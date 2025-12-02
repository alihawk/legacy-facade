"""Proxy configuration API endpoints.

Provides REST API endpoints for managing proxy configuration,
allowing the frontend to configure how requests are forwarded
to legacy REST or SOAP APIs.
"""

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from ..models.proxy_models import ProxyConfigRequest, ProxyConfig
from ..services.proxy_config_manager import proxy_config_manager


router = APIRouter()


@router.post("/api/proxy/config")
async def set_proxy_config(config_request: ProxyConfigRequest) -> dict:
    """Set proxy configuration.
    
    Validates and stores the proxy configuration for forwarding requests
    to a legacy API.
    
    Args:
        config_request: Proxy configuration including baseUrl, apiType,
                       auth settings, and resource mappings
                       
    Returns:
        Success message with status
        
    Raises:
        HTTPException: If configuration is invalid (400)
        
    Example:
        POST /api/proxy/config
        {
            "baseUrl": "https://legacy-api.example.com",
            "apiType": "rest",
            "auth": {"mode": "bearer", "bearerToken": "abc123"},
            "resources": [...]
        }
        
        Response:
        {
            "status": "ok",
            "message": "Configuration saved successfully"
        }
    """
    try:
        # Validate baseUrl
        if not config_request.baseUrl or not config_request.baseUrl.strip():
            raise HTTPException(
                status_code=400,
                detail="baseUrl is required and cannot be empty"
            )
        
        # Validate apiType
        if config_request.apiType not in ["rest", "soap"]:
            raise HTTPException(
                status_code=400,
                detail="apiType must be 'rest' or 'soap'"
            )
        
        # Validate resources
        if not config_request.resources or len(config_request.resources) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one resource must be configured"
            )
        
        # Create ProxyConfig from request
        proxy_config = ProxyConfig(
            baseUrl=config_request.baseUrl,
            apiType=config_request.apiType,
            auth=config_request.auth,
            resources=config_request.resources,
            soapNamespace=config_request.soapNamespace
        )
        
        # Save configuration
        proxy_config_manager.set_config(proxy_config)
        
        return {
            "status": "ok",
            "message": "Configuration saved successfully"
        }
        
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid configuration: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save configuration: {str(e)}"
        )


@router.get("/api/proxy/config")
async def get_proxy_config() -> dict:
    """Get current proxy configuration.
    
    Returns the current proxy configuration with sensitive data
    (tokens, passwords) sanitized for security.
    
    Returns:
        Sanitized proxy configuration
        
    Raises:
        HTTPException: If no configuration exists (404)
        
    Example:
        GET /api/proxy/config
        
        Response:
        {
            "baseUrl": "https://legacy-api.example.com",
            "apiType": "rest",
            "auth": {
                "mode": "bearer",
                "hasBearer": true,
                "hasApiKey": false,
                "hasBasicAuth": false,
                "hasWsse": false
            },
            "resources": [...],
            "configured": true
        }
    """
    config = proxy_config_manager.get_config()
    
    if config is None:
        raise HTTPException(
            status_code=404,
            detail="Proxy not configured. Please configure the proxy first."
        )
    
    # Sanitize authentication config (hide sensitive data)
    sanitized_auth = {
        "mode": config.auth.mode,
        "hasBearer": bool(config.auth.bearerToken),
        "hasApiKey": bool(config.auth.apiKeyValue),
        "hasBasicAuth": bool(config.auth.basicUser and config.auth.basicPass),
        "hasWsse": bool(config.auth.wsseUsername and config.auth.wssePassword),
    }
    
    # Add non-sensitive auth fields
    if config.auth.apiKeyHeader:
        sanitized_auth["apiKeyHeader"] = config.auth.apiKeyHeader
    
    # Build sanitized response
    return {
        "baseUrl": config.baseUrl,
        "apiType": config.apiType,
        "auth": sanitized_auth,
        "resources": [resource.model_dump() for resource in config.resources],
        "soapNamespace": config.soapNamespace,
        "configured": True
    }


@router.delete("/api/proxy/config")
async def clear_proxy_config() -> dict:
    """Clear proxy configuration.
    
    Removes the current proxy configuration, disabling proxy forwarding.
    
    Returns:
        Success message with status
        
    Example:
        DELETE /api/proxy/config
        
        Response:
        {
            "status": "ok",
            "message": "Configuration cleared successfully"
        }
    """
    try:
        proxy_config_manager.clear_config()
        
        return {
            "status": "ok",
            "message": "Configuration cleared successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear configuration: {str(e)}"
        )


@router.get("/api/proxy/status")
async def get_proxy_status() -> dict:
    """Get proxy configuration status.
    
    Returns basic information about whether the proxy is configured
    and what type of API it's configured for.
    
    Returns:
        Proxy status information
        
    Example:
        GET /api/proxy/status
        
        Response:
        {
            "configured": true,
            "apiType": "rest",
            "baseUrl": "https://legacy-api.example.com",
            "resourceCount": 3
        }
    """
    config = proxy_config_manager.get_config()
    
    if config is None:
        return {
            "configured": False,
            "apiType": None,
            "baseUrl": None,
            "resourceCount": 0
        }
    
    return {
        "configured": True,
        "apiType": config.apiType,
        "baseUrl": config.baseUrl,
        "resourceCount": len(config.resources)
    }
