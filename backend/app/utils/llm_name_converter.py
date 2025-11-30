"""Display name converter utilities.

Provides simple string transformation for default use, and optional LLM-based
intelligent conversion for the /api/clean-names endpoint.
"""

import json
import logging

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


def simple_title_case(name: str) -> str:
    """Convert field name to simple Title Case using string transformation rules.

    This is the default, fast method used by /api/analyze endpoint.
    No external API calls required.

    Rules:
    - Replace underscores and hyphens with spaces
    - Insert spaces before capital letters (camelCase)
    - Apply Title Case to all words

    Args:
        name: Field name

    Returns:
        Title Case display name

    Examples:
        >>> simple_title_case("user_name")
        'User Name'
        >>> simple_title_case("userId")
        'User Id'
        >>> simple_title_case("api_key")
        'Api Key'
        >>> simple_title_case("getUserData")
        'Get User Data'
        >>> simple_title_case("email-address")
        'Email Address'
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


def convert_batch_to_display_names_simple(field_names: list[str]) -> dict[str, str]:
    """Convert a batch of field names using simple Title Case transformation.

    This is the default method used by /api/analyze endpoint.
    Fast, predictable, no external dependencies.

    Args:
        field_names: List of technical field names

    Returns:
        Dictionary mapping field names to display names

    Examples:
        >>> convert_batch_to_display_names_simple(["user_id", "created_at"])
        {'user_id': 'User Id', 'created_at': 'Created At'}
    """
    return {name: simple_title_case(name) for name in field_names}


def convert_batch_to_display_names_llm(field_names: list[str]) -> dict[str, str]:
    """Convert a batch of field names using LLM for intelligent cleaning.

    This is used by the optional /api/clean-names endpoint.
    Handles complex cases like abbreviations, prefixes, suffixes.

    Batches up to 50 names per LLM call for efficiency.
    Falls back to simple Title Case if LLM fails.

    Args:
        field_names: List of technical field names

    Returns:
        Dictionary mapping field names to display names

    Raises:
        Exception: If LLM is not configured or fails

    Examples:
        >>> convert_batch_to_display_names_llm(["usr_prof_v2", "dt_created_ts"])
        {'usr_prof_v2': 'User Profile', 'dt_created_ts': 'Date Created'}
    """
    if not field_names:
        return {}

    if not settings.llm_provider:
        raise ValueError("LLM provider not configured")

    try:
        return _convert_with_llm(field_names)
    except Exception as e:
        logger.error("LLM display name conversion failed: %s", e)
        # Fall back to simple Title Case
        logger.warning("Falling back to simple Title Case conversion")
        return convert_batch_to_display_names_simple(field_names)


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
    if settings.llm_provider == "anthropic":
        return _convert_with_anthropic(prompt, field_names)
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
- Remove technical prefixes (fld_, tbl_, col_)
- Remove version suffixes (_v1, _v2, _new, _old)
- Expand abbreviations (usr→User, addr→Address, dt→Date, ts→Timestamp)
- Convert to Title Case with spaces
- Keep numbers only if meaningful (user_id_2 → User ID, not User ID 2)
- Be concise (max 3-4 words)

Examples:
usr_prof_v2 → User Profile
dt_created_ts → Date Created
fld_email_addr_1 → Email Address
getUserData → Get User Data
user$name → User Name

Field names:
{names_list}

Return a JSON object mapping each field name to its display name.
Example: {{"usr_prof_v2": "User Profile", "dt_created_ts": "Date Created"}}"""


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
    if not settings.openai_api_key:
        raise ValueError("OpenAI API key not configured")

    client = OpenAI(api_key=settings.openai_api_key)

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {
                "role": "system",
                "content": "You convert technical field names to human-readable names.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    result = response.choices[0].message.content
    if not result:
        raise ValueError("Empty response from OpenAI")

    conversions = json.loads(result)

    # Validate that all field names are present
    for name in field_names:
        if name not in conversions:
            logger.warning("LLM did not convert field '%s', using fallback", name)
            conversions[name] = simple_title_case(name)

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
    if not settings.anthropic_api_key:
        raise ValueError("Anthropic API key not configured")

    client = Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    result = response.content[0].text if response.content else None
    if not result:
        raise ValueError("Empty response from Anthropic")

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
            conversions[name] = simple_title_case(name)

    return conversions
