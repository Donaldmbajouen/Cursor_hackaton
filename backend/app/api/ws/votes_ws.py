"""
votes_ws.py — WebSocket résultats / diffusion
Responsable : Dev Backend (temps réel)
"""
import json
from collections import defaultdict
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketException

from app.db.pool import get_pool
from app.redis_client import get_redis
from app.services import poll_service, vote_counter_service

router = APIRouter()

active_connections: dict[str, list[WebSocket]] = defaultdict(list)


async def connect(poll_id: str, ws: WebSocket) -> None:
    await ws.accept()
    active_connections[poll_id].append(ws)


def disconnect(poll_id: str, ws: WebSocket) -> None:
    conns = active_connections.get(poll_id)
    if not conns:
        return
    if ws in conns:
        conns.remove(ws)
    if not conns:
        active_connections.pop(poll_id, None)


async def broadcast(poll_id: str, data: dict) -> None:
    payload = json.dumps(data, default=str)
    dead: list[WebSocket] = []
    for ws in list(active_connections.get(poll_id, [])):
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        disconnect(poll_id, ws)


async def notify_vote(poll_id: str, results: dict) -> None:
    await broadcast(
        poll_id,
        {
            "type": "results:update",
            "poll_id": poll_id,
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@router.websocket("/ws/votes/{poll_id}")
async def vote_websocket(ws: WebSocket, poll_id: str) -> None:
    pool = await get_pool()
    redis = await get_redis()
    async with pool.acquire() as db:
        poll = await poll_service.get_poll_by_id(db, poll_id)
        if poll is None:
            raise WebSocketException(code=1008, reason="Sondage introuvable")
        cached = await vote_counter_service.get_cached_results(redis, poll_id)
        if cached is None or len(cached) != len(poll["options"]):
            results = await poll_service.get_poll_results(db, poll_id)
            await vote_counter_service.seed_cache(redis, poll_id, results)
        else:
            results = cached

    await connect(poll_id, ws)
    try:
        await ws.send_json(
            {
                "type": "results:init",
                "poll_id": poll_id,
                "results": results,
            }
        )
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        disconnect(poll_id, ws)
    except Exception:
        disconnect(poll_id, ws)
