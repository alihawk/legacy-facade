# Backend API Analyzer - Implementation Tasks

## Task 1: Project Setup and Configuration

- [ ] 1.1 Initialize FastAPI project structure
  - Create `backend/app/` directory structure
  - Set up `main.py` with FastAPI app and CORS configuration
  - Create `__init__.py` files for all packages
  - _Requirements: All_

- [ ] 1.2 Create Pydantic models
  - Implement `ResourceField` model in `models/resource_schema.py`
  - Implement `ResourceSchema` model in `models/resource_schema.py`
  - Implement `AnalyzeRequest` model in `models/request_models.py`
  - _Requirements: 6.2, 7.2_

- [ ] 1.3 Set up environment configuration
  - Create `core/config.py` with Pydantic Settings
  - Add timeout, payload limit, LLM provider config
  - Create `.env.example` with all required variables
  - _Requirements: 11.5, 12.4_

- [ ] 1.4 Create requirements.txt
  - Add FastAPI, httpx, PyYAML, openai/anthropic
  - Add pytest, pytest-asyncio, Hypothesis for testing
  - Add mypy, ruff for type checking and linting
  - _Requirements: All_

## Task 2: HTTP Client and Utilities

- [ ] 2.1 Implement async HTTP client
  - Create `core/http_client.py` with httpx async client
  - Configure 30-second timeout
  - Add error handling for connection failures
  - _Requirements: 11.1, 11.2_

- [ ] 2.2 Implement response unwrapper utility
  - Create `utils/response_unwrapper.py`
  - Handle nested structures like `{Data: {Users: [...]}}`
  - Support multiple nesting patterns
  - _Requirements: 3.4, 4.2_

- [ ]* 2.3 Write property test for response unwrapping
  - **Property 8: Response Unwrapping**
  - **Validates: Requirements 3.4, 4.2**
  - Generate random nested JSON structures
  - Verify unwrapper extracts actual data array/object

- [ ] 2.4 Implement primary key detector
  - Create `utils/primary_key_detector.py`
  - Check for id, _id, {resource}_id, {resource}Id patterns
  - Default to "id" if field exists, otherwise still return "id"
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 2.5 Write property test for primary key detection
  - **Property 5: Primary Key Detection**
  - **Property 6: Primary Key Default Behavior**
  - **Validates: Requirements 10.1-10.6**
  - Generate random objects with various ID field patterns
  - Verify correct primary key identification

## Task 3: Type Inference System

- [ ] 3.1 Implement type inference utility
  - Create `utils/type_inference.py`
  - Detect number, boolean, email, date, text, string types
  - Handle null/undefined values
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 3.2 Write property test for type inference
  - **Property 3: Field Type Consistency**
  - **Validates: Requirements 5.1-5.6**
  - Generate random JSON values of each type
  - Verify inferred type matches actual type
  - Test edge cases (null, empty string, ISO dates, emails)

## Task 4: LLM-Based Display Name Generation

- [ ] 4.1 Implement LLM name converter
  - Create `utils/llm_name_converter.py`
  - Implement OpenAI/Anthropic client initialization
  - Create prompt template for name conversion
  - Implement batching logic (50 names per call)
  - _Requirements: 6.3_

- [ ] 4.2 Add in-memory caching for LLM results
  - Cache display name conversions during request
  - Implement fallback to simple Title Case if LLM fails
  - _Requirements: 6.3_

- [ ]* 4.3 Write property test for display name transformation
  - **Property 4: LLM-Based Display Name Transformation**
  - **Validates: Requirements 6.3**
  - Generate random field names with prefixes, suffixes, numbers
  - Verify LLM produces human-readable display names
  - Test fallback behavior when LLM unavailable

## Task 5: OpenAPI Analyzer (modes: openapi, openapi_url)

- [ ] 5.1 Implement OpenAPI parser
  - Create `services/openapi_analyzer.py`
  - Parse JSON and YAML OpenAPI specs
  - Extract paths, methods, schemas, parameters
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5.2 Implement OpenAPI URL fetcher
  - Add logic to fetch spec from URL with timeout
  - Handle JSON and YAML content types
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5.3 Extract resource schemas from OpenAPI
  - Map HTTP methods to operations (GET→list/detail, POST→create, etc.)
  - Extract field definitions from response schemas
  - Identify primary keys from path parameters
  - _Requirements: 1.4, 1.5_

- [ ]* 5.4 Write property test for OpenAPI parsing
  - **Property 1: OpenAPI Parsing Completeness**
  - **Property 2: YAML to JSON Equivalence**
  - **Validates: Requirements 1.1, 1.2, 2.3**
  - Generate random valid OpenAPI specs
  - Verify at least one ResourceSchema is produced
  - Verify YAML and JSON produce identical results

- [ ]* 5.5 Write property test for operations mapping
  - **Property 9: Operations Mapping**
  - **Validates: Requirements 1.4, 6.5**
  - Generate OpenAPI specs with various HTTP methods
  - Verify correct operations array mapping

## Task 6: Endpoint Analyzer (mode: endpoint)

- [ ] 6.1 Implement endpoint introspection
  - Create `services/endpoint_analyzer.py`
  - Make HTTP request to live endpoint with auth
  - Handle bearer, api-key, basic auth types
  - Parse custom headers JSON
  - _Requirements: 3.1, 3.2, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 6.2 Infer schema from live response
  - Detect root-level arrays vs nested structures
  - Unwrap nested data
  - Infer field types from actual values
  - _Requirements: 3.3, 3.4, 3.5_

- [ ]* 6.3 Write unit tests for authentication
  - Test bearer token header construction
  - Test API key header construction
  - Test basic auth encoding
  - Test custom headers parsing
  - _Requirements: 9.1-9.5_

## Task 7: JSON Sample Analyzer (mode: json_sample)

- [ ] 7.1 Implement JSON sample inference
  - Create `services/json_analyzer.py`
  - Parse JSON sample and extract fields
  - Detect arrays vs single objects
  - Handle nested structures
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 7.2 Write property test for JSON array detection
  - **Property 10: JSON Sample Array Detection**
  - **Validates: Requirements 4.3**
  - Generate random JSON samples with arrays
  - Verify analyzer identifies list endpoint
  - Verify common schema extraction from array items

## Task 8: Schema Normalizer

- [ ] 8.1 Implement schema normalization orchestrator
  - Create `services/schema_normalizer.py`
  - Coordinate type inference, primary key detection, name conversion
  - Assemble final ResourceSchema objects
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 8.2 Ensure consistent response format
  - Always return `{"resources": [...]}`
  - Validate all required fields present
  - Ensure operations array only contains valid values
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 8.3 Write property test for schema normalization
  - **Property 3: Schema Normalization Idempotence**
  - **Validates: Requirements 6.1, 6.2**
  - Generate random resource data
  - Normalize multiple times
  - Verify identical ResourceSchema objects produced

## Task 9: Main Analyze Endpoint

- [ ] 9.1 Implement POST /api/analyze endpoint
  - Create `api/analyze.py` with endpoint handler
  - Validate payload size (max 10MB)
  - Parse AnalyzeRequest model
  - Route to appropriate analyzer based on mode
  - _Requirements: All_

- [ ] 9.2 Implement error handling
  - Return 400 for invalid JSON/YAML
  - Return 413 for payload too large
  - Return 422 for no resources found
  - Return 503 for unreachable URLs or timeouts
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 9.3 Write property test for error responses
  - **Property 7: Error Response Validity**
  - **Validates: Requirements 8.1-8.5**
  - Generate invalid inputs (malformed JSON, bad URLs)
  - Verify appropriate HTTP error codes returned
  - Verify error messages are descriptive

- [ ]* 9.4 Write property test for timeout enforcement
  - **Property 11: Timeout Enforcement**
  - **Validates: Requirements 11.1, 11.2, 11.3**
  - Mock slow HTTP endpoints
  - Verify 503 error after 30 seconds
  - Verify timeout is logged

- [ ]* 9.5 Write property test for payload size limits
  - **Property 12: Payload Size Enforcement**
  - **Validates: Requirements 12.1, 12.2, 12.3**
  - Generate payloads exceeding 10MB
  - Verify 413 error returned
  - Verify payload size is logged

## Task 10: Integration and End-to-End Testing

- [ ]* 10.1 Write integration tests for each mode
  - Test mode="openapi" with sample OpenAPI spec
  - Test mode="openapi_url" with mock HTTP server
  - Test mode="endpoint" with mock legacy API
  - Test mode="json_sample" with sample JSON
  - _Requirements: All_

- [ ]* 10.2 Write end-to-end tests with real OpenAPI specs
  - Test with public API specs (Stripe, GitHub, etc.)
  - Verify complete flow from request to response
  - Verify CORS headers are set
  - _Requirements: All_

## Task 11: Documentation and Deployment Prep

- [ ] 11.1 Add API documentation
  - Configure FastAPI automatic OpenAPI docs
  - Add docstrings to all public functions
  - Add usage examples in README
  - _Requirements: All_

- [ ] 11.2 Add logging
  - Log all analyze requests with mode
  - Log timeout events
  - Log payload size violations
  - Log LLM API calls and failures
  - _Requirements: 11.4, 12.5_

- [ ] 11.3 Create deployment configuration
  - Add Dockerfile for containerization
  - Add docker-compose.yml for local development
  - Document environment variables
  - _Requirements: All_

## Checkpoint: Ensure All Tests Pass

- [ ] 12. Final validation
  - Run all unit tests
  - Run all property-based tests (100+ iterations each)
  - Run integration tests
  - Verify mypy type checking passes
  - Verify ruff linting passes
  - Ensure all tests pass, ask the user if questions arise.
