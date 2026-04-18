"""
pool.py — Pool asyncpg (PostgreSQL)
Responsable : Dev Backend (DB)
"""
import asyncpg

# TODO Dev : typage AppState / lifespan, taille du pool, timeouts
_pool: asyncpg.Pool | None = None


async def init_pool(dsn: str) -> asyncpg.Pool:
    """TODO Dev : options min_size, max_size, command_timeout."""
    global _pool
    _pool = await asyncpg.create_pool(dsn)
    return _pool


def get_pool() -> asyncpg.Pool:
    # TODO Dev : erreur explicite si pool non initialisé
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
