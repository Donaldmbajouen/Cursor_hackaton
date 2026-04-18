"""
poll_service.py — Logique métier sondages (PostgreSQL)
Responsable : Dev Backend (domaine)
"""
import json
import uuid
from typing import Any

import asyncpg

from app.schemas.polls import PollCreate


def _row_to_dict(record: asyncpg.Record) -> dict[str, Any]:
    return {k: record[k] for k in record.keys()}


async def create_poll(conn: asyncpg.Connection, data: PollCreate) -> dict[str, Any]:
    poll_id = str(uuid.uuid4())
    creator_token = str(uuid.uuid4())
    options_json = json.dumps(data.options, ensure_ascii=False)
    row = await conn.fetchrow(
        """
        INSERT INTO polls (id, question, options, closes_at, creator_token)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, question, options, closes_at, creator_token, created_at
        """,
        poll_id,
        data.question,
        options_json,
        data.closes_at,
        creator_token,
    )
    assert row is not None
    return _row_to_dict(row)


async def delete_poll(conn: asyncpg.Connection, poll_id: str) -> None:
    await conn.execute("DELETE FROM polls WHERE id = $1", poll_id)


async def get_poll_by_id(conn: asyncpg.Connection, poll_id: str) -> dict[str, Any] | None:
    row = await conn.fetchrow(
        "SELECT id, question, options, closes_at, creator_token, created_at "
        "FROM polls WHERE id = $1",
        poll_id,
    )
    if row is None:
        return None
    return _row_to_dict(row)


async def list_polls(
    conn: asyncpg.Connection,
    *,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    rows = await conn.fetch(
        """
        SELECT id, question, options, closes_at, creator_token, created_at
        FROM polls
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        """,
        limit,
        offset,
    )
    return [_row_to_dict(r) for r in rows]
