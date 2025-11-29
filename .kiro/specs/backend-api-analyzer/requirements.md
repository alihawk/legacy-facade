# Backend API Analyzer - Requirements Document

## Introduction

The Backend API Analyzer is the core intelligence layer of Legacy UX Reviver. It provides a single endpoint (`POST /api/analyze`) that accepts various input modes (OpenAPI specs, live endpoint URLs, or JSON samples) and returns normalized resource schemas. The frontend uses these schemas to dynamically generate CRUD interfaces without any backend code changes to the legacy API.

The API Analyzer treats OpenAPI specifications as a primary but not guaranteed source of truth; future versions may combine spec data with live endpoint introspection to detect drift and provide more accurate schemas.

## Glossary

- **API Analyzer**: The FastAPI backend service that processes API specifications and extracts resource schemas
- **Resource Schema**: A normalized data structure with name, displayName, endpoint, primaryKey, fields array, and operations array
- **OpenAPI Spec**: A standard specification format (JSON/YAML) describing RESTful APIs (versions 2.0 Swagger or 3.0)
- **Endpoint Introspection**: Making live HTTP requests to a legacy API endpoint to infer structure from actual responses
- **JSON Sample**: A representative API response used to infer resource structure without accessing the live API
- **Analysis Mode**: One of four modes: "openapi", "openapi_url", "endpoint", or "json_sample"
- **Field Type Inference**: The algorithm that determines data types (string, number, boolean, date, email, text) from values
- **Primary Key Detection**: Heuristic identification of ID fields using patterns like "id", "_id", or "{resource}_id"
- **Legacy API**: The existing backend system being wrapped with a modern UI facade

## Requirements

### Requirement 1: OpenAPI Specification Parsing (mode="openapi")

**User Story:** As a developer, I want to paste or upload an OpenAPI specification, so that the system can automatically extract all available resources and their schemas.

#### Acceptance Criteria

1. WHEN a user sends `{"mode": "openapi", "specJson": {...}}` with valid OpenAPI 3.0 or Swagger 2.0 JSON, THEN the API Analyzer SHALL parse the specification and extract all resource endpoints
2. WHEN a user sends `{"mode": "openapi", "specJson": "yaml string"}` with valid YAML, THEN the API Analyzer SHALL parse the YAML and extract resource endpoints
3. WHEN the OpenAPI spec contains nested object schemas in response definitions, THEN the API Analyzer SHALL flatten them into field definitions with appropriate types
4. WHEN the OpenAPI spec defines multiple HTTP methods for an endpoint (GET, POST, PUT, DELETE), THEN the API Analyzer SHALL map them to operations array (GET→list/detail, POST→create, PUT/PATCH→update, DELETE→delete)
5. WHEN the OpenAPI spec contains path parameters like `/users/{id}`, THEN the API Analyzer SHALL identify the primary key from the parameter name

### Requirement 2: OpenAPI URL Fetching (mode="openapi_url")

**User Story:** As a developer, I want to provide a URL to an OpenAPI spec, so that the system can fetch and analyze it without manual copy-paste.

#### Acceptance Criteria

1. WHEN a user sends `{"mode": "openapi_url", "specUrl": "https://..."}`, THEN the API Analyzer SHALL fetch the content from the URL
2. WHEN the fetched content is JSON, THEN the API Analyzer SHALL parse it as OpenAPI JSON
3. WHEN the fetched content is YAML, THEN the API Analyzer SHALL parse it as OpenAPI YAML
4. WHEN the URL is unreachable or returns an error, THEN the API Analyzer SHALL return a 503 error with message "Unable to fetch OpenAPI spec from URL"
5. WHEN the fetched content is valid OpenAPI, THEN the API Analyzer SHALL extract resources using the same logic as mode="openapi"

### Requirement 3: Live Endpoint Introspection (mode="endpoint")

**User Story:** As a developer, I want to provide a live API endpoint URL with credentials, so that the system can discover the resource structure by making actual requests.

#### Acceptance Criteria

1. WHEN a user sends `{"mode": "endpoint", "baseUrl": "...", "endpointPath": "...", "method": "GET", "authType": "bearer", "authValue": "..."}`, THEN the API Analyzer SHALL make an HTTP request to the legacy API
2. WHEN the endpoint returns a successful JSON response, THEN the API Analyzer SHALL infer field names and types from the response structure
3. WHEN the response contains a root-level array of objects, THEN the API Analyzer SHALL identify it as a list endpoint and extract the common schema from array items
4. WHEN the response contains nested data like `{Data: {Users: [...]}}`, THEN the API Analyzer SHALL unwrap the structure and extract the array
5. WHEN the endpoint request fails with 401 or 403, THEN the API Analyzer SHALL return an error message indicating authentication failure

### Requirement 4: JSON Sample Schema Inference (mode="json_sample")

**User Story:** As a developer, I want to paste a sample JSON response, so that the system can generate a resource schema even without access to the live API.

#### Acceptance Criteria

1. WHEN a user sends `{"mode": "json_sample", "sampleJson": {...}, "endpointPath": "/api/v1/users"}`, THEN the API Analyzer SHALL parse the JSON and extract field definitions
2. WHEN the JSON contains nested objects like `{Data: {Users: [...]}}`, THEN the API Analyzer SHALL unwrap and extract the actual data array
3. WHEN the JSON contains an array of objects, THEN the API Analyzer SHALL identify it as a list endpoint and extract the common schema from array items
4. WHEN the JSON contains various data types, THEN the API Analyzer SHALL infer appropriate field types (string, number, boolean, date, email, text)
5. WHEN the JSON sample includes a primary key field (id, _id, user_id, etc.), THEN the API Analyzer SHALL automatically identify it as the primary key

### Requirement 5: Field Type Inference

**User Story:** As the system, I want to accurately determine field data types from values or schemas, so that the frontend can render appropriate input controls and validation.

#### Acceptance Criteria

1. WHEN a field value is a JavaScript number or OpenAPI type "integer"/"number", THEN the API Analyzer SHALL classify it as type "number"
2. WHEN a field value is a JavaScript boolean or OpenAPI type "boolean", THEN the API Analyzer SHALL classify it as type "boolean"
3. WHEN a field value is a string matching email pattern (contains @ and domain), THEN the API Analyzer SHALL classify it as type "email"
4. WHEN a field value is a string matching ISO date pattern (YYYY-MM-DD or ISO 8601), THEN the API Analyzer SHALL classify it as type "date"
5. WHEN a field value is a string longer than 100 characters, THEN the API Analyzer SHALL classify it as type "text" for textarea rendering
6. WHEN a field value is any other string, THEN the API Analyzer SHALL classify it as type "string"

### Requirement 6: Resource Schema Normalization

**User Story:** As a frontend developer, I want all resource schemas in a consistent format, so that the UI components can render any API without special cases.

#### Acceptance Criteria

1. WHEN the API Analyzer extracts resources from any mode, THEN it SHALL return `{"resources": [ResourceSchema, ...]}` format
2. WHEN generating a ResourceSchema, THEN it SHALL include exactly these fields: name, displayName, endpoint, primaryKey, fields (array), operations (array)
3. WHEN determining the display name, THEN the API Analyzer SHALL convert snake_case or camelCase to Title Case (e.g., "user_profiles" → "User Profiles", "getUserData" → "Get User Data")
4. WHEN identifying the primary key, THEN the API Analyzer SHALL check for patterns (id, _id, {resource}_id, {resource}Id) and default to "id" if not found
5. WHEN listing operations, THEN the API Analyzer SHALL include operations based on available HTTP methods: GET→["list", "detail"], POST→["create"], PUT/PATCH→["update"], DELETE→["delete"]

### Requirement 7: Response Format Consistency

**User Story:** As a frontend developer, I want the analyze endpoint to always return the same response structure, so that I can reliably parse the results.

#### Acceptance Criteria

1. WHEN the API Analyzer successfully extracts resources, THEN it SHALL return HTTP 200 with `{"resources": [...]}`
2. WHEN each ResourceSchema is generated, THEN the fields array SHALL contain objects with exactly: name (string), type (string), displayName (string)
3. WHEN the operations array is populated, THEN it SHALL only contain valid operation strings: "list", "detail", "create", "update", "delete"
4. WHEN the endpoint field is set, THEN it SHALL be the full path from the OpenAPI spec or the provided endpointPath
5. WHEN mode="json_sample" is used without a baseUrl, THEN the endpoint field SHALL be set to the provided endpointPath

### Requirement 8: Error Handling and Validation

**User Story:** As a user, I want clear error messages when something goes wrong, so that I can fix issues with my API configuration.

#### Acceptance Criteria

1. WHEN the OpenAPI spec is invalid JSON or YAML, THEN the API Analyzer SHALL return HTTP 400 with `{"detail": "Invalid OpenAPI specification: <error details>"}`
2. WHEN mode="openapi_url" and the URL is unreachable, THEN the API Analyzer SHALL return HTTP 503 with `{"detail": "Unable to fetch OpenAPI spec from URL"}`
3. WHEN mode="endpoint" and the endpoint is unreachable, THEN the API Analyzer SHALL return HTTP 503 with `{"detail": "Unable to reach endpoint: <url>"}`
4. WHEN mode="json_sample" and the JSON is invalid, THEN the API Analyzer SHALL return HTTP 400 with `{"detail": "Invalid JSON sample"}`
5. WHEN no resources can be extracted from valid input, THEN the API Analyzer SHALL return HTTP 422 with `{"detail": "No resources found in specification"}`

### Requirement 9: Authentication Support

**User Story:** As a developer, I want to provide authentication credentials for mode="endpoint", so that the system can access protected APIs.

#### Acceptance Criteria

1. WHEN authType="none", THEN the API Analyzer SHALL make requests without authentication headers
2. WHEN authType="bearer" and authValue is provided, THEN the API Analyzer SHALL include `Authorization: Bearer <authValue>` header
3. WHEN authType="api-key" and authValue is provided, THEN the API Analyzer SHALL include `X-API-Key: <authValue>` header
4. WHEN authType="basic" and authValue is provided as "user:pass", THEN the API Analyzer SHALL include `Authorization: Basic <base64(user:pass)>` header
5. WHEN customHeaders JSON is provided, THEN the API Analyzer SHALL parse and include those headers in the request

### Requirement 10: Primary Key Detection Heuristics

**User Story:** As the system, I want to automatically detect primary key fields, so that the frontend knows which field uniquely identifies records.

#### Acceptance Criteria

1. WHEN a field is named exactly "id", THEN the API Analyzer SHALL identify it as the primary key
2. WHEN a field is named "_id", THEN the API Analyzer SHALL identify it as the primary key
3. WHEN a field matches the pattern "{resource}_id" (e.g., "user_id" for "users"), THEN the API Analyzer SHALL identify it as the primary key
4. WHEN a field matches the pattern "{resource}Id" (e.g., "userId" for "users"), THEN the API Analyzer SHALL identify it as the primary key
5. WHEN no matching field is found AND a field named "id" exists in the schema, THEN the API Analyzer SHALL default to "id" as the primary key
6. WHEN no matching field is found AND no field named "id" exists, THEN the API Analyzer SHALL set primaryKey to "id" but the frontend should handle this gracefully

### Requirement 11: Request Timeouts

**User Story:** As a system operator, I want HTTP requests to external services to timeout, so that the analyzer doesn't hang indefinitely on slow or unresponsive endpoints.

#### Acceptance Criteria

1. WHEN making an HTTP request for mode="openapi_url", THEN the API Analyzer SHALL timeout after 30 seconds
2. WHEN making an HTTP request for mode="endpoint", THEN the API Analyzer SHALL timeout after 30 seconds
3. WHEN a request times out, THEN the API Analyzer SHALL return HTTP 503 with `{"detail": "Request timed out after 30 seconds"}`
4. WHEN a timeout occurs, THEN the API Analyzer SHALL log the timeout event for debugging
5. WHEN the timeout value is configurable via environment variable, THEN the API Analyzer SHALL use that value instead of the default

### Requirement 12: Payload Size Limits

**User Story:** As a system operator, I want to limit the size of incoming requests, so that the analyzer doesn't consume excessive memory or processing time.

#### Acceptance Criteria

1. WHEN the request body for mode="openapi" exceeds 10MB, THEN the API Analyzer SHALL return HTTP 413 with `{"detail": "Request payload too large (max 10MB)"}`
2. WHEN the request body for mode="json_sample" exceeds 10MB, THEN the API Analyzer SHALL return HTTP 413 with `{"detail": "Request payload too large (max 10MB)"}`
3. WHEN fetching content for mode="openapi_url" that exceeds 10MB, THEN the API Analyzer SHALL abort the download and return HTTP 413
4. WHEN the payload size limit is configurable via environment variable, THEN the API Analyzer SHALL use that value instead of the default
5. WHEN a payload size limit is exceeded, THEN the API Analyzer SHALL log the event with the actual payload size

### Requirement 13: Spec Drift Detection and Correction (P1 - Nice to Have)

**User Story:** As a developer working with stale documentation, I want the system to detect when OpenAPI specs don't match reality, so that I get accurate schemas even when the docs are outdated.

#### Acceptance Criteria

1. WHEN an OpenAPI spec is provided AND endpoint credentials are also provided, THEN the API Analyzer MAY optionally make a live request to validate the spec
2. WHEN the live endpoint response contains fields not in the OpenAPI spec, THEN the API Analyzer SHALL augment the schema with the additional fields inferred from the response
3. WHEN the live endpoint response has different field types than the OpenAPI spec, THEN the API Analyzer SHALL use the actual response types and log a warning about the drift
4. WHEN the live endpoint response is missing fields defined in the OpenAPI spec, THEN the API Analyzer SHALL include the spec fields but mark them as potentially missing
5. WHEN spec drift is detected, THEN the API Analyzer SHALL include a `"warnings"` array in the response with messages like `"Field 'email' type mismatch: spec says 'string', actual response is 'email'"`

## Out of Scope

- GraphQL API support
- SOAP/XML API support
- Real-time WebSocket proxying
- API rate limiting or caching
- Persistent storage of analyzed schemas
- API versioning support
- Proxy layer for forwarding CRUD requests (separate feature)
- Custom transformation rules beyond basic unwrapping
