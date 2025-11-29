"""Main analyze endpoint for API introspection."""

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from app.models.request_models import AnalyzeRequest
from app.services.endpoint_analyzer import analyze_endpoint
from app.services.json_analyzer import analyze_json_sample
from app.services.openapi_analyzer import analyze_openapi_spec, analyze_openapi_url
from app.services.schema_normalizer import normalize_resources
from app.utils.llm_name_converter import clear_cache

logger = logging.getLogger(__name__)

router = APIRouter()

# Maximum payload size: 10MB
MAX_PAYLOAD_SIZE = 10 * 1024 * 1024


@router.post("/analyze")
async def analyze(request: Request) -> JSONResponse:
    """Analyze API and extract resource schemas.

    Supports multiple modes:
    - openapi: Parse OpenAPI spec (JSON or YAML)
    - openapi_url: Fetch and parse OpenAPI spec from URL
    - endpoint: Make live request to API endpoint
    - json_sample: Infer schema from JSON sample

    Returns:
        JSONResponse with {"resources": [...]}

    Raises:
        HTTPException: Various error codes based on failure type
    """
    # Check payload size
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_PAYLOAD_SIZE:
        logger.warning("Payload too large: %s bytes", content_length)
        raise HTTPException(
            status_code=413,
            detail=f"Payload too large. Maximum size is {MAX_PAYLOAD_SIZE} bytes (10MB)",
        )

    # Parse request body
    try:
        body = await request.json()
        analyze_request = AnalyzeRequest(**body)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON: %s", e)
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")
    except Exception as e:
        logger.error("Invalid request: %s", e)
        raise HTTPException(status_code=400, detail=f"Invalid request: {e}")

    # Clear LLM name conversion cache for this request
    clear_cache()

    # Route to appropriate analyzer based on mode
    try:
        if analyze_request.mode == "openapi":
            resources = await _handle_openapi_mode(analyze_request)
        elif analyze_request.mode == "openapi_url":
            resources = await _handle_openapi_url_mode(analyze_request)
        elif analyze_request.mode == "endpoint":
            resources = await _handle_endpoint_mode(analyze_request)
        elif analyze_request.mode == "json_sample":
            resources = await _handle_json_sample_mode(analyze_request)
        else:
            raise HTTPException(
                status_code=400, detail=f"Invalid mode: {analyze_request.mode}"
            )

        # Normalize and validate resources
        result = normalize_resources(resources)

        logger.info(
            "Successfully analyzed %s resources in mode=%s",
            len(resources),
            analyze_request.mode,
        )

        return JSONResponse(content=result, status_code=200)

    except ValueError as e:
        # Handle validation errors (no resources, invalid spec, etc.)
        logger.error("Validation error: %s", e)
        if "No resources found" in str(e) or "cannot be empty" in str(e):
            raise HTTPException(status_code=422, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        # Catch-all for unexpected errors
        logger.exception("Unexpected error during analysis")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


async def _handle_openapi_mode(request: AnalyzeRequest) -> list:
    """Handle mode="openapi"."""
    if not request.specJson:
        raise HTTPException(
            status_code=400, detail="specJson is required for mode='openapi'"
        )

    try:
        resources = await analyze_openapi_spec(request.specJson)
        return resources
    except ValueError as e:
        if "Invalid OpenAPI specification" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        raise


async def _handle_openapi_url_mode(request: AnalyzeRequest) -> list:
    """Handle mode="openapi_url"."""
    if not request.specUrl:
        raise HTTPException(
            status_code=400, detail="specUrl is required for mode='openapi_url'"
        )

    try:
        resources = await analyze_openapi_url(str(request.specUrl))
        return resources
    except ValueError as e:
        if "Unable to fetch" in str(e) or "timeout" in str(e).lower():
            raise HTTPException(status_code=503, detail=str(e))
        if "Invalid OpenAPI specification" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        raise


async def _handle_endpoint_mode(request: AnalyzeRequest) -> list:
    """Handle mode="endpoint"."""
    if not request.baseUrl or not request.endpointPath:
        raise HTTPException(
            status_code=400,
            detail="baseUrl and endpointPath are required for mode='endpoint'",
        )

    # Parse custom headers if provided
    custom_headers = None
    if request.customHeaders:
        try:
            custom_headers = json.loads(request.customHeaders)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid customHeaders JSON: {e}"
            )

    # Handle auth
    auth_type = None if request.authType == "none" else request.authType
    auth_value = request.authValue if auth_type else None

    try:
        resources = await analyze_endpoint(
            base_url=str(request.baseUrl),
            endpoint_path=request.endpointPath,
            method=request.method or "GET",
            auth_type=auth_type,
            auth_value=auth_value,
            custom_headers=custom_headers,
        )
        return resources
    except ValueError as e:
        if "Unable to reach endpoint" in str(e) or "timeout" in str(e).lower():
            raise HTTPException(status_code=503, detail=str(e))
        raise


async def _handle_json_sample_mode(request: AnalyzeRequest) -> list:
    """Handle mode="json_sample"."""
    if not request.sampleJson:
        raise HTTPException(
            status_code=400, detail="sampleJson is required for mode='json_sample'"
        )

    try:
        resources = await analyze_json_sample(request.sampleJson)
        return resources
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
