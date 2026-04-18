"""
jwt_service.py — JWT pour votes (typ=vote) et utilisateurs (typ=user)
Responsable : Dev Backend (sécurité)
"""
import time

from jose import JWTError, jwt

from app.config import settings


def sign_vote_token(
    poll_id: str,
    option_index: int,
    fingerprint: str,
    ip_hash: str,
) -> str:
    exp = int(time.time()) + settings.JWT_EXPIRE_HOURS * 3600
    payload = {
        "typ": "vote",
        "poll_id": poll_id,
        "option_index": option_index,
        "fingerprint": fingerprint,
        "ip_hash": ip_hash,
        "exp": exp,
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def verify_vote_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("typ") not in (None, "vote"):
        raise JWTError("Token type mismatch (expected vote)")
    return payload


def sign_user_token(user_id: str, email: str) -> str:
    now = int(time.time())
    exp = now + settings.JWT_USER_EXPIRE_HOURS * 3600
    payload = {
        "typ": "user",
        "sub": user_id,
        "email": email,
        "iat": now,
        "exp": exp,
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def verify_user_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("typ") != "user":
        raise JWTError("Token type mismatch (expected user)")
    return payload
