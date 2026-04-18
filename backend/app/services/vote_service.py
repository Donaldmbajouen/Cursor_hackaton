"""
vote_service.py — Enregistrement vote (PG) + synchro compteurs (Redis)
Responsable : Dev Backend (domaine)
"""
import asyncpg
from redis.asyncio import Redis

# TODO Dev : transaction PG + HINCRBY Redis + invalidation cache


async def cast_vote(
    conn: asyncpg.Connection,
    redis: Redis,
    *,
    poll_id: str,
    option_index: int,
) -> None:
    """TODO"""
    pass
