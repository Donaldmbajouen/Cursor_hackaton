-- Schéma PostgreSQL — VoteChain
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  creator_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_closes_at ON polls (closes_at);

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

CREATE UNIQUE INDEX IF NOT EXISTS uq_votes_poll_id_ip_hash
  ON votes (poll_id, ip_hash);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_poll_id ON sessions (poll_id);
