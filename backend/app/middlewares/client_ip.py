from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.config import settings
from app.client_ip import resolve_client_ip


class ClientIPMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        host: str | None
        if request.client:
            host = request.client.host
        else:
            host = None
        request.state.client_ip = resolve_client_ip(
            request.headers,
            host,
            use_x_forwarded_for=settings.use_x_forwarded_for,
        )
        return await call_next(request)
