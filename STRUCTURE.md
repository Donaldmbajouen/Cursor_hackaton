# VoteChain — Arborescence et technologies

Document de référence : structure du dépôt (hors dépendances générées) et pile technique.

## Technologies utilisées

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Frontend** | [React](https://react.dev/) 18 | Interface utilisateur |
| | [Vite](https://vitejs.dev/) 5 | Build tooling et serveur de dev |
| | [React Router](https://reactrouter.com/) 6 | Routage SPA |
| | [Recharts](https://recharts.org/) | Graphiques (résultats) |
| | **WebSocket** (API navigateur) | Temps réel avec le backend (remplace Socket.io) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) | API HTTP + WebSockets |
| | [Uvicorn](https://www.uvicorn.org/) | Serveur ASGI |
| | [asyncpg](https://magicstack.github.io/asyncpg/) | Client PostgreSQL async |
| | [Redis](https://redis.io/) (client `redis` Python, option **hiredis**) | Compteurs / cache temps réel |
| | [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) | Configuration typée |
| | [python-jose](https://github.com/mpdavis/python-jose) | JWT (stubs) |
| | [SlowAPI](https://github.com/laurents/slowapi) | Rate limiting (stub) |
| **Données** | [PostgreSQL](https://www.postgresql.org/) 16 | Données relationnelles (sondages, votes, sessions) |
| | [Redis](https://redis.io/) 7 | Agrégats de votes et diffusion possible (pub/sub) |
| **Conteneurs** | [Docker](https://www.docker.com/) & Compose | Orchestration locale (`postgres`, `redis`, `backend`, `frontend`) |
| **Images** | `python:3.12-slim` | Image backend |
| | `node:20-alpine` | Image frontend (dev) |

Fichiers locaux non listés dans l’arborescence ci-dessous : **`.env`** (copie de `.env.example`, ignoré par Git), **`node_modules/`**, **`__pycache__/`**, **`.venv/`**.

---

## Arborescence

```
votechain/
├── .env.example
├── .gitignore
├── README.md
├── STRUCTURE.md                 ← ce fichier
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI, CORS, lifespan PG + Redis
│       ├── config.py            # Variables d’environnement
│       ├── deps.py              # Injection DB / Redis
│       ├── redis_client.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes/
│       │   │   ├── __init__.py
│       │   │   ├── polls.py   # /api/polls
│       │   │   └── votes.py   # /api/votes
│       │   └── ws/
│       │       ├── __init__.py
│       │       └── votes_ws.py # WebSocket /ws/votes/{poll_id}
│       ├── db/
│       │   ├── __init__.py
│       │   ├── pool.py        # Pool asyncpg
│       │   └── seed.py
│       ├── middlewares/
│       │   ├── __init__.py
│       │   ├── rate_limiter.py
│       │   ├── jwt_auth.py
│       │   └── antifraud.py
│       └── services/
│           ├── __init__.py
│           ├── poll_service.py
│           ├── vote_service.py
│           ├── vote_counter_service.py  # Redis (compteurs)
│           ├── fraud_service.py
│           └── jwt_service.py
│
├── database/
│   ├── schema.sql               # Init PostgreSQL (Docker)
│   └── migrations/
│       ├── 001_polls.sql
│       ├── 002_votes.sql
│       └── 003_sessions.sql
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        │   ├── PollForm.jsx
        │   ├── VotePage.jsx
        │   ├── ResultsChart.jsx
        │   ├── Countdown.jsx
        │   └── ShareButton.jsx
        ├── pages/
        │   ├── CreatePoll.jsx
        │   ├── Vote.jsx
        │   └── Results.jsx
        ├── hooks/
        │   ├── useSocket.js     # WebSocket (canal votes)
        │   └── useFingerprint.js
        ├── services/
        │   └── api.js
        └── utils/
            ├── fingerprint.js
            └── token.js
```

---

## Ports (Docker Compose)

| Service    | Port hôte |
|------------|-----------|
| Frontend   | 5173      |
| Backend API | 3000     |
| PostgreSQL | 5432      |
| Redis      | 6379      |

---

## Fichiers de configuration clés

- **`.env.example`** — Variables partagées (API, JWT, `DATABASE_URL`, `REDIS_URL`, `VITE_API_URL`).
- **`docker-compose.yml`** — Réseau `votechain-net`, volumes Postgres, montage du schéma SQL à l’init.
- **`database/schema.sql`** — Tables `polls`, `votes`, `sessions`.

Pour une liste brute des chemins de fichiers (hors `.git` / `node_modules` / `__pycache__`) :

```bash
find . \( -path './.git' -o -path './.git/*' -o -path '*/node_modules/*' -o -path '*/__pycache__/*' \) -prune -o -type f -print | sort
```

cree une branche dedjomo qui suis main et push a partir de cette branche