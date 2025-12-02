# Feature: Add Proxy Server to Downloaded Project

## Problem Statement
The current Download Project feature generates a React-only project that calls the legacy API directly from the browser. This doesn't work because:
1. **CORS** - Browser blocks cross-origin requests to legacy APIs
2. **Field Mapping** - Legacy APIs return weird field names (USR_NM, CUST_ID) that need translation
3. **SOAP** - Browsers cannot make SOAP XML requests
4. **Auth** - Complex auth (WSSE, API keys) shouldn't be exposed in frontend code

## Solution Overview
Update the Download Project feature to include a minimal Node.js Express proxy server alongside the React frontend. The proxy handles all legacy API communication, field mapping, and auth - just like our backend Smart Proxy does.

## Architecture

### Current (Broken)
```
Browser React App → Legacy API  ❌ CORS, no mapping
```

### Updated (Working)
```
Browser React App → localhost:4000/proxy/* → Legacy API ✅
                         ↓
                   Field Mapping
                   Auth Headers
                   SOAP Translation
```

## Updated Project Structure in ZIP

```
admin-portal/
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.ts          # Calls http://localhost:4000/proxy/*
│   │   ├── config/
│   │   │   └── resources.ts    # Resource schemas
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── proxy-server/                # NEW: Express proxy
│   ├── src/
│   │   ├── index.ts            # Express server entry
│   │   ├── proxy.ts            # Proxy route handlers
│   │   ├── fieldMapper.ts      # Field name translation
│   │   ├── authBuilder.ts      # Auth header construction
│   │   ├── soapBuilder.ts      # SOAP request/response handling
│   │   └── config.ts           # Load config.json
│   ├── config.json             # Generated: baseUrl, auth, mappings
│   ├── package.json
│   └── tsconfig.json
│
├── start.sh                     # Start both servers (Unix)
├── start.bat                    # Start both servers (Windows)
└── README.md                    # Updated instructions
```

## User Stories

### US1: Download Working Project with Proxy
**As a** user who generated an admin portal for a legacy API
**I want to** download a project that actually works with my legacy API
**So that** I can run it locally and it successfully fetches/displays data

**Acceptance Criteria:**
- Downloaded ZIP contains both frontend and proxy-server
- Running both servers allows frontend to fetch legacy API data
- Field names are properly mapped (legacy → normalized)
- SOAP APIs work correctly
- Auth is handled by proxy (not exposed in frontend)

## Functional Requirements

### FR1: Generate Proxy Server Code
- Generate Express server with TypeScript
- Include proxy routes for CRUD operations
- Include field mapper module
- Include auth builder module
- Include SOAP builder module (for SOAP APIs)

### FR2: Generate Proxy Configuration
- Export ProxyConfig from current session to config.json
- Include baseUrl, apiType, auth settings
- Include resource configs with field mappings
- Include SOAP namespace and operation configs

### FR3: Update Frontend API Service
- Change api.ts to call localhost:4000/proxy/* instead of legacy API
- Remove any auth logic from frontend
- Keep resource schemas for UI rendering

### FR4: Generate Startup Scripts
- Create start.sh for Unix (runs both servers)
- Create start.bat for Windows
- Update README with clear instructions

### FR5: Update README
- Document the two-server architecture
- Provide step-by-step setup instructions
- Explain how to configure for production deployment

## Technical Design

### Proxy Server Components

#### 1. index.ts (Server Entry)
```typescript
import express from 'express';
import cors from 'cors';
import { proxyRouter } from './proxy';
import { loadConfig } from './config';

const app = express();
app.use(cors());
app.use(express.json());

const config = loadConfig();
app.use('/proxy', proxyRouter(config));

app.listen(4000, () => {
  console.log('Proxy server running on http://localhost:4000');
});
```

#### 2. proxy.ts (Route Handlers)
```typescript
import { Router } from 'express';
import { ProxyConfig } from './config';
import { mapFields } from './fieldMapper';
import { buildAuthHeaders } from './authBuilder';
import { buildSoapRequest, parseSoapResponse } from './soapBuilder';

export function proxyRouter(config: ProxyConfig): Router {
  const router = Router();

  // GET /proxy/:resource - List
  router.get('/:resource', async (req, res) => {
    const { resource } = req.params;
    const resourceConfig = config.resources.find(r => r.name === resource);
    
    if (config.apiType === 'rest') {
      // REST forwarding with field mapping
    } else {
      // SOAP forwarding with XML handling
    }
  });

  // Similar for detail, create, update, delete...
  return router;
}
```

#### 3. config.json (Generated)
```json
{
  "baseUrl": "https://legacy-api.company.com",
  "apiType": "rest",
  "auth": {
    "mode": "bearer",
    "bearerToken": "{{USER_TOKEN}}"
  },
  "resources": [
    {
      "name": "customers",
      "endpoint": "/api/v1/customers",
      "fieldMappings": [
        {"normalizedName": "customer_id", "legacyName": "CUST_ID"},
        {"normalizedName": "full_name", "legacyName": "USR_NM"},
        {"normalizedName": "email", "legacyName": "EMAIL_ADDR"}
      ],
      "responsePath": "Data.Customers"
    }
  ]
}
```

### Frontend Changes

#### api.ts (Updated)
```typescript
// OLD: Called legacy API directly
// const BASE_URL = 'https://legacy-api.company.com';

// NEW: Call local proxy
const PROXY_URL = 'http://localhost:4000/proxy';

export async function fetchResources(resourceName: string) {
  const response = await fetch(`${PROXY_URL}/${resourceName}`);
  return response.json();
}
```

## Tasks

### Task 1: Create Proxy Server Templates

Create templates for the Express proxy server files.

**Files to create in `frontend/src/services/templates/proxy/`:**
- `packageJsonTemplate.ts` - proxy-server/package.json
- `tsconfigTemplate.ts` - proxy-server/tsconfig.json
- `indexTemplate.ts` - proxy-server/src/index.ts
- `proxyTemplate.ts` - proxy-server/src/proxy.ts
- `fieldMapperTemplate.ts` - proxy-server/src/fieldMapper.ts
- `authBuilderTemplate.ts` - proxy-server/src/authBuilder.ts
- `soapBuilderTemplate.ts` - proxy-server/src/soapBuilder.ts
- `configLoaderTemplate.ts` - proxy-server/src/config.ts

**Acceptance Criteria:**
- All templates export functions returning string content
- Templates handle both REST and SOAP API types
- Field mapping logic matches backend implementation

---

### Task 2: Create Config Generator

Create a function to generate config.json from current ProxyConfig.

**File:** `frontend/src/services/templates/proxy/configGenerator.ts`

**Function signature:**
```typescript
export function generateProxyConfig(
  proxyConfig: ProxyConfig,
  schemas: ResourceSchema[]
): string
```

**Acceptance Criteria:**
- Exports ProxyConfig as JSON
- Includes all field mappings
- Sanitizes sensitive auth data with placeholders
- Includes SOAP-specific config when apiType is "soap"

---

### Task 3: Create Startup Script Templates

Create templates for startup scripts.

**Files:**
- `startShTemplate.ts` - start.sh for Unix
- `startBatTemplate.ts` - start.bat for Windows

**Content:**
```bash
#!/bin/bash
# start.sh
echo "Starting proxy server..."
cd proxy-server && npm install && npm start &
sleep 3
echo "Starting frontend..."
cd frontend && npm install && npm run dev
```

**Acceptance Criteria:**
- Scripts work on respective platforms
- Scripts install dependencies if needed
- Scripts start both servers

---

### Task 4: Update README Template

Update README.md template with proxy server instructions.

**File:** Update `frontend/src/services/templates/config/readmeTemplate.ts`

**New sections:**
- Architecture overview (two-server setup)
- Proxy server configuration
- Production deployment guide
- Troubleshooting section

**Acceptance Criteria:**
- Clear step-by-step instructions
- Explains the proxy architecture
- Documents config.json structure
- Provides production deployment guidance

---

### Task 5: Update Frontend API Template

Update api.ts template to call proxy instead of legacy API.

**File:** Update `frontend/src/services/templates/portal/apiTemplate.ts`

**Changes:**
- Change BASE_URL to `http://localhost:4000/proxy`
- Remove any auth header logic
- Simplify to just fetch calls

**Acceptance Criteria:**
- All API calls go through proxy
- No auth logic in frontend
- Works with both REST and SOAP backends

---

### Task 6: Update ProjectGenerator

Update ProjectGenerator to include proxy server files.

**File:** Update `frontend/src/services/ProjectGenerator.ts`

**Changes:**
- Add method `addProxyServerFiles(zip, proxyConfig, schemas)`
- Add proxy-server/ directory with all files
- Add config.json with generated config
- Add startup scripts
- Update folder structure (frontend/ subdirectory)

**Acceptance Criteria:**
- ZIP contains both frontend/ and proxy-server/ directories
- All proxy files are generated correctly
- config.json is populated from current session
- Startup scripts are included

---

### Task 7: Get ProxyConfig from Backend

Update download flow to fetch current ProxyConfig from backend.

**Changes to PortalPage.tsx:**
- Fetch current proxy config from `GET /api/proxy/config`
- Pass proxyConfig to ProjectGenerator
- Handle case where proxy not configured

**Acceptance Criteria:**
- Download includes current proxy configuration
- Field mappings are preserved
- Auth settings are included (with placeholders for secrets)

---

### Task 8: Testing

Test the complete download flow with proxy.

**Test cases:**
1. Download with REST API config
2. Download with SOAP API config
3. Extract ZIP and run both servers
4. Verify frontend can fetch data through proxy
5. Verify field mapping works
6. Verify SOAP translation works (for SOAP APIs)

**Acceptance Criteria:**
- Downloaded project works end-to-end
- Data displays correctly in UI
- No CORS errors
- Field names are normalized

---

## Out of Scope
- Docker configuration
- Production deployment automation
- Database setup
- User authentication in generated app

## Success Metrics
- Downloaded project starts successfully with `./start.sh`
- Frontend displays data from legacy API
- Field names are properly mapped
- Works for both REST and SOAP APIs