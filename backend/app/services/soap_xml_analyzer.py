"""SOAP XML analyzer service.

Analyzes SOAP XML response samples to infer resource schemas.
Extracts data from SOAP envelopes and infers field types.
"""

import logging
import re
from typing import Any
from xml.etree import ElementTree as ET

from app.models.resource_schema import ResourceField, ResourceSchema
from app.utils.llm_name_converter import simple_title_case
from app.utils.primary_key_detector import detect_primary_key
from app.utils.type_inference import infer_field_type

logger = logging.getLogger(__name__)

# SOAP namespaces
SOAP_NAMESPACES = {
    "soap": "http://schemas.xmlsoap.org/soap/envelope/",
    "soap12": "http://www.w3.org/2003/05/soap-envelope",
}


async def analyze_soap_xml_sample(
    xml_content: str,
    operation_name: str,
    base_url: str | None = None,
    soap_action: str | None = None,
) -> list[ResourceSchema]:
    """Analyze a SOAP XML response sample to extract resource schema.

    Args:
        xml_content: SOAP XML response content
        operation_name: Name of the SOAP operation (e.g., "GetCustomers")
        base_url: Optional base URL for the service
        soap_action: Optional SOAPAction header value

    Returns:
        List of ResourceSchema objects

    Raises:
        ValueError: If XML is invalid or cannot be parsed
    """
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        raise ValueError(f"Invalid XML: {e}") from e

    # Extract the body content from SOAP envelope
    body_content = _extract_soap_body(root)
    if body_content is None:
        body_content = root

    # Find the data elements
    records = _extract_records(body_content)

    if not records:
        raise ValueError("Could not find data records in XML response")

    # Analyze the first record to get field structure
    fields = _extract_fields_from_record(records[0])

    # Analyze multiple records for better type inference
    for record in records[1:5]:
        record_fields = _extract_fields_from_record(record)
        _merge_field_info(fields, record_fields)

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
    resource_name = _extract_resource_name(operation_name)
    primary_key = detect_primary_key(field_names, resource_name)

    operations = _infer_operations(operation_name)
    endpoint = base_url or f"/{resource_name}"

    return [
        ResourceSchema(
            name=resource_name,
            displayName=simple_title_case(resource_name),
            endpoint=endpoint,
            primaryKey=primary_key,
            fields=resource_fields,
            operations=operations,
        )
    ]


def _extract_soap_body(root: ET.Element) -> ET.Element | None:
    """Extract the Body element from a SOAP envelope."""
    for ns_uri in SOAP_NAMESPACES.values():
        body = root.find(f".//{{{ns_uri}}}Body")
        if body is not None:
            return body

    for elem in root.iter():
        if elem.tag.endswith("Body"):
            return elem

    return None


def _extract_records(body: ET.Element) -> list[ET.Element]:
    """Extract data records from the SOAP body."""
    # Strategy 1: Look for arrays of similar elements
    for elem in body.iter():
        children = list(elem)
        if len(children) >= 1:
            child_tags = [child.tag for child in children]
            if len(set(child_tags)) == 1 and len(child_tags) > 0:
                first_child = children[0]
                if len(list(first_child)) > 0:
                    return children

    # Strategy 2: Look for Response elements
    for elem in body.iter():
        tag_name = _get_local_name(elem.tag)
        if "Response" in tag_name or "Result" in tag_name:
            for child in elem.iter():
                grandchildren = list(child)
                if len(grandchildren) >= 1:
                    child_tags = [gc.tag for gc in grandchildren]
                    if len(set(child_tags)) == 1:
                        first_gc = grandchildren[0]
                        if len(list(first_gc)) > 0:
                            return grandchildren

    # Strategy 3: Elements with multiple fields
    candidates: list[ET.Element] = []
    for elem in body.iter():
        children = list(elem)
        if len(children) >= 3:
            leaf_children = [c for c in children if len(list(c)) == 0]
            if len(leaf_children) >= 3:
                candidates.append(elem)

    if candidates:
        return candidates[:10]

    return list(body)[:1]


def _extract_fields_from_record(record: ET.Element) -> list[dict[str, Any]]:
    """Extract field definitions from a record element."""
    fields: list[dict[str, Any]] = []

    for child in record:
        field_name = _get_local_name(child.tag)
        field_value = child.text

        # Use existing type_inference utility
        field_type = infer_field_type(field_value) if field_value else "string"

        fields.append({
            "name": field_name,
            "type": field_type,
            "value": field_value,
        })

    return fields


def _merge_field_info(
    base_fields: list[dict[str, Any]], new_fields: list[dict[str, Any]]
) -> None:
    """Merge field information from multiple records."""
    new_field_map = {f["name"]: f for f in new_fields}

    for base_field in base_fields:
        new_field = new_field_map.get(base_field["name"])
        if new_field and new_field.get("value"):
            new_type = infer_field_type(new_field["value"])
            if base_field["type"] == "string" and new_type != "string":
                base_field["type"] = new_type


def _get_local_name(tag: str) -> str:
    """Get local name from namespaced tag."""
    if "}" in tag:
        return tag.split("}")[-1]
    return tag


def _extract_resource_name(operation_name: str) -> str:
    """Extract resource name from operation name."""
    name = operation_name
    for prefix in ["Get", "Create", "Update", "Delete", "List", "Find", "Search"]:
        if name.startswith(prefix):
            name = name[len(prefix):]
            break

    for suffix in ["Response", "Request", "Result"]:
        if name.endswith(suffix):
            name = name[:-len(suffix)]

    name = _camel_to_snake(name).lower()

    if not name.endswith("s"):
        name = _pluralize(name)

    return name or "resources"


def _infer_operations(operation_name: str) -> list[str]:
    """Infer available operations from the operation name."""
    name_lower = operation_name.lower()
    operations = set()

    if any(p in name_lower for p in ["getall", "list", "search", "find", "query"]):
        operations.add("list")
    elif any(p in name_lower for p in ["get", "fetch", "retrieve"]):
        operations.update(["list", "detail"])
    elif any(p in name_lower for p in ["create", "add", "insert"]):
        operations.update(["list", "detail", "create"])
    elif any(p in name_lower for p in ["update", "modify", "edit"]):
        operations.update(["list", "detail", "update"])
    elif any(p in name_lower for p in ["delete", "remove"]):
        operations.update(["list", "detail", "delete"])
    else:
        operations.update(["list", "detail"])

    return list(operations)


def _camel_to_snake(name: str) -> str:
    """Convert CamelCase to snake_case."""
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def _pluralize(name: str) -> str:
    """Simple pluralization."""
    if name.endswith("s"):
        return name
    if name.endswith("y"):
        return name[:-1] + "ies"
    if name.endswith(("ch", "sh", "x", "z")):
        return name + "es"
    return name + "s"