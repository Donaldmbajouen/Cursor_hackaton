"""
antifraud.py — Contrôles anti-fraude (empreinte, IP, sessions)
Responsable : Dev 1 (Senior - Anti-fraude)
"""
from fastapi import Request


async def antifraud_check(request: Request) -> None:
    """TODO Dev 1 : scorer la requête, lever HTTPException si bloqué."""
    pass
