---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 

# Core Concept

The proxy sits between your frontend and the legacy API:
- Frontend calls your proxy
- Proxy calls legacy API with proper auth/headers
- Proxy returns clean, normalized responses to the frontend


## What the Proxy Knows (Inputs)

1. From the Analyzer (already have this)

Resource schemas with:
- fields
- primaryKey
- endpoint
- Suggested operations:
- ["list", "detail", "create", "update", "delete"]

2. From User Config (need to add)
```json
{
  "baseUrl": "https://legacy.internal/api",
  "auth": {
    "mode": "bearer",  // or "apiKey", "basic", "none"
    "bearerToken": "...",
    "apiKeyHeader": "X-API-Key",
    "apiKeyValue": "..."
  },
  "resources": [
    {
      "name": "orders",
      "operations": {
        "list":   { "method": "GET",    "path": "/v1/orders" },
        "detail": { "method": "GET",    "path": "/v1/orders/{id}" },
        "create": { "method": "POST",   "path": "/v1/orders" },
        "update": { "method": "PUT",    "path": "/v1/orders/{id}" },
        "delete": { "method": "DELETE", "path": "/v1/orders/{id}" }
      }
    }
  ]
}
```

## How It Works

Frontend calls the proxy

      GET    /proxy/orders        → List all orders
      GET    /proxy/orders/123    → Get order 123
      POST   /proxy/orders        → Create order
      PUT    /proxy/orders/123    → Update order 123
      DELETE /proxy/orders/123    → Delete order 123

Proxy behavior
	1.	Parse resource name (e.g. "orders") and operation
- Operation inferred from HTTP method + path pattern
	2.	Look up config for that resource + operation
	3.	Build request to legacy API:
- URL: baseUrl + operation.path (replace {id} if needed)
- Method: from config
- Headers: attach auth based on auth.mode
	4.	Forward request to legacy backend
	5.	Return response (and optionally normalize errors)


## Minimal Hackathon Version

Supported auth modes
- none
- No auth headers
- bearer
- Authorization: Bearer <token>
- apiKey
- X-API-Key: <value> (or custom header from config)
- basic
- Authorization: Basic <base64>

Operation mapping (REST heuristics)

      GET    /proxy/{resource}           →  GET    {baseUrl}{path}
      GET    /proxy/{resource}/{id}      →  GET    {baseUrl}{path}
      POST   /proxy/{resource}           →  POST   {baseUrl}{path}
      PUT    /proxy/{resource}/{id}      →  PUT    {baseUrl}{path}
      DELETE /proxy/{resource}/{id}      →  DELETE {baseUrl}{path}

### CORS solution
- Frontend only calls your proxy (same origin or CORS-enabled)
- Proxy makes server-to-server calls to legacy API (no browser CORS issues)
- You control CORS headers on your proxy

### Error handling
- If legacy returns 404 / 405:
- Normalize to a clean JSON error
- Show user a friendly message like:
"Update operation failed. Check configuration."


## What You Need to Build

1. New endpoints in backend

```
GET    /proxy/{resource}
GET    /proxy/{resource}/{id}
POST   /proxy/{resource}
PUT    /proxy/{resource}/{id}
DELETE /proxy/{resource}/{id}
```

2. Config storage
- Store user’s backend config:
- baseUrl
- auth
- resource → operation mappings
- For hackathon:
- Could be in-memory on backend
- Or localStorage on frontend and sent to backend

3. Request forwarding logic
- Build legacy API URL from config
- Attach auth headers
- Forward request
- Return response to frontend (optionally normalized)

4. Update analyzer to propose full CRUD

Change in json_analyzer.py line 82 from:

`operations = ["list"] if is_array else ["detail"]`

To:

`operations = ["list", "detail", "create", "update", "delete"]`

This is the missing link between:
- The analyzer (which understands the legacy API and resources), and
- The runtime UI (which needs actual CRUD operations wired to the legacy API via the proxy).

Without this, the frontend can’t actually perform full CRUD on the legacy API.