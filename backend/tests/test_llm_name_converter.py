"""Tests for LLM-based display name converter."""

from unittest.mock import MagicMock, patch

import pytest

from app.utils.llm_name_converter import (
    clear_cache,
    convert_batch_to_display_names,
    convert_to_display_name,
)


class TestLLMNameConverter:
    """Test suite for LLM name converter."""

    def setup_method(self):
        """Clear cache before each test."""
        clear_cache()

    def test_simple_title_case_fallback(self):
        """Test fallback to simple Title Case when LLM is disabled."""
        # Disable LLM
        result = convert_batch_to_display_names(
            ["user_name", "userId", "api_key"], use_llm=False
        )

        assert result["user_name"] == "User Name"
        assert result["userId"] == "User Id"
        assert result["api_key"] == "Api Key"

    def test_single_name_conversion(self):
        """Test converting a single name."""
        result = convert_to_display_name("user_name")
        assert result == "User Name"

        result = convert_to_display_name("created_at")
        assert result == "Created At"

    def test_camel_case_conversion(self):
        """Test camelCase to Title Case conversion."""
        result = convert_batch_to_display_names(
            ["userId", "createdAt", "isActive"], use_llm=False
        )

        assert result["userId"] == "User Id"
        assert result["createdAt"] == "Created At"
        assert result["isActive"] == "Is Active"

    def test_snake_case_conversion(self):
        """Test snake_case to Title Case conversion."""
        result = convert_batch_to_display_names(
            ["user_id", "created_at", "is_active"], use_llm=False
        )

        assert result["user_id"] == "User Id"
        assert result["created_at"] == "Created At"
        assert result["is_active"] == "Is Active"

    def test_hyphen_case_conversion(self):
        """Test hyphen-case to Title Case conversion."""
        result = convert_batch_to_display_names(
            ["user-id", "created-at", "is-active"], use_llm=False
        )

        assert result["user-id"] == "User Id"
        assert result["created-at"] == "Created At"
        assert result["is-active"] == "Is Active"

    def test_caching(self):
        """Test that conversions are cached."""
        # First conversion
        result1 = convert_to_display_name("user_name")
        assert result1 == "User Name"

        # Second conversion should use cache
        result2 = convert_to_display_name("user_name")
        assert result2 == "User Name"
        assert result1 == result2

    def test_batch_caching(self):
        """Test that batch conversions are cached."""
        names = ["user_id", "email", "created_at"]

        # First batch
        result1 = convert_batch_to_display_names(names, use_llm=False)

        # Second batch should use cache
        result2 = convert_batch_to_display_names(names, use_llm=False)

        assert result1 == result2

    def test_partial_cache_hit(self):
        """Test batch conversion with some names cached."""
        # Cache some names
        convert_to_display_name("user_id")
        convert_to_display_name("email")

        # Batch with cached and uncached names
        result = convert_batch_to_display_names(
            ["user_id", "email", "created_at"], use_llm=False
        )

        assert result["user_id"] == "User Id"
        assert result["email"] == "Email"
        assert result["created_at"] == "Created At"

    def test_empty_list(self):
        """Test converting empty list."""
        result = convert_batch_to_display_names([], use_llm=False)
        assert result == {}

    def test_clear_cache(self):
        """Test cache clearing."""
        # Add to cache
        convert_to_display_name("user_name")

        # Clear cache
        clear_cache()

        # Should not be in cache anymore (but will be re-added)
        result = convert_to_display_name("user_name")
        assert result == "User Name"

    def test_special_characters(self):
        """Test handling of special characters."""
        result = convert_batch_to_display_names(
            ["user@name", "email#address", "api$key"], use_llm=False
        )

        # Should handle gracefully
        assert "user@name" in result
        assert "email#address" in result
        assert "api$key" in result

    def test_numbers_in_names(self):
        """Test handling of numbers in field names."""
        result = convert_batch_to_display_names(
            ["user1", "field2name", "api3key"], use_llm=False
        )

        assert result["user1"] == "User1"
        assert result["field2name"] == "Field2Name"  # Title case capitalizes after numbers
        assert result["api3key"] == "Api3Key"

    def test_all_caps_names(self):
        """Test handling of all-caps names."""
        result = convert_batch_to_display_names(["ID", "URL", "API"], use_llm=False)

        assert result["ID"] == "Id"
        assert result["URL"] == "Url"
        assert result["API"] == "Api"

    def test_mixed_case_names(self):
        """Test handling of mixed case names."""
        result = convert_batch_to_display_names(
            ["UserName", "APIKey", "URLPath"], use_llm=False
        )

        assert result["UserName"] == "User Name"
        assert result["APIKey"] == "Apikey"  # All caps get title cased as one word
        assert result["URLPath"] == "Urlpath"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_abbreviation_expansion(self, mock_openai, mock_settings):
        """Test LLM expands abbreviations correctly."""
        clear_cache()
        
        # Configure settings
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        
        # Mock OpenAI response
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"usr_prof_v2": "User Profile", "dt_created_ts": "Date Created", "fld_email_addr_1": "Email Address"}'
        mock_client.chat.completions.create.return_value = mock_response
        
        # Test conversion
        result = convert_batch_to_display_names(
            ["usr_prof_v2", "dt_created_ts", "fld_email_addr_1"], use_llm=True
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
        clear_cache()
        
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"fld_email": "Email", "tbl_users": "Users", "col_name": "Name"}'
        mock_client.chat.completions.create.return_value = mock_response
        
        result = convert_batch_to_display_names(
            ["fld_email", "tbl_users", "col_name"], use_llm=True
        )
        
        assert result["fld_email"] == "Email"
        assert result["tbl_users"] == "Users"
        assert result["col_name"] == "Name"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_removes_version_suffixes(self, mock_openai, mock_settings):
        """Test LLM removes version suffixes."""
        clear_cache()
        
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"user_profile_v2": "User Profile", "email_new": "Email", "status_old": "Status"}'
        mock_client.chat.completions.create.return_value = mock_response
        
        result = convert_batch_to_display_names(
            ["user_profile_v2", "email_new", "status_old"], use_llm=True
        )
        
        assert result["user_profile_v2"] == "User Profile"
        assert result["email_new"] == "Email"
        assert result["status_old"] == "Status"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.OpenAI")
    def test_llm_fallback_on_error(self, mock_openai, mock_settings):
        """Test fallback to Title Case when LLM fails."""
        clear_cache()
        
        mock_settings.llm_provider = "openai"
        mock_settings.openai_api_key = "test-key"
        
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        # Simulate LLM error
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        
        result = convert_batch_to_display_names(
            ["user_name", "email_address"], use_llm=True
        )
        
        # Should fall back to Title Case
        assert result["user_name"] == "User Name"
        assert result["email_address"] == "Email Address"

    @patch("app.utils.llm_name_converter.settings")
    @patch("app.utils.llm_name_converter.Anthropic")
    def test_llm_anthropic_provider(self, mock_anthropic, mock_settings):
        """Test using Anthropic as LLM provider."""
        clear_cache()
        
        mock_settings.llm_provider = "anthropic"
        mock_settings.anthropic_api_key = "test-key"
        
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.content = [MagicMock()]
        mock_response.content[0].text = '{"usr_id": "User ID", "dt_created": "Date Created"}'
        mock_client.messages.create.return_value = mock_response
        
        result = convert_batch_to_display_names(
            ["usr_id", "dt_created"], use_llm=True
        )
        
        assert mock_client.messages.create.called
        assert result["usr_id"] == "User ID"
        assert result["dt_created"] == "Date Created"
