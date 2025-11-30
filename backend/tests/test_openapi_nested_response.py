"""Test for nested response structure handling in OpenAPI analyzer.

This test demonstrates the bug where the OpenAPI analyzer doesn't properly
unwrap nested response structures like {Data: {Activity: [...]}}.
"""

import pytest

from app.services.openapi_analyzer import analyze_openapi_spec


@pytest.mark.asyncio
async def test_nested_response_unwrapping():
    """Test that nested response structures are properly unwrapped.
    
    **Feature: backend-api-analyzer, Property 8: Response Unwrapping**
    **Validates: Requirements 3.4, 4.2**
    
    The OpenAPI spec has a response structure like:
    {
      "Data": {
        "Activity": [
          {
            "activity_id": 1,
            "timestamp": "...",
            ...
          }
        ]
      }
    }
    
    The analyzer should extract fields from the Activity array items,
    not from the Data wrapper object.
    """
    spec = {
        "openapi": "3.0.0",
        "info": {"title": "Activity Log API", "version": "1.0.0"},
        "paths": {
            "/api/v1/activity": {
                "get": {
                    "responses": {
                        "200": {
                            "description": "List of activity logs",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "Data": {
                                                "type": "object",
                                                "properties": {
                                                    "Activity": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "object",
                                                            "properties": {
                                                                "activity_id": {
                                                                    "type": "integer"
                                                                },
                                                                "timestamp": {
                                                                    "type": "string"
                                                                },
                                                                "action": {
                                                                    "type": "string"
                                                                },
                                                                "user": {
                                                                    "type": "string"
                                                                },
                                                                "resource_id": {
                                                                    "type": "integer"
                                                                },
                                                                "details": {
                                                                    "type": "string"
                                                                },
                                                            },
                                                        },
                                                    }
                                                },
                                            }
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

    resources = await analyze_openapi_spec(spec)

    # Should extract one resource
    assert len(resources) == 1, f"Expected 1 resource, got {len(resources)}"

    resource = resources[0]
    
    # Should extract resource name from path
    assert resource.name == "activity", f"Expected name 'activity', got '{resource.name}'"
    
    # Should extract endpoint
    assert resource.endpoint == "/api/v1/activity", f"Expected endpoint '/api/v1/activity', got '{resource.endpoint}'"
    
    # Should identify list operation
    assert "list" in resource.operations, f"Expected 'list' operation, got {resource.operations}"
    
    # CRITICAL: Should extract fields from Activity array items, NOT from Data wrapper
    field_names = {f.name for f in resource.fields}
    expected_fields = {"activity_id", "timestamp", "action", "user", "resource_id", "details"}
    
    # This is the bug - currently it extracts {"Data"} instead of the actual fields
    assert field_names == expected_fields, (
        f"Expected fields {expected_fields}, got {field_names}. "
        f"The analyzer should unwrap nested structures and extract fields from the array items, "
        f"not from the wrapper object."
    )
    
    # Should detect primary key
    assert resource.primaryKey == "activity_id", (
        f"Expected primary key 'activity_id', got '{resource.primaryKey}'"
    )


@pytest.mark.asyncio
async def test_simple_array_response():
    """Test that simple array responses work correctly (baseline test)."""
    spec = {
        "openapi": "3.0.0",
        "info": {"title": "Simple API", "version": "1.0.0"},
        "paths": {
            "/api/v1/users": {
                "get": {
                    "responses": {
                        "200": {
                            "description": "List of users",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "user_id": {"type": "integer"},
                                                "name": {"type": "string"},
                                                "email": {"type": "string"},
                                            },
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

    resources = await analyze_openapi_spec(spec)

    assert len(resources) == 1
    resource = resources[0]
    
    field_names = {f.name for f in resource.fields}
    expected_fields = {"user_id", "name", "email"}
    
    assert field_names == expected_fields, (
        f"Expected fields {expected_fields}, got {field_names}"
    )
