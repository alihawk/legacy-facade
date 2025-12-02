"""Field mapper for transforming field names between normalized and legacy formats.

Maps field names between the frontend's normalized schema and the legacy API's
actual field names, enabling seamless integration without changing the backend.
"""

from typing import Any

from ..models.proxy_models import FieldMapping


def map_fields(
    data: dict[str, Any] | list[dict[str, Any]],
    field_mappings: list[FieldMapping] | None,
    reverse: bool = False
) -> dict[str, Any] | list[dict[str, Any]]:
    """Map field names in data according to field mappings.
    
    Transforms field names between normalized (frontend) and legacy (backend) formats.
    
    Args:
        data: Single record (dict) or list of records to transform
        field_mappings: List of FieldMapping objects defining the transformations
        reverse: Direction of mapping
            - False: normalized → legacy (for requests to backend)
            - True: legacy → normalized (for responses from backend)
            
    Returns:
        Transformed data with mapped field names. Returns data unchanged if
        field_mappings is None or empty.
        
    Examples:
        >>> mappings = [FieldMapping(normalizedName="customer_id", legacyName="CUST_ID")]
        >>> map_fields({"CUST_ID": 1, "name": "John"}, mappings, reverse=True)
        {'customer_id': 1, 'name': 'John'}
        
        >>> map_fields({"customer_id": 1, "name": "John"}, mappings, reverse=False)
        {'CUST_ID': 1, 'name': 'John'}
        
        >>> map_fields([{"CUST_ID": 1}, {"CUST_ID": 2}], mappings, reverse=True)
        [{'customer_id': 1}, {'customer_id': 2}]
    """
    # If no mappings provided, return data unchanged
    if not field_mappings:
        return data
    
    # Build mapping dictionary based on direction
    if reverse:
        # Legacy → Normalized (for responses)
        mapping_dict = {fm.legacyName: fm.normalizedName for fm in field_mappings}
    else:
        # Normalized → Legacy (for requests)
        mapping_dict = {fm.normalizedName: fm.legacyName for fm in field_mappings}
    
    # Handle list of records
    if isinstance(data, list):
        return [_map_single_record(record, mapping_dict) for record in data]
    
    # Handle single record
    return _map_single_record(data, mapping_dict)


def _map_single_record(
    record: dict[str, Any],
    mapping: dict[str, str]
) -> dict[str, Any]:
    """Map field names in a single record.
    
    Creates a new dictionary with field names transformed according to the mapping.
    Fields not in the mapping are passed through unchanged.
    
    Args:
        record: Dictionary to transform
        mapping: Dictionary mapping old field names to new field names
        
    Returns:
        New dictionary with transformed field names
        
    Examples:
        >>> _map_single_record({"CUST_ID": 1, "name": "John"}, {"CUST_ID": "customer_id"})
        {'customer_id': 1, 'name': 'John'}
    """
    mapped_record = {}
    
    for key, value in record.items():
        # Use mapped key if available, otherwise keep original key
        new_key = mapping.get(key, key)
        mapped_record[new_key] = value
    
    return mapped_record


def get_mapped_field_name(
    field_name: str,
    field_mappings: list[FieldMapping] | None,
    reverse: bool = False
) -> str:
    """Get the mapped name for a single field.
    
    Useful for mapping individual field names (e.g., for sorting or filtering).
    
    Args:
        field_name: Original field name
        field_mappings: List of FieldMapping objects
        reverse: Direction of mapping (same as map_fields)
        
    Returns:
        Mapped field name, or original name if no mapping exists
        
    Examples:
        >>> mappings = [FieldMapping(normalizedName="customer_id", legacyName="CUST_ID")]
        >>> get_mapped_field_name("customer_id", mappings, reverse=False)
        'CUST_ID'
        
        >>> get_mapped_field_name("CUST_ID", mappings, reverse=True)
        'customer_id'
    """
    if not field_mappings:
        return field_name
    
    # Build mapping dictionary
    if reverse:
        mapping_dict = {fm.legacyName: fm.normalizedName for fm in field_mappings}
    else:
        mapping_dict = {fm.normalizedName: fm.legacyName for fm in field_mappings}
    
    return mapping_dict.get(field_name, field_name)


def has_field_mappings(field_mappings: list[FieldMapping] | None) -> bool:
    """Check if field mappings are configured.
    
    Args:
        field_mappings: List of FieldMapping objects or None
        
    Returns:
        True if mappings exist and are non-empty, False otherwise
    """
    return field_mappings is not None and len(field_mappings) > 0
