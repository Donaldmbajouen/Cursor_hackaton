-- 1 vote actif (poll, ip_hash) enregistré en base — renfort au-delà du flag Redis
CREATE UNIQUE INDEX IF NOT EXISTS uq_votes_poll_id_ip_hash
  ON votes (poll_id, ip_hash);
