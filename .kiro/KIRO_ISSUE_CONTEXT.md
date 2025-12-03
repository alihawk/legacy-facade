# Issue: Generated Portal Shows Empty Data (All Fields Show "—")

## Problem Summary

When a user analyzes a legacy API (via OpenAPI spec, Endpoint URL, or JSON Sample) and the portal is generated, the UI shows the correct schema/field names but **all data values are empty** (showing "—" dashes). The portal structure is correct, but no actual data is being fetched from the legacy API.

---

## Root Cause Identified

The **proxy configuration is never saved** after API analysis. 

Looking at `backend/app/routes/proxy.py`:

```python
@router.get("/proxy/{resource}")
async def proxy_list(resource: str, request: Request) -> JSONResponse:
    # Check if proxy is configured
    if not proxy_config_manager.is_configured():
        # Return mock data as fallback  <-- THIS IS HAPPENING!
        mock_data = _get_mock_data(resource)
        return JSONResponse(
            content={"data": mock_data},
            ...
        )
```

The `proxy_config_manager.is_configured()` returns `False` because no configuration was saved, so the proxy returns **generic mock data** instead of forwarding requests to the actual legacy API.

**Evidence from server logs:**
```
GET /proxy/employees HTTP/1.1" 200 OK
```

**Response received:**
```json
{"data":[{"id":1,"name":"Employees Record 1","status":"active","created_at":"2024-01-15"},...]}
```

This is the fallback mock data from `_get_mock_data()`, NOT the real legacy API data.

---

## Expected Flow (Currently Broken)

```
1. User enters API details (OpenAPI spec URL, base URL, etc.)
2. User clicks "Analyze & Resurrect"
3. Frontend calls POST /api/analyze
4. Backend analyzes and returns detected schema
5. ❌ MISSING: Frontend should call POST /api/proxy/config with:
   - baseUrl (e.g., "http://localhost:8081")
   - apiType ("rest" or "soap")
   - auth configuration
   - resources array with:
     - name
     - endpoint
     - operations
     - responsePath (e.g., "Data" for wrapped responses)
     - fieldMappings (optional)
6. Frontend navigates to Portal
7. Portal calls /proxy/{resource}
8. ❌ FAILS: Proxy returns mock data because config was never saved
```

---

## The Fix Required

After the `/api/analyze` endpoint returns successfully, the frontend MUST call:

```
POST /api/proxy/config
```

With a payload like:

```json
{
  "baseUrl": "http://localhost:8081",
  "apiType": "rest",
  "auth": {
    "mode": "none"
  },
  "resources": [
    {
      "name": "employees",
      "endpoint": "/api/v1/employees",
      "operations": {
        "list": {"rest": {"method": "GET", "path": "/api/v1/employees"}},
        "detail": {"rest": {"method": "GET", "path": "/api/v1/employees/{id}"}},
        "create": {"rest": {"method": "POST", "path": "/api/v1/employees"}},
        "update": {"rest": {"method": "PUT", "path": "/api/v1/employees/{id}"}},
        "delete": {"rest": {"method": "DELETE", "path": "/api/v1/employees/{id}"}}
      },
      "responsePath": "Data",
      "fieldMappings": []
    }
  ]
}
```

---

## Key Configuration Details

### 1. Response Wrapper Issue

The legacy API returns wrapped responses:
```json
{
  "Status": "SUCCESS",
  "RecordCount": 14,
  "Data": [
    {"EMP_ID": 1, "EMP_FNAME": "Margaret", ...}
  ]
}
```

The actual data is inside the `"Data"` field. The proxy config MUST include:
```json
"responsePath": "Data"
```

This tells `proxy_forwarder.py` to unwrap the response.

### 2. Base URL Must Match Legacy Server

If the legacy API runs on `http://localhost:8081`, the config must have:
```json
"baseUrl": "http://localhost:8081"
```

NOT `http://localhost:8080` (which might be in the OpenAPI spec's `servers` array).

### 3. Resource Names Must Match

The portal calls `/proxy/employees`, so the resource config must have:
```json
"name": "employees"
```

The resource name in the config must match exactly what the portal requests.

---

## Files to Check/Modify

### Frontend Files (likely locations):

1. **Analyzer Page** - where "Analyze & Resurrect" is handled:
   - `src/pages/AnalyzerPage.tsx`
   - `src/pages/RestAnalyzerPage.tsx`
   - `src/components/ApiAnalyzer.tsx`

2. **API Service** - where backend calls are made:
   - `src/services/api.ts`
   - `src/services/analyzerService.ts`
   - `src/lib/api.ts`

3. **Context/State** - where API config might be stored:
   - `src/context/ApiContext.tsx`
   - `src/context/SchemaContext.tsx`
   - `src/store/apiStore.ts`

4. **Portal Page** - where data is fetched and displayed:
   - `src/pages/Portal.tsx`
   - `src/pages/PortalPage.tsx`
   - `src/components/Portal/Portal.tsx`

### Backend Files (for reference):

1. **Proxy Config Endpoint**: `backend/app/routes/proxy_config.py`
   - `POST /api/proxy/config` - saves configuration
   - `GET /api/proxy/config` - retrieves configuration

2. **Proxy Routes**: `backend/app/routes/proxy.py`
   - Checks `proxy_config_manager.is_configured()`
   - Falls back to mock data if not configured

3. **Config Manager**: `backend/app/services/proxy_config_manager.py`
   - `set_config()` - saves to `.proxy_config.json`
   - `get_config()` - retrieves from file/cache
   - `is_configured()` - checks if config exists

4. **Proxy Forwarder**: `backend/app/services/proxy_forwarder.py`
   - `forward_request()` - forwards to legacy API
   - Uses `responsePath` to unwrap responses
   - Uses `fieldMappings` for field name translation

---

## Required Changes

### Option A: Save Config After Analysis

In the analyzer page/component, after receiving the analysis response:

```typescript
// After successful analysis
const analysisResult = await api.post('/api/analyze', { ... });

// Build proxy config from analysis result and user input
const proxyConfig = {
  baseUrl: userInputBaseUrl,  // From the form input
  apiType: 'rest',
  auth: { mode: 'none' },  // Or from user input
  resources: analysisResult.resources.map(resource => ({
    name: resource.name.toLowerCase(),
    endpoint: resource.endpoint,
    operations: buildOperations(resource),
    responsePath: detectResponsePath(analysisResult),  // Usually "Data", "data", "results", etc.
    fieldMappings: resource.fieldMappings || []
  }))
};

// CRITICAL: Save the proxy config!
await api.post('/api/proxy/config', proxyConfig);

// Then navigate to portal
navigate('/portal');
```

### Option B: Save Config When Entering Portal

In the portal component, before fetching data:

```typescript
useEffect(() => {
  async function initializeProxy() {
    // Check if config exists
    const configResponse = await api.get('/api/proxy/config');
    
    if (!configResponse.data.configured) {
      // Build and save config from stored analysis result
      const proxyConfig = buildProxyConfigFromAnalysis(storedAnalysisResult);
      await api.post('/api/proxy/config', proxyConfig);
    }
    
    // Now fetch data
    fetchResources();
  }
  
  initializeProxy();
}, []);
```

---

## Testing the Fix

### Manual Test (to verify proxy works):

```bash
# 1. Start legacy API on port 8081
cd legacy-hr-system && mvn spring-boot:run -Dserver.port=8081

# 2. Manually set proxy config
curl -X POST http://localhost:8000/api/proxy/config \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "http://localhost:8081",
    "apiType": "rest",
    "auth": {"mode": "none"},
    "resources": [{
      "name": "employees",
      "endpoint": "/api/v1/employees",
      "operations": {
        "list": {"rest": {"method": "GET", "path": "/api/v1/employees"}},
        "detail": {"rest": {"method": "GET", "path": "/api/v1/employees/{id}"}}
      },
      "responsePath": "Data"
    }]
  }'

# 3. Test proxy endpoint
curl http://localhost:8000/proxy/employees

# Should return REAL data like:
# {"EMP_ID": 1, "EMP_FNAME": "Margaret", "EMP_LNAME": "Sullivan", ...}
# NOT mock data like:
# {"id": 1, "name": "Employees Record 1", ...}
```

### Automated Test (after fix):

1. Open Legacy UX Reviver
2. Enter: `http://localhost:8081/api/openapi.json`
3. Click "Analyze & Resurrect"
4. Check browser DevTools Network tab:
   - Should see `POST /api/proxy/config` with 200 response
5. In Portal, data should show real values:
   - "Margaret", "Sullivan", "$185,000", etc.
   - NOT "—" dashes or "Employees Record 1"

---

## ProxyConfig TypeScript Interface (for frontend)

```typescript
interface ProxyConfig {
  baseUrl: string;
  apiType: 'rest' | 'soap';
  auth: {
    mode: 'none' | 'bearer' | 'apiKey' | 'basic' | 'wsse';
    bearerToken?: string;
    apiKeyHeader?: string;
    apiKeyValue?: string;
    basicUser?: string;
    basicPass?: string;
    wsseUsername?: string;
    wssePassword?: string;
  };
  resources: ResourceConfig[];
  soapNamespace?: string;
}

interface ResourceConfig {
  name: string;
  endpoint: string;
  operations: {
    [operation: string]: {
      rest?: {
        method: string;
        path: string;
      };
      soap?: {
        operationName: string;
        soapAction: string;
        responseElement?: string;
      };
    };
  };
  responsePath?: string;  // e.g., "Data", "data", "results", "items"
  fieldMappings?: FieldMapping[];
  primaryKey?: string;
}

interface FieldMapping {
  normalizedName: string;  // Frontend field name
  legacyName: string;      // Legacy API field name
}
```

---

## Summary

| What | Status |
|------|--------|
| Schema detection | ✅ Works |
| UI generation | ✅ Works |
| Proxy config saved | ✅ FIXED - Now saves after analysis |
| Data fetching | ✅ FIXED - Will use real API when configured |
| Root cause | POST /api/proxy/config never called |

**The fix**: After analysis completes, call `POST /api/proxy/config` with the legacy API details including `baseUrl`, `resources`, and `responsePath: "Data"`.

---

## Fix Applied (December 2025)

### Changes Made:

1. **AnalyzerPage.tsx** - Updated `handleGenerate()` to:
   - Build proxy configuration from analyzed schema
   - Call `POST /api/proxy/config` with baseUrl, apiType, auth, and resources
   - Include `responsePath: "Data"` for wrapped responses
   - Helper function `buildProxyOperations()` creates REST operation configs

2. **SOAPAnalyzerPage.tsx** - Updated `handleGenerate()` to:
   - Build SOAP proxy configuration from analyzed schema
   - Call `POST /api/proxy/config` with SOAP-specific settings
   - Include `soapNamespace` for SOAP envelope construction
   - Helper function `buildSoapProxyOperations()` creates SOAP operation configs

### How It Works Now:

```
1. User enters API details (OpenAPI spec URL, base URL, etc.)
2. User clicks "Analyze & Resurrect"
3. Frontend calls POST /api/analyze
4. Backend analyzes and returns detected schema + baseUrl
5. ✅ Frontend stores baseUrl in state (detectedBaseUrl)
6. User clicks "Generate Portal"
7. ✅ Frontend calls POST /api/proxy/config with full configuration
8. Frontend navigates to Portal
9. Portal calls /proxy/{resource}
10. ✅ Proxy forwards to REAL legacy API using saved config
```
