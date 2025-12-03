"""Application configuration."""

from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine the path to the .env file (in backend directory)
_backend_dir = Path(__file__).parent.parent.parent
_env_file = _backend_dir / ".env"

# Explicitly load .env before pydantic reads settings
load_dotenv(_env_file, override=True)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(_env_file),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # HTTP request configuration
    analyzer_timeout_seconds: int = 30
    analyzer_max_payload_mb: int = 10
    analyzer_log_level: str = "INFO"

    # LLM configuration for intelligent field analysis
    llm_provider: str = "openai"
    openai_api_key: str = ""  # Loaded from .env - no hardcoded default
    anthropic_api_key: str = ""  # Loaded from .env
    llm_model: str = "gpt-4o-mini"
    llm_batch_size: int = 50


# Global settings instance
settings = Settings()