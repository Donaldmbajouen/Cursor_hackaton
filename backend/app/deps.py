"""
deps.py — Dépendances FastAPI (DB, Redis)
Responsable : Dev Backend
"""
from collections.abc import AsyncGenerator
from typing import Annotated

import asyncpg
import redis.asyncio as aioredis
from fastapi import Depends

from app.db.pool import get_pool
from app.redis_client import get_redis


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


async def get_redis_dep() -> AsyncGenerator[aioredis.Redis, None]:
    redis = await get_redis()
    yield redis


DbConn = Annotated[asyncpg.Connection, Depends(get_db)]
RedisDep = Annotated[aioredis.Redis, Depends(get_redis_dep)]
