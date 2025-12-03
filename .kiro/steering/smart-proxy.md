---
inclusion: always
---

# Smart Proxy Layer - Complete Implementation

## Core Concept

The proxy sits between your frontend and the legacy API:
- Frontend calls your proxy (localhost:4000)
- Proxy calls legacy API with proper auth/headers
- Proxy returns clean, normalized responses to the frontend
- Solves CORS issues (server-to-server calls)

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. USER ANALYZES API                                               │
│     - OpenAPI spec with servers[0].url                              │
│     - Or provides baseUrl directly                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. BACKEND EXTRACTS baseUrl                                        │
│     - openapi_analyzer.py extracts from servers field               │
│     - schema_normalizer.py includes in response                     │
│     - Returns: { resources: [...], baseUrl: "https://..." }         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. FRONTEND STORES baseUrl                                         │
│     - AnalyzerPage captures response.data.baseUrl                   │
│     - Stores in localStorage with schema                            │
│     - { resources: [...], baseUrl: "https://..." }                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. DOWNLOAD/DEPLOY USES baseUrl                                    │
│     - PortalPage reads baseUrl from localStorage                    │
│     - ProjectGenerator passes to configGenerator                    │
│     - Generated config.json has REAL baseUrl                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. RUNTIME: Proxy forwards to REAL legacy API                      │
│     Frontend → Proxy (localhost:4000) → Legacy API (real URL)       │
└─────────────────────────────────────────────────────────────────────┘
```

## Proxy Configuration (config.json)

```json
{
  "baseUrl": "https://legacy.company.com/api/v1",
  "apiType": "rest",
  "auth": {
    "mode": "bearer",
    "bearerToken": "{{YOUR_BEARER_TOKEN}}"
  },
  "resources": [
    {
      "name": "users",
      "endpoint": "/users",
      "operations": {
        "list": { "rest": { "method": "GET", "path": "/users" } },
        "detail": { "rest": { "method": "GET", "path": "/users/{id}" } },
        "create": { "rest": { "method": "POST", "path": "/users" } },
        "update": { "rest": { "method": "PUT", "path": "/users/{id}" } },
        "delete": { "rest": { "method": "DELETE", "path": "/users/{id}" } }
      },
      "fieldMappings": []
    }
  ]
}
```

## Supported Auth Modes

| Mode | Headers Added |
|------|---------------|
| `none` | No auth headers |
| `bearer` | `Authorization: Bearer <token>` |
| `apiKey` | `X-API-Key: <value>` (or custom header) |
| `basic` | `Authorization: Basic <base64>` |
| `wsse` | WS-Security headers for SOAP |

## Proxy Endpoints

```
GET    /api/proxy/{resource}           → List all records
GET    /api/proxy/{resource}/{id}      → Get single record
POST   /api/proxy/{resource}           → Create record
PUT    /api/proxy/{resource}/{id}      → Update record
DELETE /api/proxy/{resource}/{id}      → Delete record
```

## SOAP Support

For SOAP APIs, the proxy:
1. Builds SOAP envelope with proper namespace
2. Sets SOAPAction header
3. Parses XML response to JSON
4. Extracts data from response elements

```json
{
  "apiType": "soap",
  "soapNamespace": "http://example.com/customerservice",
  "resources": [
    {
      "name": "customers",
      "operations": {
        "list": {
          "soap": {
            "operationName": "GetCustomers",
            "soapAction": "http://example.com/customerservice/GetCustomers",
            "responseElement": "GetCustomersResponse"
          }
        }
      }
    }
  ]
}
```

## Mock Data Fallback

When `baseUrl` is not configured or API is unreachable:
- Proxy returns mock data for demo purposes
- Supports common resources: users, customers, products, orders, activity
- Allows testing UI without real backend

## Error Handling

- 404 from legacy → Clean JSON error with message
- 401/403 → Auth error with guidance
- Timeout → Friendly timeout message
- CORS → Handled by proxy (never reaches frontend)

## Generated Project Files

```
proxy-server/
├── src/
│   ├── index.ts        # Express server setup
│   ├── proxy.ts        # Request forwarding logic
│   ├── authBuilder.ts  # Auth header construction
│   ├── fieldMapper.ts  # Field name translation
│   ├── soapBuilder.ts  # SOAP envelope construction
│   └── config.ts       # Config loader
├── config.json         # API configuration (edit this!)
├── package.json
└── tsconfig.json
```

## Key Implementation Files

### Backend (Development)
- `backend/app/api/proxy.py` - Proxy endpoints
- `backend/app/services/proxy_forwarder.py` - Request forwarding
- `backend/app/services/proxy_config_manager.py` - Config management

### Frontend (Templates)
- `frontend/src/services/templates/proxy/proxyServerTemplates.ts`
- `frontend/src/services/templates/proxy/configGenerator.ts`
- `frontend/src/services/templates/proxy/authBuilderTemplate.ts`

## Testing Real APIs

1. Analyze your real OpenAPI spec (with servers field)
2. System extracts baseUrl automatically
3. Download project
4. Update `config.json` with auth credentials
5. Run `./start.sh`
6. Frontend connects to your real legacy API via proxy
