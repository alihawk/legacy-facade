"""Request models for the analyze API endpoint.

Supports both REST and SOAP API analysis modes.
"""

from typing import Any, Literal
from pydantic import BaseModel, HttpUrl


class AnalyzeRequest(BaseModel):
    """Request model for POST /api/analyze endpoint.

    Supports multiple analysis modes:
    - REST API modes:
      - openapi: Parse an inline OpenAPI/Swagger spec
      - openapi_url: Fetch and parse OpenAPI spec from URL
      - endpoint: Make HTTP request to REST endpoint and infer schema
      - json_sample: Infer schema from JSON sample

    - SOAP API modes:
      - wsdl: Parse an inline WSDL spec
      - wsdl_url: Fetch and parse WSDL from URL
      - soap_endpoint: Make SOAP request to endpoint and infer schema
      - soap_xml_sample: Infer schema from SOAP XML response sample
    """

    # Mode selection
    mode: Literal[
        # REST modes
        "openapi",
        "openapi_url",
        "endpoint",
        "json_sample",
        # SOAP modes
        "wsdl",
        "wsdl_url",
        "soap_endpoint",
        "soap_xml_sample",
    ]

    # === REST API Fields ===

    # OpenAPI mode fields
    specJson: dict[str, Any] | str | None = None
    specUrl: HttpUrl | str | None = None

    # Endpoint mode fields
    baseUrl: str | None = None
    endpointPath: str | None = None
    method: str | None = None
    authType: str | None = None
    authValue: str | None = None
    customHeaders: str | dict[str, str] | None = None

    # JSON sample mode fields
    sampleJson: dict[str, Any] | list[Any] | None = None

    # === SOAP API Fields ===

    # WSDL mode fields
    wsdlContent: str | None = None
    wsdlUrl: HttpUrl | str | None = None

    # SOAP endpoint mode fields
    soapAction: str | None = None
    username: str | None = None
    password: str | None = None
    wsseToken: str | None = None

    # SOAP XML sample mode fields
    sampleXml: str | None = None
    operationName: str | None = None

    class Config:
        """Pydantic config."""
        extra = "allow"