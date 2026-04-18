"""
main.py — Application FastAPI (PostgreSQL + Redis)
Responsable : Dev Backend
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import polls, votes
from app.api.ws import votes_ws
from app.config import settings
from app.db.pool import close_pool, init_pool
from app.middlewares.client_ip import ClientIPMiddleware
from app.middlewares.rate_limiter import limiter
from app.redis_client import close_redis, init_redis


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_pool(settings.database_url)
    await init_redis(settings.redis_url)
    yield
    await close_pool()
    await close_redis()


app = FastAPI(title="VoteChain API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Dernier enregistrement = premier sur la requête entrante (Starlette) : client_ip avant CORS
app.add_middleware(ClientIPMiddleware)

app.include_router(polls.router, prefix="/api/polls", tags=["polls"])
app.include_router(votes.router, prefix="/api/votes", tags=["votes"])
app.include_router(votes_ws.router, prefix="/ws", tags=["websocket"])
