-- Non-destructive migration for assignment-level model selection v1

ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS llm_provider TEXT NOT NULL DEFAULT 'groq',
  ADD COLUMN IF NOT EXISTS llm_model TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  ADD COLUMN IF NOT EXISTS llm_model_locked_at TIMESTAMPTZ;

ALTER TABLE grades
  ADD COLUMN IF NOT EXISTS ai_provider TEXT,
  ADD COLUMN IF NOT EXISTS ai_model TEXT;

UPDATE assignments
SET
  llm_provider = COALESCE(NULLIF(llm_provider, ''), 'groq'),
  llm_model = COALESCE(NULLIF(llm_model, ''), 'llama-3.3-70b-versatile')
WHERE llm_provider IS NULL OR llm_model IS NULL OR llm_provider = '' OR llm_model = '';
