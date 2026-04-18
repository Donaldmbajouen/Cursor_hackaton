"""
redis_client.py — Client Redis async (compteurs de votes, pub/sub)
Responsable : Dev Backend (temps réel / agrégats)
"""
from redis.asyncio import Redis

_redis: Redis | None = None


async def init_redis(url: str) -> Redis:
    global _redis
    _redis = Redis.from_url(
        url,
        decode_responses=True,
    )
    return _redis


def get_redis() -> Redis:
    if _redis is None:
        raise RuntimeError("Redis client not initialized")
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None
