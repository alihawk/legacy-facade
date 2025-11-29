"""Application configuration."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine the path to the .env file (in backend directory)
_backend_dir = Path(__file__).parent.parent.parent
_env_file = _backend_dir / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(_env_file),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra fields in .env
        # Note: Environment variables take precedence over .env file by default
        # To use .env values, unset the environment variable or update it
    )

    # HTTP request configuration
    analyzer_timeout_seconds: int = 30
    analyzer_max_payload_mb: int = 10
    analyzer_log_level: str = "INFO"

    # LLM configuration for intelligent field analysis
    llm_provider: str = "openai"
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_batch_size: int = 50


# Global settings instance
settings = Settings()
