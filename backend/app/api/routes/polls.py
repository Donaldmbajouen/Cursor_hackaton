"""
polls.py — Routes /api/polls
Responsable : Dev Backend (API)
"""
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict

from app.deps import DbConn, RedisDep
from app.services import fraud_service, poll_service, vote_counter_service

router = APIRouter(prefix="/api/polls", tags=["polls"])


class PollCreate(BaseModel):
    question: str
    options: list[str]
    closes_at: datetime


class PollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question: str
    options: list[str]
    closes_at: datetime
    created_at: datetime


def _poll_public(p: dict) -> dict:
    return {k: v for k, v in p.items() if k != "creator_token"}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_poll_route(body: PollCreate, db: DbConn, redis: RedisDep) -> dict:
    creator_token = str(uuid4())
    async with db.transaction():
        poll = await poll_service.create_poll(
            db,
            body.question,
            body.options,
            body.closes_at,
            creator_token,
        )
        await fraud_service.create_session(db, creator_token, poll["id"])
    results = await poll_service.get_poll_results(db, poll["id"])
    await vote_counter_service.seed_cache(redis, poll["id"], results)
    pr = PollResponse.model_validate(_poll_public(poll))
    return {
        "poll": pr.model_dump(mode="json"),
        "creator_token": creator_token,
        "vote_url": f"/vote/{poll['id']}",
    }


@router.get("/")
async def list_polls(db: DbConn) -> list[dict]:
    polls = await poll_service.get_all_polls(db)
    return [PollResponse.model_validate(_poll_public(p)).model_dump(mode="json") for p in polls]


@router.get("/{poll_id}/results")
async def poll_results(poll_id: str, db: DbConn, redis: RedisDep) -> dict:
    poll = await poll_service.get_poll_by_id(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Sondage introuvable")
    cached = await vote_counter_service.get_cached_results(redis, poll_id)
    if cached is None or len(cached) != len(poll["options"]):
        results = await poll_service.get_poll_results(db, poll_id)
        await vote_counter_service.seed_cache(redis, poll_id, results)
    else:
        results = cached
    total_votes = sum(int(v) for v in results.values())
    return {
        "poll_id": poll_id,
        "results": results,
        "total_votes": total_votes,
    }


@router.post("/{poll_id}/session", status_code=status.HTTP_201_CREATED)
async def create_vote_session(poll_id: str, db: DbConn) -> dict:
    poll = await poll_service.get_poll_by_id(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Sondage introuvable")
    session_token = str(uuid4())
    await fraud_service.create_session(db, session_token, poll_id)
    return {"session_token": session_token}


@router.get("/{poll_id}")
async def get_poll_route(poll_id: str, db: DbConn) -> dict:
    poll = await poll_service.get_poll_by_id(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Sondage introuvable")
    results = await poll_service.get_poll_results(db, poll_id)
    return {
        **PollResponse.model_validate(_poll_public(poll)).model_dump(mode="json"),
        "is_open": poll_service.is_poll_open(poll),
        "results": results,
    }
