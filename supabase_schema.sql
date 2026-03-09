-- SCHEMA REFIT: Simplified and cleaned for Phase 4 (Assignments & Custom Rubrics)

-- 0. CLEANUP PREVIOUS DATA (DANGER: Drops all data)
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS rubrics CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- 1. Assignments (Tugas)
-- Contains the task details based on our new UI Form
CREATE TABLE assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    course_code TEXT,      -- Optional course identifier (e.g., IF101)
    description TEXT,      -- Instructions for students
    due_date TIMESTAMPTZ,  -- Selected deadline
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Rubrics (Kriteria Penilaian AI)
-- A separate table to store the dynamic list of rubrics linked to an assignment
CREATE TABLE rubrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    aspect TEXT NOT NULL,        -- e.g., "Code Quality"
    weight INTEGER NOT NULL,     -- e.g., 30 (representing percentage)
    description TEXT NOT NULL,   -- The AI Instructions definition
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Submissions (Tugas Mahasiswa)
-- Placeholder for Phase 5 (Student submissions)
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_identifier TEXT NOT NULL, -- NIM or Email
    answer_text TEXT,
    answer_image_url TEXT, -- For Handwritten OCR images
    status TEXT DEFAULT 'pending', -- pending, processing, graded, error
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Grades (Nilai & Evaluasi)
-- Placeholder for Phase 6 (AI Grading Engine & Evaluation)
CREATE TABLE grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
    ai_score NUMERIC,
    ai_feedback TEXT,
    ai_reasoning TEXT,
    manual_score NUMERIC, -- Manual score by lecturer for Bab 4 evaluation
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Development Policies (WARNING: Make sure to secure this properly in production)
-- For development only: allowing full public CRUD access so we can focus on functionality first.
CREATE POLICY "Enable all access" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON rubrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON grades FOR ALL USING (true) WITH CHECK (true);
