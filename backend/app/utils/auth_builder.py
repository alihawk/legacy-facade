"""Authentication header builder for proxy requests.

Builds HTTP headers for different authentication modes when forwarding
requests to legacy REST and SOAP APIs.
"""

import base64
from typing import Optional

from ..models.proxy_models import AuthConfig


def build_rest_auth_headers(auth_config: AuthConfig) -> dict[str, str]:
    """Build authentication headers for REST API requests.
    
    Supports multiple authentication modes:
    - bearer: Bearer token in Authorization header
    - apiKey: Custom header with API key
    - basic: Basic authentication (username:password base64 encoded)
    - none: No authentication headers
    
    Args:
        auth_config: Authentication configuration from ProxyConfig
        
    Returns:
        Dictionary of HTTP headers to include in the request.
        Empty dict if no authentication is configured.
        
    Examples:
        >>> auth = AuthConfig(mode="bearer", bearerToken="abc123")
        >>> build_rest_auth_headers(auth)
        {'Authorization': 'Bearer abc123'}
        
        >>> auth = AuthConfig(mode="apiKey", apiKeyHeader="X-API-Key", apiKeyValue="secret")
        >>> build_rest_auth_headers(auth)
        {'X-API-Key': 'secret'}
        
        >>> auth = AuthConfig(mode="basic", basicUser="admin", basicPass="password")
        >>> build_rest_auth_headers(auth)
        {'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='}
    """
    # Bearer token authentication
    if auth_config.mode == "bearer" and auth_config.bearerToken:
        return {"Authorization": f"Bearer {auth_config.bearerToken}"}
    
    # API Key authentication
    if auth_config.mode == "apiKey" and auth_config.apiKeyHeader and auth_config.apiKeyValue:
        return {auth_config.apiKeyHeader: auth_config.apiKeyValue}
    
    # Basic authentication
    if auth_config.mode == "basic" and auth_config.basicUser and auth_config.basicPass:
        # Encode username:password as base64
        credentials = f"{auth_config.basicUser}:{auth_config.basicPass}"
        encoded = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
        return {"Authorization": f"Basic {encoded}"}
    
    # No authentication or incomplete config
    return {}


def sanitize_headers_for_logging(headers: dict[str, str]) -> dict[str, str]:
    """Sanitize headers for safe logging by hiding sensitive values.
    
    Replaces actual values of Authorization and API key headers with placeholders.
    
    Args:
        headers: Original headers dictionary
        
    Returns:
        Sanitized headers safe for logging
    """
    sanitized = headers.copy()
    
    # Hide Authorization header value
    if "Authorization" in sanitized:
        auth_value = sanitized["Authorization"]
        if auth_value.startswith("Bearer "):
            sanitized["Authorization"] = "Bearer ***"
        elif auth_value.startswith("Basic "):
            sanitized["Authorization"] = "Basic ***"
        else:
            sanitized["Authorization"] = "***"
    
    # Hide common API key headers
    api_key_headers = ["X-API-Key", "X-Api-Key", "API-Key", "ApiKey"]
    for header in api_key_headers:
        if header in sanitized:
            sanitized[header] = "***"
    
    return sanitized


import uuid
from datetime import datetime, timezone


def build_soap_headers(soap_action: str, auth_config: AuthConfig) -> dict[str, str]:
    """Build HTTP headers for SOAP API requests.
    
    Constructs headers required for SOAP requests, including Content-Type,
    SOAPAction, and optional Basic authentication.
    
    Args:
        soap_action: SOAP action URI (e.g., "http://example.com/GetCustomers")
        auth_config: Authentication configuration
        
    Returns:
        Dictionary of HTTP headers for SOAP request
        
    Examples:
        >>> auth = AuthConfig(mode="none")
        >>> build_soap_headers("http://example.com/GetCustomers", auth)
        {'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '"http://example.com/GetCustomers"'}
        
        >>> auth = AuthConfig(mode="basic", basicUser="admin", basicPass="secret")
        >>> headers = build_soap_headers("http://example.com/GetCustomers", auth)
        >>> 'Authorization' in headers
        True
    """
    # Base SOAP headers
    headers = {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": f'"{soap_action}"'
    }
    
    # Add Basic authentication if configured
    # Note: WSSE authentication goes in the SOAP envelope, not HTTP headers
    if auth_config.mode == "basic" and auth_config.basicUser and auth_config.basicPass:
        credentials = f"{auth_config.basicUser}:{auth_config.basicPass}"
        encoded = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
        headers["Authorization"] = f"Basic {encoded}"
    
    return headers


def build_wsse_security_element(username: str, password: str) -> str:
    """Build WS-Security element for SOAP envelope header.
    
    Constructs a WS-Security UsernameToken element with nonce and timestamp
    for inclusion in the SOAP Header.
    
    Args:
        username: Username for authentication
        password: Password for authentication (sent as PasswordText)
        
    Returns:
        XML string containing wsse:Security element
        
    Note:
        This implementation uses PasswordText (plain text password).
        The nonce and timestamp provide replay attack protection.
        
    Example:
        >>> security_xml = build_wsse_security_element("admin", "secret123")
        >>> 'wsse:Security' in security_xml
        True
        >>> 'wsse:Username' in security_xml
        True
        >>> 'wsse:Nonce' in security_xml
        True
    """
    # Generate nonce (random unique value for replay attack prevention)
    nonce = base64.b64encode(str(uuid.uuid4()).encode()).decode()
    
    # Generate timestamp in ISO 8601 format (UTC)
    created = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Build WS-Security element
    security_xml = f'''<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <wsse:UsernameToken>
        <wsse:Username>{username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">{password}</wsse:Password>
        <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">{nonce}</wsse:Nonce>
        <wsu:Created>{created}</wsu:Created>
    </wsse:UsernameToken>
</wsse:Security>'''
    
    return security_xml
