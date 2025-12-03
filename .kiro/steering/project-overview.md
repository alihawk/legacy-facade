# Legacy UX Reviver - Project Overview

## Hackathon Context
- **Event:** Kiroween 2025
- **Category:** Resurrection (bringing dead UIs back to life)
- **Bonus Categories:** Frankenstein (stitching APIs + UIs), Best Startup Project
- **Theme:** Spooky Halloween aesthetic for analyzer, modern light/dark UI for generated portals

## Problem Statement
Companies have internal tools from 2010 with terrible UIs. Backend APIs work fine, but UX makes employees miserable. Full rewrites cost $100K+ and take months. Productivity suffers because people hate using the tools.

## Solution
Auto-generate modern React frontends from existing legacy APIs with ZERO backend changes. Deploy in days, not months.

## Complete Feature Set

### 1. Multi-Protocol API Support
- **REST APIs**: OpenAPI/Swagger spec, live endpoint probing, JSON sample inference
- **SOAP APIs**: WSDL parsing, SOAP endpoint analysis, XML sample inference
- Automatic baseUrl extraction from OpenAPI `servers` field

### 2. Smart Proxy Layer
- Forwards frontend requests to legacy backend (solves CORS)
- Supports multiple auth modes: Bearer, API Key, Basic, WSSE
- Field mapping for legacy→modern field name translation
- Mock data fallback for demo mode

### 3. UI Generation Engine
- Dynamic CRUD interfaces from any schema
- Dashboard with stats cards, charts, recent activity
- Bulk selection, CSV export, smart field rendering
- Light/Dark theme support with accent colors

### 4. Deployment Options
- **Download ZIP**: Complete project with frontend + proxy server
- **Deploy to Vercel**: One-click deployment with serverless functions
- Startup scripts for easy local development

## Project Architecture

### Frontend (`frontend/`)
- **Tech Stack:** React 19 + Vite 7 + TypeScript + Tailwind 4 + shadcn/ui
- **Key Pages:**
  - `LandingPage.tsx` - API type selection (REST vs SOAP)
  - `AnalyzerPage.tsx` - REST API analysis (OpenAPI, endpoint, JSON)
  - `SOAPAnalyzerPage.tsx` - SOAP API analysis (WSDL, endpoint, XML)
  - `PortalPage.tsx` - Generated admin portal with routing
- **Key Components:**
  - `Dashboard.tsx` - Stats, charts, recent activity
  - `ResourceList.tsx` - Data grid with bulk actions
  - `ResourceDetail.tsx` - Record detail view
  - `ResourceForm.tsx` - Create/edit forms
  - `SchemaReviewStep.tsx` - Field customization
  - `UICustomizationStep.tsx` - Theme/feature selection

### Backend (`backend/`)
- **Tech Stack:** Python 3.11 + FastAPI + httpx
- **Analyzers:**
  - `openapi_analyzer.py` - OpenAPI/Swagger parsing with baseUrl extraction
  - `endpoint_analyzer.py` - Live REST endpoint probing
  - `json_analyzer.py` - JSON sample inference
  - `wsdl_analyzer.py` - WSDL parsing
  - `soap_endpoint_analyzer.py` - SOAP endpoint probing
  - `soap_xml_analyzer.py` - XML sample inference
- **Proxy:**
  - `proxy.py` - Request forwarding with auth
  - `proxy_config_manager.py` - Configuration management
  - `soap_request_builder.py` - SOAP envelope construction
- **Deployment:**
  - `vercel_deployer.py` - Vercel API integration
  - `vercel_frontend_generator.py` - React project generation
  - `vercel_proxy_generator.py` - Serverless function generation

### Generated Project Structure
```
downloaded-project/
├── frontend/           # React + Vite app
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── services/   # API client
│   │   └── config/     # Resource definitions
│   └── package.json
├── proxy-server/       # Express proxy
│   ├── src/
│   │   ├── proxy.ts    # Request forwarding
│   │   ├── authBuilder.ts
│   │   └── config.ts
│   └── config.json     # API configuration
├── start.sh            # Mac/Linux startup
└── start.bat           # Windows startup
```

## Data Flow

### Analysis Flow
```
User Input → Analyzer Page → POST /api/analyze → Backend Analyzer
                                                      ↓
                                              Extract resources + baseUrl
                                                      ↓
                                              Return { resources, baseUrl }
                                                      ↓
                                              Store in localStorage
```

### Runtime Flow (Downloaded Project)
```
Frontend (localhost:5173) → Proxy (localhost:4000) → Legacy API (real URL)
         ↓                          ↓                        ↓
    Modern React UI          Add auth headers          Original backend
                             Handle CORS
                             Map fields
```

## Key Innovations

1. **BaseUrl Auto-Detection**: Extracts server URL from OpenAPI spec's `servers` field
2. **Protocol Agnostic**: Same UI generation for REST and SOAP APIs
3. **Zero Config Deployment**: Downloaded projects work out-of-the-box
4. **Theme Persistence**: Light/dark mode saved and applied to generated projects

## Kiro Usage Throughout Development

### Specs Created
- `api-introspection/` - Analyzer requirements and design
- `smart-proxy-layer/` - Proxy architecture
- `ui-generation/` - Portal component specs
- `vercel-deployment/` - Deployment integration
- `schema-customization/` - Field editing features

### Steering Rules Applied
- `tech.md` - Stack versions and commands
- `structure.md` - File organization
- `frontend-coding-standards.md` - React patterns
- `python-conventions.md` - Backend standards
- `fastapi-conventions.md` - API design
- `smart-proxy.md` - Proxy architecture

### Hooks Configured
- `lint-on-save` - Auto-fix TypeScript and Python
- `build-check` - Verify frontend builds
- `component-review` - UI component standards

## Success Metrics Achieved
- ✅ Upload API spec → Working portal in < 30 seconds
- ✅ Zero backend code changes required
- ✅ Works with REST and SOAP APIs
- ✅ Beautiful before/after transformation
- ✅ One-click Vercel deployment
- ✅ Downloadable standalone project
