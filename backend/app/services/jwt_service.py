"""
jwt_service.py — JWT pour votes (payload signé)
Responsable : Dev Backend (sécurité)
"""
import time

from jose import jwt

from app.config import settings


def sign_vote_token(
    poll_id: str,
    option_index: int,
    fingerprint: str,
    ip_hash: str,
) -> str:
    exp = int(time.time()) + settings.JWT_EXPIRE_HOURS * 3600
    payload = {
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
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )
