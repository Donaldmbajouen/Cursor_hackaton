"""
polls.py — Routes /api/polls
Responsable : Dev Backend (API)
"""
import logging

from fastapi import APIRouter, HTTPException, Query, status

from app.deps import DbConn, RedisClient
from app.schemas.polls import PollCreate, PollRead
from app.services import poll_service, vote_counter_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def list_polls(
    db: DbConn,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> dict:
    total = await db.fetchval("SELECT count(*)::bigint FROM polls")
    rows = await poll_service.list_polls(db, limit=limit, offset=offset)
    assert total is not None
    items = [
        PollRead.from_row(r, include_creator=False).model_dump() for r in rows
    ]
    return {
        "items": items,
        "total": int(total),
        "limit": limit,
        "offset": offset,
    }


@router.get("/{poll_id}")
async def get_poll(poll_id: str, db: DbConn) -> PollRead:
    row = await poll_service.get_poll_by_id(db, poll_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found",
        )
    return PollRead.from_row(row, include_creator=False)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=PollRead,
)
async def create_poll(
    body: PollCreate,
    db: DbConn,
    redis: RedisClient,
) -> PollRead:
    row = await poll_service.create_poll(db, body)
    poll_id = str(row["id"])
    n = len(body.options)
    try:
        await vote_counter_service.init_counts(redis, poll_id, n)
    except Exception:
        await redis.delete(vote_counter_service.counts_key(poll_id))
        await poll_service.delete_poll(db, poll_id)
        logger.exception("Failed to init Redis counts for poll %s", poll_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create poll: storage initialization error.",
        ) from None
    return PollRead.from_row(row, include_creator=True)
