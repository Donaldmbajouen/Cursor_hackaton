"""
vote_counter_service.py — Agrégats de votes dans Redis
Responsable : Dev Backend (temps réel)
"""
from redis.asyncio import Redis

# Clé type : votechain:poll:{poll_id}:counts — HASH field = option_index, value = count
# TODO Dev : HINCRBY, HGETALL, pub/sub NOTIFY_CHANNEL pour WebSocket


def counts_key(poll_id: str) -> str:
    return f"votechain:poll:{poll_id}:counts"


async def init_counts(redis: Redis, poll_id: str, option_count: int) -> None:
    """Préremplit le hash de comptage avec des zéros pour chaque indice 0..n-1."""
    if option_count < 0:
        raise ValueError("option_count must be non-negative")
    key = counts_key(poll_id)
    if option_count == 0:
        await redis.delete(key)
        return
    await redis.hset(
        key,
        mapping={str(i): "0" for i in range(option_count)},
    )


async def increment_count(redis: Redis, poll_id: str, option_index: int) -> int:
    """TODO Dev : HINCRBY et retourner le nouveau total pour l’option."""
    _ = counts_key(poll_id)
    return 0


async def get_all_counts(redis: Redis, poll_id: str) -> dict[str, int]:
    """TODO Dev : HGETALL, convertir en int."""
    return {}
