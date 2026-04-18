"""
deps.py — Dépendances FastAPI (DB, Redis)
Responsable : Dev Backend
"""
from collections.abc import AsyncGenerator
from typing import Annotated

import asyncpg
from fastapi import Depends, Request
from redis.asyncio import Redis

from app.client_ip import get_client_ip
from app.db.pool import get_pool
from app.redis_client import get_redis


async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """TODO Dev : traçage, timeouts, lecture seule vs écriture."""
    pool = get_pool()
    async with pool.acquire() as conn:
        yield conn


def get_redis_client() -> Redis:
    """TODO Dev : scoper par request si besoin."""
    return get_redis()


def get_request_client_ip(request: Request) -> str:
    return get_client_ip(request)


DbConn = Annotated[asyncpg.Connection, Depends(get_connection)]
RedisClient = Annotated[Redis, Depends(get_redis_client)]
ClientIP = Annotated[str, Depends(get_request_client_ip)]
