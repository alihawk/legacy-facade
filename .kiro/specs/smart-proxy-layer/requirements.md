# Smart Proxy Layer - Requirements Document

## Introduction

The Smart Proxy Layer is the runtime bridge between the generated frontend UI and legacy backend APIs (both REST and SOAP). After the API Analyzer infers resource schemas, the Smart Proxy uses those schemas plus minimal user configuration to forward CRUD operations from the frontend to the legacy backend.

The proxy handles:
- **REST APIs**: Direct HTTP requests with JSON payloads
- **SOAP APIs**: XML envelope construction, SOAPAction headers, WSSE authentication, response parsing

## Glossary

- **Smart Proxy**: The FastAPI service that forwards frontend CRUD requests to legacy backend APIs
- **Proxy Configuration**: User-provided settings including baseUrl, apiType, auth credentials, and resource mappings
- **API Type**: Either "rest" or "soap" - determines how requests are constructed and responses parsed
- **Operation Mapping**: Translation from frontend operations (list, detail, create, update, delete) to backend calls
- **Auth Mode**: Authentication strategy - "none", "bearer", "apiKey", "basic", or "wsse" (SOAP only)
- **WSSE**: WS-Security - SOAP authentication standard using UsernameToken in XML header
- **SOAPAction**: HTTP header required by SOAP services to identify the operation
- **SOAP Envelope**: XML wrapper containing Header and Body elements per SOAP specification
- **SOAP Fault**: SOAP error response format containing faultcode and faultstring
- **Field Mapping**: Translation between legacy field names (e.g., "USR_NM") and normalized names (e.g., "user_name")
- **Response Path**: JSON/XML path to extract data from nested responses (e.g., "Data.Users")
- **REST Heuristics**: Assumptions about standard REST patterns for unconfigured operations

## Requirements

### Requirement 1: Proxy Configuration Storage

**User Story:** As a user, I want to configure my legacy backend connection once, so that the proxy knows how to forward all subsequent requests.

#### Acceptance Criteria

1. WHEN a user provides backend configuration with baseUrl, apiType, and auth settings, THEN the system SHALL store this configuration to a JSON file
2. WHEN the configuration includes apiType "rest", THEN the system SHALL store REST-specific settings
3. WHEN the configuration includes apiType "soap", THEN the system SHALL store SOAP-specific settings including namespace
4. WHEN the configuration includes auth mode "wsse", THEN the system SHALL store username and password for WS-Security
5. WHEN the configuration includes field mappings for a resource, THEN the system SHALL store the normalized-to-legacy field name translations
6. WHEN the server restarts, THEN the system SHALL reload configuration from the JSON file

---

### Requirement 2: REST List Operation (GET /proxy/{resource})

**User Story:** As a frontend user, I want to fetch a list of resources from a REST API.

#### Acceptance Criteria

1. WHEN the frontend sends GET /proxy/{resource} and apiType is "rest", THEN the proxy SHALL construct a REST request
2. WHEN the resource has a "list" operation defined, THEN the proxy SHALL use that operation's method and path
3. WHEN no "list" operation is defined, THEN the proxy SHALL use REST heuristic: GET {baseUrl}/{endpoint}
4. WHEN the response contains nested data (e.g., {Data: {Users: [...]}}), THEN the proxy SHALL unwrap it using responsePath
5. WHEN field mappings are configured, THEN the proxy SHALL translate legacy field names to normalized names
6. WHEN the legacy backend returns an error, THEN the proxy SHALL normalize it to JSON format

---

### Requirement 3: REST Detail Operation (GET /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to fetch a single resource by ID from a REST API.

#### Acceptance Criteria

1. WHEN the frontend sends GET /proxy/{resource}/{id} and apiType is "rest", THEN the proxy SHALL construct a REST request
2. WHEN the resource has a "detail" operation defined with path containing {id}, THEN the proxy SHALL replace {id} with actual value
3. WHEN no "detail" operation is defined, THEN the proxy SHALL use REST heuristic: GET {baseUrl}/{endpoint}/{id}
4. WHEN field mappings are configured, THEN the proxy SHALL translate field names in the response
5. WHEN the legacy backend returns 404, THEN the proxy SHALL return normalized NOT_FOUND error

---

### Requirement 4: REST Create Operation (POST /proxy/{resource})

**User Story:** As a frontend user, I want to create a new resource via REST API.

#### Acceptance Criteria

1. WHEN the frontend sends POST /proxy/{resource} with JSON body and apiType is "rest", THEN the proxy SHALL forward the request
2. WHEN field mappings are configured, THEN the proxy SHALL translate normalized field names to legacy names in the request body
3. WHEN no "create" operation is defined, THEN the proxy SHALL use REST heuristic: POST {baseUrl}/{endpoint}
4. WHEN the legacy backend returns 201 Created, THEN the proxy SHALL forward the response with field names translated
5. WHEN the legacy backend returns an error, THEN the proxy SHALL normalize it

---

### Requirement 5: REST Update Operation (PUT /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to update an existing resource via REST API.

#### Acceptance Criteria

1. WHEN the frontend sends PUT /proxy/{resource}/{id} with JSON body and apiType is "rest", THEN the proxy SHALL forward the request
2. WHEN field mappings are configured, THEN the proxy SHALL translate field names in both request and response
3. WHEN no "update" operation is defined, THEN the proxy SHALL use REST heuristic: PUT {baseUrl}/{endpoint}/{id}
4. WHEN the path contains {id}, THEN the proxy SHALL replace it with the actual ID value
5. WHEN the legacy backend returns success, THEN the proxy SHALL forward the translated response

---

### Requirement 6: REST Delete Operation (DELETE /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to delete a resource via REST API.

#### Acceptance Criteria

1. WHEN the frontend sends DELETE /proxy/{resource}/{id} and apiType is "rest", THEN the proxy SHALL forward the request
2. WHEN no "delete" operation is defined, THEN the proxy SHALL use REST heuristic: DELETE {baseUrl}/{endpoint}/{id}
3. WHEN the legacy backend returns 200 or 204, THEN the proxy SHALL return success
4. WHEN the legacy backend returns 404, THEN the proxy SHALL return normalized NOT_FOUND error
5. WHEN the path contains {id}, THEN the proxy SHALL replace it with the actual ID value

---

### Requirement 7: Authentication Modes

**User Story:** As a user, I want the proxy to handle authentication automatically for both REST and SOAP APIs.

#### Acceptance Criteria

1. WHEN auth mode is "bearer", THEN the proxy SHALL include "Authorization: Bearer {token}" header
2. WHEN auth mode is "apiKey", THEN the proxy SHALL include the configured header name and value
3. WHEN auth mode is "basic", THEN the proxy SHALL include "Authorization: Basic {base64}" header
4. WHEN auth mode is "wsse" and apiType is "soap", THEN the proxy SHALL include WS-Security header in SOAP envelope
5. WHEN auth mode is "none", THEN the proxy SHALL make requests without authentication
6. WHEN WSSE is used, THEN the UsernameToken SHALL include Username, Password, Nonce, and Created elements
7. WHEN the backend returns 401/403, THEN the proxy SHALL return normalized authentication error

---

### Requirement 8: SOAP List Operation (GET /proxy/{resource})

**User Story:** As a frontend user, I want to fetch a list of resources from a SOAP API.

#### Acceptance Criteria

1. WHEN the frontend sends GET /proxy/{resource} and apiType is "soap", THEN the proxy SHALL construct a SOAP request
2. WHEN the resource has a "list" operation with soapAction configured, THEN the proxy SHALL use that SOAPAction header
3. WHEN the resource has a "list" operation with operationName configured, THEN the proxy SHALL use that operation name in the SOAP body
4. WHEN the proxy makes the request, THEN it SHALL POST to baseUrl with Content-Type "text/xml; charset=utf-8"
5. WHEN the SOAP response is received, THEN the proxy SHALL parse the XML and extract data records
6. WHEN field mappings are configured, THEN the proxy SHALL translate legacy XML element names to normalized names
7. WHEN the SOAP response contains a Fault, THEN the proxy SHALL return normalized SOAP_FAULT error

---

### Requirement 9: SOAP Detail Operation (GET /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to fetch a single resource by ID from a SOAP API.

#### Acceptance Criteria

1. WHEN the frontend sends GET /proxy/{resource}/{id} and apiType is "soap", THEN the proxy SHALL construct a SOAP request with ID parameter
2. WHEN the resource has a "detail" operation configured, THEN the proxy SHALL use that operation's settings
3. WHEN building the SOAP request, THEN the proxy SHALL include the ID as a parameter element in the operation
4. WHEN the SOAP response is received, THEN the proxy SHALL parse and extract the single record
5. WHEN the record is not found, THEN the proxy SHALL return normalized NOT_FOUND error

---

### Requirement 10: SOAP Create Operation (POST /proxy/{resource})

**User Story:** As a frontend user, I want to create a new resource via SOAP API.

#### Acceptance Criteria

1. WHEN the frontend sends POST /proxy/{resource} with JSON body and apiType is "soap", THEN the proxy SHALL construct a SOAP request
2. WHEN field mappings are configured, THEN the proxy SHALL translate JSON field names to legacy XML element names
3. WHEN building the SOAP request, THEN the proxy SHALL convert the JSON body to XML elements inside the operation
4. WHEN the resource has a "create" operation configured, THEN the proxy SHALL use that operation's name and soapAction
5. WHEN the SOAP response indicates success, THEN the proxy SHALL parse and return the created record with normalized field names

---

### Requirement 11: SOAP Update Operation (PUT /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to update an existing resource via SOAP API.

#### Acceptance Criteria

1. WHEN the frontend sends PUT /proxy/{resource}/{id} with JSON body and apiType is "soap", THEN the proxy SHALL construct a SOAP request
2. WHEN building the request, THEN the proxy SHALL include both the ID and the translated field values as XML elements
3. WHEN the resource has an "update" operation configured, THEN the proxy SHALL use that operation's settings
4. WHEN field mappings are configured, THEN the proxy SHALL translate field names in both directions
5. WHEN the SOAP response indicates success, THEN the proxy SHALL return the updated record normalized

---

### Requirement 12: SOAP Delete Operation (DELETE /proxy/{resource}/{id})

**User Story:** As a frontend user, I want to delete a resource via SOAP API.

#### Acceptance Criteria

1. WHEN the frontend sends DELETE /proxy/{resource}/{id} and apiType is "soap", THEN the proxy SHALL construct a SOAP request
2. WHEN building the request, THEN the proxy SHALL include the ID as a parameter element
3. WHEN the resource has a "delete" operation configured, THEN the proxy SHALL use that operation's settings
4. WHEN the SOAP response indicates success, THEN the proxy SHALL return success to frontend
5. WHEN the SOAP response contains a Fault indicating not found, THEN the proxy SHALL return normalized NOT_FOUND error

---

### Requirement 13: Error Normalization

**User Story:** As a frontend developer, I want all errors in a consistent JSON format regardless of API type.

#### Acceptance Criteria

1. WHEN a REST backend returns 404, THEN the proxy SHALL return: {"error": {"code": "NOT_FOUND", "status": 404, "message": "..."}}
2. WHEN a REST backend returns 500, THEN the proxy SHALL return: {"error": {"code": "BACKEND_ERROR", "status": 500, "message": "..."}}
3. WHEN a REST backend returns HTML, THEN the proxy SHALL return: {"error": {"code": "INVALID_RESPONSE", "status": 502, "message": "..."}}
4. WHEN a SOAP response contains Fault, THEN the proxy SHALL return: {"error": {"code": "SOAP_FAULT", "status": 500, "message": "{faultstring}", "soapFaultCode": "{faultcode}"}}
5. WHEN the backend is unreachable or times out, THEN the proxy SHALL return: {"error": {"code": "BACKEND_UNAVAILABLE", "status": 503, "message": "..."}}
6. WHEN a SOAP response is not valid XML, THEN the proxy SHALL return: {"error": {"code": "INVALID_RESPONSE", "status": 502, "message": "..."}}

---

### Requirement 14: CORS Handling

**User Story:** As a frontend developer, I want to avoid CORS issues when calling the proxy.

#### Acceptance Criteria

1. WHEN the frontend makes a request to the proxy, THEN the proxy SHALL include CORS headers in response
2. WHEN the frontend makes a preflight OPTIONS request, THEN the proxy SHALL respond appropriately
3. WHEN the proxy forwards to legacy backend, THEN it SHALL bypass browser CORS restrictions via server-to-server call
4. WHEN the proxy returns any response, THEN it SHALL include "Access-Control-Allow-Origin" header

---

### Requirement 15: REST Heuristics for Unconfigured Operations

**User Story:** As a system, I want to propose standard REST operations when not explicitly configured.

#### Acceptance Criteria

1. WHEN a REST resource has no explicit "list" operation, THEN attempt GET {baseUrl}/{endpoint}
2. WHEN a REST resource has no explicit "detail" operation, THEN attempt GET {baseUrl}/{endpoint}/{id}
3. WHEN a REST resource has no explicit "create" operation, THEN attempt POST {baseUrl}/{endpoint}
4. WHEN a REST resource has no explicit "update" operation, THEN attempt PUT {baseUrl}/{endpoint}/{id}
5. WHEN a REST resource has no explicit "delete" operation, THEN attempt DELETE {baseUrl}/{endpoint}/{id}

---

### Requirement 16: Field Mapping

**User Story:** As a system, I want to translate between legacy and normalized field names automatically.

#### Acceptance Criteria

1. WHEN field mappings are configured and a response is received, THEN translate legacy names to normalized names
2. WHEN field mappings are configured and a request body is sent, THEN translate normalized names to legacy names
3. WHEN a field has no mapping, THEN pass it through unchanged
4. WHEN mapping REST responses, THEN apply mapping after JSON parsing
5. WHEN mapping SOAP responses, THEN apply mapping after XML-to-dict conversion
6. WHEN mapping SOAP requests, THEN apply mapping before dict-to-XML conversion

---

### Requirement 17: Response Unwrapping

**User Story:** As a system, I want to extract data from nested response structures.

#### Acceptance Criteria

1. WHEN responsePath is configured (e.g., "Data.Users"), THEN extract data at that path from REST JSON response
2. WHEN responsePath is not configured, THEN return response as-is (after field mapping)
3. WHEN SOAP response has nested structure, THEN extract records from response body
4. WHEN the path doesn't exist in response, THEN return empty array for list or null for detail

---

### Requirement 18: Query Parameter Forwarding (REST)

**User Story:** As a frontend developer, I want to pass query parameters through the proxy for REST APIs.

#### Acceptance Criteria

1. WHEN GET /proxy/{resource}?status=active&page=2 is called, THEN forward query params to REST backend
2. WHEN query parameters contain special characters, THEN URL-encode them properly
3. WHEN no query parameters provided, THEN make request without query string

---

### Requirement 19: SOAP Request Construction

**User Story:** As a system, I want to build valid SOAP request envelopes.

#### Acceptance Criteria

1. WHEN building a SOAP request, THEN create valid XML with soap:Envelope, soap:Header, and soap:Body
2. WHEN namespace is configured, THEN include it in the operation element
3. WHEN parameters are provided, THEN convert them to XML elements inside the operation
4. WHEN WSSE auth is configured, THEN include Security header in soap:Header
5. WHEN making the request, THEN set Content-Type to "text/xml; charset=utf-8"
6. WHEN making the request, THEN set SOAPAction header to the configured value

---

### Requirement 20: SOAP Response Parsing

**User Story:** As a system, I want to parse SOAP responses and extract data.

#### Acceptance Criteria

1. WHEN a SOAP response is received, THEN parse the XML and locate soap:Body
2. WHEN soap:Body contains data elements, THEN convert them to Python dicts/lists
3. WHEN response contains soap:Fault, THEN extract faultcode and faultstring
4. WHEN response element names have namespaces, THEN strip namespaces for field mapping
5. WHEN multiple records are found, THEN return as list
6. WHEN single record is found, THEN return as dict

---

### Requirement 21: Timeout Handling

**User Story:** As a system operator, I want requests to timeout to prevent hanging.

#### Acceptance Criteria

1. WHEN making a request to legacy backend, THEN timeout after 30 seconds by default
2. WHEN timeout occurs, THEN return normalized BACKEND_UNAVAILABLE error
3. WHEN timeout value is configurable, THEN use configured value
4. WHEN timeout occurs, THEN log the event

---

### Requirement 22: Request Logging

**User Story:** As a system operator, I want visibility into proxy operations.

#### Acceptance Criteria

1. WHEN proxy receives request, THEN log method, resource, operation, apiType
2. WHEN proxy forwards request, THEN log target URL (sanitize auth)
3. WHEN response received, THEN log status and duration
4. WHEN error occurs, THEN log error code and message
5. WHEN DEBUG level, THEN log request/response bodies (sanitized)

---

### Requirement 23: Configuration Endpoints

**User Story:** As a frontend, I want to manage proxy configuration via API.

#### Acceptance Criteria

1. WHEN POST /api/proxy/config is called, THEN store configuration to JSON file
2. WHEN GET /api/proxy/config is called, THEN return sanitized configuration (hide tokens)
3. WHEN DELETE /api/proxy/config is called, THEN delete configuration file
4. WHEN invalid configuration is provided, THEN return 400 with validation errors

---

## Out of Scope

- OAuth flows and token refresh
- Cookie-based authentication
- WebSocket proxying
- GraphQL proxying
- Request caching
- Rate limiting
- Multi-tenant configuration
- WSDL fetching at runtime (config must be provided)