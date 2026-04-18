"""
jwt_service.py — JWT (sessions vote / créateur)
Responsable : Dev Backend (sécurité)
"""
from jose import jwt

# TODO Dev : algorithmes, durées, rotation des secrets, utiliser settings.jwt_secret


def sign_token(payload: dict) -> str:
    """TODO Dev : jwt.encode(payload, settings.jwt_secret, algorithm=...)."""
    _ = (jwt, payload)
    return ""


def verify_token(token: str) -> dict | None:
    """TODO Dev : jwt.decode(...)."""
    _ = (jwt, token)
    return None
