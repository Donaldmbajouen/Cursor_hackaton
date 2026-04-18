"""
votes_ws.py — WebSocket compteurs + resync horloge
Multi-instances: pub/sub Redis (éviter fan-out in-process seul en multi-workers).
"""
import asyncio
import contextlib
import json
import logging
from datetime import timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db.pool import get_pool
from app.redis_client import get_redis
from app.services import poll_service, vote_counter_service

logger = logging.getLogger(__name__)
router = APIRouter()
TICK_SEC = 3.0


@router.websocket("/votes/{poll_id}")
async def vote_events(websocket: WebSocket, poll_id: str) -> None:
    await websocket.accept()
    pool = get_pool()
    redis = get_redis()
    async with pool.acquire() as conn:
        poll = await poll_service.get_poll_by_id(conn, poll_id)
    if poll is None:
        await websocket.close(code=4404, reason="poll not found")
        return
    close = poll["closes_at"]
    if close.tzinfo is None:
        close = close.replace(tzinfo=timezone.utc)
    counts = await vote_counter_service.get_all_counts(redis, poll_id)
    init = {
        "type": "init",
        "poll_id": poll_id,
        "counts": counts,
        "closes_at": close.isoformat(),
        "server_time": vote_counter_service.server_utcnow_iso(),
    }
    await websocket.send_text(json.dumps(init, default=str, ensure_ascii=False))
    ch = vote_counter_service.events_channel(poll_id)
    pubsub = redis.pubsub()
    await pubsub.subscribe(ch)
    stop = asyncio.Event()

    async def forward() -> None:
        try:
            async for message in pubsub.listen():
                if message["type"] == "message" and message.get("data") is not None:
                    d = message["data"]
                    await websocket.send_text(
                        d if isinstance(d, str) else d.decode("utf-8", errors="replace")
                    )
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001
            logger.debug("WS forward end: %s", e)

    async def tick() -> None:
        try:
            while not stop.is_set():
                await asyncio.sleep(TICK_SEC)
                if stop.is_set():
                    break
                t = {
                    "type": "tick",
                    "poll_id": poll_id,
                    "server_time": vote_counter_service.server_utcnow_iso(),
                }
                await websocket.send_text(json.dumps(t, ensure_ascii=False))
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001
            logger.debug("WS tick end: %s", e)

    f_task = asyncio.create_task(forward())
    t_task = asyncio.create_task(tick())
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        stop.set()
        f_task.cancel()
        t_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await f_task
        with contextlib.suppress(asyncio.CancelledError):
            await t_task
        with contextlib.suppress(Exception):
            await pubsub.unsubscribe(ch)
            await pubsub.close()
