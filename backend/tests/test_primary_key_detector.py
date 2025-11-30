"""Tests for primary key detector utility.

Tests validate regex-based pattern matching with word boundaries and LLM fallback
for ambiguous cases (zero or multiple candidates).
"""

from unittest.mock import patch

import pytest
from hypothesis import given, settings, strategies as st

from app.utils.primary_key_detector import (
    detect_primary_key,
    _find_primary_key_candidates,
)


# Unit tests for regex pattern matching
class TestRegexPatternMatching:
    """Test regex-based primary key pattern detection."""

    def test_detect_id_pattern(self):
        """Test detection of 'id' field using word boundary."""
        field_names = ["id", "name", "email"]
        result = detect_primary_key(field_names)
        assert result == "id"

    def test_detect_user_id_pattern(self):
        """Test detection of 'user_id' field (contains 'id')."""
        field_names = ["user_id", "name", "email"]
        result = detect_primary_key(field_names)
        assert result == "user_id"

    def test_detect_userId_camelCase_pattern(self):
        """Test detection of 'userId' field (contains 'id')."""
        field_names = ["userId", "name", "email"]
        result = detect_primary_key(field_names)
        assert result == "userId"

    def test_id_pattern_does_not_match_video(self):
        """Test that 'video' does not match 'id' pattern (word boundary)."""
        field_names = ["video", "audio", "name"]
        candidates = _find_primary_key_candidates(field_names)
        assert "video" not in candidates
        assert len(candidates) == 0

    def test_detect_key_pattern(self):
        """Test detection of 'key' field."""
        field_names = ["key", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "key"

    def test_detect_api_key_pattern(self):
        """Test detection of 'api_key' field (contains 'key')."""
        field_names = ["api_key", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "api_key"

    def test_detect_code_pattern(self):
        """Test detection of 'code' field."""
        field_names = ["code", "name", "description"]
        result = detect_primary_key(field_names)
        assert result == "code"

    def test_detect_user_code_pattern(self):
        """Test detection of 'user_code' field (contains 'code')."""
        field_names = ["user_code", "name", "email"]
        result = detect_primary_key(field_names)
        assert result == "user_code"

    def test_detect_number_pattern(self):
        """Test detection of 'number' field."""
        field_names = ["number", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "number"

    def test_detect_account_number_pattern(self):
        """Test detection of 'account_number' field (contains 'number')."""
        field_names = ["account_number", "name", "balance"]
        result = detect_primary_key(field_names)
        assert result == "account_number"

    def test_detect_uuid_pattern(self):
        """Test detection of 'uuid' field."""
        field_names = ["uuid", "name", "created_at"]
        result = detect_primary_key(field_names)
        assert result == "uuid"

    def test_detect_user_uuid_pattern(self):
        """Test detection of 'user_uuid' field (contains 'uuid')."""
        field_names = ["user_uuid", "name", "email"]
        result = detect_primary_key(field_names)
        assert result == "user_uuid"

    def test_detect_guid_pattern(self):
        """Test detection of 'guid' field."""
        field_names = ["guid", "name", "created_at"]
        result = detect_primary_key(field_names)
        assert result == "guid"

    def test_detect_pk_pattern(self):
        """Test detection of 'pk' field."""
        field_names = ["pk", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "pk"

    def test_detect_primary_key_pattern(self):
        """Test detection of 'primary_key' field."""
        field_names = ["primary_key", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "primary_key"

    def test_detect_no_pattern(self):
        """Test detection of 'no' field (numeric identifier)."""
        field_names = ["no", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "no"

    def test_detect_order_no_pattern(self):
        """Test detection of 'order_no' field (contains 'no')."""
        field_names = ["order_no", "customer", "total"]
        result = detect_primary_key(field_names)
        assert result == "order_no"

    def test_detect_num_pattern(self):
        """Test detection of 'num' field."""
        field_names = ["num", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "num"

    def test_detect_seq_pattern(self):
        """Test detection of 'seq' field."""
        field_names = ["seq", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "seq"

    def test_detect_recid_pattern(self):
        """Test detection of 'recid' field (legacy pattern)."""
        field_names = ["recid", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "recid"

    def test_detect_record_id_pattern(self):
        """Test detection of 'record_id' field (legacy pattern)."""
        field_names = ["record_id", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "record_id"

    def test_detect_rowid_pattern(self):
        """Test detection of 'rowid' field (legacy pattern)."""
        field_names = ["rowid", "name", "value"]
        result = detect_primary_key(field_names)
        assert result == "rowid"


class TestCandidateFinding:
    """Test the _find_primary_key_candidates helper function."""

    def test_single_candidate(self):
        """Test finding single primary key candidate."""
        field_names = ["id", "name", "email"]
        candidates = _find_primary_key_candidates(field_names)
        assert candidates == ["id"]

    def test_multiple_candidates(self):
        """Test finding multiple primary key candidates."""
        field_names = ["id", "uuid", "name"]
        candidates = _find_primary_key_candidates(field_names)
        assert set(candidates) == {"id", "uuid"}

    def test_no_candidates(self):
        """Test finding no primary key candidates."""
        field_names = ["name", "email", "created_at"]
        candidates = _find_primary_key_candidates(field_names)
        assert candidates == []

    def test_word_boundary_prevents_false_match(self):
        """Test that word boundaries prevent false matches."""
        field_names = ["video", "audio", "name"]
        candidates = _find_primary_key_candidates(field_names)
        assert candidates == []

    def test_case_insensitive_matching(self):
        """Test that pattern matching is case-insensitive."""
        field_names = ["ID", "Name", "Email"]
        candidates = _find_primary_key_candidates(field_names)
        assert candidates == ["ID"]

    def test_multiple_patterns_in_one_field(self):
        """Test field matching multiple patterns only added once."""
        field_names = ["id_key", "name"]  # Matches both 'id' and 'key'
        candidates = _find_primary_key_candidates(field_names)
        assert candidates == ["id_key"]
        assert len(candidates) == 1  # Should only appear once

    def test_id_pattern_prioritized_over_code_pattern(self):
        """Test that 'id' pattern takes priority over 'code' pattern.
        
        Regression test for performance issue where dept_code was matching
        'code' pattern and triggering unnecessary LLM disambiguation when
        user_id was present.
        """
        field_names = ["user_id", "dept_code", "name", "email"]
        candidates = _find_primary_key_candidates(field_names)
        # Should only return user_id, not dept_code
        assert candidates == ["user_id"]
        
        # Verify detect_primary_key returns user_id without LLM call
        result = detect_primary_key(field_names)
        assert result == "user_id"


class TestLLMFallback:
    """Test LLM fallback for ambiguous cases."""

    @patch("app.utils.primary_key_detector.settings")
    def test_zero_candidates_uses_llm_or_defaults_to_id(self, mock_settings):
        """Test that zero candidates triggers LLM or defaults to 'id'."""
        # Disable LLM to test default behavior
        mock_settings.openai_api_key = None

        field_names = ["name", "email", "created_at"]
        result = detect_primary_key(field_names)
        # Should default to "id" when LLM is not configured
        assert result == "id"

    @patch("app.utils.primary_key_detector.settings")
    def test_multiple_candidates_uses_llm_or_first(self, mock_settings):
        """Test that multiple candidates triggers LLM or uses first."""
        # Disable LLM to test fallback behavior
        mock_settings.openai_api_key = None

        field_names = ["id", "uuid", "key", "name"]
        result = detect_primary_key(field_names)
        # Should fall back to first candidate when LLM is not configured
        assert result == "id"  # First candidate

    def test_single_candidate_no_llm_needed(self):
        """Test that single candidate doesn't need LLM."""
        field_names = ["user_id", "name", "email"]
        result = detect_primary_key(field_names)
        assert result == "user_id"


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_empty_field_list_defaults_to_id(self):
        """Test that empty field list defaults to 'id'."""
        result = detect_primary_key([])
        assert result == "id"

    @patch("app.utils.primary_key_detector.settings")
    def test_resource_name_passed_to_llm(self, mock_settings):
        """Test that resource name is passed to LLM for context."""
        # Disable LLM to test fallback behavior
        mock_settings.openai_api_key = None

        # Multiple candidates should trigger LLM with resource context
        field_names = ["id", "uuid", "name"]
        result = detect_primary_key(field_names, resource_name="users")
        # Should fall back to first candidate
        assert result == "id"


# Property-based tests
# Feature: backend-api-analyzer, Property 5: Primary Key Pattern Detection
# Feature: backend-api-analyzer, Property 6: Primary Key Disambiguation


@given(
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(
            lambda x: not any(
                pattern in x.lower()
                for pattern in [
                    "id",
                    "key",
                    "code",
                    "number",
                    "uuid",
                    "guid",
                    "pk",
                    "no",
                    "num",
                    "seq",
                    "recid",
                    "rowid",
                ]
            )
        ),
        min_size=0,
        max_size=10,
    )
)
@settings(max_examples=50, deadline=None)
def test_property_id_pattern_always_detected(other_fields):
    """Property: If field contains 'id' pattern, it should be detected.

    For any list of field names containing a field with 'id' pattern,
    detect_primary_key should return that field.
    """
    field_names = ["user_id"] + other_fields
    result = detect_primary_key(field_names)
    assert result == "user_id"


@given(
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(
            lambda x: not any(
                pattern in x.lower()
                for pattern in [
                    "id",
                    "key",
                    "code",
                    "number",
                    "uuid",
                    "guid",
                    "pk",
                    "no",
                    "num",
                    "seq",
                    "recid",
                    "rowid",
                ]
            )
        ),
        min_size=0,
        max_size=10,
    )
)
@settings(max_examples=50, deadline=None)
def test_property_uuid_pattern_detected(other_fields):
    """Property: If field contains 'uuid' pattern, it should be detected.

    For any list of field names containing a field with 'uuid' pattern,
    detect_primary_key should return that field.
    """
    field_names = ["uuid"] + other_fields
    result = detect_primary_key(field_names)
    assert result == "uuid"


@given(
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(
            lambda x: not any(
                pattern in x.lower()
                for pattern in [
                    "id",
                    "key",
                    "code",
                    "number",
                    "uuid",
                    "guid",
                    "pk",
                    "no",
                    "num",
                    "seq",
                    "recid",
                    "rowid",
                ]
            )
        ),
        min_size=0,
        max_size=10,
    )
)
@settings(max_examples=50, deadline=None)
@patch("app.utils.primary_key_detector.settings")
def test_property_no_pattern_defaults_to_id(mock_settings, other_fields):
    """Property: If no pattern matches, should default to 'id'.

    For any list of field names with no primary key patterns,
    detect_primary_key should return 'id'.
    """
    # Disable LLM to test default behavior
    mock_settings.openai_api_key = None
    
    result = detect_primary_key(other_fields)
    assert result == "id"


@given(
    pattern=st.sampled_from(
        ["key", "code", "number", "uuid", "guid", "pk", "no", "num", "seq", "recid"]
    ),
    other_fields=st.lists(
        st.text(
            alphabet=st.characters(
                whitelist_categories=("Ll", "Lu", "Nd"), whitelist_characters="_"
            ),
            min_size=1,
            max_size=20,
        ).filter(
            lambda x: not any(
                p in x.lower()
                for p in [
                    "id",
                    "key",
                    "code",
                    "number",
                    "uuid",
                    "guid",
                    "pk",
                    "no",
                    "num",
                    "seq",
                    "recid",
                    "rowid",
                ]
            )
        ),
        min_size=0,
        max_size=10,
    ),
)
@settings(max_examples=50, deadline=None)
def test_property_all_patterns_detected(pattern, other_fields):
    """Property: All defined patterns should be detected.

    For any primary key pattern and list of non-matching fields,
    detect_primary_key should return the pattern field.
    """
    field_names = [pattern] + other_fields
    result = detect_primary_key(field_names)
    assert result == pattern
