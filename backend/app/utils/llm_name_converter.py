"""LLM-based display name converter.

Uses OpenAI or Anthropic to convert technical field names into human-readable
display names. Includes batching for efficiency and in-memory caching.
Falls back to simple Title Case if LLM is unavailable.
"""

import logging
from typing import Any

from anthropic import Anthropic
from openai import OpenAI
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class DisplayNameConversion(BaseModel):
    """Structured output for LLM display name conversion."""

    field_name: str
    display_name: str


class DisplayNameBatch(BaseModel):
    """Batch of display name conversions."""

    conversions: list[DisplayNameConversion]


# In-memory cache for display name conversions (per-request)
_display_name_cache: dict[str, str] = {}


def clear_cache() -> None:
    """Clear the display name cache.

    Should be called at the start of each request to ensure fresh conversions.
    """
    global _display_name_cache
    _display_name_cache = {}


def convert_to_display_name(field_name: str) -> str:
    """Convert a single field name to display name.

    Uses cache if available, otherwise falls back to Title Case.
    For batch conversion, use convert_batch_to_display_names().

    Args:
        field_name: Technical field name (e.g., "user_id", "createdAt")

    Returns:
        Human-readable display name (e.g., "User ID", "Created At")

    Examples:
        >>> convert_to_display_name("user_name")
        'User Name'
        >>> convert_to_display_name("userId")
        'User Id'
        >>> convert_to_display_name("api_key")
        'Api Key'
    """
    # Check cache first
    if field_name in _display_name_cache:
        return _display_name_cache[field_name]

    # Fallback to simple Title Case
    display_name = _simple_title_case(field_name)
    _display_name_cache[field_name] = display_name
    return display_name


def convert_batch_to_display_names(
    field_names: list[str], use_llm: bool = True
) -> dict[str, str]:
    """Convert a batch of field names to display names using LLM.

    Batches up to 50 names per LLM call for efficiency.
    Caches results in memory for the duration of the request.
    Falls back to Title Case if LLM fails.

    Args:
        field_names: List of technical field names
        use_llm: Whether to attempt LLM conversion (default True)

    Returns:
        Dictionary mapping field names to display names

    Examples:
        >>> convert_batch_to_display_names(["user_id", "created_at"])
        {'user_id': 'User ID', 'created_at': 'Created At'}
    """
    if not field_names:
        return {}

    # Check cache for existing conversions
    uncached_names = [name for name in field_names if name not in _display_name_cache]

    if not uncached_names:
        # All names are cached
        return {name: _display_name_cache[name] for name in field_names}

    # Try LLM conversion if enabled
    if use_llm and settings.llm_provider:
        try:
            conversions = _convert_with_llm(uncached_names)
            # Update cache
            _display_name_cache.update(conversions)
        except Exception as e:
            logger.warning("LLM display name conversion failed: %s", e)
            # Fall back to Title Case for uncached names
            for name in uncached_names:
                if name not in _display_name_cache:
                    _display_name_cache[name] = _simple_title_case(name)
    else:
        # Use Title Case fallback
        for name in uncached_names:
            _display_name_cache[name] = _simple_title_case(name)

    # Return all requested names from cache
    return {name: _display_name_cache[name] for name in field_names}


def _convert_with_llm(field_names: list[str]) -> dict[str, str]:
    """Convert field names using LLM (OpenAI or Anthropic).

    Batches up to 50 names per call.

    Args:
        field_names: List of field names to convert

    Returns:
        Dictionary mapping field names to display names

    Raises:
        Exception: If LLM API call fails
    """
    # Batch into groups of 50
    batch_size = 50
    all_conversions = {}

    for i in range(0, len(field_names), batch_size):
        batch = field_names[i : i + batch_size]
        conversions = _convert_batch_with_llm(batch)
        all_conversions.update(conversions)

    return all_conversions


def _convert_batch_with_llm(field_names: list[str]) -> dict[str, str]:
    """Convert a single batch of field names using LLM.

    Args:
        field_names: List of up to 50 field names

    Returns:
        Dictionary mapping field names to display names

    Raises:
        Exception: If LLM API call fails
    """
    prompt = _build_conversion_prompt(field_names)

    if settings.llm_provider == "openai":
        return _convert_with_openai(prompt, field_names)
    elif settings.llm_provider == "anthropic":
        return _convert_with_anthropic(prompt, field_names)
    else:
        raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")


def _build_conversion_prompt(field_names: list[str]) -> str:
    """Build prompt for LLM display name conversion.

    Args:
        field_names: List of field names to convert

    Returns:
        Formatted prompt string
    """
    names_list = "\n".join(f"- {name}" for name in field_names)

    return f"""Convert these technical field names into human-readable display names.

Rules:
- Convert snake_case and camelCase to Title Case with spaces
- Expand common abbreviations (e.g., "id" → "ID", "url" → "URL", "api" → "API")
- Keep acronyms uppercase (e.g., "user_id" → "User ID", not "User Id")
- Make names natural and professional for a business application UI

Field names:
{names_list}

Return a JSON object mapping each field name to its display name.
Example: {{"user_id": "User ID", "created_at": "Created At"}}"""


def _convert_with_openai(prompt: str, field_names: list[str]) -> dict[str, str]:
    """Convert using OpenAI API.

    Args:
        prompt: Conversion prompt
        field_names: List of field names

    Returns:
        Dictionary mapping field names to display names

    Raises:
        Exception: If API call fails
    """
    client = OpenAI(api_key=settings.openai_api_key)

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that converts technical field names to human-readable display names.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    result = response.choices[0].message.content
    if not result:
        raise ValueError("Empty response from OpenAI")

    import json

    conversions = json.loads(result)

    # Validate that all field names are present
    for name in field_names:
        if name not in conversions:
            logger.warning("LLM did not convert field '%s', using fallback", name)
            conversions[name] = _simple_title_case(name)

    return conversions


def _convert_with_anthropic(prompt: str, field_names: list[str]) -> dict[str, str]:
    """Convert using Anthropic API.

    Args:
        prompt: Conversion prompt
        field_names: List of field names

    Returns:
        Dictionary mapping field names to display names

    Raises:
        Exception: If API call fails
    """
    client = Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    result = response.content[0].text if response.content else None
    if not result:
        raise ValueError("Empty response from Anthropic")

    import json

    # Extract JSON from response (Claude might wrap it in markdown)
    if "```json" in result:
        result = result.split("```json")[1].split("```")[0].strip()
    elif "```" in result:
        result = result.split("```")[1].split("```")[0].strip()

    conversions = json.loads(result)

    # Validate that all field names are present
    for name in field_names:
        if name not in conversions:
            logger.warning("LLM did not convert field '%s', using fallback", name)
            conversions[name] = _simple_title_case(name)

    return conversions


def _simple_title_case(name: str) -> str:
    """Convert field name to simple Title Case.

    Fallback when LLM is unavailable.

    Args:
        name: Field name

    Returns:
        Title Case display name

    Examples:
        >>> _simple_title_case("user_name")
        'User Name'
        >>> _simple_title_case("userId")
        'User Id'
        >>> _simple_title_case("api_key")
        'Api Key'
    """
    # Replace underscores and hyphens with spaces
    name = name.replace("_", " ").replace("-", " ")

    # Insert space before capital letters (camelCase)
    result = []
    for i, char in enumerate(name):
        if i > 0 and char.isupper() and name[i - 1].islower():
            result.append(" ")
        result.append(char)

    name = "".join(result)

    # Title case
    return name.title()
