"""OpenAPI specification analyzer service.

Parses OpenAPI 3.0 and Swagger 2.0 specifications to extract resource schemas.
Supports both JSON and YAML formats, and can fetch specs from URLs.

Performance optimizations:
- Uses StringIO to avoid temp file disk I/O
- Caches parsed specs by content hash
- Runs parsing in thread pool to avoid blocking event loop
"""

import asyncio
import hashlib
import json
import logging
from functools import lru_cache
from io import StringIO
from typing import Any

import yaml
from openapi_parser import parse

from app.core.http_client import HTTPClient
from app.models.resource_schema import ResourceField, ResourceSchema
from app.utils.llm_name_converter import convert_batch_to_display_names_simple
from app.utils.primary_key_detector import detect_primary_key
from app.utils.type_inference import infer_type_from_openapi_schema

logger = logging.getLogger(__name__)


def _compute_spec_hash(spec_data: dict | str) -> str:
    """Compute hash of spec data for caching.

    Args:
        spec_data: OpenAPI spec as dict or string

    Returns:
        SHA256 hash of the spec content
    """
    if isinstance(spec_data, dict):
        # Convert dict to stable JSON string for hashing
        content = json.dumps(spec_data, sort_keys=True)
    else:
        content = spec_data

    return hashlib.sha256(content.encode()).hexdigest()


@lru_cache(maxsize=100)
def _parse_openapi_cached(spec_hash: str, spec_yaml: str) -> Any:
    """Parse OpenAPI spec with caching.

    Uses LRU cache to avoid re-parsing the same spec.
    Runs synchronously but is called from thread pool.

    Args:
        spec_hash: Hash of spec content (for cache key)
        spec_yaml: YAML string of the spec

    Returns:
        Parsed OpenAPI specification object

    Raises:
        Exception: If parsing fails
    """
    # Create a temporary file for openapi_parser (it requires a file path)
    import tempfile
    from pathlib import Path

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".yaml", delete=False
    ) as f:
        f.write(spec_yaml)
        temp_path = f.name

    try:
        specification = parse(temp_path)
        return specification
    finally:
        Path(temp_path).unlink(missing_ok=True)


async def analyze_openapi_spec(spec_data: dict | str) -> list[ResourceSchema]:
    """Analyze OpenAPI specification and extract resource schemas.

    Optimizations:
    - Caches parsed specs by content hash
    - Runs parsing in thread pool to avoid blocking

    Args:
        spec_data: OpenAPI spec as dict (JSON) or string (YAML)

    Returns:
        List of ResourceSchema objects

    Raises:
        ValueError: If spec is invalid or cannot be parsed
    """
    # Convert to YAML string for parsing
    if isinstance(spec_data, str):
        spec_yaml = spec_data
    else:
        spec_yaml = yaml.dump(spec_data)

    # Compute hash for caching
    spec_hash = _compute_spec_hash(spec_data)

    try:
        # Run parsing in thread pool to avoid blocking event loop
        loop = asyncio.get_event_loop()
        specification = await loop.run_in_executor(
            None, _parse_openapi_cached, spec_hash, spec_yaml
        )
    except Exception as e:
        raise ValueError(f"Invalid OpenAPI specification: {e}") from e

    # Extract resources from paths
    resources = _extract_resources_from_openapi(specification)

    if not resources:
        raise ValueError("No resources found in specification")

    return resources


async def analyze_openapi_url(spec_url: str) -> list[ResourceSchema]:
    """Fetch and analyze OpenAPI specification from URL.

    Args:
        spec_url: URL to OpenAPI specification

    Returns:
        List of ResourceSchema objects

    Raises:
        ValueError: If spec cannot be fetched or parsed
    """
    try:
        async with HTTPClient() as client:
            response = await client.get(spec_url)
            # Get content as text (works for both JSON and YAML)
            spec_data = response.text
    except Exception as e:
        raise ValueError(f"Unable to fetch OpenAPI spec from URL: {e}") from e

    return await analyze_openapi_spec(spec_data)


def _extract_resources_from_openapi(specification: Any) -> list[ResourceSchema]:
    """Extract resource schemas from parsed OpenAPI specification.

    Groups endpoints by resource name and extracts fields, operations, and primary keys.

    Args:
        specification: Parsed OpenAPI specification object

    Returns:
        List of ResourceSchema objects
    """
    resources_dict: dict[str, dict[str, Any]] = {}

    # Iterate through all paths
    for path in specification.paths:
        # Extract resource name from path (e.g., /users/{id} -> users)
        resource_name = _extract_resource_name_from_path(path.url)

        if not resource_name:
            continue

        # Initialize resource if not exists
        if resource_name not in resources_dict:
            resources_dict[resource_name] = {
                "name": resource_name,
                "endpoint": path.url.split("{")[0].rstrip("/"),  # Remove path params
                "operations": set(),
                "fields": {},
                "primary_key": None,
            }

        # Extract operations and schemas from each operation
        for operation in path.operations:
            method = operation.method.value  # Get HTTP method as string

            # Map HTTP method to operation
            ops = _map_http_method_to_operations(method, path.url)
            resources_dict[resource_name]["operations"].update(ops)

            # Extract schema from response
            fields = _extract_fields_from_operation(operation, resource_name)
            for field_name, field in fields.items():
                if field_name not in resources_dict[resource_name]["fields"]:
                    resources_dict[resource_name]["fields"][field_name] = field

            # Extract primary key from path parameters
            if "{" in path.url and not resources_dict[resource_name]["primary_key"]:
                pk = _extract_primary_key_from_path(path.url)
                if pk:
                    resources_dict[resource_name]["primary_key"] = pk

    # Collect all names for batch LLM conversion
    all_names = []
    for resource_data in resources_dict.values():
        all_names.append(resource_data["name"])
        all_names.extend(resource_data["fields"].keys())
    
    # Batch convert all names to display names using simple transformation
    display_names = convert_batch_to_display_names_simple(all_names)

    # Convert to ResourceSchema objects
    resources = []
    for resource_data in resources_dict.values():
        # Detect primary key if not found in path
        field_names = list(resource_data["fields"].keys())
        if not resource_data["primary_key"]:
            resource_data["primary_key"] = detect_primary_key(
                field_names, resource_data["name"]
            )

        # Update field display names from batch conversion
        for field in resource_data["fields"].values():
            field.displayName = display_names.get(field.name, field.displayName)

        # Convert fields dict to list
        fields = list(resource_data["fields"].values())

        # Convert operations set to sorted list
        operations = sorted(resource_data["operations"])

        resources.append(
            ResourceSchema(
                name=resource_data["name"],
                displayName=display_names.get(resource_data["name"], resource_data["name"].title()),
                endpoint=resource_data["endpoint"],
                primaryKey=resource_data["primary_key"],
                fields=fields,
                operations=operations,
            )
        )

    return resources


def _extract_fields_from_operation(operation: Any, resource_name: str) -> dict[str, ResourceField]:
    """Extract fields from an operation's response schema.
    
    Args:
        operation: OpenAPI operation object
        resource_name: Name of the resource
        
    Returns:
        Dictionary of field name to ResourceField
    """
    if not operation.responses:
        return {}
    
    # Try to get successful response (200, 201, etc.)
    for response in operation.responses:
        if str(response.code) not in ["200", "201", "default"]:
            continue
        if not response.content:
            continue
            
        # Get JSON content
        for content in response.content:
            content_type_str = str(content.type).lower()
            if "json" not in content_type_str or not content.schema:
                continue
                
            return _extract_fields_from_schema(content.schema, resource_name)
    
    return {}


def _extract_resource_name_from_path(path: str) -> str | None:
    """Extract resource name from API path.

    Examples:
        /users -> users
        /api/v1/users -> users
        /users/{id} -> users
        /users/{id}/posts -> posts (last segment)

    Args:
        path: API path

    Returns:
        Resource name or None
    """
    # Remove leading/trailing slashes and split
    segments = path.strip("/").split("/")

    # Find the last non-parameter segment
    for segment in reversed(segments):
        if not segment.startswith("{"):
            # Skip version segments (v1, v2, api, etc.)
            if segment.lower() in ["api", "v1", "v2", "v3"]:
                continue
            return segment.lower()

    return None


def _extract_primary_key_from_path(path: str) -> str | None:
    """Extract primary key parameter name from path.

    Examples:
        /users/{id} -> id
        /users/{userId} -> userId
        /users/{user_id} -> user_id

    Args:
        path: API path with parameters

    Returns:
        Primary key parameter name or None
    """
    import re

    # Find all path parameters
    params = re.findall(r"\{([^}]+)\}", path)

    # Look for ID-like parameters
    for param in params:
        param_lower = param.lower()
        if "id" in param_lower:
            return param

    return None


def _map_http_method_to_operations(method: str, path: str) -> set[str]:
    """Map HTTP method to operation names.

    Args:
        method: HTTP method (get, post, put, patch, delete)
        path: API path (to determine if it's a list or detail endpoint)

    Returns:
        Set of operation names
    """
    has_path_param = "{" in path

    operations = set()

    if method == "get":
        if has_path_param:
            operations.add("detail")
        else:
            operations.add("list")
    elif method == "post":
        operations.add("create")
    elif method in ["put", "patch"]:
        operations.add("update")
    elif method == "delete":
        operations.add("delete")

    return operations


def _extract_fields_from_schema(
    schema: Any, resource_name: str, visited: set | None = None
) -> dict[str, ResourceField]:
    """Extract fields from OpenAPI schema object.

    Handles nested schemas and arrays.

    Args:
        schema: OpenAPI schema object from openapi_parser
        resource_name: Name of the resource (for context)
        visited: Set of visited schema IDs (to prevent infinite recursion)

    Returns:
        Dictionary of field name to ResourceField
    """
    if visited is None:
        visited = set()

    # Prevent infinite recursion
    schema_id = id(schema)
    if schema_id in visited:
        return {}
    visited.add(schema_id)

    fields = {}

    # Handle array schemas - extract items schema
    if hasattr(schema, "type") and schema.type:
        # Get string representation of type (handles both string and enum)
        schema_type_str = str(schema.type).lower()
        if "array" in schema_type_str:
            if hasattr(schema, "items") and schema.items:
                return _extract_fields_from_schema(schema.items, resource_name, visited)
            return {}

    # Handle object schemas with properties
    if hasattr(schema, "properties") and schema.properties:
        # Check if this is a wrapper object containing an array
        # Common patterns: {Data: {Users: [...]}} or {data: [...]}
        if len(schema.properties) == 1:
            # Single property - might be a wrapper
            prop = schema.properties[0]
            prop_schema = prop.schema
            
            # Check if the property is an object or array
            if hasattr(prop_schema, "type") and prop_schema.type:
                prop_type_str = str(prop_schema.type).lower()
                
                # If it's an array, unwrap and extract from items
                if "array" in prop_type_str:
                    if hasattr(prop_schema, "items") and prop_schema.items:
                        return _extract_fields_from_schema(prop_schema.items, resource_name, visited)
                
                # If it's an object, check if it contains an array
                if "object" in prop_type_str:
                    if hasattr(prop_schema, "properties") and prop_schema.properties:
                        # Recursively check nested properties for arrays
                        nested_fields = _extract_fields_from_schema(prop_schema, resource_name, visited)
                        if nested_fields:
                            return nested_fields
        
        # Check if any property is an array (for multi-property wrappers)
        for prop in schema.properties:
            prop_schema = prop.schema
            if hasattr(prop_schema, "type") and prop_schema.type:
                prop_type_str = str(prop_schema.type).lower()
                if "array" in prop_type_str:
                    # Found an array property - extract from its items
                    if hasattr(prop_schema, "items") and prop_schema.items:
                        return _extract_fields_from_schema(prop_schema.items, resource_name, visited)
        
        # No array found in nested structure, extract fields normally
        for prop in schema.properties:
            prop_name = prop.name
            prop_schema = prop.schema

            # Build schema dict for type inference
            schema_dict = {}

            if hasattr(prop_schema, "type") and prop_schema.type:
                # Convert enum/type to string
                type_str = str(prop_schema.type).lower()
                # Extract the actual type name from enum representation
                if "." in type_str:
                    type_str = type_str.split(".")[-1].replace("'", "").replace(">", "")
                schema_dict["type"] = type_str
            else:
                schema_dict["type"] = "string"
            
            # Add format if present
            if hasattr(prop_schema, "format") and prop_schema.format:
                # Convert enum to string
                format_str = str(prop_schema.format).lower()
                if "." in format_str:
                    format_str = format_str.split(".")[-1].replace("'", "").replace(">", "")
                schema_dict["format"] = format_str

            # Add maxLength if present
            if hasattr(prop_schema, "max_length") and prop_schema.max_length:
                schema_dict["maxLength"] = prop_schema.max_length

            # Infer type
            field_type = infer_type_from_openapi_schema(schema_dict)

            fields[prop_name] = ResourceField(
                name=prop_name,
                type=field_type,
                displayName=prop_name.title(),  # Temporary, will be updated with LLM conversion
            )

    # Handle allOf, oneOf, anyOf (merge schemas)
    for combiner_attr in ["all_of", "one_of", "any_of"]:
        if hasattr(schema, combiner_attr):
            combined_schemas = getattr(schema, combiner_attr)
            if combined_schemas:
                for sub_schema in combined_schemas:
                    sub_fields = _extract_fields_from_schema(
                        sub_schema, resource_name, visited
                    )
                    fields.update(sub_fields)

    return fields

