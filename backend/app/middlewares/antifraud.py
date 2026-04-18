"""
antifraud.py — Extraction IP / fingerprint côté serveur
Responsable : Dev Backend (anti-fraude)
"""
from fastapi import Request

from app.services import fraud_service


async def extract_client_data(request: Request) -> tuple[str, str]:
    client = request.client
    host = client.host if client else ""
    forwarded = request.headers.get("x-forwarded-for") or ""
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    else:
        ip = host or "unknown"
    ip_hash = fraud_service.hash_ip(ip)
    fingerprint = fraud_service.compute_fingerprint(
        user_agent=request.headers.get("user-agent", ""),
        language=request.headers.get("accept-language", ""),
        screen_res=request.headers.get("x-screen-res", "unknown"),
    )
    return ip_hash, fingerprint
