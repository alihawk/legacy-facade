"""Pytest configuration and fixtures."""

import pytest


def pytest_addoption(parser):
    """Add custom command line options."""
    parser.addoption(
        "--run-llm-tests",
        action="store_true",
        default=False,
        help="Run slow LLM-based tests that require API keys",
    )


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "llm: mark test as requiring LLM API (slow, requires API key)"
    )
