"""
jwt_auth.py — JWT Bearer optionnel
Responsable : Dev Backend (sécurité)
"""
from fastapi import Request
from jose import JWTError

from app.services import jwt_service


async def optional_jwt_verify(request: Request) -> dict | None:
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return None
    token = auth[7:].strip()
    if not token:
        return None
    try:
        return jwt_service.verify_vote_token(token)
    except JWTError:
        return None
