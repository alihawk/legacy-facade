# 🎃 Legacy UX Reviver

**Kiroween 2025 Hackathon Project** - Resurrection Category

> Bring your dead APIs back to life with beautiful, modern UIs. No backend changes required.

[![Backend Tests](https://img.shields.io/badge/tests-219%20passing-success)](backend/tests/)
[![Frontend](https://img.shields.io/badge/frontend-React%2019-blue)](frontend/)
[![Backend](https://img.shields.io/badge/backend-FastAPI-green)](backend/)

## 🌟 The Problem

Companies have internal tools from 2010 with terrible UIs. The backend APIs work fine, but the UX makes employees miserable. Full rewrites cost $100K+ and take months. Productivity suffers because people hate using the tools.

## 💡 The Solution

**Auto-generate modern React frontends from existing legacy APIs with ZERO backend changes.** Deploy in days, not months.

## ✨ Features

- 🔍 **Smart API Analysis** - Analyzes OpenAPI specs, live endpoints, or JSON samples
- 🤖 **LLM-Powered** - Uses AI to generate human-readable field names from cryptic database columns
- 🎨 **Beautiful UI** - Modern, dark-themed interface with spooky Halloween aesthetic
- 🚀 **Zero Backend Changes** - Works with your existing APIs as-is
- 📊 **Dynamic CRUD** - Automatically generates list, detail, create, and edit views
- 🔐 **Auth Support** - Handles Bearer, API Key, and Basic authentication
- 🎯 **Type Inference** - Automatically detects field types (email, date, number, etc.)
- 🔑 **Smart Primary Keys** - Heuristic detection of ID fields

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                    │
│  • Spooky analyzer interface                                │
│  • Dynamic portal generation                                │
│  • CRUD components for any API                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP POST /api/analyze
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend (FastAPI + Python)                    │
│  • OpenAPI spec parser                                      │
│  • Live endpoint introspection                              │
│  • JSON sample inference                                    │
│  • LLM-based name generation (OpenAI/Anthropic)             │
│  • Type inference & primary key detection                   │
└─────────────────────────────────────────────────────────────┘
```

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

## 📖 Usage

### 1. Analyze Your API

Open http://localhost:5173 and choose one of three methods:

#### Method A: OpenAPI Spec
- Paste your OpenAPI/Swagger spec (JSON or YAML)
- Or upload a spec file
- Or provide a URL to your spec

#### Method B: Live Endpoint
- Enter your API base URL
- Provide endpoint path
- Add authentication if needed
- System will introspect the live API

#### Method C: JSON Sample
- Paste a sample JSON response
- Provide endpoint path
- System will infer the schema

### 2. Generate Portal

Click "Analyze & Resurrect" to analyze your API, then "Generate Portal" to create your modern UI.

### 3. Use Your Portal

Navigate through your resources with:
- **List View** - Browse all records with search and filters
- **Detail View** - View individual record details
- **Create** - Add new records with smart forms
- **Edit** - Update existing records
- **Delete** - Remove records with confirmation

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

## 📚 API Documentation

Once the backend is running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### API Endpoint

```
POST /api/analyze
```

**Request Body:**
```json
{
  "mode": "openapi" | "openapi_url" | "endpoint" | "json_sample",
  "specJson": {...},           // For openapi mode
  "specUrl": "https://...",    // For openapi_url mode
  "baseUrl": "https://...",    // For endpoint mode
  "endpointPath": "/api/...",  // For endpoint/json_sample modes
  "method": "GET",             // HTTP method
  "authType": "bearer",        // Auth type
  "authValue": "token",        // Auth credentials
  "sampleJson": {...}          // For json_sample mode
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
      "operations": ["list", "detail", "create", "update"]
    }
  ]
}
```

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
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   │   ├── AnalyzerPage.tsx
│   │   │   └── PortalPage.tsx
│   │   ├── components/      # Reusable components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ResourceList.tsx
│   │   │   ├── ResourceDetail.tsx
│   │   │   └── ResourceForm.tsx
│   │   └── App.tsx
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   │   └── analyze.py
│   │   ├── services/        # Business logic
│   │   │   ├── openapi_analyzer.py
│   │   │   ├── endpoint_analyzer.py
│   │   │   ├── json_analyzer.py
│   │   │   └── schema_normalizer.py
│   │   ├── utils/           # Utilities
│   │   │   ├── llm_name_converter.py
│   │   │   ├── type_inference.py
│   │   │   ├── primary_key_detector.py
│   │   │   └── response_unwrapper.py
│   │   ├── models/          # Data models
│   │   └── core/            # Core config
│   ├── tests/               # Test suite (219 tests)
│   └── requirements.txt
│
├── .kiro/                    # Kiro specs
│   └── specs/
│       └── backend-api-analyzer/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── start-dev.sh             # Development startup script
├── INTEGRATION_GUIDE.md     # Integration documentation
└── README.md                # This file
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

## 🚧 Roadmap

- [ ] **Proxy Layer** - Forward CRUD requests to legacy API
- [ ] **Spec Drift Detection** - Compare OpenAPI spec with live API
- [ ] **Custom Transformations** - User-defined data mapping rules
- [ ] **Multi-tenant Support** - Manage multiple APIs
- [ ] **Analytics Dashboard** - Track API usage
- [ ] **Export Portal** - Download generated React code
- [ ] **GraphQL Support** - Analyze GraphQL schemas
- [ ] **WebSocket Support** - Real-time data updates

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
