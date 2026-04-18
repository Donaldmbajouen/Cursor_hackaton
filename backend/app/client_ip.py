"""
Adresse client HTTP (X-Forwarded-For) derrière reverse proxy / Docker.
"""
from __future__ import annotations

from fastapi import Request
from starlette.datastructures import Headers


def get_client_ip(request: Request) -> str:
    if getattr(request.state, "client_ip", None):
        return str(request.state.client_ip)
    if request.client and request.client.host:
        return request.client.host
    return "0.0.0.0"


def resolve_client_ip(
    headers: Headers,
    direct_host: str | None,
    *,
    use_x_forwarded_for: bool,
) -> str:
    if use_x_forwarded_for:
        for key in ("X-Forwarded-For", "X-Real-IP"):
            raw = headers.get(key)
            if not raw:
                continue
            first = raw.split(",")[0].strip()
            if first:
                if first.startswith("[") and "]" in first:
                    return first[1 : first.index("]")]
                return first.split("%")[0]
    return direct_host or "0.0.0.0"
