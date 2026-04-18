"""
me.py — Routes /api/me (dashboard utilisateur)
Responsable : Dev Backend (auth)
"""
from fastapi import APIRouter, HTTPException, status

from app.deps import CurrentUser, DbConn
from app.services import poll_service

router = APIRouter(prefix="/api/me", tags=["me"])


def _serialize_poll(poll: dict) -> dict:
    return {
        "id": poll["id"],
        "question": poll["question"],
        "options": poll["options"],
        "options_count": len(poll["options"]),
        "closes_at": poll["closes_at"].isoformat() if hasattr(poll["closes_at"], "isoformat") else poll["closes_at"],
        "created_at": poll["created_at"].isoformat() if hasattr(poll["created_at"], "isoformat") else poll["created_at"],
        "is_open": bool(poll.get("is_open")),
        "total_votes": int(poll.get("total_votes", 0)),
    }


@router.get("/polls")
async def my_polls(user: CurrentUser, db: DbConn) -> dict:
    polls = await poll_service.get_polls_by_user(db, user["id"])
    return {"polls": [_serialize_poll(p) for p in polls]}


@router.get("/stats")
async def my_stats(user: CurrentUser, db: DbConn) -> dict:
    return await poll_service.get_user_stats(db, user["id"])


@router.delete("/polls/{poll_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_poll(poll_id: str, user: CurrentUser, db: DbConn) -> None:
    deleted = await poll_service.delete_poll(db, poll_id, user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Sondage introuvable ou non autorisé")
    return None
