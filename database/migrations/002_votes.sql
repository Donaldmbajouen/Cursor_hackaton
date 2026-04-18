-- 002_votes.sql — Table votes (référence polls)
-- Voir note dans 001_polls.sql sur schema.sql / Docker.

CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  jwt_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes (poll_id);
