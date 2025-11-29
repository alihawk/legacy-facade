"""Integration tests for the analyze endpoint.

Tests complete flows from request to response for all modes.
"""

import json
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestIntegration:
    """Integration tests for all analyze modes."""

    def test_integration_openapi_mode(self):
        """Test complete flow for mode='openapi'."""
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
                    }
                }
            },
        }

        response = client.post("/api/analyze", json={"mode": "openapi", "specJson": spec})

        assert response.status_code == 200
        data = response.json()

        assert "resources" in data
        assert len(data["resources"]) == 1

        resource = data["resources"][0]
        assert resource["name"] == "users"
        assert resource["displayName"] == "Users"
        assert resource["endpoint"] == "/users"
        assert resource["primaryKey"] == "id"
        assert len(resource["fields"]) == 3
        assert "list" in resource["operations"]

        # Verify field structure
        field_names = [f["name"] for f in resource["fields"]]
        assert "id" in field_names
        assert "name" in field_names
        assert "email" in field_names

    def test_integration_openapi_yaml_mode(self):
        """Test complete flow with YAML OpenAPI spec."""
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
                    product_id:
                      type: integer
                    title:
                      type: string
                    price:
                      type: number
"""

        response = client.post(
            "/api/analyze", json={"mode": "openapi", "specJson": yaml_spec}
        )

        assert response.status_code == 200
        data = response.json()

        assert len(data["resources"]) == 1
        resource = data["resources"][0]
        assert resource["name"] == "products"
        assert resource["primaryKey"] == "product_id"

    def test_integration_json_sample_array(self):
        """Test complete flow for mode='json_sample' with array."""
        sample = [
            {"id": 1, "name": "Alice", "email": "alice@example.com", "active": True},
            {"id": 2, "name": "Bob", "email": "bob@example.com", "active": False},
            {"id": 3, "name": "Charlie", "email": "charlie@example.com", "active": True},
        ]

        response = client.post(
            "/api/analyze", json={"mode": "json_sample", "sampleJson": sample}
        )

        assert response.status_code == 200
        data = response.json()

        assert len(data["resources"]) == 1
        resource = data["resources"][0]

        assert resource["primaryKey"] == "id"
        assert "list" in resource["operations"]
        assert len(resource["fields"]) == 4

        # Verify type inference
        field_types = {f["name"]: f["type"] for f in resource["fields"]}
        assert field_types["id"] == "number"
        assert field_types["name"] == "string"
        assert field_types["email"] == "email"
        assert field_types["active"] == "boolean"

    def test_integration_json_sample_single_object(self):
        """Test complete flow for mode='json_sample' with single object."""
        sample = {"id": 1, "name": "Test", "created_at": "2024-01-15T10:30:00Z"}

        response = client.post(
            "/api/analyze", json={"mode": "json_sample", "sampleJson": sample}
        )

        assert response.status_code == 200
        data = response.json()

        resource = data["resources"][0]
        assert "detail" in resource["operations"]
        assert "list" not in resource["operations"]

        # Verify datetime detection
        field_types = {f["name"]: f["type"] for f in resource["fields"]}
        assert field_types["created_at"] == "datetime"

    def test_integration_json_sample_nested(self):
        """Test complete flow with nested JSON structure."""
        sample = {
            "data": {
                "users": [
                    {"id": 1, "name": "Alice"},
                    {"id": 2, "name": "Bob"},
                ]
            }
        }

        response = client.post(
            "/api/analyze", json={"mode": "json_sample", "sampleJson": sample}
        )

        assert response.status_code == 200
        data = response.json()

        # Should unwrap to the array
        resource = data["resources"][0]
        assert "list" in resource["operations"]
        assert len(resource["fields"]) == 2

    def test_integration_multiple_resources_openapi(self):
        """Test OpenAPI spec with multiple resources."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Multi API", "version": "1.0.0"},
            "paths": {
                "/users": {
                    "get": {
                        "responses": {
                            "200": {
                                "description": "Users",
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
                },
                "/products": {
                    "get": {
                        "responses": {
                            "200": {
                                "description": "Products",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "product_id": {"type": "integer"}
                                                },
                                            },
                                        }
                                    }
                                },
                            }
                        }
                    }
                },
            },
        }

        response = client.post("/api/analyze", json={"mode": "openapi", "specJson": spec})

        assert response.status_code == 200
        data = response.json()

        assert len(data["resources"]) == 2
        resource_names = [r["name"] for r in data["resources"]]
        assert "users" in resource_names
        assert "products" in resource_names

    def test_integration_cors_headers(self):
        """Test that CORS headers are set correctly."""
        response = client.options(
            "/api/analyze",
            headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"},
        )

        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers

    def test_integration_error_response_format(self):
        """Test that error responses have consistent format."""
        # Test with invalid mode
        response = client.post("/api/analyze", json={"mode": "invalid"})

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_integration_empty_spec(self):
        """Test handling of empty OpenAPI spec."""
        spec = {
            "openapi": "3.0.0",
            "info": {"title": "Empty API", "version": "1.0.0"},
            "paths": {},
        }

        response = client.post("/api/analyze", json={"mode": "openapi", "specJson": spec})

        assert response.status_code == 422
        assert "No resources found" in response.json()["detail"]

    @patch("app.core.http_client.httpx.AsyncClient.get")
    def test_integration_openapi_url_mode(self, mock_get):
        """Test complete flow for mode='openapi_url' with mock HTTP server."""
        # Mock OpenAPI spec to be fetched
        mock_spec = {
            "openapi": "3.0.0",
            "info": {"title": "Remote API", "version": "1.0.0"},
            "paths": {
                "/orders": {
                    "get": {
                        "responses": {
                            "200": {
                                "description": "List of orders",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "order_id": {"type": "integer"},
                                                    "customer_name": {"type": "string"},
                                                    "total": {"type": "number"},
                                                    "status": {"type": "string"},
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
                                "description": "Order created",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "order_id": {"type": "integer"}
                                            },
                                        }
                                    }
                                },
                            }
                        }
                    },
                }
            },
        }

        # Mock HTTP response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = json.dumps(mock_spec)
        mock_response.headers = {"content-type": "application/json"}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = client.post(
            "/api/analyze",
            json={"mode": "openapi_url", "specUrl": "https://api.example.com/openapi.json"},
        )

        assert response.status_code == 200
        data = response.json()

        assert "resources" in data
        assert len(data["resources"]) == 1

        resource = data["resources"][0]
        assert resource["name"] == "orders"
        assert resource["primaryKey"] == "order_id"
        assert "list" in resource["operations"]
        assert "create" in resource["operations"]

        # Verify fields
        field_names = [f["name"] for f in resource["fields"]]
        assert "order_id" in field_names
        assert "customer_name" in field_names
        assert "total" in field_names
        assert "status" in field_names

    @patch("app.core.http_client.httpx.AsyncClient.get")
    def test_integration_openapi_url_yaml(self, mock_get):
        """Test mode='openapi_url' with YAML content."""
        yaml_spec = """
openapi: 3.0.0
info:
  title: YAML API
  version: 1.0.0
paths:
  /items:
    get:
      responses:
        '200':
          description: List of items
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    item_id:
                      type: integer
                    name:
                      type: string
"""

        # Mock HTTP response with YAML
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = yaml_spec
        mock_response.headers = {"content-type": "application/x-yaml"}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = client.post(
            "/api/analyze",
            json={"mode": "openapi_url", "specUrl": "https://api.example.com/openapi.yaml"},
        )

        assert response.status_code == 200
        data = response.json()

        assert len(data["resources"]) == 1
        resource = data["resources"][0]
        assert resource["name"] == "items"
        assert resource["primaryKey"] == "item_id"

    @patch("app.core.http_client.httpx.AsyncClient.get")
    def test_integration_endpoint_mode(self, mock_get):
        """Test complete flow for mode='endpoint' with mock legacy API."""
        # Mock legacy API response
        mock_response_data = [
            {
                "user_id": 1,
                "username": "alice",
                "email": "alice@example.com",
                "created_at": "2024-01-15T10:30:00Z",
                "is_active": True,
            },
            {
                "user_id": 2,
                "username": "bob",
                "email": "bob@example.com",
                "created_at": "2024-01-16T11:45:00Z",
                "is_active": False,
            },
        ]

        # Mock HTTP response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://legacy-api.example.com",
                "endpointPath": "/api/v1/users",
                "method": "GET",
            },
        )

        assert response.status_code == 200
        data = response.json()

        assert "resources" in data
        assert len(data["resources"]) == 1

        resource = data["resources"][0]
        assert resource["name"] == "users"
        assert resource["endpoint"] == "/api/v1/users"
        assert resource["primaryKey"] == "user_id"
        assert "list" in resource["operations"]

        # Verify type inference worked
        field_types = {f["name"]: f["type"] for f in resource["fields"]}
        assert field_types["user_id"] == "number"
        assert field_types["username"] == "string"
        assert field_types["email"] == "email"
        assert field_types["created_at"] == "datetime"
        assert field_types["is_active"] == "boolean"

    @patch("app.core.http_client.httpx.AsyncClient.get")
    def test_integration_endpoint_with_bearer_auth(self, mock_get):
        """Test mode='endpoint' with bearer token authentication."""
        mock_response_data = [{"id": 1, "name": "Test"}]

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://api.example.com",
                "endpointPath": "/api/items",
                "method": "GET",
                "authType": "bearer",
                "authValue": "test-token-123",
            },
        )

        assert response.status_code == 200

        # Verify the request was made with correct auth header
        mock_get.assert_called_once()
        call_kwargs = mock_get.call_args.kwargs
        assert "headers" in call_kwargs
        assert call_kwargs["headers"]["Authorization"] == "Bearer test-token-123"

    @patch("app.core.http_client.httpx.AsyncClient.get")
    def test_integration_endpoint_with_api_key(self, mock_get):
        """Test mode='endpoint' with API key authentication."""
        mock_response_data = {"id": 1, "data": "test"}

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://api.example.com",
                "endpointPath": "/api/data",
                "method": "GET",
                "authType": "api-key",
                "authValue": "my-api-key",
            },
        )

        assert response.status_code == 200

        # Verify API key header
        call_kwargs = mock_get.call_args.kwargs
        assert call_kwargs["headers"]["X-API-Key"] == "my-api-key"

    @patch("app.core.http_client.httpx.AsyncClient.get")
    def test_integration_endpoint_with_custom_headers(self, mock_get):
        """Test mode='endpoint' with custom headers."""
        mock_response_data = [{"id": 1}]

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://api.example.com",
                "endpointPath": "/api/items",
                "customHeaders": '{"X-Custom-Header": "custom-value", "X-Request-ID": "12345"}',
            },
        )

        assert response.status_code == 200

        # Verify custom headers were included
        call_kwargs = mock_get.call_args.kwargs
        assert call_kwargs["headers"]["X-Custom-Header"] == "custom-value"
        assert call_kwargs["headers"]["X-Request-ID"] == "12345"

    @patch("app.core.http_client.httpx.AsyncClient.get")
    def test_integration_endpoint_nested_response(self, mock_get):
        """Test mode='endpoint' with nested response structure."""
        # Mock legacy API with nested structure
        mock_response_data = {
            "status": "success",
            "data": {
                "users": [
                    {"id": 1, "name": "Alice"},
                    {"id": 2, "name": "Bob"},
                ]
            },
        }

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://api.example.com",
                "endpointPath": "/api/users",
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Should unwrap nested structure
        resource = data["resources"][0]
        assert "list" in resource["operations"]
        assert len(resource["fields"]) == 2
