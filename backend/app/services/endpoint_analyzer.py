"""Endpoint analyzer service.

Makes live HTTP requests to legacy API endpoints to infer resource schemas.
Supports various authentication methods and handles nested response structures.
"""

import base64
import json
import logging
from typing import Any

from app.core.http_client import HTTPClient
from app.models.resource_schema import ResourceSchema
from app.services.json_analyzer import analyze_json_sample

logger = logging.getLogger(__name__)


async def analyze_endpoint(
    base_url: str,
    endpoint_path: str,
    method: str = "GET",
    auth_type: str | None = None,
    auth_value: str | None = None,
    custom_headers: dict[str, str] | None = None,
) -> list[ResourceSchema]:
    """Analyze a live API endpoint by making an HTTP request.

    Args:
        base_url: Base URL of the API (e.g., "https://api.example.com")
        endpoint_path: Path to the endpoint (e.g., "/api/v1/users")
        method: HTTP method (default: "GET")
        auth_type: Authentication type: "bearer", "api-key", "basic", or None
        auth_value: Authentication value (token, key, or "username:password" for basic)
        custom_headers: Additional custom headers as dict

    Returns:
        List of ResourceSchema objects

    Raises:
        ValueError: If endpoint is unreachable or returns invalid data
    """
    # Build full URL
    full_url = f"{base_url.rstrip('/')}/{endpoint_path.lstrip('/')}"

    # Build headers
    headers = _build_headers(auth_type, auth_value, custom_headers)

    # Make HTTP request
    try:
        async with HTTPClient() as client:
            if method.upper() == "GET":
                response = await client.get(full_url, headers=headers)
            elif method.upper() == "POST":
                response = await client.post(full_url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            # Parse response as JSON
            try:
                response_data = response.json()
            except Exception as e:
                raise ValueError(f"Response is not valid JSON: {e}") from e

    except Exception as e:
        raise ValueError(f"Unable to reach endpoint: {e}") from e

    # Analyze the JSON response using the JSON analyzer
    resources = await analyze_json_sample(response_data)

    # Update the endpoint path in the resource
    if resources:
        resources[0].endpoint = endpoint_path

        # Try to infer resource name from endpoint path
        resource_name = _extract_resource_name_from_path(endpoint_path)
        if resource_name:
            resources[0].name = resource_name
            resources[0].displayName = resource_name.title()

    return resources


def _build_headers(
    auth_type: str | None,
    auth_value: str | None,
    custom_headers: dict[str, str] | None,
) -> dict[str, str]:
    """Build HTTP headers including authentication.

    Args:
        auth_type: Authentication type: "bearer", "api-key", "basic", or None
        auth_value: Authentication value
        custom_headers: Additional custom headers

    Returns:
        Dictionary of HTTP headers

    Examples:
        >>> _build_headers("bearer", "token123", None)
        {'Authorization': 'Bearer token123'}

        >>> _build_headers("api-key", "key123", None)
        {'X-API-Key': 'key123'}

        >>> _build_headers("basic", "user:pass", None)
        {'Authorization': 'Basic dXNlcjpwYXNz'}
    """
    headers = {}

    # Add authentication headers
    if auth_type and auth_value:
        if auth_type.lower() == "bearer":
            headers["Authorization"] = f"Bearer {auth_value}"
        elif auth_type.lower() == "api-key":
            headers["X-API-Key"] = auth_value
        elif auth_type.lower() == "basic":
            # Encode username:password in base64
            encoded = base64.b64encode(auth_value.encode()).decode()
            headers["Authorization"] = f"Basic {encoded}"
        else:
            logger.warning("Unknown auth type: %s", auth_type)

    # Add custom headers
    if custom_headers:
        headers.update(custom_headers)

    return headers


def _extract_resource_name_from_path(path: str) -> str | None:
    """Extract resource name from endpoint path.

    Args:
        path: API endpoint path (e.g., "/api/v1/users")

    Returns:
        Resource name or None

    Examples:
        >>> _extract_resource_name_from_path("/api/v1/users")
        'users'
        >>> _extract_resource_name_from_path("/users/{id}")
        'users'
        >>> _extract_resource_name_from_path("/api/v2/user-profiles")
        'user-profiles'
        >>> _extract_resource_name_from_path("/api/v1/users/1")
        'users'
    """
    # Remove leading/trailing slashes
    path = path.strip("/")

    # Split by slashes
    segments = path.split("/")

    # Find the last non-parameter, non-numeric segment
    for segment in reversed(segments):
        # Skip path parameters
        if segment.startswith("{"):
            continue

        # Skip numeric IDs
        if segment.isdigit():
            continue

        # Skip version segments (v1, v2, api, etc.)
        if segment.lower() in ["api", "v1", "v2", "v3"]:
            continue

        return segment.lower()

    return None
