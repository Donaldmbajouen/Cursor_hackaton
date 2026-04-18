"""
votes.py — Routes /api/votes
Responsable : Dev Backend (API + anti-fraude)
"""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter()


@router.post("/")
async def post_vote() -> JSONResponse:
    """TODO Dev : rate limit, antifraud, PG + Redis atomique."""
    return JSONResponse({"message": "TODO"}, status_code=status.HTTP_501_NOT_IMPLEMENTED)
