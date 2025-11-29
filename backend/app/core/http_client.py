"""Async HTTP client for making requests to external APIs."""

import logging
from types import TracebackType
from typing import Union

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class HTTPClient:
    """Async HTTP client with timeout and error handling."""

    def __init__(self, timeout_seconds: int | None = None):
        """Initialize HTTP client with configurable timeout.

        Args:
            timeout_seconds: Request timeout in seconds. Defaults to settings value.
        """
        self.timeout = timeout_seconds or settings.analyzer_timeout_seconds
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "HTTPClient":
        """Enter async context manager."""
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout),
            follow_redirects=True,
        )
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        """Exit async context manager and cleanup."""
        if self._client:
            await self._client.aclose()

    async def get(
        self,
        url: str,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        """Make an async GET request.

        Args:
            url: Target URL
            headers: Optional HTTP headers

        Returns:
            httpx.Response object

        Raises:
            httpx.TimeoutException: If request exceeds timeout
            httpx.HTTPError: For connection failures or HTTP errors
        """
        if not self._client:
            raise RuntimeError("HTTPClient must be used as async context manager")

        try:
            logger.info("Making GET request to %s", url)
            response = await self._client.get(url, headers=headers or {})
            response.raise_for_status()
            return response
        except httpx.TimeoutException:
            logger.error(
                "Request to %s timed out after %s seconds", url, self.timeout
            )
            raise
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error %s for %s", e.response.status_code, url)
            raise
        except httpx.RequestError as e:
            logger.error("Connection error for %s: %s", url, e)
            raise

    async def post(
        self,
        url: str,
        json_data: dict[str, Union[str, int, float, bool, None, list, dict]]
        | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        """Make an async POST request.

        Args:
            url: Target URL
            json_data: JSON payload
            headers: Optional HTTP headers

        Returns:
            httpx.Response object

        Raises:
            httpx.TimeoutException: If request exceeds timeout
            httpx.HTTPError: For connection failures or HTTP errors
        """
        if not self._client:
            raise RuntimeError("HTTPClient must be used as async context manager")

        try:
            logger.info("Making POST request to %s", url)
            response = await self._client.post(
                url, json=json_data, headers=headers or {}
            )
            response.raise_for_status()
            return response
        except httpx.TimeoutException:
            logger.error(
                "Request to %s timed out after %s seconds", url, self.timeout
            )
            raise
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error %s for %s", e.response.status_code, url)
            raise
        except httpx.RequestError as e:
            logger.error("Connection error for %s: %s", url, e)
            raise


async def fetch_url(
    url: str,
    headers: dict[str, str] | None = None,
    timeout_seconds: int | None = None,
) -> tuple[bytes, str]:
    """Convenience function to fetch content from a URL.

    Args:
        url: Target URL
        headers: Optional HTTP headers
        timeout_seconds: Request timeout in seconds

    Returns:
        Tuple of (content bytes, content-type header)

    Raises:
        httpx.TimeoutException: If request exceeds timeout
        httpx.HTTPError: For connection failures or HTTP errors
    """
    async with HTTPClient(timeout_seconds=timeout_seconds) as client:
        response = await client.get(url, headers=headers)
        content_type = response.headers.get("content-type", "")
        return response.content, content_type
