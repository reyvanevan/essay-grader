-- SCHEMA REFIT: Prepared for Middleware/Public Form now, scalable to LMS later

-- 1. Courses (Mata Kuliah)
-- Owned by lecturer. Serves as the container for assignments.
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lecturer_id UUID NOT NULL, -- references auth.users(id) in full implementation
    code TEXT UNIQUE NOT NULL, -- e.g., "ALG-2026" for students to enter
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Assignments (Tugas)
-- Contains the task details and the crucial rubric for the AI.
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    rubric_text TEXT NOT NULL, -- The custom rubric/instructions from lecturer
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Submissions (Tugas Mahasiswa)
-- Scalable design: currently uses text fields for student info, can be linked to a students table later.
CREATE TABLE IF NOT EXISTS submissions (
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
-- Holds AI assessments and allows manual override for MAE/Confusion Matrix testing
CREATE TABLE IF NOT EXISTS grades (
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
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Development Policies (WARNING: Make sure to secure this properly in production)
-- For now, we allow full access to simplify development before Supabase Auth is strictly clamped down.
DROP POLICY IF EXISTS "Enable all access" ON courses;
DROP POLICY IF EXISTS "Enable all access" ON assignments;
DROP POLICY IF EXISTS "Enable all access" ON submissions;
DROP POLICY IF EXISTS "Enable all access" ON grades;

CREATE POLICY "Enable all access" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON grades FOR ALL USING (true) WITH CHECK (true);
