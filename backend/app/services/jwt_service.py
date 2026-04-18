"""
jwt_service.py — JWT (sessions vote) avec PyJWT, HS256.
"""
from __future__ import annotations

import time

import jwt
from fastapi import HTTPException, status

from app.config import settings

VOTE_TYPE = "vote"
ALGO = "HS256"


def sign_vote_token(
    poll_id: str, session_token: str, fingerprint: str
) -> str:
    now = int(time.time())
    return jwt.encode(
        {
            "sub": "vote",
            "typ": VOTE_TYPE,
            "poll_id": poll_id,
            "jti": session_token,
            "fp": fingerprint,
            "iat": now,
            "exp": now + settings.vote_jwt_ttl_seconds,
        },
        settings.jwt_secret,
        algorithm=ALGO,
    )


def decode_and_verify_vote_token(t: str) -> dict:
    try:
        data = jwt.decode(
            t,
            settings.jwt_secret,
            algorithms=[ALGO],
        )
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Vote token has expired",
        ) from e
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid vote token",
        ) from e
    if data.get("typ") != VOTE_TYPE or data.get("sub") != "vote":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    for k in ("poll_id", "jti", "fp"):
        if k not in data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed vote token",
            )
    return data
