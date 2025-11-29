# Backend API Analyzer

FastAPI service that analyzes API specifications and generates normalized resource schemas.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `POST /api/analyze` - Analyze API specifications
- `GET /health` - Health check

## Modes

- `openapi` - Parse OpenAPI JSON/YAML spec
- `openapi_url` - Fetch and parse OpenAPI spec from URL
- `endpoint` - Introspect live API endpoint
- `json_sample` - Infer schema from JSON sample

## Testing

```bash
pytest
```

## Type Checking

```bash
mypy app
```

## Linting

```bash
ruff check app
```
