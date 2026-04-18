"""
poll_service.py — Logique métier sondages (PostgreSQL)
Responsable : Dev Backend (domaine)
"""
import asyncpg

# TODO Dev : CRUD polls, sérialisation options JSON


async def get_poll_by_id(conn: asyncpg.Connection, poll_id: str) -> dict | None:
    """TODO"""
    return None
