"""
poll_service.py — Sondages (PostgreSQL)
Responsable : Dev Backend (domaine)
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Any

import asyncpg


def _row_to_poll(row: asyncpg.Record) -> dict[str, Any]:
    d = dict(row)
    if isinstance(d.get("options"), str):
        d["options"] = json.loads(d["options"])
    return d


async def create_poll(
    db: asyncpg.Connection,
    question: str,
    options: list[str],
    closes_at: datetime,
    creator_token: str,
) -> dict[str, Any]:
    if not question or not question.strip():
        raise ValueError("La question ne peut pas être vide")
    if len(options) < 2 or len(options) > 10:
        raise ValueError("Il faut entre 2 et 10 options")
    now = datetime.now(timezone.utc)
    closes = closes_at
    if closes.tzinfo is None:
        closes = closes.replace(tzinfo=timezone.utc)
    if closes <= now:
        raise ValueError("La date de clôture doit être dans le futur")

    poll_id = str(uuid.uuid4())
    options_json = json.dumps(options, ensure_ascii=False)
    await db.execute(
        """
        INSERT INTO polls (id, question, options, closes_at, creator_token)
        VALUES ($1, $2, $3, $4, $5)
        """,
        poll_id,
        question.strip(),
        options_json,
        closes,
        creator_token,
    )
    row = await db.fetchrow("SELECT * FROM polls WHERE id = $1", poll_id)
    if row is None:
        raise RuntimeError("Échec de lecture du sondage créé")
    return _row_to_poll(row)


async def get_poll_by_id(
    db: asyncpg.Connection,
    poll_id: str,
) -> dict[str, Any] | None:
    row = await db.fetchrow("SELECT * FROM polls WHERE id = $1", poll_id)
    if row is None:
        return None
    return _row_to_poll(row)


def is_poll_open(poll: dict[str, Any]) -> bool:
    closes = poll["closes_at"]
    if isinstance(closes, str):
        closes = datetime.fromisoformat(closes.replace("Z", "+00:00"))
    if closes.tzinfo is None:
        closes = closes.replace(tzinfo=timezone.utc)
    return closes > datetime.now(timezone.utc)


async def get_poll_results(
    db: asyncpg.Connection,
    poll_id: str,
) -> dict[str, int]:
    poll = await get_poll_by_id(db, poll_id)
    if poll is None:
        raise ValueError("Sondage introuvable")
    n = len(poll["options"])
    counts: dict[str, int] = {str(i): 0 for i in range(n)}
    rows = await db.fetch(
        """
        SELECT option_index, COUNT(*)::bigint AS count
        FROM votes
        WHERE poll_id = $1
        GROUP BY option_index
        """,
        poll_id,
    )
    for row in rows:
        idx = str(int(row["option_index"]))
        counts[idx] = int(row["count"])
    return counts


async def get_all_polls(db: asyncpg.Connection) -> list[dict[str, Any]]:
    rows = await db.fetch("SELECT * FROM polls ORDER BY created_at DESC")
    return [_row_to_poll(r) for r in rows]
