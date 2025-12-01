"""WSDL analyzer service.

Parses WSDL (Web Services Description Language) files to extract resource schemas.
Supports WSDL 1.1 format commonly used in SOAP services.
"""

import logging
import re
from typing import Any
from xml.etree import ElementTree as ET

from app.core.http_client import HTTPClient
from app.models.resource_schema import ResourceField, ResourceSchema
from app.utils.llm_name_converter import simple_title_case
from app.utils.primary_key_detector import detect_primary_key

logger = logging.getLogger(__name__)

# XSD type to internal type mapping
XSD_TYPE_MAP = {
    "string": "string",
    "int": "number",
    "integer": "number",
    "long": "number",
    "short": "number",
    "byte": "number",
    "float": "number",
    "double": "number",
    "decimal": "number",
    "boolean": "boolean",
    "date": "date",
    "dateTime": "datetime",
    "time": "string",
    "base64Binary": "string",
    "hexBinary": "string",
    "anyURI": "url",
    "normalizedString": "string",
    "token": "string",
    "positiveInteger": "number",
    "negativeInteger": "number",
    "nonPositiveInteger": "number",
    "nonNegativeInteger": "number",
    "unsignedInt": "number",
    "unsignedLong": "number",
    "unsignedShort": "number",
    "unsignedByte": "number",
}


async def analyze_wsdl(wsdl_content: str) -> list[ResourceSchema]:
    """Analyze a WSDL document and extract resource schemas.

    Args:
        wsdl_content: WSDL XML content as string

    Returns:
        List of ResourceSchema objects

    Raises:
        ValueError: If WSDL is invalid or cannot be parsed
    """
    try:
        root = ET.fromstring(wsdl_content)
    except ET.ParseError as e:
        raise ValueError(f"Invalid WSDL XML: {e}") from e

    # Get service name
    service_name = root.attrib.get("name", "Service")

    # Extract complex types (data structures)
    complex_types = _extract_complex_types(root)

    # Extract operations from port types
    operations = _extract_operations(root)

    # Extract service endpoint
    endpoint = _extract_endpoint(root)

    # Build resources from complex types and operations
    resources = _build_resources(
        complex_types, operations, endpoint, service_name
    )

    return resources


async def analyze_wsdl_url(wsdl_url: str) -> list[ResourceSchema]:
    """Fetch and analyze a WSDL from URL.

    Args:
        wsdl_url: URL to WSDL document (often ending in ?wsdl)

    Returns:
        List of ResourceSchema objects

    Raises:
        ValueError: If URL is unreachable or returns invalid WSDL
    """
    try:
        async with HTTPClient() as client:
            response = await client.get(wsdl_url)
            wsdl_content = response.text
    except Exception as e:
        raise ValueError(f"Unable to fetch WSDL from URL: {e}") from e

    return await analyze_wsdl(wsdl_content)


def _extract_complex_types(root: ET.Element) -> dict[str, list[dict[str, str]]]:
    """Extract complex types (data structures) from WSDL."""
    complex_types: dict[str, list[dict[str, str]]] = {}

    # Find all schema elements
    for types_elem in root.iter():
        if types_elem.tag.endswith("types") or types_elem.tag.endswith("schema"):
            _process_schema_types(types_elem, complex_types)

    # Also check for inline schemas
    for schema in root.findall(".//{http://www.w3.org/2001/XMLSchema}schema"):
        _process_schema_types(schema, complex_types)

    return complex_types


def _process_schema_types(
    schema_elem: ET.Element, complex_types: dict[str, list[dict[str, str]]]
) -> None:
    """Process a schema element to extract complex types."""
    # Find all complexType definitions
    for complex_type in schema_elem.iter():
        if complex_type.tag.endswith("complexType"):
            type_name = complex_type.attrib.get("name", "")
            if not type_name:
                continue

            fields = _extract_fields_from_complex_type(complex_type)
            if fields:
                complex_types[type_name] = fields

    # Also check for element definitions with complex types
    for element in schema_elem.iter():
        if element.tag.endswith("element"):
            element_name = element.attrib.get("name", "")
            for child in element:
                if child.tag.endswith("complexType"):
                    fields = _extract_fields_from_complex_type(child)
                    if fields and element_name:
                        complex_types[element_name] = fields


def _extract_fields_from_complex_type(
    complex_type: ET.Element,
) -> list[dict[str, str]]:
    """Extract fields from a complexType element."""
    fields: list[dict[str, str]] = []

    for container in complex_type.iter():
        if container.tag.endswith(("sequence", "all", "choice")):
            for element in container:
                if element.tag.endswith("element"):
                    field_name = element.attrib.get("name", "")
                    field_type = element.attrib.get("type", "string")

                    if field_name:
                        clean_type = _clean_xsd_type(field_type)
                        fields.append({"name": field_name, "type": clean_type})

    return fields


def _clean_xsd_type(xsd_type: str) -> str:
    """Convert XSD type to internal type."""
    if ":" in xsd_type:
        xsd_type = xsd_type.split(":")[-1]
    return XSD_TYPE_MAP.get(xsd_type, "string")


def _extract_operations(root: ET.Element) -> list[dict[str, Any]]:
    """Extract operations from WSDL portType definitions."""
    operations: list[dict[str, Any]] = []

    for port_type in root.iter():
        if port_type.tag.endswith("portType"):
            for operation in port_type:
                if operation.tag.endswith("operation"):
                    op_name = operation.attrib.get("name", "")
                    if op_name:
                        op_type = _infer_operation_type(op_name)
                        operations.append({
                            "name": op_name,
                            "type": op_type,
                        })

    return operations


def _infer_operation_type(operation_name: str) -> str:
    """Infer CRUD operation type from operation name."""
    name_lower = operation_name.lower()

    if any(p in name_lower for p in ["getall", "getlist", "list", "search", "find", "query"]):
        return "list"

    if any(p in name_lower for p in ["getbyid", "getby", "get", "fetch", "retrieve", "load"]):
        if "all" not in name_lower and "list" not in name_lower:
            return "detail"

    if any(p in name_lower for p in ["create", "add", "insert", "new", "register"]):
        return "create"

    if any(p in name_lower for p in ["update", "modify", "edit", "save", "change"]):
        return "update"

    if any(p in name_lower for p in ["delete", "remove", "destroy", "cancel"]):
        return "delete"

    if name_lower.startswith("get"):
        return "detail"

    return "detail"


def _extract_endpoint(root: ET.Element) -> str:
    """Extract service endpoint URL from WSDL."""
    for elem in root.iter():
        if elem.tag.endswith("address"):
            location = elem.attrib.get("location", "")
            if location:
                if "://" in location:
                    from urllib.parse import urlparse
                    parsed = urlparse(location)
                    return parsed.path or "/service"
                return location

    return "/service"


def _build_resources(
    complex_types: dict[str, list[dict[str, str]]],
    operations: list[dict[str, Any]],
    endpoint: str,
    service_name: str,
) -> list[ResourceSchema]:
    """Build ResourceSchema objects from extracted WSDL data."""
    resources: list[ResourceSchema] = []

    # Find main resource types (exclude request/response wrappers)
    main_types = {
        name: fields
        for name, fields in complex_types.items()
        if not any(
            suffix in name.lower()
            for suffix in ["request", "response", "result", "message"]
        )
    }

    if not main_types:
        main_types = complex_types

    for type_name, fields in main_types.items():
        if not fields:
            continue

        field_names = [f["name"] for f in fields]

        # Build ResourceField list using existing simple_title_case
        resource_fields: list[ResourceField] = []
        for field in fields:
            resource_fields.append(
                ResourceField(
                    name=field["name"],
                    type=field["type"],
                    displayName=simple_title_case(field["name"]),
                )
            )

        # Use existing primary key detector
        primary_key = detect_primary_key(field_names, type_name.lower())

        # Map operations to CRUD types
        crud_operations = list(set(op["type"] for op in operations))
        if not crud_operations:
            crud_operations = ["list", "detail"]

        resource_name = _pluralize(type_name.lower())

        resources.append(
            ResourceSchema(
                name=resource_name,
                displayName=simple_title_case(resource_name),
                endpoint=endpoint,
                primaryKey=primary_key,
                fields=resource_fields,
                operations=crud_operations,
            )
        )

    return resources


def _pluralize(name: str) -> str:
    """Simple pluralization for resource names."""
    if name.endswith("s"):
        return name
    if name.endswith("y"):
        return name[:-1] + "ies"
    if name.endswith(("ch", "sh", "x", "z")):
        return name + "es"
    return name + "s"