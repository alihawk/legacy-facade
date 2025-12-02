"""Proxy request forwarder.

Forwards requests from the frontend to legacy REST or SOAP APIs,
handling authentication, field mapping, and error normalization.
"""

import httpx
from typing import Any
from fastapi import HTTPException

from .proxy_config_manager import proxy_config_manager
from .field_mapper import map_fields
from ..models.proxy_models import ProxyConfig, ResourceConfig
from ..utils.auth_builder import build_rest_auth_headers
from ..utils.path_resolver import resolve_path
from ..utils.error_normalizer import (
    normalize_error,
    normalize_timeout_error,
    normalize_connection_error
)
from ..utils.response_unwrapper import unwrap_response, unwrap_by_path


async def forward_request(
    resource: str,
    operation: str,
    id: str | None = None,
    body: dict[str, Any] | None = None,
    query_params: dict[str, str] | None = None
) -> tuple[int, dict[str, Any] | list[dict[str, Any]]]:
    """Forward a request to the legacy API.
    
    Main entry point for proxy forwarding. Routes to REST or SOAP handler
    based on the configured API type.
    
    Args:
        resource: Resource name (e.g., "users", "orders")
        operation: Operation name ("list", "detail", "create", "update", "delete")
        id: Resource ID for detail/update/delete operations
        body: Request body for create/update operations
        query_params: Query parameters for list operations
        
    Returns:
        Tuple of (status_code, response_data)
        
    Raises:
        HTTPException: If proxy is not configured or resource not found
    """
    # Get proxy configuration
    config = proxy_config_manager.get_config()
    if not config:
        raise HTTPException(
            status_code=400,
            detail="Proxy not configured. Please configure the proxy first."
        )
    
    # Get resource configuration
    resource_config = proxy_config_manager.get_resource_config(resource)
    if not resource_config:
        raise HTTPException(
            status_code=404,
            detail=f"Resource '{resource}' not found in proxy configuration"
        )
    
    # Route to appropriate handler based on API type
    if config.apiType == "rest":
        return await _forward_rest_request(
            config=config,
            resource_config=resource_config,
            operation=operation,
            id=id,
            body=body,
            query_params=query_params
        )
    elif config.apiType == "soap":
        return await _forward_soap_request(
            config=config,
            resource_config=resource_config,
            operation=operation,
            id=id,
            body=body
        )
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Unsupported API type: {config.apiType}"
        )


async def _forward_rest_request(
    config: ProxyConfig,
    resource_config: ResourceConfig,
    operation: str,
    id: str | None,
    body: dict[str, Any] | None,
    query_params: dict[str, str] | None
) -> tuple[int, dict[str, Any] | list[dict[str, Any]]]:
    """Forward a REST API request to the legacy backend.
    
    Handles the complete REST request flow:
    1. Determine HTTP method and path (from config or heuristics)
    2. Build authentication headers
    3. Map request body fields (normalized → legacy)
    4. Make HTTP request
    5. Unwrap response if needed
    6. Map response fields (legacy → normalized)
    7. Handle errors
    
    Args:
        config: Complete proxy configuration
        resource_config: Configuration for this specific resource
        operation: Operation name
        id: Resource ID (for detail/update/delete)
        body: Request body (for create/update)
        query_params: Query parameters (for list)
        
    Returns:
        Tuple of (status_code, response_data)
    """
    # Get operation config or use REST heuristics
    if operation in resource_config.operations and resource_config.operations[operation].rest:
        # Use configured operation
        rest_config = resource_config.operations[operation].rest
        method = rest_config.method
        path_template = rest_config.path
    else:
        # Use REST heuristics
        method, path_template = _get_rest_heuristic(resource_config, operation, id)
    
    # Resolve path parameters
    path_params = {"id": id} if id else {}
    try:
        resolved_path = resolve_path(path_template, path_params)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Build full URL
    url = f"{config.baseUrl.rstrip('/')}{resolved_path}"
    
    # Build authentication headers
    headers = build_rest_auth_headers(config.auth)
    headers["Content-Type"] = "application/json"
    
    # Map request body fields (normalized → legacy)
    if body and resource_config.fieldMappings:
        body = map_fields(body, resource_config.fieldMappings, reverse=False)
    
    # Make HTTP request
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                json=body if body else None,
                params=query_params if query_params else None
            )
            
            # Handle error responses
            if response.status_code >= 400:
                try:
                    error_body = response.json()
                except Exception:
                    error_body = response.text
                
                error_response = normalize_error(
                    status_code=response.status_code,
                    response_body=error_body,
                    context=f"{operation} {resource}"
                )
                return (response.status_code, error_response)
            
            # Parse successful response
            try:
                response_data = response.json()
            except Exception:
                # Non-JSON response
                return (response.status_code, {"data": response.text})
            
            # Unwrap response using explicit path or heuristics
            if resource_config.responsePath:
                # Use explicit path-based unwrapping
                response_data = unwrap_by_path(response_data, resource_config.responsePath)
            else:
                # Fall back to heuristic unwrapping
                response_data = unwrap_response(response_data)
            
            # Map response fields (legacy → normalized)
            if resource_config.fieldMappings:
                response_data = map_fields(response_data, resource_config.fieldMappings, reverse=True)
            
            return (response.status_code, response_data)
            
    except httpx.TimeoutException:
        error_response = normalize_timeout_error(context=f"{operation} {resource}")
        return (503, error_response)
        
    except httpx.ConnectError as e:
        error_response = normalize_connection_error(
            error_message=str(e),
            context=f"{operation} {resource}"
        )
        return (503, error_response)
        
    except Exception as e:
        # Unexpected error
        error_response = normalize_error(
            status_code=500,
            response_body={"error": str(e)},
            context=f"{operation} {resource}"
        )
        return (500, error_response)


def _get_rest_heuristic(
    resource_config: ResourceConfig,
    operation: str,
    id: str | None
) -> tuple[str, str]:
    """Get REST method and path using standard heuristics.
    
    Provides default REST patterns when operation is not explicitly configured.
    
    Args:
        resource_config: Resource configuration
        operation: Operation name
        id: Resource ID (for operations that need it)
        
    Returns:
        Tuple of (HTTP method, path template)
        
    Raises:
        HTTPException: If operation is not supported
    """
    endpoint = resource_config.endpoint
    
    if operation == "list":
        return ("GET", endpoint)
    
    elif operation == "detail":
        return ("GET", f"{endpoint}/{{id}}")
    
    elif operation == "create":
        return ("POST", endpoint)
    
    elif operation == "update":
        return ("PUT", f"{endpoint}/{{id}}")
    
    elif operation == "delete":
        return ("DELETE", f"{endpoint}/{{id}}")
    
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported operation: {operation}"
        )


async def _forward_soap_request(
    config: ProxyConfig,
    resource_config: ResourceConfig,
    operation: str,
    id: str | None,
    body: dict[str, Any] | None
) -> tuple[int, dict[str, Any] | list[dict[str, Any]]]:
    """Forward a SOAP API request to the legacy backend.
    
    Handles the complete SOAP request flow:
    1. Get SOAP operation configuration
    2. Build parameters (including ID and body)
    3. Map request fields (normalized → legacy)
    4. Build SOAP XML request
    5. Build SOAP headers
    6. Make HTTP POST request
    7. Parse SOAP response
    8. Map response fields (legacy → normalized)
    9. Handle SOAP faults and errors
    
    Args:
        config: Complete proxy configuration
        resource_config: Configuration for this specific resource
        operation: Operation name
        id: Resource ID (for detail/update/delete)
        body: Request body (for create/update)
        
    Returns:
        Tuple of (status_code, response_data)
    """
    # Import SOAP-specific modules
    from .soap_request_builder import build_soap_request
    from .soap_response_parser import parse_soap_response, SoapFaultError
    from ..utils.auth_builder import build_soap_headers
    from ..utils.error_normalizer import normalize_soap_fault
    
    # Get SOAP operation configuration
    if operation not in resource_config.operations:
        return (400, {
            "error": {
                "code": "OPERATION_NOT_CONFIGURED",
                "status": 400,
                "message": f"SOAP operation '{operation}' not configured for resource '{resource_config.name}'"
            }
        })
    
    operation_config = resource_config.operations[operation]
    if not operation_config.soap:
        return (400, {
            "error": {
                "code": "SOAP_CONFIG_MISSING",
                "status": 400,
                "message": f"SOAP configuration missing for operation '{operation}'"
            }
        })
    
    soap_config = operation_config.soap
    operation_name = soap_config.operationName
    soap_action = soap_config.soapAction
    
    # Build parameters dictionary
    parameters: dict[str, Any] = {}
    
    # Add ID parameter if provided (for detail/update/delete operations)
    if id:
        # Use primary key field name or default to "id"
        id_field = resource_config.primaryKey if hasattr(resource_config, 'primaryKey') else "id"
        parameters[id_field] = id
    
    # Add body parameters if provided (for create/update operations)
    if body:
        # Map fields from normalized to legacy format
        if resource_config.fieldMappings:
            body = map_fields(body, resource_config.fieldMappings, reverse=False)
        
        # Merge body into parameters
        parameters.update(body)
    
    # Build SOAP request XML
    try:
        soap_xml = build_soap_request(
            operation_name=operation_name,
            namespace=config.soapNamespace or "http://tempuri.org/",
            parameters=parameters if parameters else None,
            auth_config=config.auth
        )
    except Exception as e:
        return (500, {
            "error": {
                "code": "SOAP_BUILD_ERROR",
                "status": 500,
                "message": f"Failed to build SOAP request: {str(e)}"
            }
        })
    
    # Build HTTP headers for SOAP request
    headers = build_soap_headers(soap_action, config.auth)
    
    # Make HTTP POST request to SOAP endpoint
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url=config.baseUrl,
                content=soap_xml,
                headers=headers
            )
            
            # Handle non-200 responses
            if response.status_code != 200:
                error_response = normalize_error(
                    status_code=response.status_code,
                    response_body=response.text,
                    context=f"SOAP {operation} {resource_config.name}"
                )
                return (response.status_code, error_response)
            
            # Parse SOAP response
            try:
                response_data = parse_soap_response(
                    xml_content=response.text,
                    operation_name=operation_name
                )
            except SoapFaultError as e:
                # Handle SOAP Fault
                error_response = normalize_soap_fault(
                    fault_code=e.fault_code,
                    fault_string=e.fault_string,
                    context=f"{operation} {resource_config.name}"
                )
                return (500, error_response)
            except Exception as e:
                # Handle XML parsing errors
                return (500, {
                    "error": {
                        "code": "SOAP_PARSE_ERROR",
                        "status": 500,
                        "message": f"Failed to parse SOAP response: {str(e)}"
                    }
                })
            
            # Map response fields (legacy → normalized)
            if resource_config.fieldMappings:
                response_data = map_fields(response_data, resource_config.fieldMappings, reverse=True)
            
            return (200, response_data)
            
    except httpx.TimeoutException:
        error_response = normalize_timeout_error(context=f"SOAP {operation} {resource_config.name}")
        return (503, error_response)
        
    except httpx.ConnectError as e:
        error_response = normalize_connection_error(
            error_message=str(e),
            context=f"SOAP {operation} {resource_config.name}"
        )
        return (503, error_response)
        
    except Exception as e:
        # Unexpected error
        error_response = normalize_error(
            status_code=500,
            response_body={"error": str(e)},
            context=f"SOAP {operation} {resource_config.name}"
        )
        return (500, error_response)
