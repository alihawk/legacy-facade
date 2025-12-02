"""Pytest configuration to mock LLM calls by default."""

import pytest
from unittest.mock import patch


@pytest.fixture(autouse=True)
def mock_llm_settings():
    """Mock LLM settings to prevent actual API calls during tests."""
    with patch("app.utils.primary_key_detector.settings") as mock_settings:
        mock_settings.openai_api_key = None
        mock_settings.anthropic_api_key = None
        mock_settings.llm_provider = None
        yield mock_settings
