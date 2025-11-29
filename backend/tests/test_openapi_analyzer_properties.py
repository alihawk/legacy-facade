"""Property-based tests for OpenAPI analyzer.

**Feature: backend-api-analyzer, Property 1: OpenAPI Parsing Completeness**
**Feature: backend-api-analyzer, Property 2: YAML to JSON Equivalence**
**Feature: backend-api-analyzer, Property 9: Operations Mapping**
"""

import pytest
import yaml
from hypothesis import given, settings
from hypothesis import strategies as st

from app.services.openapi_analyzer import analyze_openapi_spec


# Simplified strategies that generate valid, minimal OpenAPI specs


@st.composite
def simple_field_name(draw):
    """Generate a simple field name."""
    return draw(st.sampled_from(["id", "name", "email", "status", "count", "price", "date"]))


@st.composite
def simple_field_type(draw):
    """Generate a simple field type."""
    return draw(st.sampled_from(["string", "integer", "number", "boolean"]))


@st.composite
def simple_properties(draw):
    """Generate simple OpenAPI properties."""
    num_fields = draw(st.integers(min_value=1, max_value=3))
    properties = {}
    
    # Always include an id field
    properties["id"] = {"type": "integer"}
    
    # Add additional fields
    used_names = {"id"}
    for _ in range(num_fields - 1):
        field_name = draw(simple_field_name())
        if field_name not in used_names:
            properties[field_name] = {"type": draw(simple_field_type())}
            used_names.add(field_name)
    
    return properties


@st.composite
def simple_resource_name(draw):
    """Generate a simple resource name."""
    return draw(st.sampled_from(["users", "products", "orders", "items", "posts"]))


@st.composite
def simple_openapi_spec(draw):
    """Generate a simple, valid OpenAPI 3.0 specification."""
    resource = draw(simple_resource_name())
    properties = draw(simple_properties())
    
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "Test API",
            "version": "1.0.0",
        },
        "paths": {
            f"/{resource}": {
                "get": {
                    "responses": {
                        "200": {
                            "description": "Success",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": properties,
                                        },
                                    }
                                }
                            },
                        }
                    }
                }
            }
        },
    }
    
    return spec


# Property 1: OpenAPI Parsing Completeness
# For any valid OpenAPI spec, at least one ResourceSchema should be produced


@settings(max_examples=50, deadline=10000)
@given(spec=simple_openapi_spec())
@pytest.mark.asyncio
async def test_property_openapi_parsing_completeness(spec):
    """Property 1: OpenAPI Parsing Completeness.

    **Feature: backend-api-analyzer, Property 1: OpenAPI Parsing Completeness**
    **Validates: Requirements 1.1, 1.2, 2.3**

    For any valid OpenAPI specification with at least one path,
    the analyzer should produce at least one ResourceSchema.
    """
    resources = await analyze_openapi_spec(spec)

    # Should produce at least one resource
    assert len(resources) > 0, "Valid OpenAPI spec should produce at least one resource"

    # Each resource should have required fields
    for resource in resources:
        assert resource.name, "Resource should have a name"
        assert resource.displayName, "Resource should have a display name"
        assert resource.endpoint, "Resource should have an endpoint"
        assert isinstance(resource.fields, list), "Resource should have fields list"
        assert isinstance(resource.operations, list), "Resource should have operations list"
        assert len(resource.operations) > 0, "Resource should have at least one operation"


# Property 2: YAML to JSON Equivalence
# Converting a spec to YAML and back to JSON should produce identical ResourceSchemas


@settings(max_examples=50, deadline=10000)
@given(spec=simple_openapi_spec())
@pytest.mark.asyncio
async def test_property_yaml_json_equivalence(spec):
    """Property 2: YAML to JSON Equivalence.

    **Feature: backend-api-analyzer, Property 2: YAML to JSON Equivalence**
    **Validates: Requirements 1.1, 1.2, 2.3**

    For any OpenAPI spec, parsing it as JSON or YAML should produce
    identical ResourceSchema objects.
    """
    # Parse as JSON (dict)
    resources_from_json = await analyze_openapi_spec(spec)

    # Convert to YAML string and parse
    yaml_string = yaml.dump(spec)
    resources_from_yaml = await analyze_openapi_spec(yaml_string)

    # Should produce same number of resources
    assert len(resources_from_json) == len(resources_from_yaml), (
        "JSON and YAML parsing should produce same number of resources"
    )

    # Sort by name for comparison
    resources_from_json.sort(key=lambda r: r.name)
    resources_from_yaml.sort(key=lambda r: r.name)

    # Compare each resource
    for json_res, yaml_res in zip(resources_from_json, resources_from_yaml):
        assert json_res.name == yaml_res.name, "Resource names should match"
        assert json_res.endpoint == yaml_res.endpoint, "Endpoints should match"
        assert set(json_res.operations) == set(yaml_res.operations), (
            "Operations should match"
        )
        assert len(json_res.fields) == len(yaml_res.fields), (
            "Number of fields should match"
        )


# Property 9: Operations Mapping
# HTTP methods should be correctly mapped to operations


@settings(max_examples=50, deadline=10000)
@given(
    methods=st.lists(
        st.sampled_from(["get", "post", "put", "patch", "delete"]),
        min_size=1,
        max_size=5,
        unique=True,
    )
)
@pytest.mark.asyncio
async def test_property_operations_mapping(methods):
    """Property 9: Operations Mapping.

    **Feature: backend-api-analyzer, Property 9: Operations Mapping**
    **Validates: Requirements 1.4, 6.5**

    For any set of HTTP methods in an OpenAPI spec, the correct operations
    should be mapped:
    - GET on collection → list
    - GET on detail → detail
    - POST → create
    - PUT/PATCH → update
    - DELETE → delete
    """
    spec = {
        "openapi": "3.0.0",
        "info": {"title": "Test API", "version": "1.0.0"},
        "paths": {},
    }

    # Add collection endpoint
    collection_methods = [m for m in methods if m in ["get", "post"]]
    if collection_methods:
        collection_ops = {}
        for method in collection_methods:
            collection_ops[method] = {
                "responses": {
                    "200": {
                        "description": "Success",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {"id": {"type": "integer"}},
                                    },
                                }
                            }
                        },
                    }
                }
            }
        spec["paths"]["/items"] = collection_ops

    # Add detail endpoint
    detail_methods = [m for m in methods if m in ["get", "put", "patch", "delete"]]
    if detail_methods:
        detail_ops = {}
        for method in detail_methods:
            detail_ops[method] = {
                "parameters": [
                    {"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}
                ],
                "responses": {
                    "200": {
                        "description": "Success",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {"id": {"type": "integer"}},
                                }
                            }
                        },
                    }
                },
            }
        spec["paths"]["/items/{id}"] = detail_ops

    resources = await analyze_openapi_spec(spec)

    assert len(resources) > 0, "Should produce at least one resource"

    resource = resources[0]
    operations = set(resource.operations)

    # Verify expected operations based on methods
    if "get" in methods:
        # GET can map to both list and detail depending on path
        assert "list" in operations or "detail" in operations, (
            "GET should map to list or detail"
        )

    if "post" in methods:
        assert "create" in operations, "POST should map to create"

    if "put" in methods or "patch" in methods:
        assert "update" in operations, "PUT/PATCH should map to update"

    if "delete" in methods:
        assert "delete" in operations, "DELETE should map to delete"

    # Verify no unexpected operations
    valid_operations = {"list", "detail", "create", "update", "delete"}
    assert operations.issubset(valid_operations), (
        f"Operations should only contain valid values, got: {operations}"
    )
