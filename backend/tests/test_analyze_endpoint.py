"""Tests for the main analyze endpoint."""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.resource_schema import ResourceField, ResourceSchema

client = TestClient(app)


class TestAnalyzeEndpoint:
    """Test suite for POST /api/analyze endpoint."""

    @patch("app.api.analyze.analyze_openapi_spec")
    def test_analyze_openapi_mode(self, mock_analyze):
        """Test analyze endpoint with mode='openapi'."""
        # Mock analyzer response
        mock_analyze.return_value = [
            ResourceSchema(
                name="users",
                displayName="Users",
                endpoint="/users",
                primaryKey="id",
                fields=[ResourceField(name="id", type="number", displayName="ID")],
                operations=["list"],
            )
        ]

        response = client.post(
            "/api/analyze",
            json={"mode": "openapi", "specJson": {"openapi": "3.0.0", "paths": {}}},
        )

        assert response.status_code == 200
        data = response.json()
        assert "resources" in data
        assert len(data["resources"]) == 1
        assert data["resources"][0]["name"] == "users"

    @patch("app.api.analyze.analyze_openapi_url")
    def test_analyze_openapi_url_mode(self, mock_analyze):
        """Test analyze endpoint with mode='openapi_url'."""
        mock_analyze.return_value = [
            ResourceSchema(
                name="products",
                displayName="Products",
                endpoint="/products",
                primaryKey="id",
                fields=[ResourceField(name="id", type="number", displayName="ID")],
                operations=["list"],
            )
        ]

        response = client.post(
            "/api/analyze",
            json={"mode": "openapi_url", "specUrl": "https://api.example.com/openapi.json"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["resources"]) == 1

    @patch("app.api.analyze.analyze_endpoint")
    def test_analyze_endpoint_mode(self, mock_analyze):
        """Test analyze endpoint with mode='endpoint'."""
        mock_analyze.return_value = [
            ResourceSchema(
                name="items",
                displayName="Items",
                endpoint="/items",
                primaryKey="id",
                fields=[ResourceField(name="id", type="number", displayName="ID")],
                operations=["list"],
            )
        ]

        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://api.example.com",
                "endpointPath": "/items",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["resources"]) == 1

    @patch("app.api.analyze.analyze_json_sample")
    def test_analyze_json_sample_mode(self, mock_analyze):
        """Test analyze endpoint with mode='json_sample'."""
        mock_analyze.return_value = [
            ResourceSchema(
                name="sample",
                displayName="Sample",
                endpoint="__sample",
                primaryKey="id",
                fields=[ResourceField(name="id", type="number", displayName="ID")],
                operations=["list"],
            )
        ]

        response = client.post(
            "/api/analyze",
            json={"mode": "json_sample", "sampleJson": [{"id": 1, "name": "Test"}]},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["resources"]) == 1

    def test_analyze_invalid_json(self):
        """Test analyze endpoint with invalid JSON."""
        response = client.post(
            "/api/analyze",
            data="invalid json",
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 400
        assert "Invalid JSON" in response.json()["detail"]

    def test_analyze_missing_required_field(self):
        """Test analyze endpoint with missing required field."""
        response = client.post("/api/analyze", json={"mode": "openapi"})

        # Should fail validation or return 400
        assert response.status_code in [400, 422]

    def test_analyze_invalid_mode(self):
        """Test analyze endpoint with invalid mode."""
        response = client.post("/api/analyze", json={"mode": "invalid_mode"})

        assert response.status_code == 400  # Validation error caught and returned as 400

    @patch("app.api.analyze.analyze_openapi_spec")
    def test_analyze_no_resources_found(self, mock_analyze):
        """Test analyze endpoint when no resources are found."""
        mock_analyze.side_effect = ValueError("No resources found")

        response = client.post(
            "/api/analyze",
            json={"mode": "openapi", "specJson": {"openapi": "3.0.0", "paths": {}}},
        )

        assert response.status_code == 422
        assert "No resources found" in response.json()["detail"]

    @patch("app.api.analyze.analyze_openapi_url")
    def test_analyze_unreachable_url(self, mock_analyze):
        """Test analyze endpoint with unreachable URL."""
        mock_analyze.side_effect = ValueError("Unable to fetch OpenAPI spec from URL")

        response = client.post(
            "/api/analyze",
            json={"mode": "openapi_url", "specUrl": "https://unreachable.example.com/spec.json"},
        )

        assert response.status_code == 503
        assert "Unable to fetch" in response.json()["detail"]

    @patch("app.api.analyze.analyze_endpoint")
    def test_analyze_endpoint_unreachable(self, mock_analyze):
        """Test analyze endpoint with unreachable endpoint."""
        mock_analyze.side_effect = ValueError("Unable to reach endpoint")

        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://api.example.com",
                "endpointPath": "/items",
            },
        )

        assert response.status_code == 503

    def test_analyze_endpoint_with_auth(self):
        """Test analyze endpoint with authentication."""
        with patch("app.api.analyze.analyze_endpoint") as mock_analyze:
            mock_analyze.return_value = [
                ResourceSchema(
                    name="items",
                    displayName="Items",
                    endpoint="/items",
                    primaryKey="id",
                    fields=[ResourceField(name="id", type="number", displayName="ID")],
                    operations=["list"],
                )
            ]

            response = client.post(
                "/api/analyze",
                json={
                    "mode": "endpoint",
                    "baseUrl": "https://api.example.com",
                    "endpointPath": "/items",
                    "authType": "bearer",
                    "authValue": "token123",
                },
            )

            assert response.status_code == 200
            # Verify auth was passed to analyzer
            mock_analyze.assert_called_once()
            call_kwargs = mock_analyze.call_args.kwargs
            assert call_kwargs["auth_type"] == "bearer"
            assert call_kwargs["auth_value"] == "token123"

    def test_analyze_endpoint_with_custom_headers(self):
        """Test analyze endpoint with custom headers."""
        with patch("app.api.analyze.analyze_endpoint") as mock_analyze:
            mock_analyze.return_value = [
                ResourceSchema(
                    name="items",
                    displayName="Items",
                    endpoint="/items",
                    primaryKey="id",
                    fields=[ResourceField(name="id", type="number", displayName="ID")],
                    operations=["list"],
                )
            ]

            response = client.post(
                "/api/analyze",
                json={
                    "mode": "endpoint",
                    "baseUrl": "https://api.example.com",
                    "endpointPath": "/items",
                    "customHeaders": '{"X-Custom": "value"}',
                },
            )

            assert response.status_code == 200
            # Verify custom headers were parsed
            call_kwargs = mock_analyze.call_args.kwargs
            assert call_kwargs["custom_headers"] == {"X-Custom": "value"}

    def test_analyze_endpoint_with_invalid_custom_headers(self):
        """Test analyze endpoint with invalid custom headers JSON."""
        response = client.post(
            "/api/analyze",
            json={
                "mode": "endpoint",
                "baseUrl": "https://api.example.com",
                "endpointPath": "/items",
                "customHeaders": "invalid json",
            },
        )

        assert response.status_code == 400
        assert "Invalid customHeaders JSON" in response.json()["detail"]

    @patch("app.api.analyze.analyze_openapi_spec")
    def test_analyze_invalid_openapi_spec(self, mock_analyze):
        """Test analyze endpoint with invalid OpenAPI spec."""
        mock_analyze.side_effect = ValueError("Invalid OpenAPI specification: error")

        response = client.post(
            "/api/analyze",
            json={"mode": "openapi", "specJson": {"invalid": "spec"}},
        )

        assert response.status_code == 400
        assert "Invalid OpenAPI specification" in response.json()["detail"]
