#!/usr/bin/env sh
# Démarre Postgres + Redis + backend, applique l’index unique s’il manque, lance le smoke test.
set -e
cd "$(dirname "$0")/.."
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "==> Pas de .env — copie depuis .env.example (Docker Compose en a besoin)"
  cp .env.example .env
fi
export API_URL="${API_URL:-http://127.0.0.1:3000}"

# Préférer docker-compose (CLI historique) ; sinon plugin « docker compose » v2.
if command -v docker-compose > /dev/null 2>&1; then
  DCR="docker-compose"
elif docker compose version > /dev/null 2>&1; then
  DCR="docker compose"
else
  echo "Installe docker-compose ou Docker Engine avec le plugin Compose v2." >&2
  exit 1
fi

echo "==> Démarrage (postgres, redis, backend) avec: $DCR up…"
$DCR up -d --build postgres redis backend

echo "==> Attente API…"
i=0
while ! curl -sf "$API_URL/docs" > /dev/null; do
  i=$((i + 1))
  if [ "$i" -gt 40 ]; then
    echo "Le backend n’a pas répondu. Voir: $DCR logs -f backend"
    exit 1
  fi
  sleep 1
done

echo "==> Garantit l’index uq_votes (migration 004) sur la base existante…"
$DCR exec -T postgres psql -U votechain -d votechain -c \
  "CREATE UNIQUE INDEX IF NOT EXISTS uq_votes_poll_id_ip_hash ON votes (poll_id, ip_hash);"

echo "==> Installe les dépendances du smoke test (httpx, websockets)…"
python3 -m pip install -q -r scripts/requirements-smoke.txt

echo "==> Smoke test (HTTP + WebSocket)…"
python3 scripts/smoke_vote.py --url "$API_URL"

echo "==> OK"
