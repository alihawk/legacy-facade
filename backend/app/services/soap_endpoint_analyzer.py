"""SOAP endpoint analyzer service.

Makes live SOAP requests to analyze service endpoints.
Supports WS-Security (WSSE) and Basic authentication.
"""

import base64
import logging
from datetime import datetime, timezone
from uuid import uuid4

from app.models.resource_schema import ResourceSchema
from app.services.soap_xml_analyzer import analyze_soap_xml_sample

logger = logging.getLogger(__name__)


async def analyze_soap_endpoint(
    base_url: str,
    soap_action: str,
    auth_type: str | None = None,
    username: str | None = None,
    password: str | None = None,
    wsse_token: str | None = None,
    request_body: str | None = None,
) -> list[ResourceSchema]:
    """Analyze a live SOAP endpoint by making a request.

    Args:
        base_url: SOAP endpoint URL
        soap_action: SOAPAction header value
        auth_type: Authentication type: "wsse", "basic", or None
        username: Username for authentication
        password: Password for authentication
        wsse_token: Pre-generated WSSE security token
        request_body: Custom SOAP request body (optional)

    Returns:
        List of ResourceSchema objects

    Raises:
        ValueError: If endpoint is unreachable or returns invalid response
    """
    headers = _build_headers(soap_action, auth_type, username, password)
    body = request_body or _build_default_soap_request(soap_action, auth_type, username, password)

    try:
        import httpx
        # Use httpx directly for SOAP since we need raw XML content, not JSON
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                base_url,
                headers=headers,
                content=body,
            )
            response.raise_for_status()
            response_xml = response.text

    except Exception as e:
        raise ValueError(f"Unable to reach SOAP endpoint: {e}") from e

    if "<soap:Fault" in response_xml or "<Fault" in response_xml:
        fault_message = _extract_soap_fault(response_xml)
        raise ValueError(f"SOAP Fault: {fault_message}")

    operation_name = _extract_operation_from_action(soap_action)

    resources = await analyze_soap_xml_sample(
        xml_content=response_xml,
        operation_name=operation_name,
        base_url=base_url,
        soap_action=soap_action,
    )

    return resources


def _build_headers(
    soap_action: str,
    auth_type: str | None,
    username: str | None,
    password: str | None,
) -> dict[str, str]:
    """Build HTTP headers for SOAP request."""
    headers = {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": f'"{soap_action}"',
    }

    if auth_type == "basic" and username and password:
        credentials = f"{username}:{password}"
        encoded = base64.b64encode(credentials.encode()).decode()
        headers["Authorization"] = f"Basic {encoded}"

    return headers


def _build_default_soap_request(
    soap_action: str,
    auth_type: str | None = None,
    username: str | None = None,
    password: str | None = None,
) -> str:
    """Build a default SOAP request envelope."""
    operation_name = _extract_operation_from_action(soap_action)

    security_header = ""
    if auth_type == "wsse" and username and password:
        security_header = _build_wsse_header(username, password)

    envelope = f'''<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Header>
        {security_header}
    </soap:Header>
    <soap:Body>
        <{operation_name} xmlns="{_extract_namespace_from_action(soap_action)}">
        </{operation_name}>
    </soap:Body>
</soap:Envelope>'''

    return envelope


def _build_wsse_header(username: str, password: str) -> str:
    """Build WS-Security (WSSE) header."""
    nonce = base64.b64encode(str(uuid4()).encode()).decode()
    created = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    return f'''<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
                       xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
            <wsse:UsernameToken>
                <wsse:Username>{username}</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">{password}</wsse:Password>
                <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">{nonce}</wsse:Nonce>
                <wsu:Created>{created}</wsu:Created>
            </wsse:UsernameToken>
        </wsse:Security>'''


def _extract_operation_from_action(soap_action: str) -> str:
    """Extract operation name from SOAPAction."""
    soap_action = soap_action.strip('"')
    if "/" in soap_action:
        return soap_action.split("/")[-1]
    return soap_action


def _extract_namespace_from_action(soap_action: str) -> str:
    """Extract namespace from SOAPAction."""
    soap_action = soap_action.strip('"')
    if "/" in soap_action:
        parts = soap_action.rsplit("/", 1)
        return parts[0]
    return soap_action


def _extract_soap_fault(xml_content: str) -> str:
    """Extract fault message from SOAP Fault response."""
    try:
        from xml.etree import ElementTree as ET
        root = ET.fromstring(xml_content)

        for elem in root.iter():
            if elem.tag.endswith("faultstring") or elem.tag.endswith("Reason"):
                return elem.text or "Unknown SOAP fault"
            if elem.tag.endswith("Text"):
                return elem.text or "Unknown SOAP fault"

        return "Unknown SOAP fault"
    except Exception:
        return "Could not parse SOAP fault"