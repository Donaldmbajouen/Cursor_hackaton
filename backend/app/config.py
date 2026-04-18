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
    ENVIRONMENT: str = "development"


settings = Settings()
