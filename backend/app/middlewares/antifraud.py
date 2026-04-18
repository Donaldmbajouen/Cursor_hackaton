"""
antifraud.py — Contrôles anti-fraude (empreinte, IP, sessions)
Responsable : Dev 1 (Senior - Anti-fraude)
"""
from fastapi import Request


async def antifraud_check(_request: Request) -> None:
    """Déplacé : contrôles dans vote_service (session, IP Redis, empreinte JWT)."""
    return None
