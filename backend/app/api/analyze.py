"""API endpoint for analyzing API specifications.

Supports both REST and SOAP API analysis modes.
Routes requests to the appropriate analyzer based on mode.
"""

import json
import logging

from fastapi import APIRouter, HTTPException

from app.models.request_models import AnalyzeRequest
from app.models.resource_schema import ResourceSchema
from app.services.schema_normalizer import normalize_resources

# REST analyzers
from app.services.openapi_analyzer import analyze_openapi_spec, analyze_openapi_url
from app.services.json_analyzer import analyze_json_sample
from app.services.endpoint_analyzer import analyze_endpoint

# SOAP analyzers
from app.services.wsdl_analyzer import analyze_wsdl, analyze_wsdl_url
from app.services.soap_xml_analyzer import analyze_soap_xml_sample
from app.services.soap_endpoint_analyzer import analyze_soap_endpoint

logger = logging.getLogger(__name__)

router = APIRouter()

# Maximum payload size (10MB)
MAX_PAYLOAD_SIZE = 10 * 1024 * 1024


@router.post("/analyze")
async def analyze_api(request: AnalyzeRequest):
    """Analyze an API specification and return normalized resource schemas.

    Supports multiple analysis modes:

    REST API modes:
    - openapi: Parse inline OpenAPI/Swagger spec (JSON or YAML)
    - openapi_url: Fetch and parse OpenAPI spec from URL
    - endpoint: Make HTTP request to endpoint and infer schema
    - json_sample: Infer schema from JSON sample response

    SOAP API modes:
    - wsdl: Parse inline WSDL spec
    - wsdl_url: Fetch and parse WSDL from URL
    - soap_endpoint: Make SOAP request to endpoint and infer schema
    - soap_xml_sample: Infer schema from SOAP XML response sample

    Returns:
        Dictionary with "resources" key containing list of ResourceSchema objects

    Raises:
        HTTPException: If analysis fails or request is invalid
    """
    try:
        mode = request.mode

        # === REST API Modes ===
        if mode == "openapi":
            resources = await _handle_openapi_mode(request)
        elif mode == "openapi_url":
            resources = await _handle_openapi_url_mode(request)
        elif mode == "endpoint":
            resources = await _handle_endpoint_mode(request)
        elif mode == "json_sample":
            resources = await _handle_json_sample_mode(request)

        # === SOAP API Modes ===
        elif mode == "wsdl":
            resources = await _handle_wsdl_mode(request)
        elif mode == "wsdl_url":
            resources = await _handle_wsdl_url_mode(request)
        elif mode == "soap_endpoint":
            resources = await _handle_soap_endpoint_mode(request)
        elif mode == "soap_xml_sample":
            resources = await _handle_soap_xml_sample_mode(request)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown analysis mode: {mode}. "
                f"Supported modes: openapi, openapi_url, endpoint, json_sample, "
                f"wsdl, wsdl_url, soap_endpoint, soap_xml_sample",
            )

        # Normalize and validate the resources
        return normalize_resources(resources)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(
            status_code=500, detail=f"Analysis failed: {str(e)}"
        ) from e


# === REST API Mode Handlers ===


async def _handle_openapi_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle OpenAPI spec analysis mode."""
    if not request.specJson:
        raise HTTPException(
            status_code=400, detail="specJson is required for openapi mode"
        )

    spec = request.specJson
    if isinstance(spec, str):
        try:
            spec = json.loads(spec)
        except json.JSONDecodeError:
            pass

    return await analyze_openapi_spec(spec)


async def _handle_openapi_url_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle OpenAPI URL analysis mode."""
    if not request.specUrl:
        raise HTTPException(
            status_code=400, detail="specUrl is required for openapi_url mode"
        )

    url = str(request.specUrl)
    return await analyze_openapi_url(url)


async def _handle_endpoint_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle REST endpoint analysis mode."""
    if not request.baseUrl or not request.endpointPath:
        raise HTTPException(
            status_code=400,
            detail="baseUrl and endpointPath are required for endpoint mode",
        )

    custom_headers = None
    if request.customHeaders:
        if isinstance(request.customHeaders, str):
            try:
                custom_headers = json.loads(request.customHeaders)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400, detail="Invalid JSON in customHeaders"
                )
        else:
            custom_headers = request.customHeaders

    return await analyze_endpoint(
        base_url=request.baseUrl,
        endpoint_path=request.endpointPath,
        method=request.method or "GET",
        auth_type=request.authType,
        auth_value=request.authValue,
        custom_headers=custom_headers,
    )


async def _handle_json_sample_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle JSON sample analysis mode."""
    if not request.sampleJson:
        raise HTTPException(
            status_code=400, detail="sampleJson is required for json_sample mode"
        )

    resources = await analyze_json_sample(request.sampleJson)

    if resources and request.endpointPath:
        resources[0].endpoint = request.endpointPath

    return resources


# === SOAP API Mode Handlers ===


async def _handle_wsdl_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle WSDL spec analysis mode."""
    if not request.wsdlContent:
        raise HTTPException(
            status_code=400, detail="wsdlContent is required for wsdl mode"
        )

    return await analyze_wsdl(request.wsdlContent)


async def _handle_wsdl_url_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle WSDL URL analysis mode."""
    if not request.wsdlUrl:
        raise HTTPException(
            status_code=400, detail="wsdlUrl is required for wsdl_url mode"
        )

    url = str(request.wsdlUrl)
    return await analyze_wsdl_url(url)


async def _handle_soap_endpoint_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle SOAP endpoint analysis mode."""
    if not request.baseUrl or not request.soapAction:
        raise HTTPException(
            status_code=400,
            detail="baseUrl and soapAction are required for soap_endpoint mode",
        )

    return await analyze_soap_endpoint(
        base_url=request.baseUrl,
        soap_action=request.soapAction,
        auth_type=request.authType,
        username=request.username,
        password=request.password,
        wsse_token=request.wsseToken,
    )


async def _handle_soap_xml_sample_mode(request: AnalyzeRequest) -> list[ResourceSchema]:
    """Handle SOAP XML sample analysis mode."""
    if not request.sampleXml:
        raise HTTPException(
            status_code=400, detail="sampleXml is required for soap_xml_sample mode"
        )

    if not request.operationName:
        raise HTTPException(
            status_code=400,
            detail="operationName is required for soap_xml_sample mode",
        )

    return await analyze_soap_xml_sample(
        xml_content=request.sampleXml,
        operation_name=request.operationName,
        base_url=request.baseUrl,
        soap_action=request.soapAction,
    )