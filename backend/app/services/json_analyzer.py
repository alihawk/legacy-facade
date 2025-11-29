"""JSON sample analyzer service.

Analyzes JSON samples to infer resource schemas without requiring OpenAPI specs.
Handles both array and single object samples, with nested structure unwrapping.
"""

import logging
from typing import Any

from app.models.resource_schema import ResourceField, ResourceSchema
from app.utils.llm_name_converter import convert_batch_to_display_names
from app.utils.primary_key_detector import detect_primary_key
from app.utils.response_unwrapper import unwrap_response
from app.utils.type_inference import infer_field_type, infer_type_from_values

logger = logging.getLogger(__name__)


async def analyze_json_sample(sample_json: dict | list) -> list[ResourceSchema]:
    """Analyze JSON sample and infer resource schema.

    Handles both array samples and single object samples.
    Unwraps nested structures to find the actual data.

    Args:
        sample_json: JSON sample as dict or list

    Returns:
        List containing a single ResourceSchema

    Raises:
        ValueError: If sample is invalid or cannot be analyzed
    """
    if not sample_json:
        raise ValueError("JSON sample cannot be empty")

    # Unwrap nested structures
    unwrapped = unwrap_response(sample_json)

    # Determine if this is an array or single object
    is_array = isinstance(unwrapped, list)

    if is_array:
        if not unwrapped:
            raise ValueError("JSON array sample cannot be empty")
        # Use first item as schema template, but infer types from all items
        items = unwrapped
    else:
        # Single object
        items = [unwrapped]

    # Extract fields from all items
    all_fields = {}
    for item in items:
        if not isinstance(item, dict):
            raise ValueError(f"Expected object in sample, got {type(item).__name__}")

        for field_name, field_value in item.items():
            if field_name not in all_fields:
                all_fields[field_name] = []
            all_fields[field_name].append(field_value)

    # Batch convert all field names to display names using LLM
    field_names = list(all_fields.keys())
    display_names = convert_batch_to_display_names(field_names)

    # Infer field types from collected values
    fields = []
    for field_name, values in all_fields.items():
        field_type = infer_type_from_values(values)
        fields.append(
            ResourceField(
                name=field_name,
                type=field_type,
                displayName=display_names.get(field_name, field_name.title()),
            )
        )

    # Detect primary key
    primary_key = detect_primary_key(field_names, "sample")

    # Determine operations based on whether it's an array
    operations = ["list"] if is_array else ["detail"]

    # Create resource schema
    resource = ResourceSchema(
        name="sample",
        displayName="Sample",
        endpoint="__sample",  # Placeholder since we don't have actual endpoint
        primaryKey=primary_key,
        fields=fields,
        operations=operations,
    )

    return [resource]
