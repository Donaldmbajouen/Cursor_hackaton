"""
vote_counter_service.py — Agrégats de votes dans Redis
Responsable : Dev Backend (temps réel / pub/sub)
"""
import json
from datetime import datetime, timezone
from typing import Any

from redis.asyncio import Redis

# Clé : votechain:poll:{poll_id}:counts — HASH field = index, value = compteur
# Événements : votechain:poll:{poll_id}:events (PUB/SUB, texte JSON)


def counts_key(poll_id: str) -> str:
    return f"votechain:poll:{poll_id}:counts"


def events_channel(poll_id: str) -> str:
    return f"votechain:poll:{poll_id}:events"


def ip_lock_key(poll_id: str, ip_hash: str) -> str:
    return f"votechain:poll:{poll_id}:voted_by_ip:{ip_hash}"


async def init_counts(redis: Redis, poll_id: str, option_count: int) -> None:
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
    key = counts_key(poll_id)
    n = await redis.hincrby(key, str(option_index), 1)
    return int(n or 0)


async def get_all_counts(redis: Redis, poll_id: str) -> dict[str, int]:
    key = counts_key(poll_id)
    raw: dict[str, str] = await redis.hgetall(key)
    return {k: int(v) for k, v in raw.items()}


def _envelope(
    t: str,
    poll_id: str,
    data: dict[str, Any] | None = None,
) -> str:
    msg: dict[str, Any] = {
        "type": t,
        "poll_id": poll_id,
    }
    if data is not None:
        msg |= data
    return json.dumps(msg, default=str, ensure_ascii=False)


async def publish_state(
    redis: Redis, poll_id: str, extra: dict[str, Any] | None = None
) -> None:
    counts = await get_all_counts(redis, poll_id)
    ch = events_channel(poll_id)
    data: dict[str, Any] = {
        "counts": counts,
        "server_time": server_utcnow_iso(),
    }
    if extra:
        data |= extra
    _ = await redis.publish(ch, _envelope("counts", poll_id, data))


async def try_set_ip_voted(redis: Redis, poll_id: str, ip_hash: str) -> bool:
    """Pré-ordonne 1 vote par (sondage, IP). True si c'est le premier, False si déjà pris."""
    key = ip_lock_key(poll_id, ip_hash)
    v = await redis.set(key, "1", nx=True, ex=86400 * 365 * 2)
    return v is not None  # setnx returns None if not set, True/OK in decode mode


async def clear_ip_voted(redis: Redis, poll_id: str, ip_hash: str) -> None:
    await redis.delete(ip_lock_key(poll_id, ip_hash))


def server_utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
