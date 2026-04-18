"""
votes.py — Routes /api/votes
Responsable : Dev Backend (API + anti-fraude)
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.api.ws import votes_ws
from app.deps import DbConn, RedisDep
from app.middlewares.antifraud import extract_client_data
from app.middlewares.rate_limiter import VOTE_RATE, limiter
from app.services import fraud_service, poll_service, vote_counter_service, vote_service

router = APIRouter(prefix="/api/votes", tags=["votes"])


class VoteCreate(BaseModel):
    option_index: int
    session_token: str | None = None
    fingerprint: str | None = None
    screen_res: str | None = Field(default=None)


@router.post("/{poll_id}", status_code=status.HTTP_201_CREATED)
@limiter.limit(VOTE_RATE)
async def post_vote(
    request: Request,
    poll_id: str,
    body: VoteCreate,
    db: DbConn,
    redis: RedisDep,
    client_data: tuple[str, str] = Depends(extract_client_data),
) -> dict:
    ip_hash, _fp_server = client_data
    if body.fingerprint:
        fingerprint = body.fingerprint
    else:
        fingerprint = fraud_service.compute_fingerprint(
            request.headers.get("user-agent", ""),
            request.headers.get("accept-language", ""),
            body.screen_res or "unknown",
        )
    try:
        out = await vote_service.cast_vote(
            db,
            redis,
            poll_id,
            body.option_index,
            ip_hash,
            fingerprint,
            body.session_token,
        )
    except ValueError as e:
        msg = str(e)
        if "introuvable" in msg.lower():
            raise HTTPException(status_code=404, detail=msg) from e
        raise HTTPException(status_code=400, detail=msg) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Erreur interne du serveur"
        ) from e

    results = await poll_service.get_poll_results(db, poll_id)
    await vote_counter_service.seed_cache(redis, poll_id, results)
    await votes_ws.notify_vote(poll_id, results)
    return out
