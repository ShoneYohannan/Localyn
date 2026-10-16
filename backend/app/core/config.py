import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Localyn — AI Local Business Growth Platform"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # Security
    SECRET_KEY: str = Field(default="localyn-super-secret-dev-key-change-in-prod-xyz-2026", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # Database
    # Support SQLite for frictionless local dev and testing out-of-the-box, or Postgres in Docker/Production
    DATABASE_URL: str = Field(
        default=os.getenv("DATABASE_URL", "sqlite:///./localyn.db"),
        env="DATABASE_URL"
    )
    
    # Redis / Celery
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    
    # External APIs
    GOOGLE_PLACES_API_KEY: str = Field(default="", env="GOOGLE_PLACES_API_KEY")
    GOOGLE_CLIENT_ID: str = Field(default="", env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", env="GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = Field(default="http://localhost:3000/integrations/google/callback", env="GOOGLE_REDIRECT_URI")
    
    # LLM / Gemini
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
