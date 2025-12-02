"""Type inference utilities for API field analysis.

Infers field types from values, OpenAPI schemas, and multiple samples.
Supports rich type detection including currency, datetime, UUID, URL, phone, etc.
"""

import re
from typing import Any

# import phonenumbers  # PERFORMANCE: Disabled - expensive validation
from dateutil import parser as date_parser


# Type flexibility hierarchy (for conflict resolution)
# More flexible types win when there are conflicts
# Text is more flexible than string (can hold longer content)
TYPE_FLEXIBILITY = {
    "text": 100,  # Most flexible string type
    "string": 90,
    "currency": 80,
    "url": 70,
    "email": 60,
    "phone": 50,
    "uuid": 40,
    "datetime": 30,
    "number": 20,
    "boolean": 10,
    "object": 5,
    "array": 0,
}

# Regex patterns for special string types
EMAIL_PATTERN = re.compile(r".+@.+\..+")
UUID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
)
URL_PATTERN = re.compile(r"^https?://[^\s]+$", re.IGNORECASE)
# Currency pattern - must have at least one currency symbol
CURRENCY_PATTERN = re.compile(r"^([$€£¥₹]\s*[\d,]+\.?\d*|[\d,]+\.?\d*\s*[$€£¥₹])$")


def try_coerce_to_number(value: Any) -> int | float | Any:
    """Try to parse value as number.

    Attempts to convert strings to numbers. Returns the number if successful,
    otherwise returns the original value unchanged.
    Supports scientific notation (1e-05, 1.5e10, etc.)

    Args:
        value: Value to attempt number coercion on

    Returns:
        int, float, or original value

    Examples:
        >>> try_coerce_to_number("123")
        123
        >>> try_coerce_to_number("12.5")
        12.5
        >>> try_coerce_to_number("1e-05")
        1e-05
        >>> try_coerce_to_number("abc")
        'abc'
        >>> try_coerce_to_number(123)
        123
    """
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return value

    if not isinstance(value, str):
        return value

    # Try to parse as number
    try:
        # Remove common number formatting (but not scientific notation)
        cleaned = value.strip().replace(",", "")

        # Try float first (handles both int and float, including scientific notation)
        result = float(cleaned)

        # If it's a whole number and not in scientific notation, return as int
        if result.is_integer() and "e" not in cleaned.lower():
            return int(result)

        return result
    except (ValueError, AttributeError):
        return value


def _is_currency(value: str) -> bool:
    """Check if string matches currency pattern.

    Args:
        value: String to check

    Returns:
        True if matches currency pattern

    Examples:
        >>> _is_currency("$1,234.56")
        True
        >>> _is_currency("€100.00")
        True
        >>> _is_currency("123.45")
        False
    """
    return bool(CURRENCY_PATTERN.match(value.strip()))


def _is_email(value: str) -> bool:
    """Check if string matches email pattern.

    Args:
        value: String to check

    Returns:
        True if matches email pattern

    Examples:
        >>> _is_email("test@example.com")
        True
        >>> _is_email("invalid")
        False
    """
    return bool(EMAIL_PATTERN.match(value))


def _is_uuid(value: str) -> bool:
    """Check if string matches UUID pattern.

    Args:
        value: String to check

    Returns:
        True if matches UUID pattern

    Examples:
        >>> _is_uuid("550e8400-e29b-41d4-a716-446655440000")
        True
        >>> _is_uuid("not-a-uuid")
        False
    """
    return bool(UUID_PATTERN.match(value))


def _is_url(value: str) -> bool:
    """Check if string matches URL pattern.

    Args:
        value: String to check

    Returns:
        True if matches URL pattern

    Examples:
        >>> _is_url("https://example.com")
        True
        >>> _is_url("not a url")
        False
    """
    return bool(URL_PATTERN.match(value))


def _is_phone(value: str) -> bool:  # noqa: ARG001
    """Check if string matches phone number pattern.

    PERFORMANCE: Disabled to avoid expensive phonenumbers library validation.
    Phone fields will be detected as "string" type instead.

    Args:
        value: String to check

    Returns:
        Always False (phone detection disabled)

    Examples:
        >>> _is_phone("+1-555-123-4567")
        False
        >>> _is_phone("not a phone")
        False
    """
    return False
    # PERFORMANCE: Original implementation disabled
    # try:
    #     parsed = phonenumbers.parse(value, None)
    #     return phonenumbers.is_valid_number(parsed)
    # except phonenumbers.NumberParseException:
    #     try:
    #         parsed = phonenumbers.parse(value, "US")
    #         return phonenumbers.is_valid_number(parsed)
    #     except phonenumbers.NumberParseException:
    #         return False


def _is_datetime(value: str) -> bool:
    """Check if string can be parsed as datetime.

    Uses dateutil parser for robust datetime detection.
    Requires at least a date separator (-, /, :) to avoid false positives.

    Args:
        value: String to check

    Returns:
        True if can be parsed as datetime

    Examples:
        >>> _is_datetime("2024-01-15")
        True
        >>> _is_datetime("2024-01-15T10:30:00")
        True
        >>> _is_datetime("not a date")
        False
        >>> _is_datetime("123")
        False
    """
    # Require at least one date separator to avoid false positives
    if not any(sep in value for sep in ["-", "/", ":"]):
        return False

    try:
        date_parser.parse(value)
        return True
    except (ValueError, TypeError, date_parser.ParserError):
        return False


def infer_field_type(value: Any) -> str:
    """Infer field type from a single value.

    Detects types in priority order:
    1. Skip null/None
    2. Boolean
    3. Number (int/float)
    4. Array (with item type inference, max 2 levels)
    5. Object (dict)
    6. String patterns (after attempting number coercion):
       - Currency
       - Email
       - DateTime
       - UUID
       - URL
       - Phone
       - Text (>100 chars)
       - String (default)

    Args:
        value: Value to infer type from

    Returns:
        Type string: "number", "boolean", "email", "datetime", "currency",
                    "url", "uuid", "phone", "text", "string",
                    "array[dtype]", "object"

    Examples:
        >>> infer_field_type(123)
        'number'
        >>> infer_field_type(True)
        'boolean'
        >>> infer_field_type("test@example.com")
        'email'
        >>> infer_field_type([1, 2, 3])
        'array[number]'
    """
    # Skip null/None
    if value is None:
        return "string"  # Default for null

    # Boolean (check before number since bool is subclass of int)
    if isinstance(value, bool):
        return "boolean"

    # Number
    if isinstance(value, (int, float)):
        return "number"

    # Array
    if isinstance(value, list):
        return infer_array_type(value)

    # Object
    if isinstance(value, dict):
        return "object"

    # String patterns
    if isinstance(value, str):
        # Check special string patterns BEFORE number coercion
        # This prevents long numeric strings from being coerced
        if _is_currency(value):
            return "currency"

        if _is_email(value):
            return "email"

        if _is_datetime(value):
            return "datetime"

        if _is_uuid(value):
            return "uuid"

        if _is_url(value):
            return "url"

        # PERFORMANCE: Phone validation skipped (expensive phonenumbers library)
        # if _is_phone(value):
        #     return "phone"

        # Text vs string based on length (before number coercion)
        if len(value) > 100:
            return "text"

        # Try to coerce to number last (only for short strings)
        coerced = try_coerce_to_number(value)
        if isinstance(coerced, (int, float)):
            return "number"

        return "string"

    # Fallback
    return "string"


def infer_array_type(items: list[Any], max_depth: int = 2, current_depth: int = 1) -> str:
    """Infer type for array with item type detection.

    Supports nested arrays up to max_depth levels.
    Empty arrays default to "array[object]".

    Args:
        items: List of items to infer type from
        max_depth: Maximum nesting depth (default 2)
        current_depth: Current nesting level (internal use)

    Returns:
        Type string like "array[number]" or "array[array[string]]"

    Examples:
        >>> infer_array_type([1, 2, 3])
        'array[number]'
        >>> infer_array_type([[1, 2], [3, 4]])
        'array[array[number]]'
        >>> infer_array_type([])
        'array[object]'
    """
    if not items:
        return "array[object]"

    # Filter out nulls
    non_null_items = [item for item in items if item is not None]

    if not non_null_items:
        return "array[object]"

    # Check if we've hit depth limit
    if current_depth >= max_depth:
        # At max depth, just return array[object] for nested arrays
        if any(isinstance(item, list) for item in non_null_items):
            return "array[object]"

    # Infer types from all items
    item_types = []
    for item in non_null_items:
        if isinstance(item, list) and current_depth < max_depth:
            # Recursively infer nested array type
            item_type = infer_array_type(item, max_depth, current_depth + 1)
        else:
            item_type = infer_field_type(item)
        item_types.append(item_type)

    # If all same type, use that
    unique_types = set(item_types)
    if len(unique_types) == 1:
        item_type = item_types[0]
    else:
        # Conflict: pick most flexible type
        item_type = max(unique_types, key=lambda t: TYPE_FLEXIBILITY.get(t, 0))

    return f"array[{item_type}]"


def infer_type_from_values(values: list[Any]) -> str:
    """Infer type from multiple values (skip nulls).

    When types conflict, picks the most flexible type according to
    TYPE_FLEXIBILITY hierarchy.

    Args:
        values: List of values to infer type from

    Returns:
        Inferred type string

    Examples:
        >>> infer_type_from_values([1, 2, 3])
        'number'
        >>> infer_type_from_values([1, "abc"])
        'string'
        >>> infer_type_from_values([None, None])
        'string'
    """
    # Filter out nulls
    non_null_values = [v for v in values if v is not None]

    if not non_null_values:
        return "string"  # Default for all nulls

    # Infer types from all values
    types = [infer_field_type(v) for v in non_null_values]

    # If all same type, use that
    unique_types = set(types)
    if len(unique_types) == 1:
        return types[0]

    # Conflict: pick most flexible type
    return max(unique_types, key=lambda t: TYPE_FLEXIBILITY.get(t, 0))


def infer_type_from_openapi_schema(schema: dict) -> str:
    """Infer type from OpenAPI schema definition.

    Maps OpenAPI types to our type system:
    - integer/number → "number"
    - boolean → "boolean"
    - string + format → specific types (email, date, uuid, etc.)
    - array → "array[dtype]"
    - object → "object"

    Args:
        schema: OpenAPI schema dict with "type" and optional "format"

    Returns:
        Inferred type string

    Examples:
        >>> infer_type_from_openapi_schema({"type": "integer"})
        'number'
        >>> infer_type_from_openapi_schema({"type": "string", "format": "email"})
        'email'
        >>> infer_type_from_openapi_schema({"type": "array", "items": {"type": "integer"}})
        'array[number]'
    """
    schema_type = schema.get("type", "string")
    schema_format = schema.get("format")

    # Number types
    if schema_type in ("integer", "number"):
        return "number"

    # Boolean
    if schema_type == "boolean":
        return "boolean"

    # Array
    if schema_type == "array":
        items_schema = schema.get("items", {})
        if items_schema:
            item_type = infer_type_from_openapi_schema(items_schema)
            return f"array[{item_type}]"
        return "array[object]"

    # Object
    if schema_type == "object":
        return "object"

    # String with format
    if schema_type == "string":
        if schema_format == "email":
            return "email"
        if schema_format in ("date", "date-time", "datetime"):
            return "datetime"
        if schema_format == "uuid":
            return "uuid"
        if schema_format in ("uri", "url"):
            return "url"
        if schema_format == "phone":
            return "phone"

        # Check for long text (maxLength hint)
        max_length = schema.get("maxLength")
        if max_length and max_length > 100:
            return "text"

        return "string"

    # Fallback
    return "string"
