---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 

# API Introspection Engine (analyze API + return resource schema)

Purpose: Discover and map legacy API structure

**Input**: API base URL + authentication
**Output**: Normalized schema representation

**Process**:
1. Enumerate endpoints (common patterns)
2. Sample requests to understand structure
3. Infer field types from data
4. Detect relationships between resources
5. Generate internal schema JSON

Error Handling:
- 404 on endpoint → skip, try next
- 401 → prompt for credentials
- Timeout → mark as slow, warn user


Frontend expects this at:

`POST http://localhost:8000/api/analyze`

## Supported Modes

### A. mode="openapi"

Input:

```
{
  "mode": "openapi",
  "specJson": {...}   // Could be JSON or raw YAML string
}
```

Behavior:

Parse OpenAPI (JSON or YAML)

Extract:

- resource name
- endpoint paths
- fields + types
- primary key heuristic
- available operations (list/detail/create/update/delete)

Output (MUST MATCH THIS SHAPE):

```
{
  "resources": [
    {
      "name": "users",
      "displayName": "Users",
      "endpoint": "/api/v1/GetAllUsers",
      "primaryKey": "user_id",
      "fields": [...],
      "operations": [...]
    }
  ]
}
```

### B. mode="openapi_url"

Input:

```
{
  "mode": "openapi_url",
  "specUrl": "https://..."
}
```

Behavior:

Fetch JSON or YAML from URL

Then same extraction as above

### C. mode="endpoint"

Input:

```
{
  "mode": "endpoint",
  "baseUrl": "https://api.example.com",
  "endpointPath": "/api/v1/users",
  "method": "GET",
  "authType": "bearer",
  "authValue": "...",
  "customHeaders": {...}
}
```

Behavior:

- Actually call this endpoint (backend → remote)
- Infer schema from sample response:
- root array vs nested { Data: {...} }
- field types via value inspection
- primary key detection (id, <name>_id)
- operations: always at least list + detail

### D. mode="json_sample"

Input:

```
{
  "mode": "json_sample",
  "sampleJson": {...}
}
```

Behavior:

- Infers resource from JSON shape alone
- DOES NOT use actual remote endpoint
- Sets endpoint to "__sample" or null
- Must still produce the same resource list output