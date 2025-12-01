# Smart Proxy Layer - Design Document

## Overview

The Smart Proxy Layer is a FastAPI service that acts as a runtime bridge between the generated frontend UI and legacy backend APIs. It receives CRUD requests from the frontend (GET/POST/PUT/DELETE to `/proxy/{resource}`), looks up configuration for how to call the legacy backend, attaches authentication headers, forwards the request, and returns normalized responses.

The proxy solves three core problems:
1. **CORS** - Frontend calls same-origin proxy; proxy makes server-to-server calls to legacy API
2. **Auth Complexity** - User configures auth once; proxy attaches correct headers on every request
3. **Error Normalization** - Legacy backends return inconsistent errors; proxy normalizes to clean JSON

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
│   │   └── proxy_config_manager.py  # NEW: Config storage (in-memory)
│   ├── models/
│   │   ├── proxy_models.py          # NEW: ProxyConfig, ResourceOperation models
│   │   └── resource_schema.py       # (already exists)
│   ├── core/
│   │   ├── http_client.py           # (already exists, reuse for proxy)
│   │   └── config.py                # (already exists)
│   └── utils/
│       ├── auth_builder.py          # NEW: Build auth headers from config
│       ├── error_normalizer.py      # NEW: Normalize backend errors to JSON
│       └── path_resolver.py         # NEW: Replace {id} in paths
```

### Data Flow

**Configuration Phase:**
1. User analyzes API → gets ResourceSchema with operations
2. Frontend sends `POST /api/proxy/config` with baseUrl, auth, resource mappings
3. Backend stores config in memory (keyed by session or single global config)

**Runtime Phase (CRUD Operations):**
1. Frontend sends `GET /proxy/orders` (or POST/PUT/DELETE)
2. Proxy endpoint parses resource name ("orders") and infers operation from method
3. ProxyForwarder looks up config for resource + operation
4. If operation not configured, use REST heuristic (GET /orders → list)
5. AuthBuilder attaches headers based on auth.mode (bearer/apiKey/basic)
6. PathResolver replaces {id} placeholders with actual ID from URL
7. HTTPClient forwards request to legacy backend
8. If success: return response to frontend
9. If error: ErrorNormalizer converts to clean JSON error

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

**Purpose:** Store and retrieve proxy configuration using simple file-based persistence.

**Interface:**
```python
class ProxyConfigManager:
    def __init__(self, storage_path: str = ".proxy_config.json"):
        self.storage_path = storage_path
    
    def set_config(self, config: ProxyConfig) -> None:
        """Store proxy configuration to JSON file."""
        
    def get_config(self) -> ProxyConfig | None:
        """Retrieve current configuration from JSON file."""
        
    def clear_config(self) -> None:
        """Delete configuration file."""
        
    def get_resource_config(self, resource_name: str) -> ResourceConfig | None:
        """Get configuration for specific resource."""
```

**Storage Options (pick one):**

**Option 1: Simple JSON file (Recommended for hackathon)**
- Store config in `.proxy_config.json` in backend directory
- Use Python's built-in `json` module
- Pros: Zero dependencies, simple, persists across restarts
- Cons: Not suitable for multi-process deployments

**Option 2: SQLite with `diskcache` library**
- Use `diskcache` package (pip install diskcache)
- Provides dict-like interface with disk persistence
- Pros: Simple API, thread-safe, persists across restarts
- Cons: One extra dependency

**Option 3: Redis (if already using)**
- Only if Redis is already in your stack
- Pros: Fast, production-ready, multi-process safe
- Cons: Extra service to run

**Recommendation:** Use **Option 1 (JSON file)** for hackathon - simplest with zero dependencies.

### 3. Proxy Forwarder (services/proxy_forwarder.py)

**Purpose:** Core logic to forward requests to legacy backend.

**Interface:**
```python
async def forward_request(
    resource: str,
    operation: str,
    id: str | None = None,
    body: dict | None = None,
    query_params: dict | None = None,
) -> tuple[int, dict | list]:
    """Forward request to legacy backend.
    
    Returns:
        Tuple of (status_code, response_body)
    """
```

**Logic:**
1. Get ProxyConfig from ProxyConfigManager
2. Look up resource config for given resource name
3. Get operation config (method, path) for given operation
4. If operation not configured, use REST heuristic
5. Build full URL: baseUrl + path (with {id} replaced)
6. Build headers using AuthBuilder
7. Make HTTP request using HTTPClient
8. If success: return (status_code, response_body)
9. If error: use ErrorNormalizer to convert to clean JSON

### 4. Auth Builder (utils/auth_builder.py)

**Purpose:** Build authentication headers based on auth mode.

**Interface:**
```python
def build_auth_headers(auth_config: AuthConfig) -> dict[str, str]:
    """Build authentication headers from config.
    
    Returns:
        Dictionary of headers to attach to request
    """
```

**Logic:**
```python
if auth_config.mode == "bearer":
    return {"Authorization": f"Bearer {auth_config.bearerToken}"}
elif auth_config.mode == "apiKey":
    return {auth_config.apiKeyHeader: auth_config.apiKeyValue}
elif auth_config.mode == "basic":
    encoded = base64.b64encode(f"{auth_config.basicUser}:{auth_config.basicPass}".encode())
    return {"Authorization": f"Basic {encoded.decode()}"}
else:  # "none"
    return {}
```

### 5. Path Resolver (utils/path_resolver.py)

**Purpose:** Replace path parameters like {id} with actual values.

**Interface:**
```python
def resolve_path(path_template: str, params: dict[str, str]) -> str:
    """Replace path parameters with actual values.
    
    Args:
        path_template: e.g., "/v1/orders/{id}"
        params: e.g., {"id": "123"}
    
    Returns:
        Resolved path: "/v1/orders/123"
    """
```

**Logic:**
- Use regex or string replacement to find {param} patterns
- Replace with values from params dict
- Raise error if required param is missing

### 6. Error Normalizer (utils/error_normalizer.py)

**Purpose:** Convert backend errors to consistent JSON format.

**Interface:**
```python
def normalize_error(
    status_code: int,
    response_body: str | dict,
    error_context: str = "",
) -> dict:
    """Normalize backend error to clean JSON.
    
    Returns:
        {
            "error": {
                "code": "ERROR_CODE",
                "status": 404,
                "message": "Human-readable message"
            }
        }
    """
```

**Error Mappings:**
- 404 → `{"error": {"code": "NOT_FOUND", "status": 404, "message": "Resource not found"}}`
- 405 → `{"error": {"code": "OPERATION_NOT_SUPPORTED", "status": 405, "message": "Operation not supported"}}`
- 500 → `{"error": {"code": "BACKEND_ERROR", "status": 500, "message": "Legacy backend error"}}`
- Timeout → `{"error": {"code": "BACKEND_UNAVAILABLE", "status": 503, "message": "Backend timed out"}}`
- HTML response → `{"error": {"code": "INVALID_RESPONSE", "status": 502, "message": "Backend returned non-JSON"}}`

### 7. Proxy Config Endpoint (api/proxy_config.py)

**Purpose:** Allow frontend to configure proxy settings.

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
    mode: Literal["none", "bearer", "apiKey", "basic"]
    bearerToken: str | None = None
    apiKeyHeader: str | None = None
    apiKeyValue: str | None = None
    basicUser: str | None = None
    basicPass: str | None = None

class OperationConfig(BaseModel):
    method: str  # "GET", "POST", "PUT", "DELETE"
    path: str    # "/v1/orders" or "/v1/orders/{id}"

class ResourceConfig(BaseModel):
    name: str
    operations: dict[str, OperationConfig]  # "list" → OperationConfig

class ProxyConfig(BaseModel):
    baseUrl: str
    auth: AuthConfig
    resources: list[ResourceConfig]
```

### ProxyConfigRequest
```python
class ProxyConfigRequest(BaseModel):
    """Request body for POST /api/proxy/config"""
    baseUrl: str
    auth: AuthConfig
    resources: list[ResourceConfig] | None = None  # Optional, can use defaults
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Auth Header Attachment
*For any* proxy request with auth mode configured, the forwarded request to the legacy backend should include the correct authentication header based on the auth mode (Bearer, API Key, or Basic).
**Validates: Requirements 7.1, 8.1, 9.1**

### Property 2: Path Parameter Substitution
*For any* operation path containing {id} and a request with an ID value, the resolved path should have {id} replaced with the actual ID value.
**Validates: Requirements 13.1, 13.2, 13.5**

### Property 3: REST Heuristic Fallback
*For any* resource without explicit operation configuration, the proxy should use REST heuristics: GET /resource for list, GET /resource/{id} for detail, POST /resource for create, PUT /resource/{id} for update, DELETE /resource/{id} for delete.
**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

### Property 4: Error Normalization Consistency
*For any* backend error response (404, 500, timeout, HTML), the proxy should return a normalized JSON error with code, status, and message fields.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 5: Query Parameter Preservation
*For any* proxy request with query parameters, those parameters should be forwarded unchanged to the legacy backend.
**Validates: Requirements 14.1, 14.2, 14.5**

### Property 6: CORS Header Inclusion
*For any* proxy response to the frontend, the response should include Access-Control-Allow-Origin header to prevent CORS errors.
**Validates: Requirements 11.1, 11.2**

### Property 7: Request Body Forwarding
*For any* POST or PUT request with a JSON body, the proxy should forward the body unchanged to the legacy backend.
**Validates: Requirements 4.4, 5.4**

### Property 8: Timeout Enforcement
*For any* request to the legacy backend, if the request exceeds 30 seconds, the proxy should abort and return a 503 error.
**Validates: Requirements 17.1, 17.2**

## Error Handling

### Error Categories

1. **Configuration Errors (400)**
   - Missing proxy configuration
   - Invalid resource name
   - Missing required path parameters

2. **Backend Errors (502, 503)**
   - Legacy backend unreachable
   - Timeout
   - Non-JSON response

3. **Backend HTTP Errors (forwarded)**
   - 404 Not Found → normalized
   - 405 Method Not Allowed → normalized
   - 401/403 Auth errors → normalized
   - 500 Internal Server Error → normalized

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "status": 404,
    "message": "Human-readable error message"
  }
}
```

## Testing Strategy

### Unit Tests
- Test AuthBuilder with each auth mode (bearer, apiKey, basic, none)
- Test PathResolver with various path templates and parameters
- Test ErrorNormalizer with different backend error responses
- Test ProxyConfigManager storage and retrieval
- Test REST heuristic logic for operation inference

### Property-Based Tests
- Use **Hypothesis** (Python PBT library) with **100+ iterations** per property
- Generate random auth configs and verify correct headers (Property 1)
- Generate random paths with {id} and verify substitution (Property 2)
- Generate random backend errors and verify normalization (Property 4)
- Test timeout behavior with slow mock servers (Property 8)

### Integration Tests
- Test full proxy flow: frontend → proxy → mock legacy backend → response
- Test each CRUD operation (list, detail, create, update, delete)
- Test with different auth modes
- Test error scenarios (404, 500, timeout)
- Verify CORS headers are present

### Test Tagging
- Each property-based test MUST include a comment with format:
  ```python
  # Feature: smart-proxy-layer, Property 1: Auth Header Attachment
  @given(auth_config=auth_config_strategy())
  def test_auth_header_attachment(auth_config):
      ...
  ```

## Implementation Notes

### Technology Stack
- **Framework**: FastAPI (already in use)
- **HTTP Client**: httpx (already in use, reuse for proxy)
- **Config Storage**: JSON file (`.proxy_config.json`) - zero dependencies, persists across restarts
- **Testing**: pytest + pytest-asyncio + Hypothesis

### Environment Configuration
```bash
# .env (reuse existing)
PROXY_TIMEOUT_SECONDS=30  # Timeout for legacy backend requests
PROXY_LOG_LEVEL=INFO      # Logging level for proxy operations
```

### Performance Considerations
- Reuse existing HTTPClient with timeout
- No caching for hackathon (future enhancement)
- JSON file storage (minimal I/O, only on config changes)
- Cache loaded config in memory to avoid repeated file reads
- Async/await for all HTTP requests

### Security Considerations
- **Credential Storage**: Store auth tokens in memory only, never persist to disk
- **SSRF Prevention**: Validate baseUrl to block private IPs (optional for hackathon)
- **Error Sanitization**: Don't leak sensitive backend details in error messages
- **CORS**: Only allow frontend origin

### Logging Strategy
- Log all proxy requests with resource, operation, method
- Log forwarded requests with target URL (sanitize auth headers)
- Log backend response status and timing
- Log errors with normalized error code

### Integration with Existing Code

**Reuse:**
- `core/http_client.py` - Use for forwarding requests to legacy backend
- `core/config.py` - Add proxy timeout settings
- `main.py` - Include new proxy routers

**Modify:**
- `services/json_analyzer.py` line 82 - Change to propose full CRUD:
  ```python
  operations = ["list", "detail", "create", "update", "delete"]
  ```

**New Files:**
- `api/proxy.py` - Proxy CRUD endpoints
- `api/proxy_config.py` - Config management endpoints
- `services/proxy_forwarder.py` - Request forwarding logic
- `services/proxy_config_manager.py` - Config storage
- `models/proxy_models.py` - Pydantic models
- `utils/auth_builder.py` - Auth header builder
- `utils/path_resolver.py` - Path parameter resolver
- `utils/error_normalizer.py` - Error normalizer

## Deployment Considerations

### Hackathon Version
- Single global proxy config (one backend per deployment)
- JSON file storage (persists across restarts, simple)
- No authentication on proxy endpoints (trust frontend)
- CORS allows all origins for demo

### Production Enhancements (Future)
- Per-user proxy configs with session management
- Migrate to Redis or PostgreSQL for multi-process deployments
- Authentication on proxy config endpoints
- SSRF protection (block private IPs)
- Request caching
- Rate limiting
- Request/response logging to database
