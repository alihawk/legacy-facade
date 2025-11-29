"""Utility for detecting primary key fields in API responses.

Uses heuristics to identify which field serves as the unique identifier:
- Exact matches: "id", "_id"
- Resource-specific patterns: "{resource}_id", "{resource}Id"
- LLM-based intelligent detection as fallback
"""

import logging

from openai import OpenAI
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class PrimaryKeyDetection(BaseModel):
    """Structured output for LLM primary key detection."""

    primary_key_field: str | None
    confidence: str  # "high", "medium", "low"
    reasoning: str


def detect_primary_key(
    field_names: list[str], resource_name: str | None = None
) -> str:
    """Detect the primary key field from a list of field names.

    Applies heuristics in order of priority:
    1. Exact match: "id"
    2. Exact match: "_id"
    3. Resource-specific pattern: "{resource}_id" (e.g., "user_id" for "users")
    4. Resource-specific pattern: "{resource}Id" (e.g., "userId" for "users")
    5. LLM-based intelligent detection (analyzes field names to identify primary key)
    6. Default: "id" (if LLM fails)

    Args:
        field_names: List of field names from the resource schema
        resource_name: Optional resource name for pattern matching (e.g., "users")

    Returns:
        Primary key field name (defaults to "id" if no match found)

    Examples:
        >>> detect_primary_key(["id", "name", "email"])
        'id'

        >>> detect_primary_key(["_id", "name", "email"])
        '_id'

        >>> detect_primary_key(["user_id", "name", "email"], "users")
        'user_id'

        >>> detect_primary_key(["userId", "name", "email"], "users")
        'userId'

        >>> detect_primary_key(["name", "email"])
        'id'
    """
    if not field_names:
        logger.debug("No field names provided, defaulting to 'id'")
        return "id"

    # Priority 1: Exact match "id"
    if "id" in field_names:
        logger.debug("Found exact match: 'id'")
        return "id"

    # Priority 2: Exact match "_id"
    if "_id" in field_names:
        logger.debug("Found exact match: '_id'")
        return "_id"

    # Priority 3 & 4: Resource-specific patterns
    if resource_name:
        # Normalize resource name (remove trailing 's' for singular form)
        singular_resource = _singularize_resource_name(resource_name)

        # Pattern: {resource}_id (snake_case)
        snake_case_pattern = f"{singular_resource}_id"
        if snake_case_pattern in field_names:
            logger.debug("Found resource pattern: '%s'", snake_case_pattern)
            return snake_case_pattern

        # Pattern: {resource}Id (camelCase)
        camel_case_pattern = f"{singular_resource}Id"
        if camel_case_pattern in field_names:
            logger.debug("Found resource pattern: '%s'", camel_case_pattern)
            return camel_case_pattern

        # Also try with the original resource name (in case it's already singular)
        if resource_name != singular_resource:
            snake_case_pattern_orig = f"{resource_name}_id"
            if snake_case_pattern_orig in field_names:
                logger.debug("Found resource pattern: '%s'", snake_case_pattern_orig)
                return snake_case_pattern_orig

            camel_case_pattern_orig = f"{resource_name}Id"
            if camel_case_pattern_orig in field_names:
                logger.debug("Found resource pattern: '%s'", camel_case_pattern_orig)
                return camel_case_pattern_orig

    # Priority 5: Use LLM to intelligently detect primary key
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

    # Priority 6: Default to "id" if LLM fails
    logger.debug(
        "No primary key pattern matched and LLM failed, defaulting to 'id'"
    )
    return "id"


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

    resource_context = (
        f" for resource '{resource_name}'" if resource_name else ""
    )

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
4. The field MUST be one of the provided field names
5. Be conservative - when in doubt, return null"""

    try:
        completion = client.chat.completions.parse(
            model=settings.llm_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at analyzing database schemas and API structures.",
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
                logger.debug(
                    "LLM has low confidence, falling back to default (reasoning: %s)",
                    result.reasoning,
                )
                return None
            
            # Validate that the returned field is in the list
            if result.primary_key_field in field_names:
                logger.debug(
                    "LLM detected primary key: '%s' (confidence: %s, reasoning: %s)",
                    result.primary_key_field,
                    result.confidence,
                    result.reasoning,
                )
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


def _singularize_resource_name(resource_name: str) -> str:
    """Convert plural resource name to singular form.

    Simple heuristic: removes trailing 's' if present.
    Handles common cases like "users" -> "user", "items" -> "item".

    Args:
        resource_name: Resource name (e.g., "users", "items")

    Returns:
        Singular form (e.g., "user", "item")

    Examples:
        >>> _singularize_resource_name("users")
        'user'

        >>> _singularize_resource_name("items")
        'item'

        >>> _singularize_resource_name("data")
        'data'
    """
    # Don't singularize very short words (likely already singular or edge cases)
    if len(resource_name) <= 3:
        return resource_name
    
    # Handle special cases
    if resource_name.endswith("ies") and len(resource_name) > 4:
        # "categories" -> "category"
        return resource_name[:-3] + "y"
    elif resource_name.endswith("ses") and len(resource_name) > 4:
        # "addresses" -> "address"
        return resource_name[:-2]
    elif resource_name.endswith("s") and len(resource_name) > 1:
        # "users" -> "user"
        return resource_name[:-1]
    else:
        # Already singular or unknown pattern
        return resource_name
