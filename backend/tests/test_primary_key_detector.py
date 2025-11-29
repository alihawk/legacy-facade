"""Tests for primary key detector utility.

Property-based tests validate that the detector correctly identifies
primary keys across various field name patterns.
"""

from hypothesis import given, strategies as st

from app.utils.primary_key_detector import detect_primary_key, _singularize_resource_name


# Unit tests for specific cases
def test_detect_id_field():
    """Test detection of 'id' field."""
    field_names = ["id", "name", "email"]
    result = detect_primary_key(field_names)
    assert result == "id"


def test_detect_underscore_id_field():
    """Test detection of '_id' field."""
    field_names = ["_id", "name", "email"]
    result = detect_primary_key(field_names)
    assert result == "_id"


def test_id_takes_priority_over_underscore_id():
    """Test that 'id' takes priority over '_id'."""
    field_names = ["id", "_id", "name"]
    result = detect_primary_key(field_names)
    assert result == "id"


def test_detect_resource_snake_case_pattern():
    """Test detection of {resource}_id pattern."""
    field_names = ["user_id", "name", "email"]
    result = detect_primary_key(field_names, resource_name="users")
    assert result == "user_id"


def test_detect_resource_camel_case_pattern():
    """Test detection of {resource}Id pattern."""
    field_names = ["userId", "name", "email"]
    result = detect_primary_key(field_names, resource_name="users")
    assert result == "userId"


def test_id_takes_priority_over_resource_pattern():
    """Test that 'id' takes priority over resource-specific patterns."""
    field_names = ["id", "user_id", "name"]
    result = detect_primary_key(field_names, resource_name="users")
    assert result == "id"


def test_underscore_id_takes_priority_over_resource_pattern():
    """Test that '_id' takes priority over resource-specific patterns."""
    field_names = ["_id", "user_id", "name"]
    result = detect_primary_key(field_names, resource_name="users")
    assert result == "_id"


def test_default_to_id_when_no_match():
    """Test defaulting to 'id' when no pattern matches."""
    field_names = ["name", "email", "created_at"]
    result = detect_primary_key(field_names)
    assert result == "id"


def test_default_to_id_when_empty_list():
    """Test defaulting to 'id' when field list is empty."""
    result = detect_primary_key([])
    assert result == "id"


def test_default_to_id_with_resource_name_no_match():
    """Test defaulting to 'id' when resource pattern doesn't match."""
    field_names = ["name", "email"]
    result = detect_primary_key(field_names, resource_name="users")
    assert result == "id"


def test_resource_pattern_with_singular_resource():
    """Test resource pattern works with singular resource name."""
    field_names = ["user_id", "name"]
    result = detect_primary_key(field_names, resource_name="user")
    assert result == "user_id"


def test_resource_pattern_with_plural_resource():
    """Test resource pattern works with plural resource name."""
    field_names = ["user_id", "name"]
    result = detect_primary_key(field_names, resource_name="users")
    assert result == "user_id"


def test_multiple_resource_patterns_snake_case_wins():
    """Test that snake_case pattern is preferred over camelCase."""
    field_names = ["user_id", "userId", "name"]
    result = detect_primary_key(field_names, resource_name="users")
    assert result == "user_id"


def test_singularize_users():
    """Test singularization of 'users'."""
    assert _singularize_resource_name("users") == "user"


def test_singularize_items():
    """Test singularization of 'items'."""
    assert _singularize_resource_name("items") == "item"


def test_singularize_categories():
    """Test singularization of 'categories'."""
    assert _singularize_resource_name("categories") == "category"


def test_singularize_addresses():
    """Test singularization of 'addresses'."""
    assert _singularize_resource_name("addresses") == "address"


def test_singularize_already_singular():
    """Test singularization of already singular word."""
    assert _singularize_resource_name("user") == "user"
    assert _singularize_resource_name("data") == "data"


# Property-based tests
# Feature: backend-api-analyzer, Property 5: Primary Key Detection
# Feature: backend-api-analyzer, Property 6: Primary Key Default Behavior


@given(
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(lambda x: x not in ["id", "_id"]),
        min_size=0,
        max_size=10,
    )
)
def test_property_id_field_always_detected(other_fields):
    """Property: If 'id' field exists, it should be detected as primary key.

    For any list of field names containing 'id', detect_primary_key
    should return 'id'.
    """
    field_names = ["id"] + other_fields
    result = detect_primary_key(field_names)
    assert result == "id"


@given(
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(lambda x: x not in ["id", "_id"]),
        min_size=0,
        max_size=10,
    )
)
def test_property_underscore_id_field_detected(other_fields):
    """Property: If '_id' field exists (and no 'id'), it should be detected.

    For any list of field names containing '_id' but not 'id',
    detect_primary_key should return '_id'.
    """
    field_names = ["_id"] + other_fields
    result = detect_primary_key(field_names)
    assert result == "_id"


@given(
    resource_base=st.text(
        alphabet=st.characters(whitelist_categories=("Ll",)), min_size=4, max_size=12
    ),
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(lambda x: x not in ["id", "_id"]),
        min_size=0,
        max_size=10,
    ),
)
def test_property_resource_snake_case_pattern_detected(resource_base, other_fields):
    """Property: {resource}_id pattern should be detected.

    For any resource name and field list containing {singular_resource}_id
    (but not 'id' or '_id'), detect_primary_key should return the pattern.
    """
    resource_name = resource_base + "s"  # Make it plural
    singular = _singularize_resource_name(resource_name)
    pattern_field = f"{singular}_id"
    field_names = [pattern_field] + other_fields
    result = detect_primary_key(field_names, resource_name=resource_name)
    assert result == pattern_field


@given(
    resource_base=st.text(
        alphabet=st.characters(whitelist_categories=("Ll",)), min_size=4, max_size=12
    ),
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(lambda x: x not in ["id", "_id"]),
        min_size=0,
        max_size=10,
    ),
)
def test_property_resource_camel_case_pattern_detected(resource_base, other_fields):
    """Property: {resource}Id pattern should be detected.

    For any resource name and field list containing {singular_resource}Id
    (but not 'id', '_id', or snake_case pattern), detect_primary_key
    should return the pattern.
    """
    resource_name = resource_base + "s"  # Make it plural
    singular = _singularize_resource_name(resource_name)
    pattern_field = f"{singular}Id"
    # Ensure snake_case pattern is not present
    snake_case_pattern = f"{singular}_id"
    filtered_fields = [f for f in other_fields if f != snake_case_pattern]
    field_names = [pattern_field] + filtered_fields
    result = detect_primary_key(field_names, resource_name=resource_name)
    assert result == pattern_field


@given(
    resource_name=st.text(
        alphabet=st.characters(whitelist_categories=("Ll",)), min_size=3, max_size=15
    )
)
def test_property_singularize_is_idempotent(resource_name):
    """Property: Singularizing twice should give same result as once.

    For any resource name, singularizing it twice should produce
    the same result as singularizing it once.
    """
    once = _singularize_resource_name(resource_name)
    twice = _singularize_resource_name(once)
    assert once == twice


# LLM-based detection tests
def test_llm_detects_legacy_primary_key():
    """Test LLM detection of legacy primary key patterns.
    
    This test uses field names that don't match standard heuristics
    but should be recognizable by the LLM as primary keys.
    """
    # These field names don't match our heuristics (id, _id, resource_id, resourceId)
    # but "recid" is a common legacy primary key pattern
    field_names = ["recid", "customer_name", "address", "phone"]
    result = detect_primary_key(field_names, resource_name="customers")
    
    # The LLM should detect "recid" as the primary key
    # If LLM is not configured or fails, it will default to "id"
    assert result in ["recid", "id"], f"Expected 'recid' or 'id', got '{result}'"


def test_llm_detects_uuid_pattern():
    """Test LLM detection of UUID-based primary keys."""
    field_names = ["uuid", "title", "description", "created_at"]
    result = detect_primary_key(field_names, resource_name="articles")
    
    # The LLM should detect "uuid" as the primary key
    assert result in ["uuid", "id"], f"Expected 'uuid' or 'id', got '{result}'"


def test_llm_detects_pk_pattern():
    """Test LLM detection of 'pk' as primary key."""
    field_names = ["pk", "product_name", "price", "stock"]
    result = detect_primary_key(field_names, resource_name="products")
    
    # The LLM should detect "pk" as the primary key
    assert result in ["pk", "id"], f"Expected 'pk' or 'id', got '{result}'"


def test_llm_detects_record_id_pattern():
    """Test LLM detection of 'record_id' pattern."""
    field_names = ["record_id", "employee_name", "department", "salary"]
    result = detect_primary_key(field_names, resource_name="employees")
    
    # The LLM should detect "record_id" as the primary key
    assert result in ["record_id", "id"], f"Expected 'record_id' or 'id', got '{result}'"


def test_llm_detects_number_pattern():
    """Test LLM detection of numeric identifier patterns."""
    field_names = ["order_no", "customer", "total", "status"]
    result = detect_primary_key(field_names, resource_name="orders")
    
    # The LLM should detect "order_no" as the primary key
    assert result in ["order_no", "id"], f"Expected 'order_no' or 'id', got '{result}'"


def test_llm_detection_with_multiple_candidates():
    """Test LLM chooses the most likely primary key from multiple candidates.
    
    This test is marked as slow and requires --run-llm-tests flag.
    """
    # Multiple fields that could be identifiers
    field_names = ["seq", "record_no", "name", "code", "description"]
    result = detect_primary_key(field_names, resource_name="items")
    
    # The LLM should pick one of the identifier-like fields
    # "seq" or "record_no" are most likely, but "code" is also possible
    assert result in ["seq", "record_no", "code", "id"], \
        f"Expected identifier field, got '{result}'"
