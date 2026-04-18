"""
fraud_service.py — Empreintes, IP hash, sessions
Responsable : Dev Backend (anti-fraude)
"""
import hashlib

import asyncpg


def hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()


def compute_fingerprint(
    user_agent: str,
    language: str,
    screen_res: str = "unknown",
) -> str:
    raw = f"{user_agent}|{language}|{screen_res}"
    return hashlib.sha256(raw.encode()).hexdigest()


async def has_voted_by_ip(
    db: asyncpg.Connection,
    poll_id: str,
    ip_hash: str,
) -> bool:
    row = await db.fetchrow(
        "SELECT COUNT(*) AS c FROM votes WHERE poll_id = $1 AND ip_hash = $2",
        poll_id,
        ip_hash,
    )
    return row is not None and int(row["c"]) > 0


async def has_voted_by_fingerprint(
    db: asyncpg.Connection,
    poll_id: str,
    fingerprint: str,
) -> bool:
    row = await db.fetchrow(
        "SELECT COUNT(*) AS c FROM votes WHERE poll_id = $1 AND fingerprint = $2",
        poll_id,
        fingerprint,
    )
    return row is not None and int(row["c"]) > 0


async def is_session_token_valid(
    db: asyncpg.Connection,
    token: str,
    poll_id: str,
) -> bool:
    row = await db.fetchrow(
        "SELECT token FROM sessions WHERE token = $1 AND poll_id = $2 AND used = 0",
        token,
        poll_id,
    )
    return row is not None


async def mark_session_used(db: asyncpg.Connection, token: str) -> None:
    await db.execute("UPDATE sessions SET used = 1 WHERE token = $1", token)


async def create_session(db: asyncpg.Connection, token: str, poll_id: str) -> None:
    await db.execute(
        "INSERT INTO sessions (token, poll_id) VALUES ($1, $2)",
        token,
        poll_id,
    )
