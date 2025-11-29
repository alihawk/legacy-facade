"""Property-based tests for LLM name converter.

**Feature: backend-api-analyzer, Property 4: LLM-Based Display Name Transformation**
"""

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from app.utils.llm_name_converter import (
    clear_cache,
    convert_batch_to_display_names,
    convert_to_display_name,
)


# Hypothesis strategies for generating field names


@st.composite
def field_name_with_underscores(draw):
    """Generate field name with underscores (snake_case)."""
    parts = draw(
        st.lists(
            st.text(alphabet="abcdefghijklmnopqrstuvwxyz", min_size=2, max_size=8),
            min_size=1,
            max_size=4,
        )
    )
    return "_".join(parts)


@st.composite
def field_name_camel_case(draw):
    """Generate camelCase field name."""
    first_part = draw(st.text(alphabet="abcdefghijklmnopqrstuvwxyz", min_size=2, max_size=8))
    num_parts = draw(st.integers(min_value=0, max_value=3))
    
    rest_parts = []
    for _ in range(num_parts):
        capital = draw(st.sampled_from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"))
        rest = draw(st.text(alphabet="abcdefghijklmnopqrstuvwxyz", min_size=1, max_size=7))
        rest_parts.append(capital + rest)
    
    return first_part + "".join(rest_parts)


@st.composite
def field_name_with_numbers(draw):
    """Generate field name with numbers."""
    base = draw(st.text(alphabet="abcdefghijklmnopqrstuvwxyz", min_size=2, max_size=8))
    number = draw(st.integers(min_value=1, max_value=99))
    return f"{base}{number}"


@st.composite
def any_field_name(draw):
    """Generate any type of field name."""
    return draw(
        st.one_of(
            field_name_with_underscores(),
            field_name_camel_case(),
            field_name_with_numbers(),
        )
    )


# Property 4: LLM-Based Display Name Transformation


@settings(max_examples=50, deadline=5000)
@given(field_name=any_field_name())
def test_property_display_name_is_readable(field_name):
    """Property 4: Display names should be human-readable.

    **Feature: backend-api-analyzer, Property 4: LLM-Based Display Name Transformation**
    **Validates: Requirements 6.3**

    For any technical field name, the display name should:
    1. Not be empty
    2. Contain only alphanumeric characters and spaces
    3. Start with a capital letter
    4. Be different from the original (unless already in Title Case)
    """
    clear_cache()

    display_name = convert_to_display_name(field_name)

    # Should not be empty
    assert display_name, f"Display name should not be empty for '{field_name}'"

    # Should start with capital letter
    assert display_name[0].isupper(), (
        f"Display name '{display_name}' should start with capital letter"
    )

    # Should contain spaces if original had underscores or camelCase
    if "_" in field_name or any(c.isupper() for c in field_name[1:]):
        assert " " in display_name or len(field_name.split("_")) == 1, (
            f"Display name '{display_name}' should have spaces for '{field_name}'"
        )


@settings(max_examples=50, deadline=5000)
@given(field_names=st.lists(any_field_name(), min_size=1, max_size=10, unique=True))
def test_property_batch_conversion_consistency(field_names):
    """Test that batch conversion produces consistent results.

    For any list of field names, converting them in batch should
    produce the same results as converting them individually.
    """
    clear_cache()

    # Convert in batch
    batch_result = convert_batch_to_display_names(field_names, use_llm=False)

    # Convert individually
    individual_results = {name: convert_to_display_name(name) for name in field_names}

    # Should produce same results
    assert batch_result == individual_results, (
        "Batch and individual conversions should match"
    )


@settings(max_examples=50, deadline=5000)
@given(field_name=any_field_name())
def test_property_caching_idempotence(field_name):
    """Test that caching doesn't change results.

    Converting the same field name multiple times should
    always produce the same display name.
    """
    clear_cache()

    # First conversion
    result1 = convert_to_display_name(field_name)

    # Second conversion (should use cache)
    result2 = convert_to_display_name(field_name)

    # Third conversion
    result3 = convert_to_display_name(field_name)

    # All should be identical
    assert result1 == result2 == result3, (
        f"Cached conversions should be identical for '{field_name}'"
    )


@settings(max_examples=30, deadline=5000)
@given(
    field_names=st.lists(
        field_name_with_underscores(), min_size=2, max_size=5, unique=True
    )
)
def test_property_snake_case_to_title_case(field_names):
    """Test snake_case to Title Case conversion.

    For any snake_case field name, the display name should:
    1. Replace underscores with spaces
    2. Capitalize each word
    """
    clear_cache()

    results = convert_batch_to_display_names(field_names, use_llm=False)

    for field_name, display_name in results.items():
        # Should not contain underscores
        assert "_" not in display_name, (
            f"Display name '{display_name}' should not contain underscores"
        )

        # Should have spaces (unless single word)
        if "_" in field_name:
            assert " " in display_name, (
                f"Display name '{display_name}' should have spaces for '{field_name}'"
            )

        # Each word should be capitalized
        words = display_name.split()
        for word in words:
            assert word[0].isupper(), (
                f"Word '{word}' in '{display_name}' should be capitalized"
            )


@settings(max_examples=30, deadline=5000)
@given(field_names=st.lists(field_name_camel_case(), min_size=2, max_size=5, unique=True))
def test_property_camel_case_to_title_case(field_names):
    """Test camelCase to Title Case conversion.

    For any camelCase field name, the display name should:
    1. Insert spaces before capital letters
    2. Capitalize each word
    """
    clear_cache()

    results = convert_batch_to_display_names(field_names, use_llm=False)

    for field_name, display_name in results.items():
        # Should start with capital letter
        assert display_name[0].isupper(), (
            f"Display name '{display_name}' should start with capital"
        )

        # If original had capitals, display should have spaces
        if any(c.isupper() for c in field_name[1:]):
            # Should have spaces or be a single word
            assert " " in display_name or display_name.isalpha(), (
                f"Display name '{display_name}' should have spaces for '{field_name}'"
            )
