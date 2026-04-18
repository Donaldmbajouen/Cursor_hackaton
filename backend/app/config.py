"""
config.py — Paramètres d'environnement (Pydantic Settings)
Responsable : Dev Backend
"""
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    DATABASE_URL: str = Field(..., description="postgresql://...")
    REDIS_URL: str = Field(..., description="redis://...")
    JWT_SECRET: str = Field(..., min_length=1)
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 1
    FRONTEND_URL: str = "http://localhost:5173"
    # Liste séparée par des virgules ; utilisée par CORS (Vite peut prendre 5173, 5174, etc.)
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://localhost:5174,"
        "http://127.0.0.1:5173,http://127.0.0.1:5174"
    )
    ENVIRONMENT: str = "development"


settings = Settings()


def cors_allow_origins() -> list[str]:
    """Origines uniques pour CORSMiddleware (FRONTEND_URL + CORS_ORIGINS)."""
    parts = {p.strip().rstrip("/") for p in settings.CORS_ORIGINS.split(",") if p.strip()}
    fu = settings.FRONTEND_URL.strip().rstrip("/")
    if fu:
        parts.add(fu)
    return sorted(parts)
