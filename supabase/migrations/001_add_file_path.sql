-- Run this in Supabase SQL Editor if you already applied an older schema
-- and get: column "file_path" does not exist

ALTER TABLE challenges ADD COLUMN IF NOT EXISTS file_path text;

CREATE INDEX IF NOT EXISTS idx_challenges_file_path ON challenges(file_path);
