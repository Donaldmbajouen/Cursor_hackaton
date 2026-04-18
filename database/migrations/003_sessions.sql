-- 003_sessions.sql — Table sessions (jetons de vote)
-- Voir note dans 001_polls.sql sur schema.sql / Docker.

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_poll_id ON sessions (poll_id);
