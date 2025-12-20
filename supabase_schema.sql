-- Copy and paste this into your Supabase SQL Editor to fix the schema errors

-- 1. Setup Table Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  student_name TEXT,
  question_text TEXT,
  answer_text TEXT,
  status TEXT DEFAULT 'pending'
);

-- Add columns if table already exists but columns are missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='question_text') THEN
        ALTER TABLE submissions ADD COLUMN question_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='answer_text') THEN
        ALTER TABLE submissions ADD COLUMN answer_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='student_name') THEN
        ALTER TABLE submissions ADD COLUMN student_name TEXT;
    END IF;
END $$;

-- 2. Setup Table Grades
CREATE TABLE IF NOT EXISTS grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  ai_score NUMERIC,
  ai_feedback TEXT,
  ai_reasoning TEXT
);

-- 3. Enable Public Access (RLS Policies) for Development
-- WARNING: This makes tables public. For production, restrict 'using' and 'check' logic.
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Enable all access for submissions" ON submissions;
DROP POLICY IF EXISTS "Enable all access for grades" ON grades;

CREATE POLICY "Enable all access for submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for grades" ON grades FOR ALL USING (true) WITH CHECK (true);
