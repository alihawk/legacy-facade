"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analyze import router as analyze_router
from app.api.clean_names import router as clean_names_router
from app.api.proxy import router as proxy_router
from app.api.proxy_config import router as proxy_config_router
from app.api.deploy import router as deploy_router
from app.api.mock_data import router as mock_data_router

app = FastAPI(
    title="Backend API Analyzer",
    description="Analyze API specifications and generate normalized resource schemas",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_router, prefix="/api", tags=["analyze"])
app.include_router(clean_names_router, prefix="/api", tags=["clean-names"])
app.include_router(proxy_router, tags=["proxy"])
app.include_router(proxy_config_router, tags=["proxy-config"])
app.include_router(deploy_router, prefix="/api/deploy", tags=["deployment"])
app.include_router(mock_data_router, tags=["mock-data"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "Backend API Analyzer"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
