-- SCHEMA REFIT: Middleware Orchestration v1 (text-only grading, DB-backed queue)

-- 0. CLEANUP PREVIOUS DATA (DANGER: Drops all data)
DROP TABLE IF EXISTS grading_jobs CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS rubrics CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- 1. Assignments
CREATE TABLE assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    course_code TEXT,
    description TEXT,
    due_date TIMESTAMPTZ,
    llm_provider TEXT NOT NULL DEFAULT 'groq',
    llm_model TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    llm_model_locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Rubrics
CREATE TABLE rubrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    aspect TEXT NOT NULL,
    weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Submissions (text-first, OCR deferred)
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_identifier TEXT NOT NULL,
    answer_text TEXT,
    answer_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'processing', 'graded', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Grades (dual-mode + optional lecturer override)
CREATE TABLE grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,

    ai_holistic_score NUMERIC,
    ai_holistic_feedback TEXT,
    ai_rubric_breakdown JSONB,
    ai_weighted_total NUMERIC,
    ai_reasoning TEXT,
    ai_provider TEXT,
    ai_model TEXT,

    final_score NUMERIC,
    final_feedback TEXT,

    is_overridden BOOLEAN DEFAULT false,
    overridden_by TEXT,
    overridden_at TIMESTAMPTZ,
    override_note TEXT,

    manual_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Grading Jobs Queue
CREATE TABLE grading_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'processing', 'completed', 'failed')),
    attempt INTEGER NOT NULL DEFAULT 0,
    max_attempt INTEGER NOT NULL DEFAULT 3,
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    error TEXT,
    run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_grading_jobs_status_run_at ON grading_jobs(status, run_at);

UPDATE assignments
SET
    llm_provider = COALESCE(NULLIF(llm_provider, ''), 'groq'),
    llm_model = COALESCE(NULLIF(llm_model, ''), 'llama-3.3-70b-versatile');

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_jobs ENABLE ROW LEVEL SECURITY;

-- Development policies (open access for development)
CREATE POLICY "Enable all access" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON rubrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON grading_jobs FOR ALL USING (true) WITH CHECK (true);
