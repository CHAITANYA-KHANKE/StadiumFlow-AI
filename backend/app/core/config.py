import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CORS_ORIGINS: str = "*" # In production, restrict this.
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    class Config:
        env_file = ".env"

settings = Settings()
