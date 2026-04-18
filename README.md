# VoteChain

Scaffold fullstack : **React + Vite** (frontend), **FastAPI** (backend), **PostgreSQL** (données relationnelles), **Redis** (compteurs de votes / temps réel).

## Prérequis

- Docker et Docker Compose
- Node.js 20 (frontend hors Docker)
- Python 3.12 (backend hors Docker)

## Configuration

1. Copier `.env.example` vers `.env` à la racine.
2. Avec **Docker Compose**, les URLs `DATABASE_URL` et `REDIS_URL` sont surchargées pour pointer vers les services `postgres` et `redis`.
3. En **local sans Docker**, lancer PostgreSQL et Redis (ou via Compose uniquement pour les services de données) et aligner `DATABASE_URL` / `REDIS_URL` dans `.env`.

## Démarrage

### Stack complète (Docker)

```bash
docker-compose up --build
# ou (Compose v2 intégré à Docker) : docker compose up --build
```

- Frontend : http://localhost:5173  
- API : http://localhost:3000  
- WebSocket (stub) : `ws://localhost:3000/ws/votes/{poll_id}`  
- PostgreSQL : `localhost:5432` (user/mot de passe/db : `votechain` / `votechain` / `votechain`)  
- Redis : `localhost:6379`  

### Frontend seul

```bash
cd frontend && npm install && npm run dev
```

### Backend seul

```bash
cd backend && python -m venv .venv && source .venv/bin/activate  # ou équivalent Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
```

(Lancer depuis le dossier `backend`, avec PostgreSQL et Redis accessibles selon `.env`.)

## Structure

- `frontend/` — Vite + React  
- `backend/` — FastAPI (`app/`), asyncpg, client Redis async  
- `database/` — `schema.sql` (init Postgres via Docker), dossier `migrations/` pour évolutions SQL  

Les modules Python et les composants React restent en grande partie des **stubs** à compléter par l’équipe.
