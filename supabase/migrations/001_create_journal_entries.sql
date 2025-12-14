-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  steps JSONB NOT NULL,
  declaration JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);

-- Note: Since we're using Clerk for auth, not Supabase auth,
-- we disable RLS and handle access control in the application layer.
-- The application ensures users can only access their own entries via user_id checks.
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;

