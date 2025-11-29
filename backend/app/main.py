"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analyze import router as analyze_router

app = FastAPI(
    title="Backend API Analyzer",
    description="Analyze API specifications and generate normalized resource schemas",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_router, prefix="/api", tags=["analyze"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "Backend API Analyzer"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
