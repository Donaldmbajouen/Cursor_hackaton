"""
votes.py — Routes /api/votes
Responsable : Dev Backend (API + anti-fraude)
"""
from fastapi import APIRouter, HTTPException, Header, Request, status

from app.config import settings
from app.deps import ClientIP, DbConn, RedisClient
from app.schemas.votes import PrepareBody, PrepareOut, VoteIn
from app.services.fraud_service import FP_HEADER, assert_valid_fingerprint
from app.services.jwt_service import sign_vote_token
from app.services import vote_service

router = APIRouter()


@router.post("/prepare", response_model=PrepareOut, tags=["votes"])
async def prepare_vote(
    body: PrepareBody,
    db: DbConn,
    fingerprint: str = Header(
        default="",
        alias=FP_HEADER,
    ),
) -> PrepareOut:
    if not (fp := (fingerprint or "").strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing {FP_HEADER} header with client fingerprint",
        )
    assert_valid_fingerprint(fp)
    prep = await vote_service.prepare_vote(
        db,
        session_token=body.session_token,
        fingerprint=fp,
    )
    t = sign_vote_token(
        prep["poll_id"],
        prep["session_token"],
        prep["fingerprint"],
    )
    return PrepareOut(
        access_token=t,
        expires_in=settings.vote_jwt_ttl_seconds,
        poll_id=prep["poll_id"],
    )


@router.post("/", status_code=status.HTTP_201_CREATED, tags=["votes"])
async def post_vote(
    request: Request,
    body: VoteIn,
    db: DbConn,
    redis: RedisClient,
    client_ip: ClientIP,
) -> dict:
    auth = request.headers.get("Authorization", "")
    return await vote_service.cast_vote(
        db,
        redis,
        authorization=auth,
        option_index=body.option_index,
        client_ip=client_ip,
    )
