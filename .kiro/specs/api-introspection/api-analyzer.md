# Spec: API Introspection Engine

## Purpose
Parse various API input formats and produce normalized `ResourceSchema[]` for UI generation.

## Input Modes

### Mode 1: OpenAPI Spec
```typescript
{
  mode: "openapi",
  specJson: { /* OpenAPI 3.0 JSON */ }
}
```

### Mode 2: Endpoint URL
```typescript
{
  mode: "endpoint",
  baseUrl: "https://api.example.com",
  endpoint: "/users",
  method: "GET",
  authType: "bearer" | "api_key" | "none",
  authValue: "token_here"
}
```

### Mode 3: JSON Sample
```typescript
{
  mode: "json_sample",
  sampleJson: { /* sample response */ },
  baseUrl: "https://api.example.com",
  endpoint: "/api/v1/GetAllUsers"
}
```

## Output Schema
```typescript
interface ResourceSchema {
  name: string;              // "users"
  displayName: string;       // "Users"
  endpoint: string;          // "/api/users"
  primaryKey: string;        // "user_id"
  fields: ResourceField[];
  operations: string[];      // ["list", "detail", "create", "update"]
}

interface ResourceField {
  name: string;              // "user_id"
  type: string;              // "number", "string", "email", "date", "boolean"
  displayName: string;       // "User ID"
}
```

## Implementation Requirements

### Backend Endpoint: `/api/analyze`
1. Accept POST with one of 3 modes
2. Parse input based on mode
3. For `json_sample` mode:
   - Infer field types from actual data
   - Detect collections (arrays in response)
   - Generate display names (user_id → "User ID")
4. Return `{ resources: ResourceSchema[] }`

### Field Type Inference Rules
```python
# Look at actual values to determine type
"john@example.com" → "email"
"2024-11-22T10:30:00Z" → "date"
123 → "number"
true/false → "boolean"
"Sample text" → "string"
```

### Error Handling
- Invalid JSON → `{ error: "Invalid JSON format" }`
- No collections found → `{ error: "No arrays detected in response" }`
- Network error → `{ error: "Could not reach endpoint" }`

## Testing
- Test with OpenAPI spec from JSONPlaceholder
- Test with direct endpoint to `https://jsonplaceholder.typicode.com/users`
- Test with sample JSON containing nested data

## Non-Goals
- Full OpenAPI 3.1 support (just basic 3.0)
- Advanced relationship detection
- GraphQL introspection (future)