"""Tests for display name converter utilities.

Tests simple string transformation (default) and LLM-based conversion (optional).
"""

from unittest.mock import MagicMock, patch

import pytest

from app.utils.llm_name_converter import (
    convert_batch_to_display_names_llm,
    convert_batch_to_display_names_simple,
    simple_title_case,
)


class TestSimpleTitleCase:
    """Test suite for simple Title Case transformation."""

    def test_snake_case_conversion(self):
        """Test snake_case to Title Case conversion."""
        assert simple_title_case("user_name") == "User Name"
        assert simple_title_case("created_at") == "Created At"
        assert simple_title_case("is_active") == "Is Active"

    def test_camel_case_conversion(self):
        """Test camelCase to Title Case conversion."""
        assert simple_title_case("userId") == "User Id"
        assert simple_title_case("createdAt") == "Created At"
        assert simple_title_case("isActive") == "Is Active"

    def test_hyphen_case_conversion(self):
        """Test hyphen-case to Title Case conversion."""
        assert simple_title_case("user-id") == "User Id"
        assert simple_title_case("created-at") == "Created At"
        assert simple_title_case("is-active") == "Is Active"

    def test_mixed_format_conversion(self):
        """Test mixed format conversion."""
        assert simple_title_case("getUserData") == "Get User Data"
        assert simple_title_case("user_profile_v2") == "User Profile V2"
        assert simple_title_case("email-address_new") == "Email Address New"

    def test_all_caps_names(self):
        """Test handling of all-caps names."""
        assert simple_title_case("ID") == "Id"
        assert simple_title_case("URL") == "Url"
        assert simple_title_case("API") == "Api"

    def test_pascal_case_conversion(self):
        """Test PascalCase to Title Case conversion."""
        assert simple_title_case("UserName") == "User Name"
        assert simple_title_case("EmailAddress") == "Email Address"
        assert simple_title_case("CreatedAt") == "Created At"

    def test_numbers_in_names(self):
        """Test handling of numbers in field names."""
        assert simple_title_case("user1") == "User1"
        assert simple_title_case("field2name") == "Field2Name"
        assert simple_title_case("api3key") == "Api3Key"

    def test_special_characters(self):
        """Test handling of special characters."""
        # Special characters are preserved
        result = simple_title_case("user@name")
        assert "User" in result and "@" in result

    def test_empty_string(self):
        """Test handling of empty string."""
        assert simple_title_case("") == ""

    def test_single_word(self):
        """Test handling of single word."""
        assert simple_title_case("user") == "User"
        assert simple_title_case("email") == "Email"


class TestBatchSimpleConversion:
    """Test suite for batch simple conversion."""

    def test_batch_snake_case(self):
        """Test batch conversion of snake_case names."""
        result = convert_batch_to_display_names_simple(
            ["user_id", "email_address", "created_at"]
        )

        assert result["user_id"] == "User Id"
        assert result["email_address"] == "Email Address"
        assert result["created_at"] == "Created At"

    def test_batch_camel_case(self):
        """Test batch conversion of camelCase names."""
        result = convert_batch_to_display_names_simple(
            ["userId", "emailAddress", "createdAt"]
        )

        assert result["userId"] == "User Id"
        assert result["emailAddress"] == "Email Address"
        assert result["createdAt"] == "Created At"

    def test_batch_mixed_formats(self):
        """Test batch conversion of mixed format names."""
        result = convert_batch_to_display_names_simple(
            ["user_id", "emailAddress", "created-at", "IsActive"]
        )

        assert result["user_id"] == "User Id"
        assert result["emailAddress"] == "Email Address"
        assert result["created-at"] == "Created At"
        assert result["IsActive"] == "Is Active"

    def test_empty_list(self):
        """Test converting empty list."""
        result = convert_batch_to_display_names_simple([])
        assert result == {}

    def test_single_name(self):
        """Test converting single name."""
        result = convert_batch_to_display_names_simple(["user_name"])
        assert result == {"user_name": "User Name"}

    def test_duplicate_names(self):
        """Test handling of duplicate names."""
        result = convert_batch_to_display_names_simple(
            ["user_id", "user_id", "email"]
        )
        assert len(result) == 2  # Duplicates should be handled
        assert result["user_id"] == "User Id"
        assert result["email"] == "Email"


class TestLLMConversion:
    """Test suite for LLM-based conversion."""

    @patch("app.utils.llm_name_converter.settings")
    def test_llm_not_configured_raises_error(self, mock_settings):
        """Test that LLM conversion raises error when not configured."""
        mock_settings.llm_provider = None

        with pytest.raises(ValueError, match="LLM provider not configured"):
            convert_batch_to_display_names_llm(["usr_prof_v2"])

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_abbreviation_expansion(self, mock_openai, mock_settings):
        """Test LLM expands abbreviations correctly."""
        # Configure settings
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        mock_settings.llm_model = "gpt-4o-mini"

        # Mock OpenAI response
        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = (
            '{"usr_prof_v2": "User Profile", '
            '"dt_created_ts": "Date Created", '
            '"fld_email_addr_1": "Email Address"}'
        )
        mock_client.chat.completions.create.return_value = mock_response

        # Test conversion
        result = convert_batch_to_display_names_llm(
            ["usr_prof_v2", "dt_created_ts", "fld_email_addr_1"]
        )

        # Verify LLM was called
        assert mock_client.chat.completions.create.called

        # Verify results match LLM output
        assert result["usr_prof_v2"] == "User Profile"
        assert result["dt_created_ts"] == "Date Created"
        assert result["fld_email_addr_1"] == "Email Address"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_removes_technical_prefixes(self, mock_openai, mock_settings):
        """Test LLM removes technical prefixes."""
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        mock_settings.llm_model = "gpt-4o-mini"

        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = (
            '{"fld_email": "Email", "tbl_users": "Users", "col_name": "Name"}'
        )
        mock_client.chat.completions.create.return_value = mock_response

        result = convert_batch_to_display_names_llm(
            ["fld_email", "tbl_users", "col_name"]
        )

        assert result["fld_email"] == "Email"
        assert result["tbl_users"] == "Users"
        assert result["col_name"] == "Name"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_removes_version_suffixes(self, mock_openai, mock_settings):
        """Test LLM removes version suffixes."""
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        mock_settings.llm_model = "gpt-4o-mini"

        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = (
            '{"user_profile_v2": "User Profile", '
            '"email_new": "Email", '
            '"status_old": "Status"}'
        )
        mock_client.chat.completions.create.return_value = mock_response

        result = convert_batch_to_display_names_llm(
            ["user_profile_v2", "email_new", "status_old"]
        )

        assert result["user_profile_v2"] == "User Profile"
        assert result["email_new"] == "Email"
        assert result["status_old"] == "Status"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_fallback_on_error(self, mock_openai, mock_settings):
        """Test fallback to simple Title Case when LLM fails."""
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        mock_settings.llm_model = "gpt-4o-mini"

        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        # Simulate LLM error
        mock_client.chat.completions.create.side_effect = Exception("API Error")

        result = convert_batch_to_display_names_llm(
            ["user_name", "email_address"]
        )

        # Should fall back to simple Title Case
        assert result["user_name"] == "User Name"
        assert result["email_address"] == "Email Address"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.Anthropic")
    def test_llm_anthropic_provider(self, mock_anthropic, mock_settings):
        """Test using Anthropic as LLM provider."""
        mock_settings.llm_provider = "anthropic"
        mock_settings.anthropic_api_key = "test-key"

        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client

        mock_response = MagicMock()
        mock_response.content = [MagicMock()]
        mock_response.content[0].text = (
            '{"usr_id": "User ID", "dt_created": "Date Created"}'
        )
        mock_client.messages.create.return_value = mock_response

        result = convert_batch_to_display_names_llm(["usr_id", "dt_created"])

        assert mock_client.messages.create.called
        assert result["usr_id"] == "User ID"
        assert result["dt_created"] == "Date Created"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_batching(self, mock_openai, mock_settings):
        """Test that LLM batches names in groups of 50."""
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        mock_settings.llm_model = "gpt-4o-mini"

        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        # Create 75 field names (should trigger 2 batches)
        field_names = [f"field_{i}" for i in range(75)]

        # Mock response for each batch
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        # Return a dict with all field names
        response_dict = {name: f"Field {i}" for i, name in enumerate(field_names)}
        mock_response.choices[0].message.content = str(response_dict).replace("'", '"')
        mock_client.chat.completions.create.return_value = mock_response

        result = convert_batch_to_display_names_llm(field_names)

        # Verify LLM was called twice (2 batches of 50 and 25)
        assert mock_client.chat.completions.create.call_count == 2

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_missing_field_uses_fallback(self, mock_openai, mock_settings):
        """Test that missing fields in LLM response use fallback."""
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        mock_settings.llm_model = "gpt-4o-mini"

        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        # LLM only returns one field
        mock_response.choices[0].message.content = '{"field1": "Field One"}'
        mock_client.chat.completions.create.return_value = mock_response

        result = convert_batch_to_display_names_llm(["field1", "field2"])

        # field1 should use LLM result
        assert result["field1"] == "Field One"
        # field2 should use fallback
        assert result["field2"] == "Field2"
