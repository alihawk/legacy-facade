"""Tests for HTTP client."""

import pytest
import httpx
from app.core.http_client import HTTPClient, fetch_url


@pytest.mark.asyncio
async def test_http_client_context_manager():
    """Test HTTPClient can be used as async context manager."""
    async with HTTPClient() as client:
        assert client._client is not None
        assert isinstance(client._client, httpx.AsyncClient)


@pytest.mark.asyncio
async def test_http_client_timeout_configuration():
    """Test HTTPClient respects timeout configuration."""
    custom_timeout = 15
    async with HTTPClient(timeout_seconds=custom_timeout) as client:
        assert client.timeout == custom_timeout


@pytest.mark.asyncio
async def test_http_client_get_success(httpx_mock):
    """Test successful GET request."""
    test_url = "https://api.example.com/data"
    test_response = {"status": "ok"}
    
    httpx_mock.add_response(url=test_url, json=test_response)
    
    async with HTTPClient() as client:
        response = await client.get(test_url)
        assert response.status_code == 200
        assert response.json() == test_response


@pytest.mark.asyncio
async def test_http_client_get_with_headers(httpx_mock):
    """Test GET request with custom headers."""
    test_url = "https://api.example.com/data"
    test_headers = {"Authorization": "Bearer token123"}
    
    httpx_mock.add_response(url=test_url, json={"data": "test"})
    
    async with HTTPClient() as client:
        response = await client.get(test_url, headers=test_headers)
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_http_client_timeout_error(httpx_mock):
    """Test timeout handling."""
    test_url = "https://slow-api.example.com/data"
    
    httpx_mock.add_exception(httpx.TimeoutException("Timeout"))
    
    async with HTTPClient(timeout_seconds=1) as client:
        with pytest.raises(httpx.TimeoutException):
            await client.get(test_url)


@pytest.mark.asyncio
async def test_http_client_connection_error(httpx_mock):
    """Test connection error handling."""
    test_url = "https://unreachable.example.com/data"
    
    httpx_mock.add_exception(httpx.ConnectError("Connection failed"))
    
    async with HTTPClient() as client:
        with pytest.raises(httpx.ConnectError):
            await client.get(test_url)


@pytest.mark.asyncio
async def test_http_client_http_error(httpx_mock):
    """Test HTTP error status handling."""
    test_url = "https://api.example.com/not-found"
    
    httpx_mock.add_response(url=test_url, status_code=404)
    
    async with HTTPClient() as client:
        with pytest.raises(httpx.HTTPStatusError):
            await client.get(test_url)


@pytest.mark.asyncio
async def test_fetch_url_convenience_function(httpx_mock):
    """Test fetch_url convenience function."""
    test_url = "https://api.example.com/spec.json"
    test_content = b'{"openapi": "3.0.0"}'
    
    httpx_mock.add_response(
        url=test_url,
        content=test_content,
        headers={"content-type": "application/json"},
    )
    
    content, content_type = await fetch_url(test_url)
    assert content == test_content
    assert "application/json" in content_type


@pytest.mark.asyncio
async def test_http_client_post_success(httpx_mock):
    """Test successful POST request."""
    test_url = "https://api.example.com/create"
    test_payload = {"name": "test"}
    test_response = {"id": 1, "name": "test"}
    
    httpx_mock.add_response(url=test_url, json=test_response)
    
    async with HTTPClient() as client:
        response = await client.post(test_url, json_data=test_payload)
        assert response.status_code == 200
        assert response.json() == test_response
