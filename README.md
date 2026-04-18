# VoteChain

Scaffold fullstack (React + Vite + Express + Socket.io + SQLite) pour des sondages en temps réel.

## Prérequis

- Docker et Docker Compose
- Node.js 20 (développement hors Docker)

## Configuration

1. Copier `.env.example` vers `.env` à la racine du projet.
2. Pour Docker, définir dans `.env` : `DB_PATH=/app/data/votechain.db` (le volume monte `database/votechain.db` vers ce chemin dans le conteneur backend).

## Démarrage

### Avec Docker

```bash
docker compose up --build
```

- Frontend : http://localhost:5173  
- API / WebSocket : http://localhost:3000  

### Frontend seul

```bash
cd frontend && npm install && npm run dev
```

### Backend seul

```bash
cd backend && npm install && npm run dev
```

## Structure

- `frontend/` — interface Vite + React  
- `backend/` — API Express + Socket.io  
- `database/` — schéma SQL, migrations et fichier SQLite (`votechain.db`, monté en volume)

Les fichiers `.js` / `.jsx` sont des stubs commentés : la logique métier reste à implémenter par l’équipe.
