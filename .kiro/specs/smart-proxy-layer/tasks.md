# Smart Proxy Layer - Implementation Tasks

## Task 1: Update Analyzer to Propose Full CRUD Operations

- [ ] 1.1 Modify json_analyzer.py to propose all operations
  - Change line 82 from `operations = ["list"] if is_array else ["detail"]`
  - To: `operations = ["list", "detail", "create", "update", "delete"]`
  - This enables REST heuristics for all resources
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

## Task 2: Create Data Models for Proxy Configuration

- [ ] 2.1 Create proxy_models.py with Pydantic models
  - Implement `AuthConfig` model with mode, bearerToken, apiKeyHeader, apiKeyValue, basicUser, basicPass
  - Implement `OperationConfig` model with method and path
  - Implement `ResourceConfig` model with name and operations dict
  - Implement `ProxyConfig` model with baseUrl, auth, and resources list
  - Implement `ProxyConfigRequest` model for API requests
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

## Task 3: Implement Proxy Config Manager with JSON File Storage

- [ ] 3.1 Create proxy_config_manager.py
  - Implement `ProxyConfigManager` class with JSON file storage
  - Add `set_config()` method to write config to `.proxy_config.json`
  - Add `get_config()` method to read config from file (with in-memory caching)
  - Add `clear_config()` method to delete config file
  - Add `get_resource_config()` method to retrieve specific resource config
  - Handle file not found gracefully (return None)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3.2 Write unit tests for ProxyConfigManager
  - Test config storage and retrieval
  - Test file persistence across manager instances
  - Test clear_config deletes file
  - Test get_resource_config returns correct resource
  - Test handling of missing config file
  - _Requirements: 1.1-1.5_

## Task 4: Implement Auth Header Builder

- [ ] 4.1 Create auth_builder.py utility
  - Implement `build_auth_headers()` function
  - Handle "bearer" mode: return `{"Authorization": "Bearer {token}"}`
  - Handle "apiKey" mode: return `{apiKeyHeader: apiKeyValue}`
  - Handle "basic" mode: encode credentials as base64, return `{"Authorization": "Basic {encoded}"}`
  - Handle "none" mode: return empty dict
  - _Requirements: 7.1, 8.1, 8.2, 9.1, 9.2_

- [ ] 4.2 Write property test for auth header builder
  - **Property 1: Auth Header Attachment**
  - **Validates: Requirements 7.1, 8.1, 9.1**
  - Generate random auth configs for each mode
  - Verify correct headers are built
  - Test edge cases (empty tokens, missing values)

## Task 5: Implement Path Parameter Resolver

- [ ] 5.1 Create path_resolver.py utility
  - Implement `resolve_path()` function
  - Use regex to find {param} patterns in path template
  - Replace {id} with actual ID value from params dict
  - Replace {resourceId}, {userId}, etc. with corresponding values
  - Raise ValueError if required parameter is missing
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 5.2 Write property test for path resolver
  - **Property 2: Path Parameter Substitution**
  - **Validates: Requirements 13.1, 13.2, 13.5**
  - Generate random path templates with {id} placeholders
  - Generate random ID values
  - Verify {id} is correctly replaced
  - Test multiple parameters in one path

## Task 6: Implement Error Normalizer

- [ ] 6.1 Create error_normalizer.py utility
  - Implement `normalize_error()` function
  - Map 404 → `{"error": {"code": "NOT_FOUND", "status": 404, "message": "..."}}`
  - Map 405 → `{"error": {"code": "OPERATION_NOT_SUPPORTED", "status": 405, "message": "..."}}`
  - Map 500 → `{"error": {"code": "BACKEND_ERROR", "status": 500, "message": "..."}}`
  - Map timeout → `{"error": {"code": "BACKEND_UNAVAILABLE", "status": 503, "message": "..."}}`
  - Detect HTML responses → `{"error": {"code": "INVALID_RESPONSE", "status": 502, "message": "..."}}`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 6.2 Write property test for error normalizer
  - **Property 4: Error Normalization Consistency**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
  - Generate random backend error responses
  - Verify all errors are normalized to consistent JSON format
  - Verify error has code, status, and message fields

## Task 7: Implement Proxy Forwarder Service

- [ ] 7.1 Create proxy_forwarder.py service
  - Implement `forward_request()` async function
  - Get ProxyConfig from ProxyConfigManager
  - Look up resource config for given resource name
  - Get operation config (method, path) for given operation
  - If operation not configured, use REST heuristic (GET /resource for list, etc.)
  - Build full URL: baseUrl + resolved path
  - Build headers using AuthBuilder
  - Add query parameters to URL if provided
  - Make HTTP request using existing HTTPClient (with 30s timeout)
  - If success: return (status_code, response_body)
  - If error: use ErrorNormalizer to convert to clean JSON
  - _Requirements: 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.5, 6.1-6.5, 12.1-12.5_

- [ ] 7.2 Write property test for REST heuristics
  - **Property 3: REST Heuristic Fallback**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**
  - Generate random resources without explicit operation config
  - Verify proxy uses correct REST heuristic for each operation
  - Test list → GET /resource, detail → GET /resource/{id}, etc.

## Task 8: Implement Proxy Config API Endpoints

- [ ] 8.1 Create proxy_config.py API router
  - Implement `POST /api/proxy/config` endpoint
  - Accept ProxyConfigRequest body
  - Validate config (baseUrl is valid URL, auth mode is valid)
  - Store config using ProxyConfigManager
  - Return success response with config ID
  - _Requirements: 16.1, 16.2_

- [ ] 8.2 Implement GET /api/proxy/config endpoint
  - Retrieve config from ProxyConfigManager
  - Sanitize sensitive values (replace tokens with "***")
  - Return sanitized config
  - _Requirements: 16.3_

- [ ] 8.3 Implement DELETE /api/proxy/config endpoint
  - Clear config using ProxyConfigManager
  - Return success response
  - _Requirements: 16.5_

- [ ] 8.4 Write unit tests for config endpoints
  - Test POST stores config correctly
  - Test GET returns sanitized config
  - Test DELETE clears config
  - Test validation errors for invalid config
  - _Requirements: 16.1-16.5_

## Task 9: Implement Proxy CRUD Endpoints

- [ ] 9.1 Create proxy.py API router
  - Implement `GET /proxy/{resource}` endpoint for list operation
  - Parse resource name from URL
  - Extract query parameters from request
  - Call ProxyForwarder.forward_request() with operation="list"
  - Return response or normalized error
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 9.2 Implement GET /proxy/{resource}/{id} endpoint for detail operation
  - Parse resource name and ID from URL
  - Call ProxyForwarder.forward_request() with operation="detail" and id
  - Return response or normalized error
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9.3 Implement POST /proxy/{resource} endpoint for create operation
  - Parse resource name from URL
  - Extract JSON body from request
  - Call ProxyForwarder.forward_request() with operation="create" and body
  - Return response or normalized error
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9.4 Implement PUT /proxy/{resource}/{id} endpoint for update operation
  - Parse resource name and ID from URL
  - Extract JSON body from request
  - Call ProxyForwarder.forward_request() with operation="update", id, and body
  - Return response or normalized error
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9.5 Implement DELETE /proxy/{resource}/{id} endpoint for delete operation
  - Parse resource name and ID from URL
  - Call ProxyForwarder.forward_request() with operation="delete" and id
  - Return response or normalized error
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9.6 Write property test for query parameter forwarding
  - **Property 5: Query Parameter Preservation**
  - **Validates: Requirements 14.1, 14.2, 14.5**
  - Generate random query parameters
  - Verify they are forwarded to legacy backend unchanged
  - Test special characters are properly encoded

- [ ] 9.7 Write property test for request body forwarding
  - **Property 7: Request Body Forwarding**
  - **Validates: Requirements 4.4, 5.4**
  - Generate random JSON bodies for POST/PUT
  - Verify body is forwarded unchanged to legacy backend

## Task 10: Add CORS Headers to Proxy Responses

- [ ] 10.1 Update proxy.py endpoints to include CORS headers
  - Add "Access-Control-Allow-Origin" header to all responses
  - Add "Access-Control-Allow-Credentials: true" if needed
  - Handle OPTIONS preflight requests
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 10.2 Write property test for CORS headers
  - **Property 6: CORS Header Inclusion**
  - **Validates: Requirements 11.1, 11.2**
  - Generate random proxy requests
  - Verify all responses include CORS headers

## Task 11: Add Timeout Handling

- [ ] 11.1 Configure HTTPClient timeout for proxy requests
  - Reuse existing HTTPClient with 30-second timeout
  - Catch timeout exceptions in ProxyForwarder
  - Use ErrorNormalizer to return 503 error on timeout
  - Log timeout events with target URL
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 11.2 Write property test for timeout enforcement
  - **Property 8: Timeout Enforcement**
  - **Validates: Requirements 17.1, 17.2**
  - Mock slow backend endpoints
  - Verify proxy returns 503 after 30 seconds
  - Verify timeout is logged

## Task 12: Add Request Logging

- [ ] 12.1 Add logging to proxy endpoints
  - Log incoming proxy requests with method, resource, operation
  - Log forwarded requests with target URL (sanitize auth headers)
  - Log backend response status and timing
  - Log errors with normalized error code
  - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 12.2 Add debug-level logging for request/response bodies
  - When log level is DEBUG, log request bodies (sanitized)
  - When log level is DEBUG, log response bodies (truncated if large)
  - _Requirements: 18.5_

## Task 13: Include Proxy Routers in Main App

- [ ] 13.1 Update main.py to include proxy routers
  - Import proxy router from api/proxy.py
  - Import proxy_config router from api/proxy_config.py
  - Include routers with appropriate prefixes
  - Verify CORS middleware applies to proxy endpoints
  - _Requirements: All_

## Task 14: Integration Testing

- [ ] 14.1 Write integration tests for full proxy flow
  - Create mock legacy backend with FastAPI TestClient
  - Test list operation: frontend → proxy → mock backend → response
  - Test detail operation with ID parameter
  - Test create operation with JSON body
  - Test update operation with ID and body
  - Test delete operation with ID
  - _Requirements: All_

- [ ] 14.2 Write integration tests for auth modes
  - Test bearer token auth
  - Test API key auth
  - Test basic auth
  - Test no auth
  - Verify correct headers are sent to mock backend
  - _Requirements: 7.1-7.5, 8.1-8.5, 9.1-9.5_

- [ ] 14.3 Write integration tests for error scenarios
  - Test 404 from backend → normalized error
  - Test 500 from backend → normalized error
  - Test timeout → 503 error
  - Test HTML response → 502 error
  - Test missing config → 400 error
  - _Requirements: 10.1-10.5_

## Task 15: End-to-End Testing with Frontend

- [ ] 15.1 Test proxy with actual frontend
  - Start backend with proxy enabled
  - Configure proxy with test backend URL
  - Use frontend to perform CRUD operations
  - Verify list, detail, create, update, delete all work
  - Verify errors are displayed correctly in UI
  - _Requirements: All_

## Checkpoint: Ensure All Tests Pass

- [ ] 16. Final validation
  - Run all unit tests
  - Run all property-based tests (100+ iterations each)
  - Run integration tests
  - Verify proxy works with frontend
  - Verify config persists across server restarts
  - Ensure all tests pass, ask the user if questions arise.
