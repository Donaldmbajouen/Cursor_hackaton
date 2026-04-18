"""
polls.py — Routes /api/polls
Responsable : Dev Backend (API)
"""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/")
async def list_polls() -> JSONResponse:
    """TODO Dev : pagination, filtres."""
    return JSONResponse({"message": "TODO"}, status_code=status.HTTP_501_NOT_IMPLEMENTED)


@router.get("/{poll_id}")
async def get_poll(poll_id: str) -> JSONResponse:
    """TODO Dev : charger depuis PostgreSQL."""
    return JSONResponse({"poll_id": poll_id, "message": "TODO"}, status_code=status.HTTP_501_NOT_IMPLEMENTED)


@router.post("/")
async def create_poll() -> JSONResponse:
    """TODO Dev : validation body, insert PG, init compteurs Redis."""
    return JSONResponse({"message": "TODO"}, status_code=status.HTTP_501_NOT_IMPLEMENTED)
