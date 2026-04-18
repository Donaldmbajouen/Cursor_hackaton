"""
jwt_auth.py — Dépendance FastAPI pour JWT Bearer
Responsable : Dev Backend (sécurité)
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer(auto_error=False)


async def jwt_auth(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict | None:
    """TODO Dev : décoder JWT, valider claims, retourner payload ou 401."""
    if credentials is None:
        return None
    # TODO : vérifier signature avec jwt_service
    return None


JwtUser = Annotated[dict | None, Depends(jwt_auth)]
