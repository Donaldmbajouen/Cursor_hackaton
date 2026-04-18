"""
jwt_auth.py — Placeholder pour futurs tokens « créateur ».
Les votes utilisent le flux PyJWT dédié dans app.services.jwt_service.
"""
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer(auto_error=False)


async def jwt_auth(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict | None:
    if credentials is None:
        return None
    return None


JwtUser = Annotated[dict | None, Depends(jwt_auth)]
