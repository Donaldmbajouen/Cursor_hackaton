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
    user_id: str | None = None,
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
        INSERT INTO polls (id, question, options, closes_at, creator_token, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        poll_id,
        question.strip(),
        options_json,
        closes,
        creator_token,
        user_id,
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


async def get_polls_by_user(
    db: asyncpg.Connection,
    user_id: str,
) -> list[dict[str, Any]]:
    rows = await db.fetch(
        """
        SELECT p.*, COALESCE(v.total, 0)::bigint AS total_votes
        FROM polls p
        LEFT JOIN (
          SELECT poll_id, COUNT(*) AS total
          FROM votes
          GROUP BY poll_id
        ) v ON v.poll_id = p.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        """,
        user_id,
    )
    polls = []
    for row in rows:
        poll = _row_to_poll(row)
        poll["total_votes"] = int(row["total_votes"])
        poll["is_open"] = is_poll_open(poll)
        polls.append(poll)
    return polls


async def get_user_stats(
    db: asyncpg.Connection,
    user_id: str,
) -> dict[str, Any]:
    polls = await get_polls_by_user(db, user_id)
    total_votes = sum(int(p.get("total_votes", 0)) for p in polls)
    active = sum(1 for p in polls if p.get("is_open"))
    closed = len(polls) - active
    top_poll = None
    if polls:
        top = max(polls, key=lambda p: int(p.get("total_votes", 0)))
        if int(top.get("total_votes", 0)) > 0:
            top_poll = {
                "id": top["id"],
                "question": top["question"],
                "total_votes": int(top["total_votes"]),
            }
    return {
        "polls_count": len(polls),
        "total_votes": total_votes,
        "active_polls": active,
        "closed_polls": closed,
        "top_poll": top_poll,
    }


async def delete_poll(
    db: asyncpg.Connection,
    poll_id: str,
    user_id: str,
) -> bool:
    """Supprime un sondage si l'utilisateur en est propriétaire. Renvoie True si supprimé."""
    result = await db.execute(
        "DELETE FROM polls WHERE id = $1 AND user_id = $2",
        poll_id,
        user_id,
    )
    return result.endswith(" 1")
