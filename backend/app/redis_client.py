"""
redis_client.py — Client Redis async (compteurs de votes, cache)
Responsable : Dev Backend (temps réel / agrégats)
"""
import redis.asyncio as aioredis

from app.config import settings

_redis: aioredis.Redis | None = None


async def create_redis() -> aioredis.Redis:
    global _redis
    _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


async def get_redis() -> aioredis.Redis:
    if _redis is None:
        raise RuntimeError("Redis client not initialized")
    return _redis
