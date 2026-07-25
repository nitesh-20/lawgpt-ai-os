from typing import List
from app.core.config import settings

# CORS configuration
CORS_ORIGINS: List[str] = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8080",
]

# If in dev mode, we can allow wildcards, but in production we stick to explicit settings
if settings.ENVIRONMENT in ["development", "testing"]:
    CORS_ORIGINS = ["*"]

CORS_ALLOW_CREDENTIALS: bool = True
CORS_ALLOW_METHODS: List[str] = ["*"]
CORS_ALLOW_HEADERS: List[str] = ["*"]

# Trusted Hosts configuration
TRUSTED_HOSTS: List[str] = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
]

if settings.ENVIRONMENT == "production":
    # In production, specify your hosts
    TRUSTED_HOSTS = ["localhost", "127.0.0.1", "backend"]
else:
    TRUSTED_HOSTS = ["*"]
