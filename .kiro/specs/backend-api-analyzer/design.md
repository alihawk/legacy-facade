# Backend API Analyzer - Design Document

## Overview

The Backend API Analyzer is a FastAPI-based service that provides a single endpoint (`POST /api/analyze`) to transform various API specification formats into normalized resource schemas. It supports four analysis modes (openapi, openapi_url, endpoint, json_sample) and returns a consistent ResourceSchema format that the frontend uses to dynamically generate CRUD interfaces.

The system treats OpenAPI specifications as hints rather than absolute truth, with future versions potentially combining spec data with live endpoint introspection to detect and correct drift.

## Architecture

### System Components

```
backend/
├── app/
│   ├── main.py                    # FastAPI application entry point with CORS
│   ├── api/
│   │   ├── analyze.py             # POST /api/analyze endpoint
│   │   └── clean_names.py         # POST /api/clean-names endpoint (optional LLM enhancement)
│   ├── services/
│   │   ├── openapi_analyzer.py    # OpenAPI spec parsing (modes: openapi, openapi_url)
│   │   ├── endpoint_analyzer.py   # Live endpoint introspection (mode: endpoint)
│   │   ├── json_analyzer.py       # JSON sample inference (mode: json_sample)
│   │   └── schema_normalizer.py   # Schema normalization & orchestration
│   ├── models/
│   │   ├── request_models.py      # AnalyzeRequest Pydantic model
│   │   └── resource_schema.py     # ResourceSchema, ResourceField models
│   ├── core/
│   │   ├── config.py              # Environment config (timeouts, payload limits)
│   │   └── http_client.py         # Shared async HTTP client with timeout
│   └── utils/
│       ├── type_inference.py      # Field type detection (string/number/boolean/date/email/text)
│       ├── llm_name_converter.py  # LLM-based intelligent display name generation
│       ├── primary_key_detector.py # Primary key heuristics
│       └── response_unwrapper.py  # Unwrap nested {Data: {Users: [...]}} structures
├── tests/
│   ├── test_openapi_analyzer.py
│   ├── test_endpoint_analyzer.py
│   ├── test_json_analyzer.py
│   ├── test_type_inference.py
│   ├── test_primary_key_detector.py
│   └── test_schema_normalizer.py
├── requirements.txt
└── .env.example                   # Example environment variables
```

### Data Flow

1. **Client Request** → `POST /api/analyze` with mode and input data
2. **Payload Validation** → Check size limit (max 10MB), reject with 413 if exceeded
3. **Request Parsing** → Parse and validate AnalyzeRequest Pydantic model
4. **Mode Routing** → Route to appropriate analyzer based on mode:
   - `mode="openapi"` → OpenAPIAnalyzer (parse JSON/YAML spec)
   - `mode="openapi_url"` → OpenAPIAnalyzer (fetch from URL with 30s timeout, then parse)
   - `mode="endpoint"` → EndpointAnalyzer (make live HTTP request with 30s timeout)
   - `mode="json_sample"` → JSONAnalyzer (infer from sample)
5. **Schema Extraction** → Analyzer extracts raw resource data (fields, endpoints, operations)
6. **Response Unwrapping** → Unwrap nested structures like `{Data: {Users: [...]}}`
7. **Type Inference** → Determine field types (string/number/boolean/date/email/text)
8. **Primary Key Detection** → Apply regex-based heuristics with word boundaries; use LLM only if ambiguous
9. **Simple Name Conversion** → Convert field/resource names using simple rules (replace underscores, Title Case)
10. **Schema Normalization** → Convert to ResourceSchema format
11. **Response** → Return `{"resources": [ResourceSchema, ...]}`

### Optional Enhancement Flow (POST /api/clean-names)

1. **Client Request** → `POST /api/clean-names` with `{"resources": [...]}`
2. **Extract Field Names** → Collect all field and resource names from input
3. **Batch LLM Conversion** → Send names to LLM in batches of 50 for intelligent cleaning
4. **Update Display Names** → Replace display names in ResourceSchema objects
5. **Response** → Return updated `{"resources": [ResourceSchema, ...]}`

## Components and Interfaces

### Simple Display Name Generation (Default)

**Default Behavior:**
The `/api/analyze` endpoint uses simple, fast transformation rules:
- Replace underscores and hyphens with spaces
- Insert spaces before capital letters (camelCase → camel Case)
- Apply Title Case to all words
- No external API calls required

**Examples:**
- `user_name` → "User Name"
- `getUserData` → "Get User Data"
- `email-address` → "Email Address"
- `createdAt` → "Created At"

### LLM-Based Display Name Cleaning (Optional Enhancement)

**Why LLM for Optional Cleaning:**
Legacy APIs have unpredictable naming conventions that simple rules can't handle:
- Abbreviations: `usr_prof`, `dt_created`, `addr_ln_1`
- Prefixes/Suffixes: `fld_email`, `tbl_users`, `_v2`, `_new`
- Mixed formats: `camelCase_with_snake`, `PascalCase_ID`
- Numbers: `email_1`, `phone_2`, `user_id_3`
- Symbols: `user$name`, `email@address`, `id#123`

**LLM Prompt Strategy (for /api/clean-names):**
```
You are converting database field names to human-readable display names.

Rules:
- Remove technical prefixes (fld_, tbl_, col_)
- Remove version suffixes (_v1, _v2, _new, _old)
- Expand abbreviations (usr→User, addr→Address, dt→Date, ts→Timestamp)
- Convert to Title Case with spaces
- Keep numbers only if meaningful (user_id_2 → User ID, not User ID 2)
- Be concise (max 3-4 words)

Examples:
usr_prof_v2 → User Profile
dt_created_ts → Date Created
fld_email_addr_1 → Email Address
getUserData → Get User Data
user$name → User Name

Convert these field names:
[batch of 50 field names]
```

**Batching Strategy:**
- Collect all field names from all resources
- Send in batches of 50 to LLM
- Parse JSON response with field name mappings
- Return updated ResourceSchema array

### API Endpoint

#### POST /api/analyze

**Purpose:** Analyze API specifications and return normalized resource schemas with simple display name transformation.

**Request Body (AnalyzeRequest):**
```json
{
  "mode": "openapi" | "openapi_url" | "endpoint" | "json_sample",
  
  // For mode="openapi"
  "specJson": {...} | "yaml string",
  
  // For mode="openapi_url"
  "specUrl": "https://api.example.com/swagger.json",
  
  // For mode="endpoint"
  "baseUrl": "https://api.example.com",
  "endpointPath": "/api/v1/users",
  "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  "authType": "none" | "bearer" | "api-key" | "basic",
  "authValue": "token or credentials",
  "customHeaders": "{\"X-Custom\": \"value\"}",
  
  // For mode="json_sample"
  "sampleJson": {...},
  "baseUrl": "https://api.example.com",  // optional
  "endpointPath": "/api/v1/users",
  "method": "GET"
}
```

**Success Response (200):**
```json
{
  "resources": [
    {
      "name": "users",
      "displayName": "Users",
      "endpoint": "/api/v1/users",
      "primaryKey": "user_id",
      "fields": [
        {
          "name": "user_id",
          "type": "number",
          "displayName": "User ID"
        },
        {
          "name": "email_address",
          "type": "email",
          "displayName": "Email Address"
        },
        {
          "name": "created_at",
          "type": "date",
          "displayName": "Created At"
        },
        {
          "name": "bio",
          "type": "text",
          "displayName": "Bio"
        }
      ],
      "operations": ["list", "detail", "create", "update"]
    }
  ]
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid input
{
  "detail": "Invalid OpenAPI specification: YAML parsing error at line 5"
}

// 413 Payload Too Large
{
  "detail": "Request payload too large (max 10MB)"
}

// 422 Unprocessable Entity - Valid but no resources
{
  "detail": "No resources found in specification"
}

// 503 Service Unavailable - External service unreachable
{
  "detail": "Unable to fetch OpenAPI spec from URL"
}
// or
{
  "detail": "Request timed out after 30 seconds"
}
```

#### POST /api/clean-names (Optional Enhancement)

**Purpose:** Use LLM to intelligently clean field and resource display names in already-analyzed schemas.

**Request Body:**
```json
{
  "resources": [
    {
      "name": "users",
      "displayName": "Users",
      "endpoint": "/api/v1/users",
      "primaryKey": "user_id",
      "fields": [
        {
          "name": "usr_prof_id",
          "type": "number",
          "displayName": "Usr Prof Id"  // Simple transformation
        },
        {
          "name": "dt_created_ts",
          "type": "date",
          "displayName": "Dt Created Ts"  // Simple transformation
        }
      ],
      "operations": ["list", "detail"]
    }
  ]
}
```

**Success Response (200):**
```json
{
  "resources": [
    {
      "name": "users",
      "displayName": "Users",
      "endpoint": "/api/v1/users",
      "primaryKey": "user_id",
      "fields": [
        {
          "name": "usr_prof_id",
          "type": "number",
          "displayName": "User Profile ID"  // LLM-cleaned
        },
        {
          "name": "dt_created_ts",
          "type": "date",
          "displayName": "Date Created"  // LLM-cleaned
        }
      ],
      "operations": ["list", "detail"]
    }
  ]
}
```

**Error Response (503):**
```json
{
  "detail": "LLM service unavailable"
}
```

## Data Models

### ResourceSchema
```python
class ResourceField(BaseModel):
    name: str  # Field name (e.g., "user_id", "email_address")
    type: str  # "string" | "number" | "boolean" | "date" | "email" | "text"
    displayName: str  # Human-readable name (e.g., "User ID", "Email Address")

class ResourceSchema(BaseModel):
    name: str  # Resource name (e.g., "users")
    displayName: str  # Human-readable name (e.g., "Users")
    endpoint: str  # API endpoint path (e.g., "/api/v1/users")
    primaryKey: str  # Primary key field name (e.g., "user_id" or "id")
    fields: list[ResourceField]  # List of fields
    operations: list[str]  # ["list", "detail", "create", "update", "delete"]
```

### AnalyzeRequest
```python
class AnalyzeRequest(BaseModel):
    mode: Literal["openapi", "openapi_url", "endpoint", "json_sample"]
    specJson: Optional[Union[dict, str]] = None
    specUrl: Optional[HttpUrl] = None
    baseUrl: Optional[HttpUrl] = None
    endpointPath: Optional[str] = None
    method: Optional[str] = "GET"
    authType: Optional[Literal["none", "bearer", "api-key", "basic"]] = "none"
    authValue: Optional[str] = None
    customHeaders: Optional[str] = None
    sampleJson: Optional[dict] = None
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: OpenAPI Parsing Completeness
*For any* valid OpenAPI 3.0 or Swagger 2.0 specification with at least one path definition, parsing should produce at least one ResourceSchema.
**Validates: Requirements 1.1, 1.2**

### Property 2: YAML to JSON Equivalence
*For any* OpenAPI specification, parsing it as YAML or JSON should produce identical ResourceSchema objects.
**Validates: Requirements 1.2, 2.3**

### Property 3: Field Type Consistency
*For any* JSON value, the inferred type should match the value's actual type: number→"number", boolean→"boolean", string matching email pattern→"email", string matching ISO date→"date", string >100 chars→"text", other string→"string".
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

### Property 4: Simple Display Name Transformation
*For any* resource or field name, the simple name converter should generate a readable display name by replacing underscores/hyphens with spaces, inserting spaces before capitals, and applying Title Case (e.g., "user_name" → "User Name", "getUserData" → "Get User Data").
**Validates: Requirements 6.3**

**Implementation Note:** Uses simple string transformation rules without external API calls for fast, predictable results.

### Property 5: Primary Key Pattern Detection
*For any* object with field names containing primary key patterns (id, key, code, number, uuid, guid, pk, primary_key, no, num, seq, recid, record_id, rowid) using word boundary regex, those fields should be identified as primary key candidates.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 6: Primary Key Disambiguation
*For any* object with zero or multiple primary key candidates, the LLM should be used to select the most appropriate primary key; if LLM fails, default to "id".
**Validates: Requirements 10.6, 10.7, 10.8, 10.9**

### Property 7: Error Response Validity
*For any* invalid input (malformed JSON, unreachable URL, invalid spec), the API should return an appropriate HTTP error code (400, 413, 422, 503) with a descriptive error message.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 8: Response Unwrapping
*For any* JSON response with nested data structures (e.g., `{Data: {Users: [...]}}`), the analyzer should extract and use only the actual data array or object.
**Validates: Requirements 3.4, 4.2**

### Property 9: Operations Mapping
*For any* OpenAPI spec with HTTP methods defined, the operations array should correctly map: GET→["list", "detail"], POST→["create"], PUT/PATCH→["update"], DELETE→["delete"].
**Validates: Requirements 1.4, 6.5**

### Property 10: JSON Sample Array Detection
*For any* JSON sample containing an array of objects, the analyzer should identify it as a list endpoint and extract the common schema from the array items.
**Validates: Requirements 4.3**

### Property 11: Timeout Enforcement
*For any* HTTP request (openapi_url or endpoint modes), if the request takes longer than 30 seconds, it should be aborted and return a 503 error.
**Validates: Requirements 11.1, 11.2, 11.3**

### Property 12: Payload Size Enforcement
*For any* request with body size exceeding 10MB, the API should reject it with HTTP 413 before processing.
**Validates: Requirements 12.1, 12.2, 12.3**

## Error Handling

### Error Categories

1. **Client Errors (400-499)**
   - `400 Bad Request`: Invalid JSON/YAML, malformed request body
   - `413 Payload Too Large`: Request exceeds 10MB limit
   - `422 Unprocessable Entity`: Valid format but no resources extractable

2. **Server Errors (500-599)**
   - `503 Service Unavailable`: External URL unreachable or timeout
   - `500 Internal Server Error`: Unexpected processing errors

### Error Response Format
```python
{
  "detail": "Human-readable error message"
}
```

## Testing Strategy

### Unit Tests
- Test each analyzer (OpenAPI, Endpoint, JSON) independently with various inputs
- Test type inference with edge cases (null, undefined, mixed types)
- Test name conversion utilities (snake_case, camelCase, PascalCase)
- Test primary key detection with all patterns
- Test response unwrapping with various nesting levels
- Test error handling for each failure mode

### Property-Based Tests
- Use **Hypothesis** (Python PBT library) with **100+ iterations** per property
- Generate random OpenAPI specs and verify parsing completeness (Property 1)
- Generate random JSON structures and verify type inference (Property 3)
- Generate random resource names and verify simple display name transformation (Property 4)
- Generate random objects and verify primary key detection (Properties 5, 6)
- Test timeout behavior with slow mock servers (Property 11)
- Test payload size limits with large generated payloads (Property 12)

### Integration Tests
- Test full analyze flow from request to response for each mode
- Test error scenarios end-to-end (invalid spec, unreachable URL, timeout)
- Verify CORS headers are properly set
- Test with real OpenAPI specs from public APIs (Stripe, GitHub, etc.)

### Test Tagging
- Each property-based test MUST include a comment with format:
  ```python
  # Feature: backend-api-analyzer, Property 1: OpenAPI Parsing Completeness
  @given(openapi_spec=openapi_strategy())
  def test_openapi_parsing_completeness(openapi_spec):
      ...
  ```

## Implementation Notes

### Technology Stack
- **Framework**: FastAPI 0.104+
- **HTTP Client**: httpx (async support with configurable timeout)
- **OpenAPI Parsing**: pydantic-openapi-schema or openapi-spec-validator
- **YAML Parsing**: PyYAML
- **LLM Integration**: openai or anthropic SDK for display name generation
- **Testing**: pytest + pytest-asyncio + Hypothesis
- **Type Checking**: mypy (strict mode)
- **Linting**: ruff

### Environment Configuration
```bash
# .env
ANALYZER_TIMEOUT_SECONDS=30  # HTTP request timeout
ANALYZER_MAX_PAYLOAD_MB=10   # Max request body size
ANALYZER_LOG_LEVEL=INFO      # Logging level

# LLM Configuration for optional display name cleaning (/api/clean-names endpoint)
LLM_PROVIDER=openai          # "openai" or "anthropic" (optional, only needed for /api/clean-names)
OPENAI_API_KEY=sk-...        # OpenAI API key (optional, only needed for /api/clean-names)
ANTHROPIC_API_KEY=sk-ant-... # Anthropic API key (optional, only needed for /api/clean-names)
LLM_MODEL=gpt-4o-mini        # Model to use (optional, only needed for /api/clean-names)
LLM_BATCH_SIZE=50            # Number of field names to convert in one LLM call
```

### Performance Considerations
- Use async/await for all HTTP requests to avoid blocking
- Stream large responses instead of loading entirely into memory
- Limit JSON sample size to prevent memory exhaustion (max 10MB)
- Timeout for all external requests (30 seconds default)
- **Simple name conversion by default**: Use fast string transformation rules for display names in /api/analyze
- **Optional LLM cleaning**: Provide separate /api/clean-names endpoint for intelligent name cleaning when needed
- **Batch LLM calls**: When using /api/clean-names, convert multiple field names in a single LLM request (batch size: 50)
- Consider caching parsed OpenAPI specs (optional enhancement)

### Security Considerations
- **SSRF Prevention**: Validate URLs before making requests (block private IPs, localhost)
- **Credential Handling**: Store auth credentials in memory only, never persist
- **Error Sanitization**: Don't leak sensitive data in error messages
- **Rate Limiting**: Consider adding rate limiting for analyze endpoint (optional)
- **CORS**: Configure CORS to allow frontend origin only

### Logging Strategy
- Log all analyze requests with mode and basic metadata
- Log timeout events with URL and duration
- Log payload size limit violations with actual size
- Log parsing errors with sanitized error details
- Use structured logging (JSON format) for easy parsing
