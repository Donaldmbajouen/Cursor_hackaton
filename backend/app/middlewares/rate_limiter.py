"""
rate_limiter.py — Rate limiting (SlowAPI)
Responsable : Dev Backend
"""
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)

GLOBAL_RATE = "100/minute"
VOTE_RATE = "5 per 10 minutes"


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    _ = (request, exc)
    return JSONResponse(
        status_code=429,
        content={"error": "Limite de requêtes atteinte."},
    )
