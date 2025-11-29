"""Tests for endpoint analyzer."""

import base64
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.endpoint_analyzer import analyze_endpoint, _build_headers


class TestEndpointAnalyzer:
    """Test suite for endpoint analyzer."""

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_with_array_response(self, mock_http_client):
        """Test analyzing endpoint that returns an array."""
        # Mock HTTP response
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = [
            {"id": 1, "name": "Alice", "email": "alice@example.com"},
            {"id": 2, "name": "Bob", "email": "bob@example.com"},
        ]
        mock_client.get.return_value = mock_response

        # Analyze endpoint
        resources = await analyze_endpoint(
            base_url="https://api.example.com",
            endpoint_path="/api/v1/users",
            method="GET",
        )

        # Verify HTTP call
        mock_client.get.assert_called_once_with(
            "https://api.example.com/api/v1/users", headers={}
        )

        # Verify resource
        assert len(resources) == 1
        resource = resources[0]

        assert resource.name == "users"
        assert resource.endpoint == "/api/v1/users"
        assert "list" in resource.operations
        assert len(resource.fields) == 3

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_with_object_response(self, mock_http_client):
        """Test analyzing endpoint that returns a single object."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = {
            "id": 1,
            "name": "Alice",
            "email": "alice@example.com",
        }
        mock_client.get.return_value = mock_response

        resources = await analyze_endpoint(
            base_url="https://api.example.com",
            endpoint_path="/api/v1/users/1",
            method="GET",
        )

        assert len(resources) == 1
        resource = resources[0]

        assert resource.name == "users"
        assert resource.endpoint == "/api/v1/users/1"
        assert "detail" in resource.operations

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_with_bearer_auth(self, mock_http_client):
        """Test endpoint analysis with bearer token authentication."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = [{"id": 1, "name": "Test"}]
        mock_client.get.return_value = mock_response

        await analyze_endpoint(
            base_url="https://api.example.com",
            endpoint_path="/users",
            auth_type="bearer",
            auth_value="token123",
        )

        # Verify auth header was included
        call_args = mock_client.get.call_args
        headers = call_args.kwargs["headers"]
        assert headers["Authorization"] == "Bearer token123"

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_with_api_key_auth(self, mock_http_client):
        """Test endpoint analysis with API key authentication."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = [{"id": 1, "name": "Test"}]
        mock_client.get.return_value = mock_response

        await analyze_endpoint(
            base_url="https://api.example.com",
            endpoint_path="/users",
            auth_type="api-key",
            auth_value="key123",
        )

        call_args = mock_client.get.call_args
        headers = call_args.kwargs["headers"]
        assert headers["X-API-Key"] == "key123"

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_with_basic_auth(self, mock_http_client):
        """Test endpoint analysis with basic authentication."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = [{"id": 1, "name": "Test"}]
        mock_client.get.return_value = mock_response

        await analyze_endpoint(
            base_url="https://api.example.com",
            endpoint_path="/users",
            auth_type="basic",
            auth_value="user:pass",
        )

        call_args = mock_client.get.call_args
        headers = call_args.kwargs["headers"]

        # Verify basic auth header
        expected = "Basic " + base64.b64encode(b"user:pass").decode()
        assert headers["Authorization"] == expected

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_with_custom_headers(self, mock_http_client):
        """Test endpoint analysis with custom headers."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = [{"id": 1, "name": "Test"}]
        mock_client.get.return_value = mock_response

        custom_headers = {"X-Custom-Header": "value", "X-Request-ID": "123"}

        await analyze_endpoint(
            base_url="https://api.example.com",
            endpoint_path="/users",
            custom_headers=custom_headers,
        )

        call_args = mock_client.get.call_args
        headers = call_args.kwargs["headers"]
        assert headers["X-Custom-Header"] == "value"
        assert headers["X-Request-ID"] == "123"

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_with_nested_response(self, mock_http_client):
        """Test endpoint analysis with nested response structure."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": {"users": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]}
        }
        mock_client.get.return_value = mock_response

        resources = await analyze_endpoint(
            base_url="https://api.example.com", endpoint_path="/users"
        )

        # Should unwrap nested structure
        assert len(resources) == 1
        assert "list" in resources[0].operations

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_unreachable(self, mock_http_client):
        """Test error handling when endpoint is unreachable."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_client.get.side_effect = Exception("Connection failed")

        with pytest.raises(ValueError, match="Unable to reach endpoint"):
            await analyze_endpoint(
                base_url="https://api.example.com", endpoint_path="/users"
            )

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_invalid_json(self, mock_http_client):
        """Test error handling when response is not valid JSON."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.side_effect = Exception("Invalid JSON")
        mock_client.get.return_value = mock_response

        with pytest.raises(ValueError, match="not valid JSON"):
            await analyze_endpoint(
                base_url="https://api.example.com", endpoint_path="/users"
            )

    @pytest.mark.asyncio
    @patch("app.services.endpoint_analyzer.HTTPClient")
    async def test_analyze_endpoint_post_method(self, mock_http_client):
        """Test endpoint analysis with POST method."""
        mock_client = AsyncMock()
        mock_http_client.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.json.return_value = {"id": 1, "name": "Created"}
        mock_client.post.return_value = mock_response

        resources = await analyze_endpoint(
            base_url="https://api.example.com",
            endpoint_path="/users",
            method="POST",
        )

        # Verify POST was called
        mock_client.post.assert_called_once()
        assert len(resources) == 1


class TestBuildHeaders:
    """Test suite for header building."""

    def test_build_headers_bearer_auth(self):
        """Test building headers with bearer token."""
        headers = _build_headers("bearer", "token123", None)
        assert headers["Authorization"] == "Bearer token123"

    def test_build_headers_api_key_auth(self):
        """Test building headers with API key."""
        headers = _build_headers("api-key", "key123", None)
        assert headers["X-API-Key"] == "key123"

    def test_build_headers_basic_auth(self):
        """Test building headers with basic auth."""
        headers = _build_headers("basic", "user:pass", None)
        expected = "Basic " + base64.b64encode(b"user:pass").decode()
        assert headers["Authorization"] == expected

    def test_build_headers_no_auth(self):
        """Test building headers without authentication."""
        headers = _build_headers(None, None, None)
        assert headers == {}

    def test_build_headers_with_custom_headers(self):
        """Test building headers with custom headers."""
        custom = {"X-Custom": "value", "X-Another": "test"}
        headers = _build_headers(None, None, custom)
        assert headers["X-Custom"] == "value"
        assert headers["X-Another"] == "test"

    def test_build_headers_auth_and_custom(self):
        """Test building headers with both auth and custom headers."""
        custom = {"X-Custom": "value"}
        headers = _build_headers("bearer", "token123", custom)
        assert headers["Authorization"] == "Bearer token123"
        assert headers["X-Custom"] == "value"

    def test_build_headers_unknown_auth_type(self):
        """Test building headers with unknown auth type."""
        headers = _build_headers("unknown", "value", None)
        # Should not add any auth header for unknown type
        assert "Authorization" not in headers
