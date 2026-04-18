"""
Sessions de vote (UUID) — liés à un sondage, usage unique.
"""
import uuid
from typing import Any

import asyncpg


def _row(record: asyncpg.Record) -> dict[str, Any]:
    return {k: record[k] for k in record.keys()}


async def create_session(
    conn: asyncpg.Connection,
    poll_id: str,
) -> dict[str, Any] | None:
    """Ouvre une session. Le sondage doit exister et être ouvert (validé en route)."""
    token = str(uuid.uuid4())
    r = await conn.fetchrow(
        "INSERT INTO sessions (token, poll_id, used) VALUES ($1, $2, 0) "
        "RETURNING token, poll_id, used, created_at",
        token,
        poll_id,
    )
    if r is None:
        return None
    return _row(r)


async def get_session(
    conn: asyncpg.Connection, session_token: str
) -> asyncpg.Record | None:
    return await conn.fetchrow(
        "SELECT token, poll_id, used, created_at FROM sessions WHERE token = $1",
        session_token,
    )
