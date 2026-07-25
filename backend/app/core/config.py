from typing import Literal, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General Settings
    APP_NAME: str = Field(default="LawGPT AI OS")
    APP_VERSION: str = Field(default="0.1.0")
    DEBUG: bool = Field(default=True)
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    ENVIRONMENT: Literal["development", "testing", "staging", "production"] = Field(default="development")

    # Storage Settings
    MAX_UPLOAD_SIZE: int = Field(default=10485760)  # 10MB default
    UPLOAD_FOLDER: str = Field(default="uploads")

    # Logging Settings
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(default="DEBUG")

    # Firebase Settings
    FIREBASE_PROJECT_ID: Optional[str] = Field(default=None)
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = Field(default=None)

    # Sarvam AI API Settings
    SARVAM_API_KEY: Optional[str] = Field(default=None)
    SARVAM_BASE_URL: str = Field(default="https://api.sarvam.ai")

    # Gemini API Settings
    GEMINI_API_KEY: Optional[str] = Field(default=None)

    # GCS Settings
    GCS_BUCKET: Optional[str] = Field(default=None)

    @field_validator("PORT")
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not (1 <= v <= 65535):
            raise ValueError("Port must be between 1 and 65535")
        return v

    @field_validator("MAX_UPLOAD_SIZE")
    @classmethod
    def validate_max_upload_size(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Max upload size must be a positive integer")
        return v

    @field_validator("SARVAM_API_KEY")
    @classmethod
    def validate_sarvam_key(cls, v: Optional[str], info) -> Optional[str]:
        # If environment is staging or production, we require SARVAM_API_KEY
        values = info.data
        env = values.get("ENVIRONMENT", "development")
        if env in ["staging", "production"] and not v:
            raise ValueError(f"SARVAM_API_KEY is required in {env} environment")
        return v

    @field_validator("FIREBASE_PROJECT_ID")
    @classmethod
    def validate_firebase_id(cls, v: Optional[str], info) -> Optional[str]:
        values = info.data
        env = values.get("ENVIRONMENT", "development")
        if env in ["staging", "production"] and not v:
            raise ValueError(f"FIREBASE_PROJECT_ID is required in {env} environment")
        return v

settings = Settings()
