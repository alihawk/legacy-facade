"""SOAP request builder for constructing XML SOAP envelopes.

Builds SOAP 1.1/1.2 compliant XML requests for legacy SOAP APIs,
including WS-Security authentication when required.
"""

import base64
import uuid
from datetime import datetime, timezone
from typing import Any

from ..models.proxy_models import AuthConfig


def build_soap_request(
    operation_name: str,
    namespace: str,
    parameters: dict[str, Any] | None = None,
    auth_config: AuthConfig | None = None
) -> str:
    """Build a SOAP XML request envelope.
    
    Constructs a complete SOAP envelope with optional WS-Security authentication
    and operation parameters.
    
    Args:
        operation_name: Name of the SOAP operation (e.g., "GetCustomers")
        namespace: Target namespace for the operation (e.g., "http://example.com/service")
        parameters: Dictionary of parameters to include in the operation element
        auth_config: Authentication configuration (for WSSE)
        
    Returns:
        Complete SOAP XML request as a string
        
    Example:
        >>> build_soap_request("GetCustomers", "http://example.com", {"status": "active"})
        '<?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://example.com">
            <soap:Header></soap:Header>
            <soap:Body>
                <ns:GetCustomers>
                    <ns:status>active</ns:status>
                </ns:GetCustomers>
            </soap:Body>
        </soap:Envelope>'
    """
    # Build SOAP header (with WSSE if configured)
    header_content = ""
    if auth_config and auth_config.mode == "wsse" and auth_config.wsseUsername and auth_config.wssePassword:
        header_content = build_wsse_header(auth_config.wsseUsername, auth_config.wssePassword)
    
    # Build operation parameters
    params_xml = ""
    if parameters:
        params_xml = dict_to_xml_elements(parameters, namespace, indent=12)
    
    # Construct SOAP envelope
    soap_envelope = f'''<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="{namespace}">
    <soap:Header>
{header_content}    </soap:Header>
    <soap:Body>
        <ns:{operation_name}>
{params_xml}        </ns:{operation_name}>
    </soap:Body>
</soap:Envelope>'''
    
    return soap_envelope


def build_wsse_header(username: str, password: str) -> str:
    """Build WS-Security UsernameToken header.
    
    Constructs a WS-Security header with UsernameToken authentication,
    including nonce and timestamp for enhanced security.
    
    Args:
        username: Username for authentication
        password: Password for authentication (sent in plain text as PasswordText)
        
    Returns:
        WS-Security XML header content (indented for insertion into soap:Header)
        
    Note:
        This implementation uses PasswordText (plain text password).
        For production, consider using PasswordDigest with proper hashing.
        
    Example:
        >>> build_wsse_header("admin", "secret123")
        '        <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
            <wsse:UsernameToken>
                <wsse:Username>admin</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">secret123</wsse:Password>
                <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">...</wsse:Nonce>
                <wsu:Created>2024-01-01T12:00:00Z</wsu:Created>
            </wsse:UsernameToken>
        </wsse:Security>'
    """
    # Generate nonce (random unique value)
    nonce = base64.b64encode(uuid.uuid4().bytes).decode('utf-8')
    
    # Generate timestamp in ISO 8601 format
    created = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Build WS-Security header
    wsse_header = f'''        <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
            <wsse:UsernameToken>
                <wsse:Username>{username}</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">{password}</wsse:Password>
                <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">{nonce}</wsse:Nonce>
                <wsu:Created>{created}</wsu:Created>
            </wsse:UsernameToken>
        </wsse:Security>
'''
    
    return wsse_header


def dict_to_xml_elements(
    data: dict[str, Any],
    namespace: str,
    indent: int = 12
) -> str:
    """Convert a dictionary to XML elements.
    
    Recursively converts a dictionary into XML elements with proper namespace
    prefixes and indentation.
    
    Args:
        data: Dictionary to convert
        namespace: Namespace prefix to use (e.g., "ns")
        indent: Number of spaces for indentation
        
    Returns:
        XML elements as a string with proper indentation
        
    Examples:
        >>> dict_to_xml_elements({"name": "John", "age": 30}, "ns", 12)
        '            <ns:name>John</ns:name>
            <ns:age>30</ns:age>
'
        
        >>> dict_to_xml_elements({"user": {"name": "John", "age": 30}}, "ns", 12)
        '            <ns:user>
                <ns:name>John</ns:name>
                <ns:age>30</ns:age>
            </ns:user>
'
    """
    xml_lines = []
    indent_str = " " * indent
    
    for key, value in data.items():
        # Sanitize key to be valid XML element name
        safe_key = _sanitize_xml_name(key)
        
        if value is None:
            # Null values as self-closing tags
            xml_lines.append(f"{indent_str}<ns:{safe_key}/>")
            
        elif isinstance(value, dict):
            # Nested dictionary - recurse
            xml_lines.append(f"{indent_str}<ns:{safe_key}>")
            nested_xml = dict_to_xml_elements(value, namespace, indent + 4)
            xml_lines.append(nested_xml.rstrip('\n'))
            xml_lines.append(f"{indent_str}</ns:{safe_key}>")
            
        elif isinstance(value, list):
            # List - create multiple elements with same name
            for item in value:
                if isinstance(item, dict):
                    xml_lines.append(f"{indent_str}<ns:{safe_key}>")
                    nested_xml = dict_to_xml_elements(item, namespace, indent + 4)
                    xml_lines.append(nested_xml.rstrip('\n'))
                    xml_lines.append(f"{indent_str}</ns:{safe_key}>")
                else:
                    # Primitive value in list
                    xml_lines.append(f"{indent_str}<ns:{safe_key}>{_escape_xml(str(item))}</ns:{safe_key}>")
                    
        elif isinstance(value, bool):
            # Boolean - lowercase string
            xml_lines.append(f"{indent_str}<ns:{safe_key}>{str(value).lower()}</ns:{safe_key}>")
            
        else:
            # Primitive value (string, number, etc.)
            xml_lines.append(f"{indent_str}<ns:{safe_key}>{_escape_xml(str(value))}</ns:{safe_key}>")
    
    return '\n'.join(xml_lines) + '\n' if xml_lines else ''


def _sanitize_xml_name(name: str) -> str:
    """Sanitize a string to be a valid XML element name.
    
    XML element names must:
    - Start with a letter or underscore
    - Contain only letters, digits, hyphens, underscores, and periods
    - Not start with "xml" (case-insensitive)
    
    Args:
        name: Original name
        
    Returns:
        Sanitized name safe for use as XML element name
    """
    # Replace invalid characters with underscores
    sanitized = ''.join(c if c.isalnum() or c in ('_', '-', '.') else '_' for c in name)
    
    # Ensure it starts with a letter or underscore
    if sanitized and not (sanitized[0].isalpha() or sanitized[0] == '_'):
        sanitized = '_' + sanitized
    
    # Ensure it's not empty
    if not sanitized:
        sanitized = 'element'
    
    return sanitized


def _escape_xml(text: str) -> str:
    """Escape special XML characters.
    
    Replaces characters that have special meaning in XML with their
    entity references.
    
    Args:
        text: Text to escape
        
    Returns:
        Escaped text safe for XML content
    """
    return (text
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&apos;'))
