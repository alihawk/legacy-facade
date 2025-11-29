"""Utility for unwrapping nested API response structures.

Legacy APIs often wrap data in nested structures like:
- {Data: {Users: [...]}}
- {data: [...]}
- {result: {items: [...]}}
- {response: {data: [...]}}

This module extracts the actual data array or object from these wrappers.
"""

import logging
from typing import Union

logger = logging.getLogger(__name__)


def unwrap_response(
    response_data: Union[dict, list, str, int, float, bool, None]
) -> Union[dict, list, str, int, float, bool, None]:
    """Unwrap nested response structures to extract actual data.

    Handles common legacy API patterns:
    - Root-level arrays: [...] → [...]
    - Single wrapper: {data: [...]} → [...]
    - Nested wrappers: {Data: {Users: [...]}} → [...]
    - Multiple nesting levels

    Args:
        response_data: Raw API response (dict, list, or primitive)

    Returns:
        Unwrapped data (typically a list or dict)

    Examples:
        >>> unwrap_response([{"id": 1}])
        [{"id": 1}]

        >>> unwrap_response({"data": [{"id": 1}]})
        [{"id": 1}]

        >>> unwrap_response({"Data": {"Users": [{"id": 1}]}})
        [{"id": 1}]
    """
    if not isinstance(response_data, dict):
        # Already unwrapped (array or primitive)
        return response_data

    # Track unwrapping depth to prevent infinite loops
    max_depth = 10
    current = response_data
    depth = 0

    while isinstance(current, dict) and depth < max_depth:
        # Check if this dict has exactly one key (common wrapper pattern)
        if len(current) == 1:
            key = next(iter(current))
            value = current[key]

            # If the value is a list or dict, unwrap it
            if isinstance(value, (list, dict)):
                logger.debug("Unwrapping nested key: %s", key)
                current = value
                depth += 1
                continue

        # Check for common wrapper keys (case-insensitive)
        wrapper_keys = [
            "data",
            "Data",
            "result",
            "Result",
            "results",
            "Results",
            "items",
            "Items",
            "response",
            "Response",
            "payload",
            "Payload",
        ]

        found_wrapper = False
        for wrapper_key in wrapper_keys:
            if wrapper_key in current:
                value = current[wrapper_key]
                if isinstance(value, (list, dict)):
                    logger.debug("Unwrapping wrapper key: %s", wrapper_key)
                    current = value
                    depth += 1
                    found_wrapper = True
                    break

        if not found_wrapper:
            # No more unwrapping possible
            break

    if depth >= max_depth:
        logger.warning("Max unwrapping depth reached, returning current state")

    return current


def extract_array_from_response(
    response_data: Union[dict, list, str, int, float, bool, None]
) -> list[dict[str, Union[str, int, float, bool, None, list, dict]]]:
    """Extract an array of objects from a response.

    Unwraps nested structures and ensures the result is a list of dicts.
    If the unwrapped data is a single object, wraps it in a list.

    Args:
        response_data: Raw API response

    Returns:
        List of dictionaries representing data items

    Raises:
        ValueError: If response cannot be converted to a list of objects

    Examples:
        >>> extract_array_from_response([{"id": 1}])
        [{"id": 1}]

        >>> extract_array_from_response({"data": [{"id": 1}]})
        [{"id": 1}]

        >>> extract_array_from_response({"id": 1})
        [{"id": 1}]
    """
    unwrapped = unwrap_response(response_data)

    if isinstance(unwrapped, list):
        # Filter to only dict items (ignore primitives in array)
        dict_items = [item for item in unwrapped if isinstance(item, dict)]
        if not dict_items:
            raise ValueError("Response array contains no objects")
        return dict_items

    if isinstance(unwrapped, dict):
        # Single object - wrap in list
        return [unwrapped]

    raise ValueError(
        f"Cannot extract array from response of type {type(unwrapped).__name__}"
    )
