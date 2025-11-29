"""Request models for the analyze endpoint."""

from typing import Literal, Optional, Union
from pydantic import BaseModel, HttpUrl


class AnalyzeRequest(BaseModel):
    """Request model for POST /api/analyze endpoint."""

    mode: Literal["openapi", "openapi_url", "endpoint", "json_sample"]

    # For mode="openapi"
    specJson: Optional[Union[dict, str]] = None

    # For mode="openapi_url"
    specUrl: Optional[HttpUrl] = None

    # For mode="endpoint"
    baseUrl: Optional[HttpUrl] = None
    endpointPath: Optional[str] = None
    method: Optional[str] = "GET"
    authType: Optional[Literal["none", "bearer", "api-key", "basic"]] = "none"
    authValue: Optional[str] = None
    customHeaders: Optional[str] = None

    # For mode="json_sample"
    sampleJson: Optional[Union[dict, list]] = None
