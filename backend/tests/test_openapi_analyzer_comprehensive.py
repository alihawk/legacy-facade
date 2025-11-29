"""Comprehensive tests for OpenAPI analyzer service."""

import pytest

from app.services.openapi_analyzer import analyze_openapi_spec, analyze_openapi_url


class TestOpenAPIAnalyzer:
    """Test suite for OpenAPI analyzer."""

    @pytest.mark.asyncio
    async def test_simple_crud_resource(self):
        """Test analyzing a simple CRUD resource with all operations."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/users": {
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
                                                    "id": {"type": "integer"},
                                                    "name": {"type": "string"},
                                                    "email": {
                                                        "type": "string",
                                                        "format": "email",
                                                    },
                                                },
                                            },
                                        }
                                    }
                                },
                            }
                        }
                    },
                    "post": {
                        "responses": {
                            "201": {
                                "description": "User created",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "integer"},
                                                "name": {"type": "string"},
                                                "email": {
                                                    "type": "string",
                                                    "format": "email",
                                                },
                                            },
                                        }
                                    }
                                },
                            }
                        }
                    },
                },
                "/users/{id}": {
                    "get": {
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "User details",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "integer"},
                                                "name": {"type": "string"},
                                                "email": {
                                                    "type": "string",
                                                    "format": "email",
                                                },
                                            },
                                        }
                                    }
                                },
                            }
                        }
                    },
                    "put": {
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "User updated",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "integer"},
                                                "name": {"type": "string"},
                                            },
                                        }
                                    }
                                },
                            }
                        }
                    },
                    "delete": {
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {"204": {"description": "User deleted"}},
                    },
                },
            },
        }

        resources = await analyze_openapi_spec(spec)

        assert len(resources) == 1
        resource = resources[0]

        # Check basic properties
        assert resource.name == "users"
        assert resource.displayName == "Users"
        assert resource.endpoint == "/users"
        assert resource.primaryKey == "id"

        # Check operations
        assert set(resource.operations) == {"list", "detail", "create", "update", "delete"}

        # Check fields
        assert len(resource.fields) == 3
        field_map = {f.name: f for f in resource.fields}

        assert "id" in field_map
        assert field_map["id"].type == "number"
        assert field_map["id"].displayName == "ID"  # LLM correctly expands ID

        assert "name" in field_map
        assert field_map["name"].type == "string"

        assert "email" in field_map
        assert field_map["email"].type == "email"

    @pytest.mark.asyncio
    async def test_multiple_resources(self):
        """Test analyzing spec with multiple resources."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/users": {
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
                                                    "id": {"type": "integer"},
                                                    "name": {"type": "string"},
                                                },
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/products": {
                    "get": {
                        "responses": {
                            "200": {
                                "description": "List of products",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "product_id": {"type": "integer"},
                                                    "title": {"type": "string"},
                                                    "price": {"type": "number"},
                                                },
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/products/{product_id}": {
                    "get": {
                        "parameters": [
                            {
                                "name": "product_id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Product details",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "product_id": {"type": "integer"},
                                                "title": {"type": "string"},
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
        }

        resources = await analyze_openapi_spec(spec)

        assert len(resources) == 2

        # Check users resource
        users = next(r for r in resources if r.name == "users")
        assert users.primaryKey == "id"
        assert "list" in users.operations

        # Check products resource
        products = next(r for r in resources if r.name == "products")
        assert products.primaryKey == "product_id"
        assert "list" in products.operations
        assert "detail" in products.operations

    @pytest.mark.asyncio
    async def test_field_type_inference(self):
        """Test that field types are correctly inferred from OpenAPI schemas."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/records": {
                    "get": {
                        "responses": {
                            "200": {
                                "description": "List of records",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "id": {"type": "integer"},
                                                    "count": {"type": "number"},
                                                    "active": {"type": "boolean"},
                                                    "email": {
                                                        "type": "string",
                                                        "format": "email",
                                                    },
                                                    "created_at": {
                                                        "type": "string",
                                                        "format": "date-time",
                                                    },
                                                    "uuid": {
                                                        "type": "string",
                                                        "format": "uuid",
                                                    },
                                                    "website": {
                                                        "type": "string",
                                                        "format": "uri",
                                                    },
                                                    "description": {
                                                        "type": "string",
                                                        "maxLength": 500,
                                                    },
                                                    "name": {"type": "string"},
                                                },
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }

        resources = await analyze_openapi_spec(spec)
        resource = resources[0]

        field_types = {f.name: f.type for f in resource.fields}

        assert field_types["id"] == "number"
        assert field_types["count"] == "number"
        assert field_types["active"] == "boolean"
        assert field_types["email"] == "email"
        assert field_types["created_at"] == "datetime"
        assert field_types["uuid"] == "uuid"
        assert field_types["website"] == "url"
        assert field_types["description"] == "text"  # maxLength > 100
        assert field_types["name"] == "string"

    @pytest.mark.asyncio
    async def test_yaml_spec(self):
        """Test analyzing YAML OpenAPI specification."""
        yaml_spec = """
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /products:
    get:
      responses:
        '200':
          description: List of products
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    name:
                      type: string
                    price:
                      type: number
"""

        resources = await analyze_openapi_spec(yaml_spec)

        assert len(resources) == 1
        assert resources[0].name == "products"
        assert len(resources[0].fields) == 3

    @pytest.mark.asyncio
    async def test_nested_paths(self):
        """Test handling of nested API paths."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/api/v1/users": {
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
                                                "properties": {
                                                    "id": {"type": "integer"},
                                                },
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }

        resources = await analyze_openapi_spec(spec)

        assert len(resources) == 1
        assert resources[0].name == "users"
        assert resources[0].endpoint == "/api/v1/users"

    @pytest.mark.asyncio
    async def test_primary_key_detection_from_path(self):
        """Test primary key detection from path parameters."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/users/{userId}": {
                    "get": {
                        "parameters": [
                            {
                                "name": "userId",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "User details",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "userId": {"type": "integer"},
                                                "name": {"type": "string"},
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }

        resources = await analyze_openapi_spec(spec)

        assert len(resources) == 1
        assert resources[0].primaryKey == "userId"

    @pytest.mark.asyncio
    async def test_invalid_spec_raises_error(self):
        """Test that invalid OpenAPI spec raises ValueError."""
        invalid_spec = {
            "openapi": "3.0.0",
            # Missing required 'info' field
            "paths": {},
        }

        with pytest.raises(ValueError, match="Invalid OpenAPI specification"):
            await analyze_openapi_spec(invalid_spec)

    @pytest.mark.asyncio
    async def test_empty_spec_raises_error(self):
        """Test that spec with no resources raises ValueError."""
        empty_spec = {
            "openapi": "3.0.0",
            "info": {"title": "Empty API", "version": "1.0.0"},
            "paths": {},
        }

        with pytest.raises(ValueError, match="No resources found"):
            await analyze_openapi_spec(empty_spec)

    @pytest.mark.asyncio
    async def test_operations_mapping(self):
        """Test HTTP method to operation mapping."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/items": {
                    "get": {
                        "responses": {
                            "200": {
                                "description": "List of items",
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
                                }
                            }
                        }
                    },
                    "post": {
                        "responses": {
                            "201": {
                                "description": "Item created",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {"id": {"type": "integer"}},
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
                "/items/{id}": {
                    "get": {
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Item details",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {"id": {"type": "integer"}},
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "patch": {
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Item updated",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {"id": {"type": "integer"}},
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "delete": {
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {"204": {"description": "Deleted"}},
                    },
                },
            },
        }

        resources = await analyze_openapi_spec(spec)
        resource = resources[0]

        # GET /items -> list
        # POST /items -> create
        # GET /items/{id} -> detail
        # PATCH /items/{id} -> update
        # DELETE /items/{id} -> delete
        assert set(resource.operations) == {"list", "create", "detail", "update", "delete"}

    @pytest.mark.asyncio
    async def test_display_name_generation(self):
        """Test display name generation from field names."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/items": {
                    "get": {
                        "responses": {
                            "200": {
                                "description": "List of items",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "user_name": {"type": "string"},
                                                    "userId": {"type": "integer"},
                                                    "api_key": {"type": "string"},
                                                },
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }

        resources = await analyze_openapi_spec(spec)
        resource = resources[0]

        field_display_names = {f.name: f.displayName for f in resource.fields}

        assert field_display_names["user_name"] == "User Name"
        assert field_display_names["userId"] == "User ID"  # LLM correctly expands ID
        assert field_display_names["api_key"] == "API Key"  # LLM correctly expands API
