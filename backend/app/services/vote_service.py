"""
vote_service.py — Enregistrement d'un vote (PG + Redis + JWT)
Responsable : Dev Backend (domaine)
"""
import uuid

import asyncpg
import redis.asyncio as aioredis

from app.services import fraud_service, jwt_service, poll_service, vote_counter_service


async def cast_vote(
    db: asyncpg.Connection,
    redis: aioredis.Redis,
    poll_id: str,
    option_index: int,
    ip_hash: str,
    fingerprint: str,
    session_token: str | None,
) -> dict:
    poll = await poll_service.get_poll_by_id(db, poll_id)
    if poll is None:
        raise ValueError("Sondage introuvable")
    if not poll_service.is_poll_open(poll):
        raise ValueError("Sondage clôturé")
    options = poll["options"]
    if option_index < 0 or option_index >= len(options):
        raise ValueError("Option invalide")
    if session_token:
        ok = await fraud_service.is_session_token_valid(db, session_token, poll_id)
        if not ok:
            raise ValueError("Token de session invalide")
    if await fraud_service.has_voted_by_ip(db, poll_id, ip_hash):
        raise ValueError("Vous avez déjà voté (IP)")
    if await fraud_service.has_voted_by_fingerprint(db, poll_id, fingerprint):
        raise ValueError("Vous avez déjà voté (appareil)")

    token_jwt = jwt_service.sign_vote_token(
        poll_id, option_index, fingerprint, ip_hash
    )
    vote_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO votes (id, poll_id, option_index, ip_hash, fingerprint, jwt_token)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        vote_id,
        poll_id,
        option_index,
        ip_hash,
        fingerprint,
        token_jwt,
    )
    if session_token:
        await fraud_service.mark_session_used(db, session_token)
    await vote_counter_service.increment_vote(redis, poll_id, option_index)
    return {
        "vote_id": vote_id,
        "poll_id": poll_id,
        "option_index": option_index,
        "jwt_token": token_jwt,
    }
