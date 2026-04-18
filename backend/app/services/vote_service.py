"""
vote_service.py — Enregistrement vote (PG) + synchro compteurs (Redis)
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Any

import asyncpg
from asyncpg.exceptions import UniqueViolationError
from fastapi import HTTPException, status
from redis.asyncio import Redis

from app.services import poll_service, session_service, vote_counter_service
from app.services.fraud_service import assert_valid_fingerprint, hash_client_ip
from app.services.jwt_service import decode_and_verify_vote_token


def _options_len(poll: dict[str, Any]) -> int:
    raw = poll["options"]
    if isinstance(raw, str):
        opts: list = json.loads(raw)
    else:
        opts = list(raw)
    return len(opts)


def _poll_open(poll: dict) -> bool:
    now = datetime.now(timezone.utc)
    c = poll["closes_at"]
    if c.tzinfo is None:
        c = c.replace(tzinfo=timezone.utc)
    return c > now


def extract_bearer(raw: str | None) -> str:
    if not raw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    s = raw.strip()
    if s.lower().startswith("bearer "):
        t = s[7:].strip()
    else:
        t = s
    if not t:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    return t


async def prepare_vote(
    conn: asyncpg.Connection,
    *,
    session_token: str,
    fingerprint: str,
) -> dict:
    assert_valid_fingerprint(fingerprint)
    s = await session_service.get_session(conn, session_token)
    if s is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if int(s["used"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Session already used",
        )
    poll = await poll_service.get_poll_by_id(conn, s["poll_id"])
    if poll is None or not _poll_open(poll):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poll is closed or missing",
        )
    return {
        "poll": poll,
        "session_token": session_token,
        "fingerprint": fingerprint,
        "poll_id": str(s["poll_id"]),
    }


async def cast_vote(
    conn: asyncpg.Connection,
    redis: Redis,
    *,
    authorization: str,
    option_index: int,
    client_ip: str,
) -> dict:
    t = extract_bearer(authorization)
    claims = decode_and_verify_vote_token(t)
    poll_id = str(claims["poll_id"])
    jti = str(claims["jti"])
    fp = str(claims["fp"])
    assert_valid_fingerprint(fp)

    poll = await poll_service.get_poll_by_id(conn, poll_id)
    if poll is None or not _poll_open(poll):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poll is closed or missing",
        )
    n = _options_len(poll)
    if not (0 <= option_index < n):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid option index",
        )

    iph = hash_client_ip(client_ip)
    locked = await vote_counter_service.try_set_ip_voted(redis, poll_id, iph)
    if not locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A vote from this address was already accepted for this poll",
        )
    try:
        async with conn.transaction():
            s = await conn.fetchrow(
                "SELECT token, poll_id, used FROM sessions WHERE token = $1 FOR UPDATE",
                jti,
            )
            if s is None or str(s["poll_id"]) != poll_id or int(s["used"]):
                await vote_counter_service.clear_ip_voted(redis, poll_id, iph)
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Invalid or used vote session",
                )
            try:
                vote_id = str(uuid.uuid4())
                await conn.execute(
                    """
                    INSERT INTO votes
                        (id, poll_id, option_index, ip_hash, fingerprint, jwt_token)
                    VALUES
                        ($1, $2, $3, $4, $5, $6)
                    """,
                    vote_id,
                    poll_id,
                    option_index,
                    iph,
                    fp,
                    jti,
                )
            except UniqueViolationError as e:
                await vote_counter_service.clear_ip_voted(redis, poll_id, iph)
                _ = e
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="A vote from this address was already recorded",
                ) from e
            await conn.execute(
                "UPDATE sessions SET used = 1 WHERE token = $1", jti
            )
    except HTTPException:
        raise
    except Exception:  # noqa: BLE001
        await vote_counter_service.clear_ip_voted(redis, poll_id, iph)
        raise

    await vote_counter_service.increment_count(redis, poll_id, option_index)
    await vote_counter_service.publish_state(redis, poll_id)

    return {
        "ok": True,
        "poll_id": poll_id,
        "option_index": option_index,
        "counts": await vote_counter_service.get_all_counts(redis, poll_id),
    }
