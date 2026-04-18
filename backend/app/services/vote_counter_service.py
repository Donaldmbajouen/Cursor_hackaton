"""
vote_counter_service.py — Compteurs de votes dans Redis
Responsable : Dev Backend (cache)
"""
import redis.asyncio as aioredis

TTL_SECONDS = 86400


def _votes_hash_key(poll_id: str) -> str:
    return f"poll:{poll_id}:votes"


def _total_key(poll_id: str) -> str:
    return f"poll:{poll_id}:total"


async def increment_vote(
    redis: aioredis.Redis,
    poll_id: str,
    option_index: int,
) -> None:
    hkey = _votes_hash_key(poll_id)
    tkey = _total_key(poll_id)
    await redis.hincrby(hkey, str(option_index), 1)
    await redis.incr(tkey)
    await redis.expire(hkey, TTL_SECONDS)
    await redis.expire(tkey, TTL_SECONDS)


async def get_cached_results(
    redis: aioredis.Redis,
    poll_id: str,
) -> dict[str, int] | None:
    raw = await redis.hgetall(_votes_hash_key(poll_id))
    if not raw:
        return None
    return {k: int(v) for k, v in raw.items()}


async def get_total_votes(redis: aioredis.Redis, poll_id: str) -> int:
    val = await redis.get(_total_key(poll_id))
    if val is None:
        return 0
    return int(val)


async def seed_cache(
    redis: aioredis.Redis,
    poll_id: str,
    results: dict[str, int],
) -> None:
    hkey = _votes_hash_key(poll_id)
    tkey = _total_key(poll_id)
    if results:
        await redis.delete(hkey)
        mapping = {str(k): str(v) for k, v in results.items()}
        await redis.hset(hkey, mapping=mapping)
    total = sum(results.values()) if results else 0
    await redis.set(tkey, str(total))
    await redis.expire(hkey, TTL_SECONDS)
    await redis.expire(tkey, TTL_SECONDS)
