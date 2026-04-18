"""
main.py — Application FastAPI (PostgreSQL + Redis)
Responsable : Dev Backend
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from app.api.routes import polls, votes
from app.api.ws import votes_ws
from app.config import settings
from app.db.pool import close_pool, create_pool
from app.middlewares.rate_limiter import limiter, rate_limit_exceeded_handler
from app.redis_client import close_redis, create_redis


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await create_pool()
    await create_redis()
    yield
    await close_pool()
    await close_redis()


app = FastAPI(title="VoteChain API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(polls.router)
app.include_router(votes.router)
app.include_router(votes_ws.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "environment": settings.ENVIRONMENT}
