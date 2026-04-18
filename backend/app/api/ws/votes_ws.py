"""
votes_ws.py — WebSocket diffusion des compteurs / événements
Responsable : Dev Backend (temps réel)
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/votes/{poll_id}")
async def vote_events(websocket: WebSocket, poll_id: str) -> None:
    """TODO Dev : souscrire Redis pub/sub, pousser JSON des compteurs."""
    await websocket.accept()
    _ = poll_id
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
