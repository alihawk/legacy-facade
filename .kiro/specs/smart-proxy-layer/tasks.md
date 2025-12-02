# Smart Proxy Layer - Implementation Tasks

## Phase 1: Foundation

### Task 1: Create Data Models for Proxy Configuration

- [ ] 1.1 Create `backend/app/models/proxy_models.py` with Pydantic models:
  - `AuthConfig` with mode: Literal["none", "bearer", "apiKey", "basic", "wsse"]
  - `RestOperationConfig` with method, path
  - `SoapOperationConfig` with operationName, soapAction, responseElement
  - `OperationConfig` with optional rest and soap configs
  - `FieldMapping` with normalizedName, legacyName
  - `ResourceConfig` with name, endpoint, operations, fieldMappings, responsePath
  - `ProxyConfig` with baseUrl, apiType, auth, resources, soapNamespace
  - `ProxyConfigRequest` for API endpoint
  - _Requirements: 1.1-1.6_

### Task 2: Implement Proxy Config Manager with JSON File Storage

- [ ] 2.1 Create `backend/app/services/proxy_config_manager.py`:
  - `ProxyConfigManager` class with storage_path and _cache
  - `set_config()` - write to JSON file, update cache
  - `get_config()` - read from file (use cache if loaded)
  - `clear_config()` - delete file, clear cache
  - `get_resource_config()` - lookup by resource name
  - Handle FileNotFoundError gracefully
  - _Requirements: 1.1-1.6_

- [ ] 2.2 Write unit tests for ProxyConfigManager
  - Test storage and retrieval roundtrip
  - Test cache invalidation on set_config
  - Test persistence across manager instances
  - Test clear_config removes file
  - Test get_resource_config returns correct resource

---

## Phase 2: REST Support

### Task 3: Implement Auth Header Builder

- [ ] 3.1 Create `backend/app/utils/auth_builder.py`:
  - `build_rest_auth_headers(auth_config)` - returns dict of headers
  - Handle bearer: `{"Authorization": "Bearer {token}"}`
  - Handle apiKey: `{headerName: headerValue}`
  - Handle basic: `{"Authorization": "Basic {base64}"}`
  - Handle none: return empty dict
  - _Requirements: 7.1-7.5_

- [ ] 3.2 Write tests for REST auth builder
  - Test each auth mode produces correct headers
  - Test empty/missing values treated as "none"

### Task 4: Implement Path Resolver

- [ ] 4.1 Create `backend/app/utils/path_resolver.py`:
  - `resolve_path(path_template, params)` - replace {id}, {resourceId}, etc.
  - Use regex to find all {param} patterns
  - Raise ValueError if required param missing
  - _Requirements: 3.2, 5.4, 6.5_

- [ ] 4.2 Write tests for path resolver
  - Test single parameter replacement
  - Test multiple parameters
  - Test missing parameter raises error

### Task 5: Implement Error Normalizer

- [ ] 5.1 Create `backend/app/utils/error_normalizer.py`:
  - `normalize_error(status_code, response_body, context)` - returns dict
  - Map 404 → NOT_FOUND
  - Map 405 → OPERATION_NOT_SUPPORTED
  - Map 500 → BACKEND_ERROR
  - Map timeout → BACKEND_UNAVAILABLE
  - Detect HTML → INVALID_RESPONSE
  - `normalize_soap_fault(fault)` - converts SoapFaultError to dict
  - _Requirements: 13.1-13.6_

- [ ] 5.2 Write tests for error normalizer
  - Test each HTTP status code mapping
  - Test HTML detection
  - Test SOAP fault conversion

### Task 6: Implement Field Mapper

- [ ] 6.1 Create `backend/app/services/field_mapper.py`:
  - `map_fields(data, field_mappings, reverse)` - transform field names
  - Handle single dict or list of dicts
  - reverse=True: legacy → normalized (for responses)
  - reverse=False: normalized → legacy (for requests)
  - Pass through unmapped fields unchanged
  - _Requirements: 16.1-16.6_

- [ ] 6.2 Write tests for field mapper
  - Test single record mapping
  - Test list of records mapping
  - Test reverse mapping
  - Test unmapped fields preserved

### Task 7: Implement REST Proxy Forwarder

- [ ] 7.1 Create `backend/app/services/proxy_forwarder.py`:
  - `forward_request(resource, operation, id, body, query_params)` - main entry
  - Get config from ProxyConfigManager
  - If apiType == "rest", call `_forward_rest_request()`
  - If apiType == "soap", call `_forward_soap_request()` (stub for now)
  - _Requirements: 2.1-6.5_

- [ ] 7.2 Implement `_forward_rest_request()`:
  - Look up resource config and operation config
  - If operation not configured, use REST heuristics
  - Build URL: baseUrl + resolved path + query params
  - Build headers using auth_builder
  - Make HTTP request using httpx
  - Unwrap response using response_unwrapper if responsePath configured
  - Map fields using field_mapper
  - Handle errors using error_normalizer
  - _Requirements: 2.1-6.5, 15.1-15.5, 17.1-17.3, 18.1-18.3_

- [ ] 7.3 Write tests for REST proxy forwarder
  - Test list operation with configured endpoint
  - Test detail operation with path parameter
  - Test create operation with body
  - Test REST heuristics fallback
  - Test field mapping applied
  - Test response unwrapping

---

## Phase 3: SOAP Support

### Task 8: Implement SOAP Request Builder

- [ ] 8.1 Create `backend/app/services/soap_request_builder.py`:
  - `build_soap_request(operation_name, namespace, parameters, auth_config)` - returns XML string
  - Build soap:Envelope with correct namespaces
  - Build soap:Header (include WSSE if auth_config.mode == "wsse")
  - Build soap:Body with operation element and parameters
  - `build_wsse_header(username, password)` - WS-Security UsernameToken
  - `dict_to_xml_elements(data, namespace)` - recursive dict to XML conversion
  - _Requirements: 19.1-19.6_

- [ ] 8.2 Write tests for SOAP request builder
  - Test basic envelope structure
  - Test operation with parameters
  - Test WSSE header generation
  - Test nested dict to XML conversion
  - Validate generated XML is well-formed

### Task 9: Implement SOAP Response Parser

- [ ] 9.1 Create `backend/app/services/soap_response_parser.py`:
  - `parse_soap_response(xml_content, operation_name)` - returns list[dict] or dict
  - `extract_soap_body(root)` - find soap:Body element
  - `check_soap_fault(body)` - raise SoapFaultError if Fault found
  - `extract_records(body, operation_name)` - find data records
  - `element_to_dict(element)` - recursive XML to dict conversion
  - `SoapFaultError` exception class with fault_code, fault_string
  - _Requirements: 20.1-20.6_

- [ ] 9.2 Write tests for SOAP response parser
  - Test parsing valid response with multiple records
  - Test parsing response with single record
  - Test SOAP Fault detection and extraction
  - Test namespace stripping
  - Test nested XML to dict conversion

### Task 10: Implement WSSE Auth Builder

- [ ] 10.1 Add WSSE support to `auth_builder.py`:
  - `build_soap_headers(soap_action, auth_config)` - HTTP headers for SOAP
  - Returns Content-Type and SOAPAction headers
  - Basic auth added to HTTP headers if configured
  - `build_wsse_security_element(username, password)` - XML string for envelope
  - Generate Nonce (random base64)
  - Generate Created timestamp (ISO format)
  - _Requirements: 7.4, 7.6, 7.7_

- [ ] 10.2 Write tests for WSSE auth
  - Test WSSE element contains required sub-elements
  - Test Nonce is base64 encoded
  - Test Created is valid ISO timestamp
  - Test SOAP headers include SOAPAction

### Task 11: Implement SOAP Proxy Forwarder

- [ ] 11.1 Add `_forward_soap_request()` to proxy_forwarder.py:
  - Look up resource config and SOAP operation config
  - Get operationName and soapAction from config
  - Build SOAP request using soap_request_builder
  - Build headers using auth_builder (SOAP mode)
  - POST to baseUrl with XML body
  - Parse response using soap_response_parser
  - Map fields using field_mapper
  - Handle SOAP faults using error_normalizer
  - _Requirements: 8.1-12.5_

- [ ] 11.2 Handle SOAP operation parameters:
  - For detail/update/delete: include ID as parameter
  - For create/update: convert JSON body to XML parameters
  - Apply field mapping (normalized → legacy) before conversion
  - _Requirements: 9.3, 10.3, 11.2_

- [ ] 11.3 Write tests for SOAP proxy forwarder
  - Test list operation constructs correct SOAP request
  - Test detail operation includes ID parameter
  - Test create operation converts JSON to XML
  - Test field mapping applied to request and response
  - Test SOAP fault handled correctly

---

## Phase 4: API Endpoints

### Task 12: Implement Proxy Config API Endpoints

- [ ] 12.1 Create `backend/app/api/proxy_config.py`:
  - `POST /api/proxy/config` - validate and store config
  - `GET /api/proxy/config` - return sanitized config (hide tokens)
  - `DELETE /api/proxy/config` - clear config
  - _Requirements: 23.1-23.4_

- [ ] 12.2 Write tests for config endpoints
  - Test POST stores config correctly
  - Test GET returns sanitized config
  - Test DELETE clears config
  - Test validation errors for invalid config

### Task 13: Implement Proxy CRUD Endpoints

- [ ] 13.1 Create `backend/app/api/proxy.py`:
  - `GET /proxy/{resource}` - list operation
  - `GET /proxy/{resource}/{id}` - detail operation
  - `POST /proxy/{resource}` - create operation
  - `PUT /proxy/{resource}/{id}` - update operation
  - `DELETE /proxy/{resource}/{id}` - delete operation
  - All endpoints call proxy_forwarder.forward_request()
  - Return JSONResponse with CORS headers
  - _Requirements: 2.1-6.5, 8.1-12.5, 14.1-14.4_

- [ ] 13.2 Add CORS handling:
  - Include Access-Control-Allow-Origin in all responses
  - Handle OPTIONS preflight requests
  - _Requirements: 14.1-14.4_

- [ ] 13.3 Write tests for proxy endpoints
  - Test REST list operation
  - Test REST detail operation
  - Test SOAP list operation
  - Test SOAP create operation
  - Test error responses have correct format

### Task 14: Register Routers in Main App

- [ ] 14.1 Update `backend/app/main.py`:
  - Import proxy router from api/proxy.py
  - Import proxy_config router from api/proxy_config.py
  - Include routers with correct prefixes
  - Verify CORS middleware applies to proxy endpoints
  - _Requirements: All_

---

## Phase 5: Logging and Polish

### Task 15: Add Request Logging

- [ ] 15.1 Add logging throughout proxy flow:
  - Log incoming request: method, resource, operation, apiType
  - Log outgoing request: target URL (sanitize auth headers)
  - Log response: status code, duration
  - Log errors: error code, message
  - At DEBUG level: log bodies (truncated, sanitized)
  - _Requirements: 22.1-22.5_

### Task 16: Update Analyzer for Full CRUD Operations

- [ ] 16.1 Modify `backend/app/services/json_analyzer.py`:
  - Change operations from `["list"]` to `["list", "detail", "create", "update", "delete"]`
  - This enables REST heuristics for all resources
  - _Requirements: 15.1-15.5_

- [ ] 16.2 Verify SOAP analyzers also propose full CRUD:
  - Check wsdl_analyzer.py proposes multiple operations
  - Check soap_xml_analyzer.py proposes multiple operations
  - _Requirements: 15.1-15.5 (for SOAP)_

---

## Phase 6: Integration Testing

### Task 17: Integration Tests - REST

- [ ] 17.1 Create mock REST backend for testing:
  - FastAPI test app with sample endpoints
  - Support list, detail, create, update, delete
  - Support different auth modes
  - Support nested responses

- [ ] 17.2 Write integration tests:
  - Test full flow: configure → list → detail → create → update → delete
  - Test with bearer auth
  - Test with API key auth
  - Test with basic auth
  - Test response unwrapping
  - Test field mapping

### Task 18: Integration Tests - SOAP

- [ ] 18.1 Create mock SOAP backend for testing:
  - FastAPI endpoint that accepts XML POST
  - Parse SOAP request and return SOAP response
  - Support different operations
  - Support WSSE validation
  - Return SOAP Faults for error cases

- [ ] 18.2 Write integration tests:
  - Test full SOAP flow: configure → list → detail → create
  - Test WSSE authentication
  - Test basic auth with SOAP
  - Test SOAP fault handling
  - Test field mapping for SOAP

### Task 19: End-to-End Testing

- [ ] 19.1 Test with actual frontend:
  - Start backend with proxy enabled
  - Configure proxy for REST test API
  - Perform CRUD operations via UI
  - Verify data displays correctly

- [ ] 19.2 Test SOAP with frontend:
  - Configure proxy for SOAP test API
  - Perform CRUD operations via UI
  - Verify XML correctly constructed
  - Verify responses parsed correctly

---

## Phase 7: Frontend Integration

### Task 20: Update Frontend to Use Proxy

- [ ] 20.1 Update PortalPage to configure proxy on mount:
  - Read schema from localStorage
  - Build ProxyConfig from schema and baseUrl
  - POST to /api/proxy/config
  - _Requirements: 23.1_

- [ ] 20.2 Update ResourceList to call proxy:
  - Change from localStorage mock data to `GET /proxy/{resource}`
  - Handle loading states
  - Handle error responses
  - _Requirements: 2.1-2.6, 8.1-8.7_

- [ ] 20.3 Update ResourceDetail to call proxy:
  - Fetch via `GET /proxy/{resource}/{id}`
  - Handle not found errors
  - _Requirements: 3.1-3.5, 9.1-9.5_

- [ ] 20.4 Update ResourceForm to call proxy:
  - Create: `POST /proxy/{resource}`
  - Update: `PUT /proxy/{resource}/{id}`
  - Handle success and error responses
  - _Requirements: 4.1-4.5, 5.1-5.5, 10.1-10.5, 11.1-11.5_

- [ ] 20.5 Add delete functionality:
  - Call `DELETE /proxy/{resource}/{id}`
  - Confirm before delete
  - Handle errors
  - _Requirements: 6.1-6.5, 12.1-12.5_

---

## Checkpoint: Final Validation

- [ ] 21. Run all tests:
  - Unit tests pass
  - Integration tests pass
  - SOAP tests pass
  - Frontend works with REST API via proxy
  - Frontend works with SOAP API via proxy
  - Error handling works correctly
  - Logging provides visibility
  - Config persists across restarts