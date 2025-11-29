"""Tests for response unwrapper utility.

Property-based tests validate that the unwrapper correctly extracts data
from various nested structures.
"""

import pytest
from hypothesis import given, strategies as st

from app.utils.response_unwrapper import (
    unwrap_response,
    extract_array_from_response,
)


# Unit tests for specific cases
def test_unwrap_already_unwrapped_array():
    """Test unwrapping an already unwrapped array."""
    data = [{"id": 1}, {"id": 2}]
    result = unwrap_response(data)
    assert result == data


def test_unwrap_single_wrapper():
    """Test unwrapping single-level wrapper."""
    data = {"data": [{"id": 1}, {"id": 2}]}
    result = unwrap_response(data)
    assert result == [{"id": 1}, {"id": 2}]


def test_unwrap_nested_wrapper():
    """Test unwrapping nested wrapper structure."""
    data = {"Data": {"Users": [{"id": 1}, {"id": 2}]}}
    result = unwrap_response(data)
    assert result == [{"id": 1}, {"id": 2}]


def test_unwrap_multiple_nesting_levels():
    """Test unwrapping multiple nesting levels."""
    data = {"response": {"data": {"items": [{"id": 1}]}}}
    result = unwrap_response(data)
    assert result == [{"id": 1}]


def test_unwrap_case_insensitive_keys():
    """Test unwrapping with various case formats."""
    test_cases = [
        {"data": [{"id": 1}]},
        {"Data": [{"id": 1}]},
        {"result": [{"id": 1}]},
        {"Result": [{"id": 1}]},
        {"items": [{"id": 1}]},
        {"Items": [{"id": 1}]},
    ]

    for data in test_cases:
        result = unwrap_response(data)
        assert result == [{"id": 1}]


def test_unwrap_single_key_dict():
    """Test unwrapping dict with single key."""
    data = {"Users": [{"id": 1}]}
    result = unwrap_response(data)
    assert result == [{"id": 1}]


def test_unwrap_stops_at_multi_key_dict():
    """Test unwrapping stops when dict has multiple keys."""
    data = {"id": 1, "name": "test", "email": "test@example.com"}
    result = unwrap_response(data)
    assert result == data


def test_unwrap_primitive_value():
    """Test unwrapping primitive values returns them unchanged."""
    assert unwrap_response("string") == "string"
    assert unwrap_response(123) == 123
    assert unwrap_response(True) is True
    assert unwrap_response(None) is None


def test_extract_array_from_list():
    """Test extracting array from list response."""
    data = [{"id": 1}, {"id": 2}]
    result = extract_array_from_response(data)
    assert result == data


def test_extract_array_from_wrapped_list():
    """Test extracting array from wrapped list."""
    data = {"data": [{"id": 1}, {"id": 2}]}
    result = extract_array_from_response(data)
    assert result == [{"id": 1}, {"id": 2}]


def test_extract_array_from_single_object():
    """Test extracting array from single object wraps it in list."""
    data = {"id": 1, "name": "test"}
    result = extract_array_from_response(data)
    assert result == [data]


def test_extract_array_from_nested_single_object():
    """Test extracting array from nested single object."""
    data = {"data": {"id": 1, "name": "test"}}
    result = extract_array_from_response(data)
    assert result == [{"id": 1, "name": "test"}]


def test_extract_array_filters_non_dict_items():
    """Test that extract_array filters out non-dict items from arrays."""
    data = [{"id": 1}, "string", 123, {"id": 2}, None]
    result = extract_array_from_response(data)
    assert result == [{"id": 1}, {"id": 2}]


def test_extract_array_raises_on_empty_array():
    """Test that extract_array raises ValueError on array with no dicts."""
    with pytest.raises(ValueError, match="contains no objects"):
        extract_array_from_response([1, 2, 3, "string"])


def test_extract_array_raises_on_primitive():
    """Test that extract_array raises ValueError on primitive values."""
    with pytest.raises(ValueError, match="Cannot extract array"):
        extract_array_from_response("string")

    with pytest.raises(ValueError, match="Cannot extract array"):
        extract_array_from_response(123)


# Property-based tests
# Feature: backend-api-analyzer, Property 8: Response Unwrapping


@given(
    data=st.lists(
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(
                st.integers(),
                st.text(),
                st.booleans(),
                st.none(),
            ),
            min_size=1,
            max_size=10,
        ),
        min_size=1,
        max_size=20,
    )
)
def test_property_unwrap_preserves_array_data(data):
    """Property: Unwrapping an array should return the same array.

    For any list of objects, unwrapping should return the original list.
    """
    result = unwrap_response(data)
    assert result == data


@given(
    data=st.lists(
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.integers(), st.text(), st.booleans()),
            min_size=1,
            max_size=10,
        ),
        min_size=1,
        max_size=20,
    ),
    wrapper_key=st.sampled_from(
        ["data", "Data", "result", "Result", "items", "Items", "response", "Response"]
    ),
)
def test_property_unwrap_single_wrapper(data, wrapper_key):
    """Property: Unwrapping {wrapper: data} should extract data.

    For any data array and wrapper key, wrapping then unwrapping
    should return the original data.
    """
    wrapped = {wrapper_key: data}
    result = unwrap_response(wrapped)
    assert result == data


@given(
    data=st.lists(
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.integers(), st.text(), st.booleans()),
            min_size=1,
            max_size=10,
        ),
        min_size=1,
        max_size=20,
    ),
    wrapper1=st.sampled_from(["data", "Data", "result", "response"]),
    wrapper2=st.sampled_from(["Users", "Items", "Records", "Entities"]),
)
def test_property_unwrap_nested_wrappers(data, wrapper1, wrapper2):
    """Property: Unwrapping nested wrappers should extract innermost data.

    For any data array and two wrapper keys, double-wrapping then
    unwrapping should return the original data.
    """
    wrapped = {wrapper1: {wrapper2: data}}
    result = unwrap_response(wrapped)
    assert result == data


@given(
    obj=st.dictionaries(
        keys=st.text(min_size=1, max_size=20),
        values=st.one_of(st.integers(), st.text(), st.booleans()),
        min_size=2,
        max_size=10,
    )
)
def test_property_unwrap_multi_key_dict_unchanged(obj):
    """Property: Unwrapping dict with multiple keys returns it unchanged.

    For any dict with 2+ keys, unwrapping should return the original dict
    since it's not a wrapper pattern.
    """
    result = unwrap_response(obj)
    assert result == obj


@given(
    data=st.lists(
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.integers(), st.text(), st.booleans()),
            min_size=1,
            max_size=10,
        ),
        min_size=1,
        max_size=20,
    )
)
def test_property_extract_array_from_list(data):
    """Property: Extracting array from list returns the list.

    For any list of dicts, extract_array_from_response should return
    the same list.
    """
    result = extract_array_from_response(data)
    assert result == data


@given(
    obj=st.dictionaries(
        keys=st.text(min_size=1, max_size=20),
        values=st.one_of(st.integers(), st.text(), st.booleans()),
        min_size=1,
        max_size=10,
    )
)
def test_property_extract_array_wraps_single_object(obj):
    """Property: Extracting array from single object wraps it in list.

    For any dict, extract_array_from_response should return [dict].
    """
    result = extract_array_from_response(obj)
    assert result == [obj]
    assert len(result) == 1
    assert result[0] == obj


@given(
    data=st.lists(
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.integers(), st.text(), st.booleans()),
            min_size=1,
            max_size=10,
        ),
        min_size=1,
        max_size=20,
    ),
    wrapper_key=st.sampled_from(["data", "result", "items"]),
)
def test_property_extract_array_unwraps_wrapper(data, wrapper_key):
    """Property: Extracting array from wrapped data unwraps it.

    For any data array and wrapper key, wrapping then extracting
    should return the original data.
    """
    wrapped = {wrapper_key: data}
    result = extract_array_from_response(wrapped)
    assert result == data
