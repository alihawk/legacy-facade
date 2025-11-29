"""Property-based tests for JSON sample analyzer.

**Feature: backend-api-analyzer, Property 10: JSON Sample Array Detection**
"""

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from app.services.json_analyzer import analyze_json_sample


# Hypothesis strategies for generating JSON samples


@st.composite
def json_field_value(draw, field_type):
    """Generate a value for a specific field type."""
    if field_type == "string":
        return draw(st.text(min_size=1, max_size=50))
    elif field_type == "number":
        return draw(st.integers(min_value=1, max_value=1000))
    elif field_type == "boolean":
        return draw(st.booleans())
    elif field_type == "email":
        username = draw(st.text(alphabet=st.characters(whitelist_categories=("Ll",)), min_size=3, max_size=10))
        domain = draw(st.text(alphabet=st.characters(whitelist_categories=("Ll",)), min_size=3, max_size=10))
        return f"{username}@{domain}.com"
    else:
        return draw(st.text(min_size=1, max_size=20))


@st.composite
def json_object(draw, num_fields=3):
    """Generate a JSON object with random fields."""
    obj = {}
    
    # Always include an id field
    obj["id"] = draw(st.integers(min_value=1, max_value=10000))
    
    # Add additional fields
    field_names = ["name", "email", "status", "count", "active"]
    field_types = ["string", "email", "string", "number", "boolean"]
    
    for i in range(min(num_fields - 1, len(field_names))):
        obj[field_names[i]] = draw(json_field_value(field_types[i]))
    
    return obj


@st.composite
def json_array_sample(draw, min_items=1, max_items=5):
    """Generate a JSON array sample."""
    num_items = draw(st.integers(min_value=min_items, max_value=max_items))
    return [draw(json_object()) for _ in range(num_items)]


# Property 10: JSON Sample Array Detection


@settings(max_examples=50, deadline=10000)
@given(sample=json_array_sample(min_items=1, max_items=10))
@pytest.mark.asyncio
async def test_property_json_array_detection(sample):
    """Property 10: JSON Sample Array Detection.

    **Feature: backend-api-analyzer, Property 10: JSON Sample Array Detection**
    **Validates: Requirements 4.3**

    For any JSON array sample, the analyzer should:
    1. Identify it as a list endpoint
    2. Extract a common schema from all array items
    3. Produce a ResourceSchema with "list" operation
    """
    resources = await analyze_json_sample(sample)

    # Should produce exactly one resource
    assert len(resources) == 1, "Array sample should produce one resource"

    resource = resources[0]

    # Should identify as list endpoint
    assert "list" in resource.operations, "Array sample should have 'list' operation"

    # Should have fields
    assert len(resource.fields) > 0, "Resource should have at least one field"

    # Should have a primary key
    assert resource.primaryKey, "Resource should have a primary key"

    # All items in the sample should have contributed to the schema
    # Check that common fields are present
    first_item = sample[0]
    for field_name in first_item.keys():
        field_names = [f.name for f in resource.fields]
        assert field_name in field_names, f"Field '{field_name}' should be in schema"


@settings(max_examples=50, deadline=10000)
@given(obj=json_object())
@pytest.mark.asyncio
async def test_property_json_single_object_detection(obj):
    """Test that single objects are detected as detail endpoints.

    For any single JSON object, the analyzer should:
    1. Identify it as a detail endpoint
    2. Extract all fields from the object
    3. Produce a ResourceSchema with "detail" operation
    """
    resources = await analyze_json_sample(obj)

    # Should produce exactly one resource
    assert len(resources) == 1, "Single object should produce one resource"

    resource = resources[0]

    # Should identify as detail endpoint
    assert "detail" in resource.operations, "Single object should have 'detail' operation"
    assert "list" not in resource.operations, "Single object should not have 'list' operation"

    # Should have all fields from the object
    assert len(resource.fields) == len(obj), "Should have same number of fields as object"

    # All object keys should be in the schema
    field_names = [f.name for f in resource.fields]
    for key in obj.keys():
        assert key in field_names, f"Field '{key}' should be in schema"


@settings(max_examples=50, deadline=10000)
@given(sample=json_array_sample(min_items=2, max_items=5))
@pytest.mark.asyncio
async def test_property_type_inference_consistency(sample):
    """Test that type inference is consistent across array items.

    For any array sample, fields that appear in multiple items
    should have consistent type inference.
    """
    resources = await analyze_json_sample(sample)
    resource = resources[0]

    # Get field types
    field_types = {f.name: f.type for f in resource.fields}

    # ID field should always be detected as number (since we generate integers)
    if "id" in field_types:
        assert field_types["id"] == "number", "ID should be detected as number"

    # Email field should be detected as email
    if "email" in field_types:
        assert field_types["email"] == "email", "Email should be detected as email type"

    # Boolean field should be detected as boolean
    if "active" in field_types:
        assert field_types["active"] == "boolean", "Active should be detected as boolean"


@settings(max_examples=30, deadline=10000)
@given(
    sample=st.lists(
        st.dictionaries(
            keys=st.sampled_from(["id", "name", "value"]),
            values=st.one_of(st.integers(), st.text(min_size=1, max_size=20)),
            min_size=1,
            max_size=3,
        ),
        min_size=1,
        max_size=5,
    )
)
@pytest.mark.asyncio
async def test_property_mixed_types_handling(sample):
    """Test handling of mixed types across array items.

    When the same field has different types across items,
    the analyzer should pick the most flexible type.
    """
    resources = await analyze_json_sample(sample)
    resource = resources[0]

    # Should successfully analyze without errors
    assert len(resource.fields) > 0, "Should extract fields even with mixed types"

    # Should have a primary key
    assert resource.primaryKey, "Should have a primary key"
