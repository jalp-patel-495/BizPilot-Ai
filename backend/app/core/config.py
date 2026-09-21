import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Upteky AI – Intelligent Business Automation & Analytics Platform"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security & Tokens
    JWT_SECRET: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Seed data setting
    SEED_DEMO_DATA: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./upteky.db"
    POSTGRES_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/upteky_db"

    # Background tasks & broker
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # AI Service Settings
    LLM_PROVIDER: str = "mock"  # mock, openai, gemini
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]

    @field_validator("JWT_SECRET", mode="before")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        env = os.getenv("ENVIRONMENT", "development").lower()
        default_insecure = "dev-insecure-jwt-secret-key-for-local-development-only-2026"
        if env == "production":
            if not v or len(v.strip()) < 32 or "change-in-prod" in v.lower() or "dev-insecure" in v.lower():
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: A secure, high-entropy JWT_SECRET "
                    "(minimum 32 characters) must be explicitly configured in the environment for production."
                )
            return v
        # In non-production (development, test)
        if not v or not v.strip():
            return default_insecure
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
