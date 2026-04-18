"""
auth.py — Routes /api/auth (register, login, me, logout)
Responsable : Dev Backend (auth)
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.deps import CurrentUser, DbConn
from app.services import auth_service, jwt_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = Field(default=None, max_length=100)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


def _user_with_token(user: dict) -> dict:
    token = jwt_service.sign_user_token(user["id"], user["email"])
    return {"user": user, "token": token}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterBody, db: DbConn) -> dict:
    try:
        user = await auth_service.create_user(db, body.email, body.password, body.name)
    except auth_service.EmailAlreadyExists:
        raise HTTPException(status_code=409, detail="Cet email est déjà utilisé")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _user_with_token(user)


@router.post("/login")
async def login(body: LoginBody, db: DbConn) -> dict:
    try:
        user = await auth_service.authenticate(db, body.email, body.password)
    except auth_service.InvalidCredentials:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    return _user_with_token(user)


@router.get("/me")
async def me(user: CurrentUser) -> dict:
    return {"user": user}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout() -> None:
    return None
