"""
config.py — Paramètres d’environnement (Pydantic Settings)
Responsable : Dev Backend
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    port: int = 3000
    jwt_secret: str = "change_me_in_production"
    database_url: str = "postgresql://votechain:votechain@localhost:5432/votechain"
    redis_url: str = "redis://localhost:6379/0"


settings = Settings()
