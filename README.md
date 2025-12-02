# 🎃 Legacy UX Reviver

**Kiroween 2025 Hackathon Project** - Resurrection Category

> Bring your dead APIs back to life with beautiful, modern UIs. No backend changes required.

[![Backend Tests](https://img.shields.io/badge/tests-219%20passing-success)](backend/tests/)
[![Frontend](https://img.shields.io/badge/frontend-React%2019-blue)](frontend/)
[![Backend](https://img.shields.io/badge/backend-FastAPI-green)](backend/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## 🌟 The Problem

Companies have internal tools from 2010 with terrible UIs. The backend APIs work fine, but the UX makes employees miserable. Full rewrites cost $100K+ and take months. Productivity suffers because people hate using the tools.

## 💡 The Solution

**Auto-generate modern React frontends from existing legacy APIs with ZERO backend changes.** Deploy in days, not months.

## ✨ Key Features

### 🔍 Multi-Protocol API Analysis
- **REST APIs** - OpenAPI/Swagger specs, live endpoints, or JSON samples
- **SOAP APIs** - WSDL files, WSDL URLs, SOAP endpoints, or XML samples
- **Smart Introspection** - Automatically discovers resources, fields, and operations
- **Type Inference** - Detects field types (email, date, number, boolean, URL, etc.)

### 🎨 Schema Review & Customization
- **Interactive Schema Editor** - Review and modify detected resources
- **Field Management** - Show/hide fields, change types, set primary keys
- **Operation Control** - Enable/disable CRUD operations per resource
- **Read-Only Mode** - Configure resources as view-only

### 🎯 UI Customization
- **Dashboard Features** - Toggle stats cards, charts, and activity logs
- **List View Options** - Bulk selection, bulk delete, CSV export
- **Smart Field Rendering** - Automatic formatting for dates, emails, URLs, booleans
- **Theme Selection** - Light, dark, or spooky mode with accent colors

### 🚀 Deployment Options
- **Download Project** - Get a complete standalone React + Node.js project
- **Deploy to Vercel** - One-click deployment with automatic configuration
- **Proxy Server Included** - Smart proxy handles authentication and CORS

### 🔐 Authentication & Security
- **Multiple Auth Types** - Bearer tokens, API keys, Basic auth, WSSE (SOAP)
- **Proxy Layer** - Secure backend-to-backend communication
- **CORS Handling** - No more browser CORS issues
- **Field Mapping** - Transform legacy field names to modern conventions

### 📊 Advanced Features
- **Bulk Actions** - Select multiple items, bulk delete, CSV export
- **Activity Logging** - Track all operations and changes
- **Resource Settings** - Per-resource UI configuration
- **Smart Filtering** - Search across all fields
- **Pagination** - Handle large datasets efficiently
- **Sorting** - Click column headers to sort

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Frontend (React 19 + Vite)                        │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Landing Page  │→ │  Analyzer Pages  │→ │  Portal Generator │    │
│  │  (API Select)  │  │  (REST/SOAP)     │  │  (3-Step Flow)    │    │
│  └────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                      │                │
│  ┌──────────────────────────────────────────────────┘                │
│  │                                                                    │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  └→ │ Schema Review  │→ │ UI Customization │→ │ Generated Portal │ │
│     │ (Edit Fields)  │  │ (Features/Theme) │  │ (CRUD Interface) │ │
│     └────────────────┘  └──────────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   /analyze   │  │   /deploy    │  │    /proxy    │
        │  (Introspect)│  │  (Vercel)    │  │  (Forward)   │
        └──────────────┘  └──────────────┘  └──────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
┌──────────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + Python)                         │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    API Analyzers                             │    │
│  │  • OpenAPI Parser    • WSDL Parser    • JSON Inferencer     │    │
│  │  • Endpoint Tester   • SOAP Analyzer  • Type Detector       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Smart Proxy Layer                         │    │
│  │  • Request Forwarding    • Auth Injection                    │    │
│  │  • SOAP/REST Support     • Field Mapping                     │    │
│  │  • Error Normalization   • CORS Handling                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  Deployment Services                         │    │
│  │  • Project Generator     • Vercel API Client                 │    │
│  │  • Frontend Templates    • Proxy Templates                   │    │
│  │  • Config Generator      • Deployment Manager                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   Legacy Backend API   │
                        │   (REST/SOAP/Any)     │
                        └───────────────────────┘
```

### Data Flow

1. **Analysis Phase**
   - User provides API spec/endpoint/sample
   - Backend analyzes and extracts schema
   - Returns normalized resource definitions

2. **Review Phase**
   - User reviews detected resources
   - Modifies fields, types, operations
   - Configures UI features and theme

3. **Generation Phase**
   - Frontend generates portal in-browser
   - Or downloads complete project
   - Or deploys to Vercel

4. **Runtime Phase**
   - Generated portal calls proxy server
   - Proxy forwards to legacy API
   - Handles auth, CORS, field mapping

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key (for intelligent field name generation)

### Option 1: Use the Startup Script (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd legacy-facade

# Run the startup script
./start-dev.sh
```

This will:
1. Create Python virtual environment if needed
2. Install all dependencies
3. Start backend on http://localhost:8000
4. Start frontend on http://localhost:5173
5. Open your browser automatically

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 📖 Usage Guide

### Step 1: Choose API Type

Open http://localhost:5173 and select:
- **REST API** - Modern JSON-based APIs
- **SOAP API** - Enterprise XML-based services

### Step 2: Analyze Your API

#### For REST APIs (3 methods):

**Method A: OpenAPI Spec**
- Paste your OpenAPI/Swagger spec (JSON or YAML)
- Upload a spec file (.json, .yaml, .yml)
- Or provide a URL to your spec endpoint

**Method B: Live Endpoint**
- Enter API base URL (e.g., `https://api.example.com`)
- Provide endpoint path (e.g., `/api/v1/users`)
- Select HTTP method (GET, POST, PUT, DELETE, PATCH)
- Add authentication (Bearer, API Key, Basic, or None)
- System will call the endpoint and infer schema

**Method C: JSON Sample**
- Paste a sample JSON response from your API
- Provide endpoint path
- Select HTTP method
- System will infer schema from the sample

#### For SOAP APIs (3 methods):

**Method A: WSDL File**
- Paste WSDL content
- Upload WSDL file (.wsdl, .xml)
- Or provide WSDL URL

**Method B: SOAP Endpoint**
- Enter SOAP endpoint URL
- Provide SOAPAction header
- Add authentication (None, WSSE, Basic)
- System will introspect the service

**Method C: XML Sample**
- Paste sample SOAP response XML
- Provide endpoint and operation details
- System will infer schema

### Step 3: Review Schema

After analysis, review the detected resources:

- **View Resources** - See all detected resources and their fields
- **Edit Fields** - Show/hide fields, change display names, modify types
- **Set Primary Keys** - Select which field is the unique identifier
- **Configure Operations** - Enable/disable list, detail, create, update, delete
- **Read-Only Mode** - Disable all write operations for view-only access

**AI Field Cleaning** (Optional):
- Click "Clean Field Names with AI" to transform cryptic database names
- Example: `usr_nm` → `User Name`, `dt_created` → `Date Created`

### Step 4: Customize UI

Configure your portal's appearance and features:

**Dashboard Features:**
- Stats Cards - Show resource counts and metrics
- Bar Chart - Visual resource distribution
- Recent Activity - Latest operations log

**List View Features:**
- Bulk Selection - Select multiple items with checkboxes
- Bulk Delete - Delete multiple items at once
- CSV Export - Export data to spreadsheet
- Smart Field Rendering - Auto-format dates, emails, URLs

**Forms:**
- Smart Inputs - Appropriate input types for each field

**Theme:**
- Mode: Light, Auto, or Spooky/Dark
- Accent Color: Blue, Green, Purple, Orange

### Step 5: Deploy

Choose your deployment method:

**Option A: Generate Portal (In-Browser)**
- Click "Generate Portal"
- Portal loads instantly in your browser
- Uses localStorage for schema
- Perfect for testing and demos

**Option B: Download Project**
- Click "Download Project"
- Get a complete standalone project:
  - React frontend with all components
  - Node.js proxy server
  - Configuration files
  - Startup scripts
- Extract and run: `npm install && npm start`

**Option C: Deploy to Vercel**
- Click "Deploy to Vercel"
- Automatic deployment with:
  - Frontend hosting
  - Serverless proxy functions
  - Environment configuration
  - Custom domain support
- Live in minutes!

### Step 6: Use Your Portal

Navigate through your resources:

**List View:**
- Search across all fields
- Sort by clicking column headers
- Filter with items-per-page selector
- Select items for bulk operations
- Export to CSV
- Click any row to view details

**Detail View:**
- View all field values
- Smart rendering (dates, emails, URLs, booleans)
- Edit button (if enabled)
- Delete button (if enabled)
- Activity log tab
- Settings tab

**Create/Edit:**
- Smart form inputs based on field types
- Validation for emails, URLs, dates
- Required field indicators
- Cancel or save changes

**Bulk Actions:**
- Select multiple items
- Export selected to CSV
- Delete selected items
- Clear selection

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v

# Run specific test suites
pytest tests/test_integration.py -v
pytest tests/test_openapi_analyzer.py -v
pytest tests/test_endpoint_analyzer.py -v
```

**Test Coverage:**
- ✅ 219 tests passing
- ✅ Integration tests for all 4 modes
- ✅ Property-based tests with Hypothesis
- ✅ Unit tests for all services
- ✅ Authentication tests
- ✅ Error handling tests

### Frontend Tests

```bash
cd frontend
npm run lint
```

## � ASmart Proxy Server

The proxy server is a key component that enables seamless communication with legacy APIs:

### Why a Proxy?

**Problem:** Legacy APIs often have:
- CORS restrictions (can't call from browser)
- Complex authentication (tokens, API keys, WSSE)
- Inconsistent response formats
- No HTTPS support
- Rate limiting

**Solution:** The proxy server:
- Runs server-side (no CORS issues)
- Handles authentication securely
- Normalizes responses
- Maps field names
- Provides consistent REST interface

### How It Works

```
Frontend → Proxy Server → Legacy API
         ↑              ↑
    Modern REST    Any Protocol
    (JSON)         (REST/SOAP/XML)
```

1. **Frontend makes clean REST calls:**
   ```
   GET /proxy/users
   POST /proxy/users
   PUT /proxy/users/123
   DELETE /proxy/users/123
   ```

2. **Proxy transforms and forwards:**
   - Adds authentication headers
   - Converts REST → SOAP if needed
   - Maps modern field names → legacy names
   - Handles pagination, filtering

3. **Legacy API receives familiar format:**
   - Original authentication
   - Original field names
   - Original protocol (REST/SOAP)

4. **Proxy normalizes response:**
   - Unwraps nested structures
   - Maps legacy names → modern names
   - Returns clean JSON

### Proxy Configuration

The proxy is configured automatically based on your schema review:

```json
{
  "baseUrl": "https://legacy.api.com",
  "auth": {
    "type": "bearer",
    "token": "your-token"
  },
  "resources": {
    "users": {
      "endpoint": "/api/v1/GetAllUsers",
      "operations": {
        "list": { "method": "GET", "path": "/api/v1/GetAllUsers" },
        "detail": { "method": "GET", "path": "/api/v1/GetUser/{id}" },
        "create": { "method": "POST", "path": "/api/v1/CreateUser" },
        "update": { "method": "PUT", "path": "/api/v1/UpdateUser/{id}" },
        "delete": { "method": "DELETE", "path": "/api/v1/DeleteUser/{id}" }
      },
      "fieldMapping": {
        "userId": "user_id",
        "fullName": "full_name"
      }
    }
  }
}
```

### Included in Downloads

When you download a project, you get:
- **Node.js proxy server** (`proxy-server/`)
- **Configuration file** (`proxy-config.json`)
- **Startup scripts** (`start-proxy.sh`)
- **Authentication handlers** (Bearer, API Key, Basic, WSSE)
- **SOAP support** (if using SOAP APIs)
- **Field mapping** (legacy ↔ modern names)

### Deployment

**Local Development:**
```bash
cd proxy-server
npm install
npm start  # Runs on http://localhost:3001
```

**Vercel Deployment:**
- Proxy runs as serverless functions
- Automatic scaling
- Environment variables for secrets
- No server management

## 📚 API Documentation

Once the backend is running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Main Endpoints

#### 1. Analyze API
```
POST /api/analyze
```

Analyzes an API and returns normalized schema.

**Request Body:**
```json
{
  "mode": "openapi" | "openapi_url" | "endpoint" | "json_sample" | "wsdl" | "wsdl_url" | "soap_endpoint" | "xml_sample",
  "specJson": {...},           // For openapi mode
  "specUrl": "https://...",    // For openapi_url mode
  "baseUrl": "https://...",    // For endpoint mode
  "endpointPath": "/api/...",  // For endpoint/json_sample modes
  "method": "GET",             // HTTP method
  "authType": "bearer",        // Auth type
  "authValue": "token",        // Auth credentials
  "sampleJson": {...},         // For json_sample mode
  "wsdlContent": "...",        // For wsdl mode
  "wsdlUrl": "https://...",    // For wsdl_url mode
  "soapAction": "...",         // For SOAP
  "xmlSample": "..."           // For xml_sample mode
}
```

**Response:**
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
        }
      ],
      "operations": {
        "list": true,
        "detail": true,
        "create": true,
        "update": true,
        "delete": false
      }
    }
  ]
}
```

#### 2. Clean Field Names
```
POST /api/clean-names
```

Uses LLM to beautify field names.

**Request:**
```json
{
  "resources": [...]  // Resources from analyze endpoint
}
```

**Response:**
```json
{
  "resources": [...]  // Resources with cleaned field names
}
```

#### 3. Deploy to Vercel
```
POST /api/deploy
```

Deploys project to Vercel.

**Request:**
```json
{
  "projectName": "my-portal",
  "resources": [...],
  "proxyConfig": {...},
  "vercelToken": "..."
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://my-portal.vercel.app",
  "deploymentId": "..."
}
```

#### 4. Proxy Requests
```
GET    /proxy/{resource}
GET    /proxy/{resource}/{id}
POST   /proxy/{resource}
PUT    /proxy/{resource}/{id}
DELETE /proxy/{resource}/{id}
```

Forwards requests to legacy API with authentication and field mapping.

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Axios** - HTTP client
- **React Router** - Routing

### Backend
- **FastAPI** - Web framework
- **Python 3.10+** - Language
- **httpx** - Async HTTP client
- **Pydantic** - Data validation
- **OpenAPI Parser** - Spec parsing
- **OpenAI/Anthropic** - LLM integration
- **pytest** - Testing framework
- **Hypothesis** - Property-based testing

## 📁 Project Structure

```
legacy-facade/
├── frontend/                          # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/                    # Route pages
│   │   │   ├── Landingpage.tsx       # API type selection
│   │   │   ├── AnalyzerPage.tsx      # REST API analyzer
│   │   │   ├── SOAPAnalyzerPage.tsx  # SOAP API analyzer
│   │   │   └── PortalPage.tsx        # Generated portal container
│   │   │
│   │   ├── components/               # React components
│   │   │   ├── Dashboard.tsx         # Portal dashboard with stats
│   │   │   ├── ResourceList.tsx      # List view with bulk actions
│   │   │   ├── ResourceDetail.tsx    # Detail view
│   │   │   ├── ResourceForm.tsx      # Create/edit forms
│   │   │   ├── ResourceActivity.tsx  # Activity log
│   │   │   ├── ResourceSettings.tsx  # Per-resource settings
│   │   │   ├── BulkActionsBar.tsx    # Bulk operations UI
│   │   │   ├── FieldRenderer.tsx     # Smart field display
│   │   │   ├── DeployToVercelButton.tsx
│   │   │   ├── Sidebar.tsx           # Navigation
│   │   │   ├── SpookyBackground.tsx  # Animated background
│   │   │   ├── SpookyLoader.tsx      # Loading animations
│   │   │   │
│   │   │   ├── SchemaReview/         # Schema editing components
│   │   │   │   ├── SchemaReviewStep.tsx
│   │   │   │   ├── FieldsEditor.tsx
│   │   │   │   ├── OperationsToggle.tsx
│   │   │   │   └── ResourceCard.tsx
│   │   │   │
│   │   │   ├── UICustomization/      # UI config components
│   │   │   │   ├── UICustomizationStep.tsx
│   │   │   │   ├── FeatureToggleGroup.tsx
│   │   │   │   ├── ThemeSelector.tsx
│   │   │   │   └── OutputOptions.tsx
│   │   │   │
│   │   │   └── ui/                   # shadcn/ui components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── select.tsx
│   │   │       ├── table.tsx
│   │   │       └── ...
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── ProjectGenerator.ts   # Download project generator
│   │   │   └── templates/            # Code generation templates
│   │   │       ├── portal/           # Portal component templates
│   │   │       ├── proxy/            # Proxy server templates
│   │   │       ├── components/       # Component templates
│   │   │       └── baseTemplates.ts
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   └── csvExport.ts          # CSV export functionality
│   │   │
│   │   ├── context/                  # React context
│   │   │   └── SchemaContext.tsx     # Schema state management
│   │   │
│   │   ├── types/                    # TypeScript types
│   │   │   └── schemaTypes.ts
│   │   │
│   │   ├── lib/                      # Libraries
│   │   │   └── utils.ts              # Tailwind utilities
│   │   │
│   │   ├── App.tsx                   # Root component
│   │   ├── App.css                   # Global styles
│   │   └── main.tsx                  # Entry point
│   │
│   ├── public/                       # Static assets
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── vite.config.ts                # Vite config
│   └── tailwind.config.js            # Tailwind config
│
├── backend/                           # FastAPI + Python 3.11
│   ├── app/
│   │   ├── api/                      # API endpoints
│   │   │   ├── analyze.py            # API analysis endpoint
│   │   │   ├── clean_names.py        # LLM name cleaning
│   │   │   ├── deploy.py             # Vercel deployment
│   │   │   ├── proxy.py              # Proxy forwarding
│   │   │   └── proxy_config.py       # Proxy configuration
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── openapi_analyzer.py   # OpenAPI parser
│   │   │   ├── json_analyzer.py      # JSON inference
│   │   │   ├── endpoint_analyzer.py  # Live endpoint tester
│   │   │   ├── wsdl_analyzer.py      # WSDL parser
│   │   │   ├── soap_xml_analyzer.py  # SOAP XML parser
│   │   │   ├── soap_endpoint_analyzer.py
│   │   │   ├── soap_request_builder.py
│   │   │   ├── soap_response_parser.py
│   │   │   ├── schema_normalizer.py  # Schema normalization
│   │   │   ├── proxy_forwarder.py    # Request forwarding
│   │   │   ├── proxy_config_manager.py
│   │   │   ├── field_mapper.py       # Field transformation
│   │   │   ├── vercel_deployer.py    # Vercel deployment
│   │   │   ├── vercel_api_client.py  # Vercel API
│   │   │   ├── vercel_frontend_generator.py
│   │   │   └── vercel_proxy_generator.py
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   ├── llm_name_converter.py # AI field naming
│   │   │   ├── type_inference.py     # Type detection
│   │   │   ├── primary_key_detector.py
│   │   │   ├── response_unwrapper.py # Nested response handling
│   │   │   ├── http_client.py        # HTTP utilities
│   │   │   └── error_normalizer.py   # Error handling
│   │   │
│   │   ├── models/                   # Pydantic models
│   │   │   ├── request_models.py     # Request schemas
│   │   │   ├── response_models.py    # Response schemas
│   │   │   └── deployment_models.py  # Deployment schemas
│   │   │
│   │   ├── core/                     # Core configuration
│   │   │   ├── config.py             # App config
│   │   │   └── llm_client.py         # LLM integration
│   │   │
│   │   └── main.py                   # FastAPI app
│   │
│   ├── tests/                        # Test suite (219 tests)
│   │   ├── test_openapi_analyzer.py
│   │   ├── test_json_analyzer.py
│   │   ├── test_endpoint_analyzer.py
│   │   ├── test_wsdl_analyzer.py
│   │   ├── test_soap_xml_analyzer.py
│   │   ├── test_integration.py
│   │   ├── test_llm_name_converter.py
│   │   └── ...
│   │
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment template
│   └── README.md                     # Backend docs
│
├── scripts/                           # Utility scripts
│   ├── deploy_frontend.sh            # Frontend deployment
│   └── test_soap_validation.sh       # SOAP testing
│
├── .kiro/                            # Kiro AI configuration
│   ├── specs/                        # Feature specifications
│   │   ├── api-introspection/
│   │   ├── smart-proxy-layer/
│   │   ├── vercel-deployment/
│   │   ├── schema-customization/
│   │   └── ui-enhancement/
│   │
│   ├── steering/                     # Development guidelines
│   │   ├── project-overview.md
│   │   ├── tech.md
│   │   ├── structure.md
│   │   └── ...
│   │
│   ├── summary-documents/            # Documentation archive
│   │   └── PROJECT_CLEANUP_SUMMARY.md
│   │
│   └── hooks/                        # Git hooks
│       ├── lint-on-save.json
│       └── build-check.json
│
├── .gitignore                        # Git ignore rules
├── LICENSE                           # MIT License
└── README.md                         # This file
```

## 🎯 Use Cases

1. **Internal Tools Modernization**
   - HR systems from 2010
   - Inventory management
   - Admin dashboards

2. **Legacy API Documentation**
   - Generate interactive docs
   - Test API endpoints
   - Explore data structures

3. **Rapid Prototyping**
   - Quick UI for new APIs
   - Demo interfaces
   - Client presentations

4. **API Migration Planning**
   - Understand existing APIs
   - Plan gradual migration
   - Maintain old UI during rewrite

## 🔒 Security

- ✅ CORS properly configured
- ✅ Input validation with Pydantic
- ✅ Request size limits (10MB)
- ✅ Timeout protection (30s)
- ✅ Credentials never persisted
- ✅ SSRF prevention (TODO)
- ✅ Rate limiting (TODO)

## ✅ Completed Features

- ✅ **REST API Support** - OpenAPI, endpoints, JSON samples
- ✅ **SOAP API Support** - WSDL, SOAP endpoints, XML samples
- ✅ **Schema Review** - Interactive field and operation editing
- ✅ **UI Customization** - Dashboard, list view, theme configuration
- ✅ **Smart Proxy Layer** - Authentication, CORS, field mapping
- ✅ **Download Project** - Complete standalone React + Node.js project
- ✅ **Vercel Deployment** - One-click deployment with serverless functions
- ✅ **Bulk Actions** - Multi-select, bulk delete, CSV export
- ✅ **Activity Logging** - Track all operations
- ✅ **Smart Field Rendering** - Auto-format dates, emails, URLs, booleans
- ✅ **LLM Field Cleaning** - AI-powered field name beautification
- ✅ **Multiple Auth Types** - Bearer, API Key, Basic, WSSE
- ✅ **Type Inference** - Automatic field type detection
- ✅ **Primary Key Detection** - Smart ID field identification

## 🚧 Roadmap

- [ ] **Spec Drift Detection** - Compare OpenAPI spec with live API
- [ ] **Custom Transformations** - User-defined data mapping rules
- [ ] **Multi-tenant Support** - Manage multiple APIs
- [ ] **Analytics Dashboard** - Track API usage and performance
- [ ] **GraphQL Support** - Analyze GraphQL schemas
- [ ] **WebSocket Support** - Real-time data updates
- [ ] **API Versioning** - Handle multiple API versions
- [ ] **Automated Testing** - Generate test suites for APIs
- [ ] **Documentation Generator** - Auto-generate API docs
- [ ] **Migration Assistant** - Help plan API migrations

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎃 Hackathon Categories

- ✅ **Resurrection** - Bringing dead UIs back to life
- ✅ **Frankenstein** - Stitching APIs + UIs together
- ✅ **Best Startup Project** - Solves real business problem

## 🙏 Acknowledgments

- Built with [Kiro](https://kiro.dev) - AI-powered development environment
- Inspired by companies struggling with legacy internal tools
- Halloween theme because resurrecting dead code is spooky 👻

## 📞 Support

For questions or issues, please open a GitHub issue.

---

**Made with 💀 for Kiroween 2025**
