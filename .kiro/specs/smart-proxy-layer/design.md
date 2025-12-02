# Smart Proxy Layer - Design Document

## Overview

The Smart Proxy Layer is a FastAPI service that acts as a runtime bridge between the generated frontend UI and legacy backend APIs (both REST and SOAP). It receives CRUD requests from the frontend (GET/POST/PUT/DELETE to `/proxy/{resource}`), looks up configuration for how to call the legacy backend, attaches authentication headers, forwards the request, transforms responses, and returns normalized JSON to the frontend.

The proxy solves five core problems:
1. **CORS** - Frontend calls same-origin proxy; proxy makes server-to-server calls to legacy API
2. **Auth Complexity** - User configures auth once; proxy attaches correct headers on every request
3. **Protocol Translation** - SOAP XML requests/responses converted to/from JSON for frontend
4. **Response Normalization** - Nested/wrapped responses unwrapped to clean arrays
5. **Field Mapping** - Legacy field names mapped to normalized schema field names

## Architecture

### System Components

```
backend/
├── app/
│   ├── main.py                      # FastAPI app with CORS (already exists)
│   ├── api/
│   │   ├── analyze.py               # POST /api/analyze (already exists)
│   │   ├── proxy.py                 # NEW: Proxy endpoints
│   │   └── proxy_config.py          # NEW: POST/GET /api/proxy/config
│   ├── services/
│   │   ├── proxy_forwarder.py       # NEW: Request forwarding logic
│   │   ├── proxy_config_manager.py  # NEW: Config storage (JSON file)
│   │   ├── soap_request_builder.py  # NEW: Build SOAP XML requests
│   │   ├── soap_response_parser.py  # NEW: Parse SOAP XML responses
│   │   └── field_mapper.py          # NEW: Map legacy fields to normalized fields
│   ├── models/
│   │   ├── proxy_models.py          # NEW: ProxyConfig, ResourceOperation models
│   │   └── resource_schema.py       # (already exists)
│   ├── core/
│   │   ├── http_client.py           # (already exists, reuse for proxy)
│   │   └── config.py                # (already exists)
│   └── utils/
│       ├── auth_builder.py          # NEW: Build auth headers (REST + SOAP WSSE)
│       ├── error_normalizer.py      # NEW: Normalize backend errors to JSON
│       ├── path_resolver.py         # NEW: Replace {id} in paths
│       └── response_unwrapper.py    # (already exists, reuse)
```

### Data Flow

**Configuration Phase:**
1. User analyzes API → gets ResourceSchema with operations and field mappings
2. Frontend sends `POST /api/proxy/config` with:
   - baseUrl, auth settings
   - apiType: "rest" or "soap"
   - For SOAP: soapAction patterns, WSDL namespace
   - Resource mappings with field name translations
3. Backend stores config in `.proxy_config.json`

**Runtime Phase - REST API:**
1. Frontend sends `GET /proxy/orders`
2. Proxy looks up config, builds REST request
3. AuthBuilder attaches headers (Bearer/API Key/Basic)
4. HTTPClient forwards to legacy REST endpoint
5. ResponseUnwrapper extracts data from nested response
6. FieldMapper translates legacy field names to normalized names
7. Return normalized JSON to frontend

**Runtime Phase - SOAP API:**
1. Frontend sends `GET /proxy/customers`
2. Proxy looks up config, sees apiType="soap"
3. SoapRequestBuilder creates XML envelope with operation and parameters
4. AuthBuilder attaches WSSE security header (if configured)
5. HTTPClient POSTs XML to SOAP endpoint with SOAPAction header
6. SoapResponseParser extracts data from SOAP envelope body
7. FieldMapper translates legacy field names to normalized names
8. Return normalized JSON to frontend

## Components and Interfaces

### 1. Proxy Endpoints (api/proxy.py)

**Purpose:** Handle incoming CRUD requests from frontend and route to ProxyForwarder.

**Endpoints:**
```python
@router.get("/proxy/{resource}")
async def proxy_list(resource: str, request: Request) -> JSONResponse:
    """List all records for a resource."""
    
@router.get("/proxy/{resource}/{id}")
async def proxy_detail(resource: str, id: str, request: Request) -> JSONResponse:
    """Get single record by ID."""
    
@router.post("/proxy/{resource}")
async def proxy_create(resource: str, request: Request) -> JSONResponse:
    """Create new record."""
    
@router.put("/proxy/{resource}/{id}")
async def proxy_update(resource: str, id: str, request: Request) -> JSONResponse:
    """Update existing record."""
    
@router.delete("/proxy/{resource}/{id}")
async def proxy_delete(resource: str, id: str, request: Request) -> JSONResponse:
    """Delete record."""
```

**Logic:**
- Parse resource name and ID from URL
- Infer operation from HTTP method (GET → list/detail, POST → create, etc.)
- Get request body for POST/PUT
- Get query parameters for filtering/pagination
- Call ProxyForwarder.forward_request()
- Return response or normalized error

### 2. Proxy Config Manager (services/proxy_config_manager.py)

**Purpose:** Store and retrieve proxy configuration using JSON file persistence.

**Interface:**
```python
class ProxyConfigManager:
    def __init__(self, storage_path: str = ".proxy_config.json"):
        self.storage_path = storage_path
        self._cache: ProxyConfig | None = None
    
    def set_config(self, config: ProxyConfig) -> None:
        """Store proxy configuration to JSON file."""
        
    def get_config(self) -> ProxyConfig | None:
        """Retrieve current configuration (cached in memory)."""
        
    def clear_config(self) -> None:
        """Delete configuration file and clear cache."""
        
    def get_resource_config(self, resource_name: str) -> ResourceConfig | None:
        """Get configuration for specific resource."""
```

### 3. Proxy Forwarder (services/proxy_forwarder.py)

**Purpose:** Core logic to forward requests to legacy backend (REST or SOAP).

**Interface:**
```python
async def forward_request(
    resource: str,
    operation: str,  # "list", "detail", "create", "update", "delete"
    id: str | None = None,
    body: dict | None = None,
    query_params: dict | None = None,
) -> tuple[int, dict | list]:
    """Forward request to legacy backend.
    
    Returns:
        Tuple of (status_code, normalized_response_body)
    """
```

**Logic:**
1. Get ProxyConfig from ProxyConfigManager
2. Check apiType: "rest" or "soap"
3. **If REST:**
   - Look up resource config for operation (method, path)
   - If not configured, use REST heuristic
   - Build URL with path parameters resolved
   - Build headers using AuthBuilder
   - Make HTTP request
   - Unwrap response using ResponseUnwrapper
   - Map fields using FieldMapper
4. **If SOAP:**
   - Look up resource config for SOAP operation name and action
   - Build SOAP request using SoapRequestBuilder
   - Build headers with SOAPAction and WSSE auth
   - POST to SOAP endpoint
   - Parse response using SoapResponseParser
   - Map fields using FieldMapper
5. Return normalized data or error

### 4. Auth Builder (utils/auth_builder.py)

**Purpose:** Build authentication headers for both REST and SOAP APIs.

**Interface:**
```python
def build_rest_auth_headers(auth_config: AuthConfig) -> dict[str, str]:
    """Build REST authentication headers."""

def build_soap_headers(
    soap_action: str,
    auth_config: AuthConfig,
) -> dict[str, str]:
    """Build SOAP request headers including SOAPAction."""

def build_wsse_security_header(
    username: str,
    password: str,
) -> str:
    """Build WS-Security XML header for SOAP envelope."""
```

**REST Auth Logic:**
```python
if auth_config.mode == "bearer":
    return {"Authorization": f"Bearer {auth_config.bearerToken}"}
elif auth_config.mode == "apiKey":
    return {auth_config.apiKeyHeader: auth_config.apiKeyValue}
elif auth_config.mode == "basic":
    encoded = base64.b64encode(f"{auth_config.basicUser}:{auth_config.basicPass}".encode())
    return {"Authorization": f"Basic {encoded.decode()}"}
else:
    return {}
```

**SOAP Auth Logic:**
```python
headers = {
    "Content-Type": "text/xml; charset=utf-8",
    "SOAPAction": f'"{soap_action}"',
}
if auth_config.mode == "basic":
    encoded = base64.b64encode(f"{auth_config.basicUser}:{auth_config.basicPass}".encode())
    headers["Authorization"] = f"Basic {encoded.decode()}"
# WSSE is added to XML envelope, not HTTP headers
return headers
```

### 5. SOAP Request Builder (services/soap_request_builder.py)

**Purpose:** Build SOAP XML request envelopes for different operations.

**Interface:**
```python
def build_soap_request(
    operation_name: str,
    namespace: str,
    parameters: dict | None = None,
    auth_config: AuthConfig | None = None,
) -> str:
    """Build complete SOAP XML envelope.
    
    Args:
        operation_name: SOAP operation (e.g., "GetCustomers", "CreateOrder")
        namespace: Service namespace (e.g., "http://example.com/customerservice")
        parameters: Operation parameters as dict (converted to XML elements)
        auth_config: If mode="wsse", include WS-Security header
    
    Returns:
        Complete SOAP XML envelope as string
    """

def build_operation_xml(
    operation_name: str,
    namespace: str,
    parameters: dict | None,
) -> str:
    """Build the operation element with parameters."""

def dict_to_xml_elements(data: dict, indent: int = 0) -> str:
    """Convert dictionary to XML elements recursively."""
```

**Example Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="http://example.com/customerservice">
    <soap:Header>
        <!-- WSSE Security header if auth_config.mode == "wsse" -->
    </soap:Header>
    <soap:Body>
        <ns:GetCustomers>
            <ns:status>active</ns:status>
        </ns:GetCustomers>
    </soap:Body>
</soap:Envelope>
```

### 6. SOAP Response Parser (services/soap_response_parser.py)

**Purpose:** Parse SOAP XML responses and extract data as Python dicts/lists.

**Interface:**
```python
def parse_soap_response(
    xml_content: str,
    operation_name: str,
) -> list[dict] | dict:
    """Parse SOAP response and extract data.
    
    Args:
        xml_content: Raw SOAP XML response
        operation_name: Operation name to help locate response element
    
    Returns:
        Extracted data as list of dicts (for list operations) or single dict
    
    Raises:
        SoapFaultError: If response contains SOAP Fault
        ValueError: If response cannot be parsed
    """

def extract_soap_body(root: ET.Element) -> ET.Element:
    """Extract Body element from SOAP envelope."""

def extract_records(body: ET.Element, operation_name: str) -> list[ET.Element]:
    """Find and extract data records from response body."""

def element_to_dict(element: ET.Element) -> dict:
    """Convert XML element to dictionary recursively."""

class SoapFaultError(Exception):
    """Raised when SOAP response contains a Fault."""
    def __init__(self, fault_code: str, fault_string: str):
        self.fault_code = fault_code
        self.fault_string = fault_string
```

### 7. Field Mapper (services/field_mapper.py)

**Purpose:** Translate legacy field names to normalized schema field names.

**Interface:**
```python
def map_fields(
    data: dict | list[dict],
    field_mapping: dict[str, str],
    reverse: bool = False,
) -> dict | list[dict]:
    """Map field names in data according to mapping.
    
    Args:
        data: Data to transform (single dict or list of dicts)
        field_mapping: Mapping from normalized name to legacy name
                       e.g., {"customer_id": "CUST_ID", "full_name": "USR_NM"}
        reverse: If True, map from legacy to normalized (for responses)
                 If False, map from normalized to legacy (for requests)
    
    Returns:
        Data with field names transformed
    """

def map_single_record(
    record: dict,
    field_mapping: dict[str, str],
    reverse: bool,
) -> dict:
    """Map fields in a single record."""
```

**Example:**
```python
# Response from legacy API
legacy_data = {"CUST_ID": 1001, "USR_NM": "John Smith", "EMAIL_ADDR": "john@example.com"}

# Field mapping (normalized → legacy)
mapping = {
    "customer_id": "CUST_ID",
    "full_name": "USR_NM", 
    "email": "EMAIL_ADDR"
}

# Map legacy → normalized (reverse=True)
normalized = map_fields(legacy_data, mapping, reverse=True)
# Result: {"customer_id": 1001, "full_name": "John Smith", "email": "john@example.com"}
```

### 8. Path Resolver (utils/path_resolver.py)

**Purpose:** Replace path parameters like {id} with actual values.

**Interface:**
```python
def resolve_path(path_template: str, params: dict[str, str]) -> str:
    """Replace path parameters with actual values."""
```

### 9. Error Normalizer (utils/error_normalizer.py)

**Purpose:** Convert backend errors (REST and SOAP) to consistent JSON format.

**Interface:**
```python
def normalize_error(
    status_code: int,
    response_body: str | dict,
    error_context: str = "",
) -> dict:
    """Normalize backend error to clean JSON."""

def normalize_soap_fault(fault: SoapFaultError) -> dict:
    """Convert SOAP Fault to normalized error format."""
```

**SOAP Fault Mapping:**
```python
{
    "error": {
        "code": "SOAP_FAULT",
        "status": 500,
        "message": fault.fault_string,
        "soapFaultCode": fault.fault_code
    }
}
```

### 10. Proxy Config Endpoint (api/proxy_config.py)

**Endpoints:**
```python
@router.post("/api/proxy/config")
async def set_proxy_config(config: ProxyConfigRequest) -> JSONResponse:
    """Store proxy configuration."""
    
@router.get("/api/proxy/config")
async def get_proxy_config() -> JSONResponse:
    """Get current proxy configuration (sanitized)."""
    
@router.delete("/api/proxy/config")
async def clear_proxy_config() -> JSONResponse:
    """Clear proxy configuration."""
```

## Data Models

### ProxyConfig
```python
class AuthConfig(BaseModel):
    mode: Literal["none", "bearer", "apiKey", "basic", "wsse"]
    # REST auth
    bearerToken: str | None = None
    apiKeyHeader: str | None = None
    apiKeyValue: str | None = None
    basicUser: str | None = None
    basicPass: str | None = None
    # SOAP WSSE auth (uses basicUser/basicPass for username/password)

class SoapOperationConfig(BaseModel):
    """SOAP-specific operation configuration."""
    operationName: str      # e.g., "GetCustomers"
    soapAction: str         # e.g., "http://example.com/GetCustomers"
    responseElement: str | None = None  # Element containing data in response

class RestOperationConfig(BaseModel):
    """REST-specific operation configuration."""
    method: str  # "GET", "POST", "PUT", "DELETE"
    path: str    # "/v1/orders" or "/v1/orders/{id}"

class OperationConfig(BaseModel):
    """Unified operation config supporting both REST and SOAP."""
    rest: RestOperationConfig | None = None
    soap: SoapOperationConfig | None = None

class FieldMapping(BaseModel):
    """Maps normalized field name to legacy field name."""
    normalizedName: str   # e.g., "customer_id"
    legacyName: str       # e.g., "CUST_ID"

class ResourceConfig(BaseModel):
    name: str
    endpoint: str  # Base endpoint path for this resource
    operations: dict[str, OperationConfig]  # "list" → OperationConfig
    fieldMappings: list[FieldMapping] | None = None  # Optional field name translations
    responsePath: str | None = None  # JSON path to data in response (e.g., "Data.Users")

class ProxyConfig(BaseModel):
    baseUrl: str
    apiType: Literal["rest", "soap"]
    auth: AuthConfig
    resources: list[ResourceConfig]
    # SOAP-specific
    soapNamespace: str | None = None  # Default namespace for SOAP operations
```

### ProxyConfigRequest
```python
class ProxyConfigRequest(BaseModel):
    """Request body for POST /api/proxy/config"""
    baseUrl: str
    apiType: Literal["rest", "soap"] = "rest"
    auth: AuthConfig
    resources: list[ResourceConfig] | None = None
    soapNamespace: str | None = None
```

## Correctness Properties

### Property 1: Auth Header Attachment (REST)
*For any* REST proxy request with auth mode configured, the forwarded request should include the correct authentication header.
**Validates: Requirements 7.1, 8.1, 9.1**

### Property 2: WSSE Security Header (SOAP)
*For any* SOAP proxy request with auth mode "wsse", the SOAP envelope should include a valid WS-Security header with UsernameToken.
**Validates: Requirements 7.6, 7.7**

### Property 3: Path Parameter Substitution
*For any* REST operation path containing {id}, the resolved path should have {id} replaced with the actual ID value.
**Validates: Requirements 13.1, 13.2, 13.5**

### Property 4: SOAP Envelope Construction
*For any* SOAP proxy request, the generated XML should be a valid SOAP envelope with correct namespace, operation name, and parameters.
**Validates: Requirements 19.1, 19.2, 19.3**

### Property 5: REST Heuristic Fallback
*For any* REST resource without explicit operation configuration, the proxy should use REST heuristics.
**Validates: Requirements 12.1-12.5**

### Property 6: SOAP Response Parsing
*For any* valid SOAP response, the parser should extract data records and convert them to Python dicts.
**Validates: Requirements 20.1, 20.2, 20.3**

### Property 7: Field Mapping Consistency
*For any* response with field mappings configured, all legacy field names should be translated to normalized names.
**Validates: Requirements 21.1, 21.2, 21.3**

### Property 8: Error Normalization Consistency
*For any* backend error (REST HTTP error or SOAP Fault), the proxy should return a normalized JSON error.
**Validates: Requirements 10.1-10.5, 10.6**

### Property 9: Query Parameter Preservation
*For any* REST proxy request with query parameters, those parameters should be forwarded unchanged.
**Validates: Requirements 14.1, 14.2**

### Property 10: CORS Header Inclusion
*For any* proxy response, the response should include CORS headers.
**Validates: Requirements 11.1, 11.2**

## Error Handling

### REST Error Categories
1. **Configuration Errors (400)** - Missing config, invalid resource
2. **Backend Errors (502, 503)** - Unreachable, timeout, non-JSON response
3. **Backend HTTP Errors (forwarded)** - 404, 405, 401/403, 500

### SOAP Error Categories
1. **Configuration Errors (400)** - Missing SOAP config, invalid operation
2. **SOAP Faults (500)** - Server returned SOAP Fault element
3. **Backend Errors (502, 503)** - Unreachable, timeout, non-XML response
4. **Parse Errors (502)** - Invalid XML, missing expected elements

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "status": 404,
    "message": "Human-readable error message",
    "soapFaultCode": "soap:Server"  // Only for SOAP faults
  }
}
```

## Implementation Notes

### Technology Stack
- **Framework**: FastAPI (already in use)
- **HTTP Client**: httpx (already in use)
- **XML Parsing**: xml.etree.ElementTree (stdlib)
- **Config Storage**: JSON file (`.proxy_config.json`)
- **Testing**: pytest + pytest-asyncio + Hypothesis

### Performance Considerations
- Cache ProxyConfig in memory after loading from file
- Reuse HTTPClient with connection pooling
- Parse SOAP responses with streaming for large responses (future)

### Security Considerations
- Never log auth tokens or passwords
- Sanitize config when returning via GET endpoint
- Validate baseUrl to prevent SSRF (optional for hackathon)