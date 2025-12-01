# Smart Proxy Layer - Requirements Document

## Introduction

The Smart Proxy Layer is the runtime bridge between the generated frontend UI and legacy backend APIs. After the API Analyzer infers resource schemas, the Smart Proxy uses those schemas plus minimal user configuration to forward CRUD operations from the frontend to the legacy backend. It solves CORS issues, handles authentication complexity, and normalizes responses.

The proxy operates on inferred REST conventions: from a single GET endpoint analysis, it proposes full CRUD operations (list, detail, create, update, delete) and attempts to call them using standard REST patterns. When operations don't exist on the legacy backend, the proxy returns normalized error messages.

## Glossary

- **Smart Proxy**: The FastAPI service that forwards frontend CRUD requests to legacy backend APIs
- **Proxy Configuration**: User-provided settings including baseUrl, auth credentials, and resource operation mappings
- **Operation Mapping**: The translation from frontend operations (list, detail, create, update, delete) to backend HTTP calls
- **Auth Mode**: Authentication strategy (none, bearer, apiKey, basic)
- **Resource Config**: Per-resource settings defining how operations map to backend endpoints
- **CORS Bypass**: The proxy acts as same-origin intermediary, eliminating browser CORS restrictions
- **Error Normalization**: Converting backend errors (404, 500, HTML responses) into clean JSON error messages
- **REST Heuristics**: Assumptions about standard REST patterns (GET /resource, POST /resource, PUT /resource/{id}, etc.)

## Requirements

### Requirement 1: Proxy Configuration Storage

**User Story:** As a user, I want to configure my legacy backend connection once, so that the proxy knows how to forward all subsequent requests.

#### Acceptance Criteria

1. WHEN a user provides backend configuration with baseUrl and auth settings, THEN the system SHALL store this configuration for the session
2. WHEN the configuration includes auth mode "bearer", THEN the system SHALL store the bearer token securely
3. WHEN the configuration includes auth mode "apiKey", THEN the system SHALL store the API key header name and value
4. WHEN the configuration includes auth mode "basic", THEN the system SHALL store the username and password
5. WHEN the configuration includes resource operation mappings, THEN the system SHALL store the method and path for each operation

### Requirement 2: List Operation Proxying (GET /proxy/{resource})

**User Story:** As a frontend user, I want to fetch a list of resources, so that I can view all records in a table.

#### Acceptance Criteria

1. WHEN the frontend sends GET /proxy/{resource}, THEN the proxy SHALL look up the resource configuration
2. WHEN the resource has a "list" operation defined, THEN the proxy SHALL use that operation's method and path
3. WHEN no "list" operation is defined, THEN the proxy SHALL use REST heuristic: GET {baseUrl}/{resource}
4. WHEN the legacy backend returns a successful response, THEN the proxy SHALL forward the response body to the frontend
5. WHEN the legacy backend returns an error, THEN the proxy SHALL normalize it to JSON format with status code and message

### Requirement 3: Detail Operation Proxying (GET /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to fetch a single resource by ID, so that I can view its details.

#### Acceptance Criteria

1. WHEN the frontend sends GET /proxy/{resource}/{id}, THEN the proxy SHALL look up the resource configuration
2. WHEN the resource has a "detail" operation defined, THEN the proxy SHALL use that operation's method and path, replacing {id} placeholder
3. WHEN no "detail" operation is defined, THEN the proxy SHALL use REST heuristic: GET {baseUrl}/{resource}/{id}
4. WHEN the path template contains {id}, THEN the proxy SHALL replace it with the actual ID from the request
5. WHEN the legacy backend returns a successful response, THEN the proxy SHALL forward the response body to the frontend

### Requirement 4: Create Operation Proxying (POST /proxy/{resource})

**User Story:** As a frontend user, I want to create a new resource, so that I can add records to the system.

#### Acceptance Criteria

1. WHEN the frontend sends POST /proxy/{resource} with JSON body, THEN the proxy SHALL look up the resource configuration
2. WHEN the resource has a "create" operation defined, THEN the proxy SHALL use that operation's method and path
3. WHEN no "create" operation is defined, THEN the proxy SHALL use REST heuristic: POST {baseUrl}/{resource}
4. WHEN the request includes a JSON body, THEN the proxy SHALL forward it to the legacy backend unchanged
5. WHEN the legacy backend returns a successful response (200, 201), THEN the proxy SHALL forward the response to the frontend

### Requirement 5: Update Operation Proxying (PUT /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to update an existing resource, so that I can modify records.

#### Acceptance Criteria

1. WHEN the frontend sends PUT /proxy/{resource}/{id} with JSON body, THEN the proxy SHALL look up the resource configuration
2. WHEN the resource has an "update" operation defined, THEN the proxy SHALL use that operation's method and path, replacing {id} placeholder
3. WHEN no "update" operation is defined, THEN the proxy SHALL use REST heuristic: PUT {baseUrl}/{resource}/{id}
4. WHEN the request includes a JSON body, THEN the proxy SHALL forward it to the legacy backend unchanged
5. WHEN the legacy backend returns a successful response, THEN the proxy SHALL forward the response to the frontend

### Requirement 6: Delete Operation Proxying (DELETE /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to delete a resource, so that I can remove records from the system.

#### Acceptance Criteria

1. WHEN the frontend sends DELETE /proxy/{resource}/{id}, THEN the proxy SHALL look up the resource configuration
2. WHEN the resource has a "delete" operation defined, THEN the proxy SHALL use that operation's method and path, replacing {id} placeholder
3. WHEN no "delete" operation is defined, THEN the proxy SHALL use REST heuristic: DELETE {baseUrl}/{resource}/{id}
4. WHEN the legacy backend returns a successful response (200, 204), THEN the proxy SHALL return success to the frontend
5. WHEN the legacy backend returns an error, THEN the proxy SHALL normalize it to JSON format

### Requirement 7: Bearer Token Authentication

**User Story:** As a user with a bearer token, I want the proxy to attach it to all requests, so that I don't have to manage authentication in the frontend.

#### Acceptance Criteria

1. WHEN auth mode is "bearer" and a token is configured, THEN the proxy SHALL include "Authorization: Bearer {token}" header on all backend requests
2. WHEN the legacy backend returns 401 Unauthorized, THEN the proxy SHALL return a normalized error indicating authentication failure
3. WHEN the legacy backend returns 403 Forbidden, THEN the proxy SHALL return a normalized error indicating insufficient permissions
4. WHEN no auth mode is configured, THEN the proxy SHALL make requests without authentication headers
5. WHEN the bearer token is empty or null, THEN the proxy SHALL treat it as auth mode "none"

### Requirement 8: API Key Authentication

**User Story:** As a user with an API key, I want the proxy to attach it to all requests, so that the legacy API accepts my calls.

#### Acceptance Criteria

1. WHEN auth mode is "apiKey" with header name and value configured, THEN the proxy SHALL include that header on all backend requests
2. WHEN the API key header name is "X-API-Key", THEN the proxy SHALL use "X-API-Key: {value}"
3. WHEN the API key header name is custom (e.g., "X-Custom-Auth"), THEN the proxy SHALL use that custom header name
4. WHEN the legacy backend returns 401 or 403, THEN the proxy SHALL return a normalized authentication error
5. WHEN the API key value is empty, THEN the proxy SHALL treat it as auth mode "none"

### Requirement 9: Basic Authentication

**User Story:** As a user with username and password credentials, I want the proxy to handle basic auth, so that I can access protected legacy APIs.

#### Acceptance Criteria

1. WHEN auth mode is "basic" with username and password configured, THEN the proxy SHALL encode credentials as base64
2. WHEN credentials are encoded, THEN the proxy SHALL include "Authorization: Basic {base64(username:password)}" header on all backend requests
3. WHEN the legacy backend returns 401, THEN the proxy SHALL return a normalized error indicating invalid credentials
4. WHEN username or password is empty, THEN the proxy SHALL treat it as auth mode "none"
5. WHEN the legacy backend accepts basic auth, THEN the proxy SHALL forward successful responses to the frontend

### Requirement 10: Error Normalization

**User Story:** As a frontend developer, I want all errors in a consistent JSON format, so that I can display meaningful messages to users.

#### Acceptance Criteria

1. WHEN the legacy backend returns a 404 Not Found, THEN the proxy SHALL return JSON: {"error": {"code": "NOT_FOUND", "status": 404, "message": "Resource not found"}}
2. WHEN the legacy backend returns a 500 Internal Server Error, THEN the proxy SHALL return JSON: {"error": {"code": "BACKEND_ERROR", "status": 500, "message": "Legacy backend error"}}
3. WHEN the legacy backend returns HTML instead of JSON, THEN the proxy SHALL return JSON: {"error": {"code": "INVALID_RESPONSE", "status": 502, "message": "Backend returned non-JSON response"}}
4. WHEN the legacy backend is unreachable or times out, THEN the proxy SHALL return JSON: {"error": {"code": "BACKEND_UNAVAILABLE", "status": 503, "message": "Unable to reach legacy backend"}}
5. WHEN the configured operation path returns 405 Method Not Allowed, THEN the proxy SHALL return JSON: {"error": {"code": "OPERATION_NOT_SUPPORTED", "status": 405, "message": "The configured operation is not supported by the backend"}}

### Requirement 11: CORS Handling

**User Story:** As a frontend developer, I want to avoid CORS issues, so that my browser can make requests without preflight failures.

#### Acceptance Criteria

1. WHEN the frontend makes a request to the proxy, THEN the proxy SHALL include "Access-Control-Allow-Origin" header with the frontend origin
2. WHEN the frontend makes a preflight OPTIONS request, THEN the proxy SHALL respond with appropriate CORS headers
3. WHEN the proxy forwards requests to the legacy backend, THEN it SHALL make server-to-server calls that bypass browser CORS restrictions
4. WHEN the legacy backend does not support CORS, THEN the proxy SHALL still work because it acts as an intermediary
5. WHEN the proxy returns responses to the frontend, THEN it SHALL include "Access-Control-Allow-Credentials: true" if needed

### Requirement 12: REST Heuristics for Operation Inference

**User Story:** As a system, I want to propose standard REST operations even when not explicitly configured, so that users can quickly test if their backend follows REST conventions.

#### Acceptance Criteria

1. WHEN a resource has no explicit "list" operation configured, THEN the proxy SHALL attempt GET {baseUrl}/{resourceEndpoint}
2. WHEN a resource has no explicit "detail" operation configured, THEN the proxy SHALL attempt GET {baseUrl}/{resourceEndpoint}/{id}
3. WHEN a resource has no explicit "create" operation configured, THEN the proxy SHALL attempt POST {baseUrl}/{resourceEndpoint}
4. WHEN a resource has no explicit "update" operation configured, THEN the proxy SHALL attempt PUT {baseUrl}/{resourceEndpoint}/{id}
5. WHEN a resource has no explicit "delete" operation configured, THEN the proxy SHALL attempt DELETE {baseUrl}/{resourceEndpoint}/{id}

### Requirement 13: Path Parameter Substitution

**User Story:** As a system, I want to replace path parameters like {id} with actual values, so that parameterized endpoints work correctly.

#### Acceptance Criteria

1. WHEN an operation path contains {id}, THEN the proxy SHALL replace it with the actual ID from the request URL
2. WHEN an operation path contains {resourceId}, THEN the proxy SHALL replace it with the actual ID from the request URL
3. WHEN an operation path contains multiple parameters like {userId} and {orderId}, THEN the proxy SHALL replace all parameters with values from the request
4. WHEN a path parameter is not found in the request, THEN the proxy SHALL return a 400 error indicating missing parameter
5. WHEN path parameters are successfully replaced, THEN the proxy SHALL make the request to the fully resolved URL

### Requirement 14: Query Parameter Forwarding

**User Story:** As a frontend developer, I want to pass query parameters through the proxy, so that I can support filtering, pagination, and sorting.

#### Acceptance Criteria

1. WHEN the frontend sends GET /proxy/{resource}?status=PAID&page=2, THEN the proxy SHALL forward query parameters to the legacy backend
2. WHEN the legacy backend supports query parameters, THEN the proxy SHALL preserve all query string parameters unchanged
3. WHEN the legacy backend does not support query parameters, THEN the proxy SHALL still forward them (backend will ignore)
4. WHEN query parameters contain special characters, THEN the proxy SHALL properly URL-encode them
5. WHEN no query parameters are provided, THEN the proxy SHALL make requests without query strings

### Requirement 15: Response Unwrapping (Optional Enhancement)

**User Story:** As a frontend developer, I want consistent response formats, so that I don't have to handle different wrapping patterns.

#### Acceptance Criteria

1. WHEN the legacy backend returns {data: [...]}, THEN the proxy MAY unwrap it to return [...] directly
2. WHEN the legacy backend returns {Data: {Users: [...]}}, THEN the proxy MAY unwrap it to return [...]
3. WHEN the legacy backend returns a root-level array, THEN the proxy SHALL return it unchanged
4. WHEN unwrapping is enabled in configuration, THEN the proxy SHALL apply unwrapping logic consistently
5. WHEN unwrapping is disabled (default), THEN the proxy SHALL return responses unchanged

### Requirement 16: Configuration Endpoint

**User Story:** As a frontend, I want to send proxy configuration via API, so that users can set up their backend connection through the UI.

#### Acceptance Criteria

1. WHEN the frontend sends POST /api/proxy/config with baseUrl and auth settings, THEN the proxy SHALL store the configuration
2. WHEN the configuration is stored, THEN the proxy SHALL return a success response with configuration ID
3. WHEN the frontend sends GET /api/proxy/config, THEN the proxy SHALL return the current configuration (without sensitive values like tokens)
4. WHEN the frontend sends PUT /api/proxy/config to update settings, THEN the proxy SHALL update the stored configuration
5. WHEN the frontend sends DELETE /api/proxy/config, THEN the proxy SHALL clear the stored configuration

### Requirement 17: Timeout Handling

**User Story:** As a system operator, I want requests to legacy backends to timeout, so that slow backends don't hang the proxy indefinitely.

#### Acceptance Criteria

1. WHEN the proxy makes a request to the legacy backend, THEN it SHALL timeout after 30 seconds by default
2. WHEN a request times out, THEN the proxy SHALL return a 503 error with message "Request to legacy backend timed out"
3. WHEN the timeout value is configurable via environment variable, THEN the proxy SHALL use that value
4. WHEN a timeout occurs, THEN the proxy SHALL log the event with the target URL and duration
5. WHEN the legacy backend responds before timeout, THEN the proxy SHALL forward the response normally

### Requirement 18: Request Logging

**User Story:** As a system operator, I want to see which proxy requests are being made, so that I can debug issues and monitor usage.

#### Acceptance Criteria

1. WHEN the proxy receives a request, THEN it SHALL log the method, resource, operation, and timestamp
2. WHEN the proxy forwards a request to the legacy backend, THEN it SHALL log the target URL and method
3. WHEN the legacy backend responds, THEN it SHALL log the status code and response time
4. WHEN an error occurs, THEN it SHALL log the error type and message
5. WHEN logging is configured to DEBUG level, THEN it SHALL also log request/response bodies (sanitized)

## Out of Scope

- Full login flow handling (POST /login, token extraction, session management)
- Token refresh logic
- Cookie-based authentication
- OAuth flows
- Request/response transformation beyond unwrapping
- Caching of backend responses
- Rate limiting
- Request queuing or retry logic
- Multi-tenant configuration (one config per deployment for hackathon)
- Persistent storage of configuration (in-memory for hackathon)
- WebSocket proxying
- GraphQL proxying
