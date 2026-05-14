import bcrypt
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./sip_database.db"
    SECRET_KEY: str = "changeme-use-a-real-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    GROQ_API_KEY: str = ""
    ENVIRONMENT: str = "development"
    # Owner credentials
    OWNER_USERNAME: str = "shubham"
    # Store the bcrypt hash (generated at startup from the plaintext in .env)
    OWNER_PASSWORD_HASH: str = ""
    OWNER_PASSWORD_PLAIN: str = "Senku@27."  # fallback plaintext, overridden by .env OWNER_PASSWORD_PLAIN

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Generate bcrypt hash at startup so auth.py can use verify_password()
if not settings.OWNER_PASSWORD_HASH:
    _plain = settings.OWNER_PASSWORD_PLAIN.encode("utf-8")
    settings.OWNER_PASSWORD_HASH = bcrypt.hashpw(_plain, bcrypt.gensalt()).decode("utf-8")

# Expose as OWNER_PASSWORD for backward compatibility with auth utilities
settings.OWNER_PASSWORD = settings.OWNER_PASSWORD_HASH
