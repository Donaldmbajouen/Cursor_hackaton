"""
auth_service.py — Inscription, authentification, hash de mot de passe
Responsable : Dev Backend (auth)
"""
import uuid
from datetime import datetime, timezone
from typing import Any

import asyncpg
from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class EmailAlreadyExists(Exception):
    pass


class InvalidCredentials(Exception):
    pass


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, password_hash: str) -> bool:
    try:
        return _pwd_context.verify(plain, password_hash)
    except Exception:
        return False


def _row_to_user(row: asyncpg.Record | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row)


def _public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name"),
        "created_at": user.get("created_at"),
        "last_login_at": user.get("last_login_at"),
    }


async def create_user(
    db: asyncpg.Connection,
    email: str,
    password: str,
    name: str | None,
) -> dict[str, Any]:
    if not password or len(password) < 8:
        raise ValueError("Le mot de passe doit faire au moins 8 caractères")
    email_norm = email.strip().lower()
    user_id = str(uuid.uuid4())
    pwd_hash = hash_password(password)
    try:
        await db.execute(
            """
            INSERT INTO users (id, email, password_hash, name)
            VALUES ($1, $2, $3, $4)
            """,
            user_id,
            email_norm,
            pwd_hash,
            (name or "").strip() or None,
        )
    except asyncpg.UniqueViolationError as exc:
        raise EmailAlreadyExists(email_norm) from exc
    row = await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
    user = _row_to_user(row)
    if user is None:
        raise RuntimeError("Échec de lecture de l'utilisateur créé")
    return _public_user(user)


async def authenticate(
    db: asyncpg.Connection,
    email: str,
    password: str,
) -> dict[str, Any]:
    email_norm = email.strip().lower()
    row = await db.fetchrow("SELECT * FROM users WHERE email = $1", email_norm)
    user = _row_to_user(row)
    if user is None or not verify_password(password, user["password_hash"]):
        raise InvalidCredentials()
    await db.execute(
        "UPDATE users SET last_login_at = $1 WHERE id = $2",
        datetime.now(timezone.utc),
        user["id"],
    )
    user["last_login_at"] = datetime.now(timezone.utc)
    return _public_user(user)


async def get_user_by_id(
    db: asyncpg.Connection,
    user_id: str,
) -> dict[str, Any] | None:
    row = await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
    user = _row_to_user(row)
    if user is None:
        return None
    return _public_user(user)
