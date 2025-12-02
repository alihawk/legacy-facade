"""SOAP response parser for extracting data from XML SOAP responses.

Parses SOAP 1.1/1.2 XML responses from legacy APIs, handling faults
and extracting data records into Python dictionaries.
"""

import xml.etree.ElementTree as ET
from typing import Any


class SoapFaultError(Exception):
    """Exception raised when a SOAP Fault is encountered in the response.
    
    Attributes:
        fault_code: SOAP fault code (e.g., "soap:Server", "soap:Client")
        fault_string: Human-readable fault description
    """
    
    def __init__(self, fault_code: str, fault_string: str):
        """Initialize SOAP fault error.
        
        Args:
            fault_code: SOAP fault code
            fault_string: Fault description message
        """
        self.fault_code = fault_code
        self.fault_string = fault_string
        super().__init__(f"SOAP Fault [{fault_code}]: {fault_string}")


def parse_soap_response(
    xml_content: str,
    operation_name: str
) -> list[dict[str, Any]] | dict[str, Any]:
    """Parse a SOAP XML response and extract data records.
    
    Handles complete SOAP response parsing including:
    - Extracting SOAP Body
    - Checking for SOAP Faults
    - Finding data records
    - Converting XML to Python dicts
    
    Args:
        xml_content: Raw XML response string
        operation_name: Name of the operation (used to find response element)
        
    Returns:
        List of dictionaries (for multiple records) or single dictionary
        
    Raises:
        SoapFaultError: If SOAP Fault is present in response
        ET.ParseError: If XML is malformed
        
    Examples:
        >>> xml = '''<soap:Envelope>
        ...     <soap:Body>
        ...         <GetCustomersResponse>
        ...             <Customer><id>1</id><name>John</name></Customer>
        ...         </GetCustomersResponse>
        ...     </soap:Body>
        ... </soap:Envelope>'''
        >>> parse_soap_response(xml, "GetCustomers")
        [{'id': '1', 'name': 'John'}]
    """
    # Parse XML
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        raise ET.ParseError(f"Failed to parse SOAP response: {e}")
    
    # Extract SOAP Body
    body = extract_soap_body(root)
    
    # Check for SOAP Fault
    check_soap_fault(body)
    
    # Extract data records
    record_elements = extract_records(body, operation_name)
    
    # Convert elements to dictionaries
    records = [element_to_dict(elem) for elem in record_elements]
    
    # Return single dict if only one record, otherwise list
    if len(records) == 1:
        return records[0]
    return records


def extract_soap_body(root: ET.Element) -> ET.Element:
    """Extract the SOAP Body element from the envelope.
    
    Handles both SOAP 1.1 and SOAP 1.2 namespaces.
    
    Args:
        root: Root XML element (should be soap:Envelope)
        
    Returns:
        SOAP Body element, or root if not a SOAP envelope
        
    Examples:
        >>> root = ET.fromstring('<soap:Envelope><soap:Body>...</soap:Body></soap:Envelope>')
        >>> body = extract_soap_body(root)
        >>> body.tag.endswith('Body')
        True
    """
    # SOAP namespaces
    soap_namespaces = [
        'http://schemas.xmlsoap.org/soap/envelope/',  # SOAP 1.1
        'http://www.w3.org/2003/05/soap-envelope'     # SOAP 1.2
    ]
    
    # Try to find Body element with namespace
    for ns in soap_namespaces:
        body = root.find(f'{{{ns}}}Body')
        if body is not None:
            return body
    
    # Try without namespace (some APIs don't use proper namespaces)
    for child in root:
        if child.tag.endswith('Body') or child.tag == 'Body':
            return child
    
    # If no Body found, assume root is the body (non-standard SOAP)
    return root


def check_soap_fault(body: ET.Element) -> None:
    """Check for SOAP Fault in the body and raise exception if found.
    
    Args:
        body: SOAP Body element
        
    Raises:
        SoapFaultError: If a Fault element is found
        
    Examples:
        >>> body = ET.fromstring('<Body><Fault><faultcode>Server</faultcode><faultstring>Error</faultstring></Fault></Body>')
        >>> check_soap_fault(body)
        Traceback (most recent call last):
        ...
        SoapFaultError: SOAP Fault [Server]: Error
    """
    # Look for Fault element (with or without namespace)
    fault = None
    
    # Try with SOAP namespaces
    soap_namespaces = [
        'http://schemas.xmlsoap.org/soap/envelope/',
        'http://www.w3.org/2003/05/soap-envelope'
    ]
    
    for ns in soap_namespaces:
        fault = body.find(f'{{{ns}}}Fault')
        if fault is not None:
            break
    
    # Try without namespace
    if fault is None:
        for child in body:
            if child.tag.endswith('Fault') or child.tag == 'Fault':
                fault = child
                break
    
    if fault is None:
        return  # No fault found
    
    # Extract fault code and string
    fault_code = "Unknown"
    fault_string = "Unknown error"
    
    # Try to find faultcode/faultstring (SOAP 1.1)
    for elem in fault:
        tag = _strip_namespace(elem.tag)
        if tag == 'faultcode':
            fault_code = elem.text or fault_code
        elif tag == 'faultstring':
            fault_string = elem.text or fault_string
    
    # Try to find Code/Reason (SOAP 1.2)
    if fault_code == "Unknown":
        code_elem = fault.find('.//{*}Code/{*}Value')
        if code_elem is not None and code_elem.text:
            fault_code = code_elem.text
        
        reason_elem = fault.find('.//{*}Reason/{*}Text')
        if reason_elem is not None and reason_elem.text:
            fault_string = reason_elem.text
    
    raise SoapFaultError(fault_code, fault_string)


def extract_records(
    body: ET.Element,
    operation_name: str
) -> list[ET.Element]:
    """Extract data record elements from the SOAP body.
    
    Looks for the response element (operation_name + "Response") and
    extracts child elements that appear to be data records.
    
    Args:
        body: SOAP Body element
        operation_name: Name of the operation
        
    Returns:
        List of XML elements representing data records
        
    Examples:
        >>> body = ET.fromstring('<Body><GetCustomersResponse><Customer><id>1</id></Customer></GetCustomersResponse></Body>')
        >>> records = extract_records(body, "GetCustomers")
        >>> len(records)
        1
    """
    # Look for response element (e.g., "GetCustomersResponse")
    response_name = f"{operation_name}Response"
    response_elem = None
    
    # Try to find response element (with or without namespace)
    for child in body:
        tag = _strip_namespace(child.tag)
        if tag == response_name or tag == operation_name:
            response_elem = child
            break
    
    # If no response element found, use body directly
    if response_elem is None:
        response_elem = body
    
    # Extract record elements
    # Look for child elements that appear to be data records
    records = []
    
    for child in response_elem:
        tag = _strip_namespace(child.tag)
        
        # Skip metadata elements
        if tag.lower() in ('return', 'result', 'response'):
            # These might contain the actual records
            records.extend(list(child))
        else:
            # This is likely a data record
            records.append(child)
    
    # If no records found, try to use response_elem itself
    if not records and response_elem is not body:
        records = [response_elem]
    
    return records


def element_to_dict(element: ET.Element) -> dict[str, Any]:
    """Convert an XML element to a Python dictionary.
    
    Recursively converts XML elements to nested dictionaries,
    handling text content, attributes, and child elements.
    
    Args:
        element: XML element to convert
        
    Returns:
        Dictionary representation of the element
        
    Examples:
        >>> elem = ET.fromstring('<Customer><id>1</id><name>John</name></Customer>')
        >>> element_to_dict(elem)
        {'id': '1', 'name': 'John'}
        
        >>> elem = ET.fromstring('<Items><item>A</item><item>B</item></Items>')
        >>> element_to_dict(elem)
        {'item': ['A', 'B']}
    """
    result = {}
    
    # Add attributes (prefixed with @)
    for key, value in element.attrib.items():
        result[f"@{_strip_namespace(key)}"] = value
    
    # Process child elements
    children = list(element)
    
    if not children:
        # Leaf node - return text content
        text = element.text
        if text and text.strip():
            return text.strip()
        return {}
    
    # Group children by tag name to handle lists
    child_dict: dict[str, list[Any]] = {}
    
    for child in children:
        tag = _strip_namespace(child.tag)
        child_value = element_to_dict(child)
        
        if tag not in child_dict:
            child_dict[tag] = []
        child_dict[tag].append(child_value)
    
    # Convert single-item lists to single values
    for tag, values in child_dict.items():
        if len(values) == 1:
            result[tag] = values[0]
        else:
            result[tag] = values
    
    # Add text content if present and not just whitespace
    if element.text and element.text.strip():
        result['#text'] = element.text.strip()
    
    return result


def _strip_namespace(tag: str) -> str:
    """Remove namespace from an XML tag.
    
    Args:
        tag: XML tag (possibly with namespace like "{http://example.com}Customer")
        
    Returns:
        Tag without namespace (e.g., "Customer")
        
    Examples:
        >>> _strip_namespace('{http://example.com}Customer')
        'Customer'
        
        >>> _strip_namespace('Customer')
        'Customer'
    """
    if '}' in tag:
        return tag.split('}', 1)[1]
    return tag
