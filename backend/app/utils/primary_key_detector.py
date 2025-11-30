"""Utility for detecting primary key fields in API responses.

Uses regex-based heuristics with word boundaries to identify primary key fields:
- Fields containing: "id", "key", "code", "number"
- Fields with: "uuid", "guid"
- Exact matches: "pk", "primary_key"
- Numeric identifiers: "no", "num", "seq"
- Legacy patterns: "recid", "record_id", "rowid"

LLM-based detection is used only when:
- Zero fields match patterns (ambiguous case)
- Multiple fields match patterns (need disambiguation)
"""

import logging
import re
from typing import Literal


from openai import OpenAI
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class PrimaryKeyDetection(BaseModel):
    """Structured output for LLM primary key detection."""

    primary_key_field: str | None
    confidence: Literal["high", "low"]


# Primary key patterns - match at word boundaries, after underscore/hyphen, or in camelCase
# Patterns match: start of string, after _, after -, or after lowercase letter (camelCase)
# and end with: end of string, before _, before -, or before uppercase letter (camelCase)
PRIMARY_KEY_PATTERNS = [
    r"(?:^|_|-|(?<=[a-z]))id(?=$|_|-|(?=[A-Z]))",  # "id", "user_id", "userId"
    r"(?:^|_|-|(?<=[a-z]))key(?=$|_|-|(?=[A-Z]))",  # "key", "api_key", "userKey"
    r"(?:^|_|-|(?<=[a-z]))code(?=$|_|-|(?=[A-Z]))",  # "code", "user_code"
    r"(?:^|_|-|(?<=[a-z]))number(?=$|_|-|(?=[A-Z]))",  # "number", "account_number"
    r"(?:^|_|-|(?<=[a-z]))uuid(?=$|_|-|(?=[A-Z]))",  # "uuid", "user_uuid"
    r"(?:^|_|-|(?<=[a-z]))guid(?=$|_|-|(?=[A-Z]))",  # "guid", "user_guid"
    r"(?:^|_|-|(?<=[a-z]))pk(?=$|_|-|(?=[A-Z]))",  # "pk"
    r"(?:^|_|-)primary_key(?=$|_|-)",  # "primary_key"
    r"(?:^|_|-|(?<=[a-z]))no(?=$|_|-|(?=[A-Z]))",  # "no", "user_no", "account_no"
    r"(?:^|_|-|(?<=[a-z]))num(?=$|_|-|(?=[A-Z]))",  # "num", "user_num"
    r"(?:^|_|-|(?<=[a-z]))seq(?=$|_|-|(?=[A-Z]))",  # "seq", "sequence"
    r"(?:^|_|-)recid(?=$|_|-)",  # "recid"
    r"(?:^|_|-)record_id(?=$|_|-)",  # "record_id"
    r"(?:^|_|-)rowid(?=$|_|-)",  # "rowid", "row_id"
]


def detect_primary_key(
    field_names: list[str], resource_name: str | None = None
) -> str:
    """Detect the primary key field from a list of field names.

    Applies regex-based heuristics with word boundaries to find primary key candidates.
    Uses LLM only when zero or multiple candidates are found.

    Priority:
    1. Find all fields matching primary key patterns (using word boundary regex)
    2. If exactly one match: return it
    3. If zero matches: use LLM detection, fallback to "id"
    4. If multiple matches: use LLM to disambiguate, fallback to first match

    Args:
        field_names: List of field names from the resource schema
        resource_name: Optional resource name for context (used by LLM)

    Returns:
        Primary key field name (defaults to "id" if no match found)

    Examples:
        >>> detect_primary_key(["id", "name", "email"])
        'id'

        >>> detect_primary_key(["user_id", "name", "email"])
        'user_id'

        >>> detect_primary_key(["userId", "name", "email"])
        'userId'

        >>> detect_primary_key(["uuid", "name", "email"])
        'uuid'

        >>> detect_primary_key(["account_number", "name", "email"])
        'account_number'

        >>> detect_primary_key(["name", "email"])  # No match, uses LLM or defaults
        'id'
    """
    if not field_names:
        logger.debug("No field names provided, defaulting to 'id'")
        return "id"

    # Find all fields matching primary key patterns
    candidates = _find_primary_key_candidates(field_names)

    if len(candidates) == 1:
        # Exactly one match - use it
        logger.debug("Found single primary key candidate: '%s'", candidates[0])
        return candidates[0]

    if len(candidates) == 0:
        # No matches - use LLM or default to "id"
        logger.debug("No primary key candidates found, trying LLM detection")
        try:
            llm_result = _detect_primary_key_with_llm(field_names, resource_name)
            if llm_result and llm_result in field_names:
                logger.info(
                    "LLM detected primary key: '%s' from fields: %s",
                    llm_result,
                    field_names,
                )
                return llm_result
        except Exception as e:
            logger.warning("LLM primary key detection failed: %s", e)

        logger.debug("No primary key found, defaulting to 'id'")
        return "id"

    # Multiple matches - use LLM to disambiguate
    logger.debug(
        "Multiple primary key candidates found: %s, using LLM to disambiguate",
        candidates,
    )
    try:
        llm_result = _detect_primary_key_with_llm(field_names, resource_name)
        if llm_result and llm_result in field_names:
            logger.info(
                "LLM disambiguated primary key: '%s' from candidates: %s",
                llm_result,
                candidates,
            )
            return llm_result
    except Exception as e:
        logger.warning("LLM disambiguation failed: %s", e)

    # Fallback to first candidate
    logger.debug("LLM failed, using first candidate: '%s'", candidates[0])
    return candidates[0]


def _find_primary_key_candidates(field_names: list[str]) -> list[str]:
    """Find all field names matching primary key patterns.

    Uses word boundary regex to match patterns like "id", "key", "uuid", etc.
    Prioritizes "id" pattern - if found, returns only "id" matches.

    Args:
        field_names: List of field names to search

    Returns:
        List of field names matching primary key patterns

    Examples:
        >>> _find_primary_key_candidates(["id", "name", "email"])
        ['id']

        >>> _find_primary_key_candidates(["user_id", "user_name", "email"])
        ['user_id']

        >>> _find_primary_key_candidates(["uuid", "guid", "name"])
        ['uuid', 'guid']

        >>> _find_primary_key_candidates(["video", "audio", "name"])
        []
        
        >>> _find_primary_key_candidates(["user_id", "dept_code"])
        ['user_id']  # Only returns id pattern, ignores code
    """
    # First pass: look for "id" pattern (highest priority)
    id_pattern = r"(?:^|_|-|(?<=[a-z]))id(?=$|_|-|(?=[A-Z]))"
    id_candidates = []
    
    for field_name in field_names:
        field_lower = field_name.lower()
        if re.search(id_pattern, field_lower):
            id_candidates.append(field_name)
    
    # If we found any "id" matches, return only those
    if id_candidates:
        return id_candidates
    
    # Second pass: look for other patterns
    candidates = []
    for field_name in field_names:
        field_lower = field_name.lower()
        for pattern in PRIMARY_KEY_PATTERNS[1:]:  # Skip first pattern (id) since we checked it
            if re.search(pattern, field_lower):
                candidates.append(field_name)
                break  # Only add once even if multiple patterns match

    return candidates


def _detect_primary_key_with_llm(
    field_names: list[str], resource_name: str | None = None
) -> str | None:
    """Use OpenAI LLM to intelligently detect primary key field.

    Args:
        field_names: List of field names from the resource schema
        resource_name: Optional resource name for context

    Returns:
        Detected primary key field name, or None if detection fails

    Raises:
        Exception: If LLM API call fails
    """
    if not settings.openai_api_key:
        logger.debug("OpenAI API key not configured, skipping LLM detection")
        return None

    client = OpenAI(api_key=settings.openai_api_key)

    resource_context = f" for resource '{resource_name}'" if resource_name else ""

    prompt = f"""You are analyzing field names from a legacy API response{resource_context}.
Your task is to identify which field serves as the primary key (unique identifier).

Field names: {', '.join(field_names)}

Common primary key patterns:
- Fields containing "id", "key", "code", "number"
- Fields with "uuid", "guid" patterns
- Fields like "pk", "primary_key"
- Numeric identifiers: "no", "num", "seq"
- Legacy patterns: "recid", "record_id", "rowid"

IMPORTANT RULES:
1. Only return a field name if it clearly matches a primary key pattern above
2. Fields like "name", "email", "phone", "address", "description" are NOT primary keys
3. If no field matches a clear primary key pattern, return null
4. The field MUST be exactly one of the provided field names
5. Be conservative - when in doubt, return null"""

    try:
        completion = client.chat.completions.parse(
            model=settings.llm_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at analyzing database schemas.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format=PrimaryKeyDetection,
        )

        message = completion.choices[0].message

        # Check if the response was parsed successfully
        if message.parsed:
            result = message.parsed

            # If LLM is not confident, return None to fall back to default
            if result.confidence == "low" or result.primary_key_field is None:
                logger.debug("LLM has low confidence, falling back to default")
                return None

            # Validate that the returned field is in the list
            if result.primary_key_field in field_names:
                logger.debug(
                    "LLM detected primary key: '%s' (confidence: %s)",
                    result.primary_key_field,
                    result.confidence                )
                return result.primary_key_field

            logger.warning(
                "LLM returned invalid field: '%s' not in %s",
                result.primary_key_field,
                field_names,
            )
            return None

        # Handle refusal case
        if message.refusal:
            logger.warning("LLM refused to respond: %s", message.refusal)
            return None

        logger.warning("LLM response could not be parsed")
        return None

    except Exception as e:
        logger.error("LLM API call failed: %s", e)
        raise
