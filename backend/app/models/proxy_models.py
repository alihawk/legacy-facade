"""Proxy configuration data models.

These models define the structure for configuring the smart proxy layer
that forwards requests from the frontend to legacy REST or SOAP APIs.
"""

from typing import Literal
from pydantic import BaseModel, HttpUrl


class AuthConfig(BaseModel):
    """Authentication configuration for legacy API.
    
    Supports multiple auth modes:
    - none: No authentication
    - bearer: Bearer token in Authorization header
    - apiKey: Custom header with API key
    - basic: Basic authentication (username:password)
    - wsse: WS-Security for SOAP APIs
    """
    
    mode: Literal["none", "bearer", "apiKey", "basic", "wsse"] = "none"
    
    # Bearer token auth
    bearerToken: str | None = None
    
    # API Key auth
    apiKeyHeader: str | None = None
    apiKeyValue: str | None = None
    
    # Basic auth
    basicUser: str | None = None
    basicPass: str | None = None
    
    # WSSE auth (SOAP only)
    wsseUsername: str | None = None
    wssePassword: str | None = None


class RestOperationConfig(BaseModel):
    """Configuration for a REST API operation.
    
    Defines the HTTP method and path template for the operation.
    Path can include parameters like {id} or {resourceId}.
    """
    
    method: str  # GET, POST, PUT, DELETE, PATCH
    path: str    # e.g., "/api/v1/users/{id}"


class SoapOperationConfig(BaseModel):
    """Configuration for a SOAP API operation.
    
    Defines the SOAP operation name, SOAPAction header,
    and optional response element to extract.
    """
    
    operationName: str           # e.g., "GetCustomers"
    soapAction: str              # e.g., "http://example.com/GetCustomers"
    responseElement: str | None = None  # Optional element name to extract from response


class OperationConfig(BaseModel):
    """Configuration for a single CRUD operation.
    
    Can be either REST or SOAP (or both for hybrid APIs).
    At least one of rest or soap must be provided.
    """
    
    rest: RestOperationConfig | None = None
    soap: SoapOperationConfig | None = None


class FieldMapping(BaseModel):
    """Mapping between normalized field names and legacy field names.
    
    Used to transform field names between the frontend's normalized
    schema and the legacy API's actual field names.
    
    Example:
        normalizedName: "customer_id"
        legacyName: "CustID"
    """
    
    normalizedName: str  # Field name in frontend schema
    legacyName: str      # Field name in legacy API


class ResourceConfig(BaseModel):
    """Configuration for a single resource (e.g., users, orders).
    
    Defines how to map CRUD operations for this resource
    to the legacy API endpoints.
    """
    
    name: str                                    # Resource name (e.g., "users")
    endpoint: str                                # Base endpoint (e.g., "/api/v1/users")
    operations: dict[str, OperationConfig]       # Map of operation name to config
    fieldMappings: list[FieldMapping] | None = None  # Optional field name mappings
    responsePath: str | None = None              # Optional JSON path to unwrap response (e.g., "data.users")
    primaryKey: str | None = None                # Primary key field name (defaults to "id")


class ProxyConfig(BaseModel):
    """Complete proxy configuration.
    
    Defines how to connect to and interact with a legacy API,
    including authentication, resource mappings, and operation configs.
    """
    
    baseUrl: str                                 # Legacy API base URL
    apiType: Literal["rest", "soap"]             # API protocol type
    auth: AuthConfig                             # Authentication configuration
    resources: list[ResourceConfig]              # Resource configurations
    soapNamespace: str | None = None             # SOAP namespace (for SOAP APIs only)


class ProxyConfigRequest(BaseModel):
    """Request model for setting proxy configuration via API.
    
    Same structure as ProxyConfig but used for API input validation.
    """
    
    baseUrl: str
    apiType: Literal["rest", "soap"]
    auth: AuthConfig
    resources: list[ResourceConfig]
    soapNamespace: str | None = None


class ProxyConfigResponse(BaseModel):
    """Response model for getting proxy configuration.
    
    Returns sanitized config with sensitive data (tokens, passwords) hidden.
    """
    
    baseUrl: str
    apiType: Literal["rest", "soap"]
    auth: dict  # Sanitized auth config (no tokens/passwords)
    resources: list[ResourceConfig]
    soapNamespace: str | None = None
    configured: bool = True


class ProxyErrorResponse(BaseModel):
    """Standardized error response from proxy operations."""
    
    error: str                    # Error code (e.g., "NOT_FOUND", "BACKEND_ERROR")
    message: str                  # Human-readable error message
    details: dict | None = None   # Optional additional error details
    statusCode: int               # HTTP status code
