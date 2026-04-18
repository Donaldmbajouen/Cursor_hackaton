"""
rate_limiter.py — Rate limiting (SlowAPI / IP)
Responsable : Dev 1 (Senior - Anti-fraude)
"""
from fastapi import Request
from slowapi import Limiter

from app.client_ip import get_client_ip


def _client_ip_key(request: Request) -> str:
    return get_client_ip(request)


# Clé = IP fiable (X-Forwarded-For via ClientIPMiddleware, cf. app/middlewares/client_ip.py)
limiter = Limiter(key_func=_client_ip_key)
