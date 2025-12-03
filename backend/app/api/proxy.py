"""Proxy CRUD API endpoints.

Provides REST API endpoints that forward requests to legacy APIs
through the smart proxy layer, handling authentication, field mapping,
and protocol translation (REST/SOAP).

Falls back to mock data when proxy is not configured.
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from typing import Any

from ..services.proxy_forwarder import forward_request
from ..services.proxy_config_manager import proxy_config_manager
from .mock_data import (
    MOCK_USERS, MOCK_ACTIVITY, MOCK_PRODUCTS,
    MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_ACCOUNTS, MOCK_TRANSACTIONS
)


router = APIRouter()


# Mock data mapping for fallback
MOCK_DATA_MAP = {
    "users": MOCK_USERS,
    "getallusers": MOCK_USERS,  # SOAP HR example
    "activity": MOCK_ACTIVITY,
    "products": MOCK_PRODUCTS,
    "customers": MOCK_CUSTOMERS,
    "getcustomers": MOCK_CUSTOMERS,  # SOAP Customer example
    "orders": MOCK_ORDERS,
    "getorders": MOCK_ORDERS,  # SOAP Order example
    "accounts": MOCK_ACCOUNTS,
    "getaccounts": MOCK_ACCOUNTS,  # SOAP Banking example
    "transactions": MOCK_TRANSACTIONS,
    "gettransactions": MOCK_TRANSACTIONS,  # SOAP Banking example
    "sample": MOCK_USERS,  # Default fallback for analyzed samples
}


def _get_primary_key(resource: str) -> str:
    """Get the primary key field name for a resource."""
    pk_map = {
        "users": "user_id",
        "getallusers": "user_id",
        "activity": "activity_id",
        "products": "product_id",
        "customers": "customer_id",
        "getcustomers": "customer_id",
        "orders": "order_id",
        "getorders": "order_id",
        "accounts": "account_id",
        "getaccounts": "account_id",
        "transactions": "transaction_id",
        "gettransactions": "transaction_id",
    }
    return pk_map.get(resource.lower(), "id")


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


def _get_mock_data(resource: str) -> list:
    """Get mock data for a resource, with fallback to generic data."""
    if resource.lower() in MOCK_DATA_MAP:
        return MOCK_DATA_MAP[resource.lower()]
    
    # Generate generic mock data for unknown resources
    return [
        {"id": i, "name": f"{resource.title()} Record {i}", "status": "active", "created_at": "2024-01-15"}
        for i in range(1, 11)
    ]


@router.get("/proxy/{resource}")
async def proxy_list(resource: str, request: Request) -> JSONResponse:
    """List all records for a resource.
    
    Forwards a list request to the legacy API, applying authentication,
    field mapping, and response normalization.
    
    Falls back to mock data if proxy is not configured or resource not found.
    
    Args:
        resource: Resource name (e.g., "users", "orders")
        request: FastAPI request object (for query parameters)
        
    Returns:
        JSONResponse with list of records or error
    """
    # Check if proxy is configured
    if not proxy_config_manager.is_configured():
        # Return mock data as fallback
        mock_data = _get_mock_data(resource)
        return JSONResponse(
            content={"data": mock_data},
            status_code=200,
            headers=_build_cors_headers()
        )
    
    # Check if resource exists in config (case-insensitive)
    resource_config = proxy_config_manager.get_resource_config(resource.lower())
    if not resource_config:
        # Resource not in config - return mock data for demo purposes
        mock_data = _get_mock_data(resource)
        return JSONResponse(
            content={"data": mock_data},
            status_code=200,
            headers=_build_cors_headers()
        )
    
    # Extract query parameters
    query_params = dict(request.query_params)
    
    # Forward request to legacy API
    try:
        status_code, data = await forward_request(
            resource=resource.lower(),
            operation="list",
            query_params=query_params if query_params else None
        )
    except Exception as e:
        # If forwarding fails, fall back to mock data
        print(f"Proxy forward failed for {resource}: {e}")
        mock_data = _get_mock_data(resource)
        return JSONResponse(
            content={"data": mock_data},
            status_code=200,
            headers=_build_cors_headers()
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
    Falls back to mock data if proxy is not configured or resource not found.
    
    Args:
        resource: Resource name
        id: Resource ID
        
    Returns:
        JSONResponse with single record or error
    """
    # Helper to get mock record
    def get_mock_record():
        mock_data = _get_mock_data(resource)
        pk_field = _get_primary_key(resource)
        try:
            id_val = int(id) if id.isdigit() else id
        except (ValueError, AttributeError):
            id_val = id
        return next((item for item in mock_data if item.get(pk_field) == id_val or item.get("id") == id_val), None)
    
    # Check if proxy is configured
    if not proxy_config_manager.is_configured():
        record = get_mock_record()
        if record:
            return JSONResponse(
                content={"data": record},
                status_code=200,
                headers=_build_cors_headers()
            )
        else:
            return JSONResponse(
                content={"error": f"{resource} with id {id} not found"},
                status_code=404,
                headers=_build_cors_headers()
            )
    
    # Check if resource exists in config (case-insensitive)
    resource_config = proxy_config_manager.get_resource_config(resource.lower())
    if not resource_config:
        # Resource not in config - return mock data
        record = get_mock_record()
        if record:
            return JSONResponse(
                content={"data": record},
                status_code=200,
                headers=_build_cors_headers()
            )
        else:
            return JSONResponse(
                content={"error": f"{resource} with id {id} not found"},
                status_code=404,
                headers=_build_cors_headers()
            )
    
    # Forward request to legacy API
    try:
        status_code, data = await forward_request(
            resource=resource.lower(),
            operation="detail",
            id=id
        )
    except Exception as e:
        # If forwarding fails, fall back to mock data
        print(f"Proxy forward failed for {resource}/{id}: {e}")
        record = get_mock_record()
        if record:
            return JSONResponse(
                content={"data": record},
                status_code=200,
                headers=_build_cors_headers()
            )
        else:
            return JSONResponse(
                content={"error": f"{resource} with id {id} not found"},
                status_code=404,
                headers=_build_cors_headers()
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
    Falls back to mock response if proxy is not configured or resource not found.
    
    Args:
        resource: Resource name
        request: FastAPI request object (for JSON body)
        
    Returns:
        JSONResponse with created record or error
    """
    # Extract JSON body
    try:
        body = await request.json()
    except Exception:
        body = {}
    
    # Helper to create mock response
    def mock_create_response():
        pk_field = _get_primary_key(resource)
        import random
        new_id = random.randint(10000, 99999)
        created_record = {pk_field: new_id, **body}
        return JSONResponse(
            content={"data": created_record, "message": "Record created (mock)"},
            status_code=201,
            headers=_build_cors_headers()
        )
    
    # Check if proxy is configured
    if not proxy_config_manager.is_configured():
        return mock_create_response()
    
    # Check if resource exists in config
    resource_config = proxy_config_manager.get_resource_config(resource.lower())
    if not resource_config:
        return mock_create_response()
    
    # Forward request to legacy API
    try:
        status_code, data = await forward_request(
            resource=resource.lower(),
            operation="create",
            body=body
        )
    except Exception as e:
        print(f"Proxy create failed for {resource}: {e}")
        return mock_create_response()
    
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
    Falls back to mock response if proxy is not configured or resource not found.
    
    Args:
        resource: Resource name
        id: Resource ID
        request: FastAPI request object (for JSON body)
        
    Returns:
        JSONResponse with updated record or error
    """
    # Extract JSON body
    try:
        body = await request.json()
    except Exception:
        body = {}
    
    # Helper to create mock response
    def mock_update_response():
        pk_field = _get_primary_key(resource)
        try:
            id_val = int(id) if id.isdigit() else id
        except (ValueError, AttributeError):
            id_val = id
        updated_record = {pk_field: id_val, **body}
        return JSONResponse(
            content={"data": updated_record, "message": "Record updated (mock)"},
            status_code=200,
            headers=_build_cors_headers()
        )
    
    # Check if proxy is configured
    if not proxy_config_manager.is_configured():
        return mock_update_response()
    
    # Check if resource exists in config
    resource_config = proxy_config_manager.get_resource_config(resource.lower())
    if not resource_config:
        return mock_update_response()
    
    # Forward request to legacy API
    try:
        status_code, data = await forward_request(
            resource=resource.lower(),
            operation="update",
            id=id,
            body=body
        )
    except Exception as e:
        print(f"Proxy update failed for {resource}/{id}: {e}")
        return mock_update_response()
    
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
    Falls back to mock response if proxy is not configured or resource not found.
    
    Args:
        resource: Resource name
        id: Resource ID
        
    Returns:
        JSONResponse with success message or error
    """
    # Helper for mock response
    def mock_delete_response():
        return JSONResponse(
            content={"status": "ok", "message": f"Record {id} deleted (mock)"},
            status_code=200,
            headers=_build_cors_headers()
        )
    
    # Check if proxy is configured
    if not proxy_config_manager.is_configured():
        return mock_delete_response()
    
    # Check if resource exists in config
    resource_config = proxy_config_manager.get_resource_config(resource.lower())
    if not resource_config:
        return mock_delete_response()
    
    # Forward request to legacy API
    try:
        status_code, data = await forward_request(
            resource=resource.lower(),
            operation="delete",
            id=id
        )
    except Exception as e:
        print(f"Proxy delete failed for {resource}/{id}: {e}")
        return mock_delete_response()
    
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
