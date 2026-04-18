-- 001_polls.sql — Table polls
-- Environnements locaux : le conteneur Docker exécute database/schema.sql au premier
-- démarrage (cf. docker-compose). Ces fichiers servent de migrations manuelles / historique
-- idempotent (CREATE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  creator_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_closes_at ON polls (closes_at);
