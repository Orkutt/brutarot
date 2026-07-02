from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BOT_TOKEN: str
    FRONTEND_URL: str = "https://example.com"
    DATABASE_URL: str = ''

    class Config:
        env_file = '.env'

settings = Settings()