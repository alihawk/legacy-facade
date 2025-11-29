"""Schema normalization orchestrator.

Validates and normalizes ResourceSchema objects to ensure consistent output format.
All analyzers should produce valid schemas, but this provides a final validation layer.
"""

import logging
from typing import Any

from app.models.resource_schema import ResourceSchema

logger = logging.getLogger(__name__)

# Valid operation types
VALID_OPERATIONS = {"list", "detail", "create", "update", "delete"}


def normalize_resources(resources: list[ResourceSchema]) -> dict[str, list[dict[str, Any]]]:
    """Normalize and validate resource schemas.

    Ensures all resources have required fields and valid values.
    Returns the standard API response format.

    Args:
        resources: List of ResourceSchema objects

    Returns:
        Dictionary with "resources" key containing list of resource dicts

    Raises:
        ValueError: If resources are invalid
    """
    if not resources:
        raise ValueError("No resources provided")

    # Validate each resource
    for resource in resources:
        _validate_resource(resource)

    # Convert to dict format for API response
    resources_dict = [_resource_to_dict(resource) for resource in resources]

    return {"resources": resources_dict}


def _validate_resource(resource: ResourceSchema) -> None:
    """Validate a single resource schema.

    Args:
        resource: ResourceSchema to validate

    Raises:
        ValueError: If resource is invalid
    """
    # Check required fields
    if not resource.name:
        raise ValueError("Resource must have a name")

    if not resource.displayName:
        raise ValueError(f"Resource '{resource.name}' must have a displayName")

    if not resource.endpoint:
        raise ValueError(f"Resource '{resource.name}' must have an endpoint")

    if not resource.primaryKey:
        raise ValueError(f"Resource '{resource.name}' must have a primaryKey")

    if not isinstance(resource.fields, list):
        raise ValueError(f"Resource '{resource.name}' fields must be a list")

    if not isinstance(resource.operations, list):
        raise ValueError(f"Resource '{resource.name}' operations must be a list")

    # Validate operations
    if not resource.operations:
        raise ValueError(f"Resource '{resource.name}' must have at least one operation")

    invalid_ops = set(resource.operations) - VALID_OPERATIONS
    if invalid_ops:
        raise ValueError(
            f"Resource '{resource.name}' has invalid operations: {invalid_ops}. "
            f"Valid operations are: {VALID_OPERATIONS}"
        )

    # Validate fields
    for field in resource.fields:
        if not field.name:
            raise ValueError(f"Resource '{resource.name}' has a field without a name")

        if not field.type:
            raise ValueError(
                f"Resource '{resource.name}' field '{field.name}' must have a type"
            )

        if not field.displayName:
            raise ValueError(
                f"Resource '{resource.name}' field '{field.name}' must have a displayName"
            )


def _resource_to_dict(resource: ResourceSchema) -> dict[str, Any]:
    """Convert ResourceSchema to dictionary for API response.

    Args:
        resource: ResourceSchema object

    Returns:
        Dictionary representation
    """
    return {
        "name": resource.name,
        "displayName": resource.displayName,
        "endpoint": resource.endpoint,
        "primaryKey": resource.primaryKey,
        "fields": [
            {
                "name": field.name,
                "type": field.type,
                "displayName": field.displayName,
            }
            for field in resource.fields
        ],
        "operations": resource.operations,
    }
