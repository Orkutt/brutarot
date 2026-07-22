# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BOT_TOKEN: str
    FRONTEND_URL: str = "https://example.com"
    DATABASE_URL: str = ""
    GIGACHAT_AUTH_KEY: str = ""   # ← твой Authorization key (Base64)
    GIGACHAT_SCOPE: str = "GIGACHAT_API_PERS"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()