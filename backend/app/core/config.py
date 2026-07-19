import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://stadiumflow-ai.vercel.app")
    PORT: int = 8000
    HOST: str = "0.0.0.0"  # nosec B104

    class Config:
        env_file = ".env"


settings = Settings()
