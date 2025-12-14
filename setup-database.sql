-- ============================================
-- Supabase Database Setup for Sabbath Journal
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Then click "Run" to create the tables and indexes

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  has_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);

-- Disable Row Level Security (RLS)
-- Note: We're using Clerk for authentication, not Supabase auth
-- Access control is handled in the application layer via user_id checks
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Verification Query (Optional)
-- ============================================
-- Run this after the above to verify the table was created:
-- SELECT * FROM journal_entries LIMIT 1;
