"""
deps.py — Dépendances FastAPI (DB, Redis, auth utilisateur)
Responsable : Dev Backend
"""
from collections.abc import AsyncGenerator
from typing import Annotated, Any

import asyncpg
import redis.asyncio as aioredis
from fastapi import Depends, Header, HTTPException, status
from jose import JWTError

from app.db.pool import get_pool
from app.redis_client import get_redis
from app.services import auth_service, jwt_service


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


async def get_redis_dep() -> AsyncGenerator[aioredis.Redis, None]:
    redis = await get_redis()
    yield redis


DbConn = Annotated[asyncpg.Connection, Depends(get_db)]
RedisDep = Annotated[aioredis.Redis, Depends(get_redis_dep)]


def _extract_bearer(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1].strip()
    return token or None


async def get_current_user(
    db: DbConn,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    token = _extract_bearer(authorization)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt_service.verify_user_token(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
    user = await auth_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur introuvable")
    return user


async def get_optional_user(
    db: DbConn,
    authorization: str | None = Header(default=None),
) -> dict[str, Any] | None:
    token = _extract_bearer(authorization)
    if token is None:
        return None
    try:
        payload = jwt_service.verify_user_token(token)
    except JWTError:
        return None
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        return None
    return await auth_service.get_user_by_id(db, user_id)


CurrentUser = Annotated[dict[str, Any], Depends(get_current_user)]
OptionalUser = Annotated["dict[str, Any] | None", Depends(get_optional_user)]
