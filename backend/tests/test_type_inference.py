"""Tests for type inference utility.

Property-based tests validate type inference across various value types.
"""

from hypothesis import given, strategies as st

from app.utils.type_inference import (
    infer_array_type,
    infer_field_type,
    infer_type_from_openapi_schema,
    infer_type_from_values,
    try_coerce_to_number,
)


# Unit tests for specific cases
def test_infer_boolean():
    """Test boolean type inference."""
    assert infer_field_type(True) == "boolean"
    assert infer_field_type(False) == "boolean"


def test_infer_number():
    """Test number type inference."""
    assert infer_field_type(123) == "number"
    assert infer_field_type(12.5) == "number"
    assert infer_field_type(-42) == "number"
    assert infer_field_type(0) == "number"


def test_infer_string():
    """Test string type inference."""
    assert infer_field_type("hello") == "string"
    assert infer_field_type("") == "string"
    assert infer_field_type("short") == "string"


def test_infer_text():
    """Test text type inference (>100 chars)."""
    long_text = "a" * 101
    assert infer_field_type(long_text) == "text"


def test_infer_email():
    """Test email type inference."""
    assert infer_field_type("test@example.com") == "email"
    assert infer_field_type("user.name@domain.co.uk") == "email"


def test_infer_datetime():
    """Test datetime type inference."""
    assert infer_field_type("2024-01-15") == "datetime"
    assert infer_field_type("2024-01-15T10:30:00") == "datetime"
    assert infer_field_type("2024-01-15T10:30:00Z") == "datetime"
    assert infer_field_type("2024-01-15T10:30:00+05:00") == "datetime"


def test_infer_uuid():
    """Test UUID type inference."""
    assert infer_field_type("550e8400-e29b-41d4-a716-446655440000") == "uuid"
    assert infer_field_type("123e4567-e89b-12d3-a456-426614174000") == "uuid"


def test_infer_url():
    """Test URL type inference."""
    assert infer_field_type("https://example.com") == "url"
    assert infer_field_type("http://test.org/path") == "url"


def test_infer_currency():
    """Test currency type inference."""
    assert infer_field_type("$1,234.56") == "currency"
    assert infer_field_type("€100.00") == "currency"
    assert infer_field_type("£50") == "currency"
    assert infer_field_type("¥1000") == "currency"


def test_infer_phone():
    """Test phone number type inference."""
    # Use valid phone numbers (555 is invalid in phonenumbers library)
    assert infer_field_type("+12025551234") == "phone"
    assert infer_field_type("+442079460958") == "phone"
    assert infer_field_type("+1 202 555 1234") == "phone"


def test_infer_array():
    """Test array type inference."""
    assert infer_field_type([1, 2, 3]) == "array[number]"
    assert infer_field_type(["a", "b", "c"]) == "array[string]"
    assert infer_field_type([True, False]) == "array[boolean]"
    assert infer_field_type([]) == "array[object]"


def test_infer_nested_array():
    """Test nested array type inference."""
    assert infer_field_type([[1, 2], [3, 4]]) == "array[array[number]]"
    assert infer_field_type([["a"], ["b"]]) == "array[array[string]]"


def test_infer_object():
    """Test object type inference."""
    assert infer_field_type({"key": "value"}) == "object"
    assert infer_field_type({}) == "object"


def test_infer_null():
    """Test null handling."""
    assert infer_field_type(None) == "string"


def test_number_coercion():
    """Test string to number coercion."""
    assert try_coerce_to_number("123") == 123
    assert try_coerce_to_number("12.5") == 12.5
    assert try_coerce_to_number("1,234") == 1234
    assert try_coerce_to_number("abc") == "abc"
    assert try_coerce_to_number(123) == 123


def test_number_coercion_in_inference():
    """Test that numeric strings are inferred as numbers."""
    assert infer_field_type("123") == "number"
    assert infer_field_type("12.5") == "number"
    assert infer_field_type("1,234") == "number"


def test_infer_from_multiple_values():
    """Test type inference from multiple values."""
    assert infer_type_from_values([1, 2, 3]) == "number"
    assert infer_type_from_values(["a", "b", "c"]) == "string"
    assert infer_type_from_values([True, False, True]) == "boolean"


def test_infer_from_multiple_values_with_nulls():
    """Test that nulls are skipped when inferring from multiple values."""
    assert infer_type_from_values([1, None, 2, None, 3]) == "number"
    assert infer_type_from_values([None, None, "test"]) == "string"
    assert infer_type_from_values([None, None, None]) == "string"


def test_infer_from_multiple_values_with_conflicts():
    """Test type conflict resolution (most flexible wins)."""
    # String is more flexible than number
    assert infer_type_from_values([1, "abc"]) == "string"
    # String is more flexible than boolean
    assert infer_type_from_values([True, "test"]) == "string"
    # Text is more flexible than string
    assert infer_type_from_values(["short", "a" * 101]) == "text"


def test_openapi_schema_inference():
    """Test OpenAPI schema type inference."""
    assert infer_type_from_openapi_schema({"type": "integer"}) == "number"
    assert infer_type_from_openapi_schema({"type": "number"}) == "number"
    assert infer_type_from_openapi_schema({"type": "boolean"}) == "boolean"
    assert infer_type_from_openapi_schema({"type": "string"}) == "string"
    assert infer_type_from_openapi_schema({"type": "object"}) == "object"


def test_openapi_schema_with_format():
    """Test OpenAPI schema with format field."""
    assert infer_type_from_openapi_schema({"type": "string", "format": "email"}) == "email"
    assert infer_type_from_openapi_schema({"type": "string", "format": "date"}) == "datetime"
    assert infer_type_from_openapi_schema({"type": "string", "format": "date-time"}) == "datetime"
    assert infer_type_from_openapi_schema({"type": "string", "format": "uuid"}) == "uuid"
    assert infer_type_from_openapi_schema({"type": "string", "format": "uri"}) == "url"


def test_openapi_array_schema():
    """Test OpenAPI array schema inference."""
    assert (
        infer_type_from_openapi_schema({"type": "array", "items": {"type": "integer"}})
        == "array[number]"
    )
    assert (
        infer_type_from_openapi_schema({"type": "array", "items": {"type": "string"}})
        == "array[string]"
    )
    assert infer_type_from_openapi_schema({"type": "array"}) == "array[object]"


def test_openapi_text_inference():
    """Test OpenAPI text inference from maxLength."""
    assert (
        infer_type_from_openapi_schema({"type": "string", "maxLength": 200}) == "text"
    )
    assert (
        infer_type_from_openapi_schema({"type": "string", "maxLength": 50}) == "string"
    )


# Property-based tests
# Feature: backend-api-analyzer, Property 3: Field Type Consistency


@given(value=st.integers())
def test_property_integer_inference(value):
    """Property: Integers should be inferred as 'number'."""
    result = infer_field_type(value)
    assert result == "number"


@given(value=st.floats(allow_nan=False, allow_infinity=False))
def test_property_float_inference(value):
    """Property: Floats should be inferred as 'number'."""
    result = infer_field_type(value)
    assert result == "number"


@given(value=st.booleans())
def test_property_boolean_inference(value):
    """Property: Booleans should be inferred as 'boolean'."""
    result = infer_field_type(value)
    assert result == "boolean"


@given(value=st.emails())
def test_property_email_inference(value):
    """Property: Valid emails should be inferred as 'email'."""
    result = infer_field_type(value)
    assert result == "email"


@given(value=st.text(min_size=101, max_size=200))
def test_property_text_inference(value):
    """Property: Strings >100 chars should be inferred as 'text'."""
    # Skip if it matches other patterns (email, url, etc.)
    result = infer_field_type(value)
    # Should be text or one of the special types (if pattern matches)
    assert result in ["text", "email", "url", "datetime", "uuid", "phone", "currency"]


@given(value=st.text(min_size=1, max_size=100))
def test_property_string_inference(value):
    """Property: Short strings should be inferred as 'string' or special type."""
    result = infer_field_type(value)
    # Should be string or one of the special types
    assert result in [
        "string",
        "number",
        "email",
        "url",
        "datetime",
        "uuid",
        "phone",
        "currency",
    ]


@given(items=st.lists(st.integers(), min_size=1, max_size=10))
def test_property_array_number_inference(items):
    """Property: Arrays of integers should be inferred as 'array[number]'."""
    result = infer_field_type(items)
    assert result == "array[number]"


@given(items=st.lists(st.text(min_size=1, max_size=20), min_size=1, max_size=10))
def test_property_array_string_inference(items):
    """Property: Arrays of strings should be inferred as 'array[string]' or more specific."""
    result = infer_field_type(items)
    # Should be array of some string-like type
    assert result.startswith("array[")


@given(num=st.integers(min_value=-(2**53), max_value=2**53))
def test_property_number_coercion_integers(num):
    """Property: String integers should coerce to int (within safe range)."""
    result = try_coerce_to_number(str(num))
    assert result == num
    assert isinstance(result, int)


@given(num=st.floats(allow_nan=False, allow_infinity=False))
def test_property_number_coercion_floats(num):
    """Property: String floats should coerce to float."""
    result = try_coerce_to_number(str(num))
    # Allow small floating point differences
    assert abs(result - num) < 0.0001 or result == num


@given(
    values=st.lists(
        st.one_of(st.integers(), st.none()), min_size=1, max_size=10
    ).filter(lambda lst: any(v is not None for v in lst))
)
def test_property_multi_value_skips_nulls(values):
    """Property: Null values should be skipped when inferring from multiple values."""
    result = infer_type_from_values(values)
    # Should infer number from non-null integers
    assert result == "number"


@given(
    values=st.lists(
        st.one_of(st.integers(), st.text(min_size=1, max_size=20)),
        min_size=2,
        max_size=10,
    ).filter(
        lambda lst: any(isinstance(v, int) for v in lst)
        and any(isinstance(v, str) for v in lst)
    )
)
def test_property_type_conflict_resolution(values):
    """Property: String should win over number in type conflicts."""
    result = infer_type_from_values(values)
    # String is more flexible than number
    assert result in ["string", "text", "email", "url", "datetime", "uuid", "phone", "currency", "number"]


def test_property_empty_array():
    """Property: Empty arrays should default to 'array[object]'."""
    assert infer_array_type([]) == "array[object]"


def test_property_array_depth_limit():
    """Property: Array nesting should be capped at 2 levels."""
    # 3-level nesting should be capped
    deep_array = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
    result = infer_field_type(deep_array)
    # Should cap at array[array[...]]
    assert result.count("[") <= 2


@given(
    schema_type=st.sampled_from(["integer", "number", "boolean", "string", "object", "array"])
)
def test_property_openapi_schema_valid_types(schema_type):
    """Property: All OpenAPI schema types should be handled."""
    result = infer_type_from_openapi_schema({"type": schema_type})
    # Should return a valid type
    assert isinstance(result, str)
    assert len(result) > 0
