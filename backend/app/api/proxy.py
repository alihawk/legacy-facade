"""Proxy CRUD API endpoints.

Provides REST API endpoints that forward requests to legacy APIs
through the smart proxy layer, handling authentication, field mapping,
and protocol translation (REST/SOAP).
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from typing import Any

from ..services.proxy_forwarder import forward_request


router = APIRouter()


def _build_cors_headers() -> dict[str, str]:
    """Build CORS headers for proxy responses.
    
    Returns:
        Dictionary of CORS headers
    """
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


@router.get("/proxy/{resource}")
async def proxy_list(resource: str, request: Request) -> JSONResponse:
    """List all records for a resource.
    
    Forwards a list request to the legacy API, applying authentication,
    field mapping, and response normalization.
    
    Args:
        resource: Resource name (e.g., "users", "orders")
        request: FastAPI request object (for query parameters)
        
    Returns:
        JSONResponse with list of records or error
        
    Example:
        GET /proxy/customers?status=active
        
        Response:
        [
            {"id": 1, "name": "John", "status": "active"},
            {"id": 2, "name": "Jane", "status": "active"}
        ]
    """
    # Extract query parameters
    query_params = dict(request.query_params)
    
    # Forward request to legacy API
    status_code, data = await forward_request(
        resource=resource,
        operation="list",
        query_params=query_params if query_params else None
    )
    
    # Return response with CORS headers
    return JSONResponse(
        content=data,
        status_code=status_code,
        headers=_build_cors_headers()
    )


@router.get("/proxy/{resource}/{id}")
async def proxy_detail(resource: str, id: str) -> JSONResponse:
    """Get a single record by ID.
    
    Forwards a detail request to the legacy API.
    
    Args:
        resource: Resource name
        id: Resource ID
        
    Returns:
        JSONResponse with single record or error
        
    Example:
        GET /proxy/customers/123
        
        Response:
        {
            "id": 123,
            "name": "John Doe",
            "email": "john@example.com"
        }
    """
    # Forward request to legacy API
    status_code, data = await forward_request(
        resource=resource,
        operation="detail",
        id=id
    )
    
    # Return response with CORS headers
    return JSONResponse(
        content=data,
        status_code=status_code,
        headers=_build_cors_headers()
    )


@router.post("/proxy/{resource}")
async def proxy_create(resource: str, request: Request) -> JSONResponse:
    """Create a new record.
    
    Forwards a create request to the legacy API with the provided data.
    
    Args:
        resource: Resource name
        request: FastAPI request object (for JSON body)
        
    Returns:
        JSONResponse with created record or error
        
    Example:
        POST /proxy/customers
        {
            "name": "John Doe",
            "email": "john@example.com"
        }
        
        Response:
        {
            "id": 123,
            "name": "John Doe",
            "email": "john@example.com"
        }
    """
    # Extract JSON body
    try:
        body = await request.json()
    except Exception:
        body = None
    
    # Forward request to legacy API
    status_code, data = await forward_request(
        resource=resource,
        operation="create",
        body=body
    )
    
    # Return response with CORS headers
    return JSONResponse(
        content=data,
        status_code=status_code,
        headers=_build_cors_headers()
    )


@router.put("/proxy/{resource}/{id}")
async def proxy_update(resource: str, id: str, request: Request) -> JSONResponse:
    """Update an existing record.
    
    Forwards an update request to the legacy API with the provided data.
    
    Args:
        resource: Resource name
        id: Resource ID
        request: FastAPI request object (for JSON body)
        
    Returns:
        JSONResponse with updated record or error
        
    Example:
        PUT /proxy/customers/123
        {
            "name": "John Smith",
            "email": "john.smith@example.com"
        }
        
        Response:
        {
            "id": 123,
            "name": "John Smith",
            "email": "john.smith@example.com"
        }
    """
    # Extract JSON body
    try:
        body = await request.json()
    except Exception:
        body = None
    
    # Forward request to legacy API
    status_code, data = await forward_request(
        resource=resource,
        operation="update",
        id=id,
        body=body
    )
    
    # Return response with CORS headers
    return JSONResponse(
        content=data,
        status_code=status_code,
        headers=_build_cors_headers()
    )


@router.delete("/proxy/{resource}/{id}")
async def proxy_delete(resource: str, id: str) -> JSONResponse:
    """Delete a record.
    
    Forwards a delete request to the legacy API.
    
    Args:
        resource: Resource name
        id: Resource ID
        
    Returns:
        JSONResponse with success message or error
        
    Example:
        DELETE /proxy/customers/123
        
        Response:
        {
            "status": "ok",
            "message": "Record deleted successfully"
        }
    """
    # Forward request to legacy API
    status_code, data = await forward_request(
        resource=resource,
        operation="delete",
        id=id
    )
    
    # Return response with CORS headers
    return JSONResponse(
        content=data,
        status_code=status_code,
        headers=_build_cors_headers()
    )


@router.options("/proxy/{resource}")
@router.options("/proxy/{resource}/{id}")
async def proxy_options(resource: str, id: str | None = None) -> JSONResponse:
    """Handle CORS preflight requests.
    
    Responds to OPTIONS requests with appropriate CORS headers,
    allowing the browser to make cross-origin requests.
    
    Args:
        resource: Resource name
        id: Optional resource ID
        
    Returns:
        Empty JSONResponse with CORS headers
    """
    return JSONResponse(
        content={},
        status_code=200,
        headers=_build_cors_headers()
    )
