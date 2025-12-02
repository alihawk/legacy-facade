"""Integration tests for LLM-based display name converter.

These tests make real API calls to OpenAI/Anthropic.
They are skipped if API keys are not configured.
"""

import pytest

from app.core.config import settings
from app.utils.llm_name_converter import convert_batch_to_display_names_llm


@pytest.mark.skipif(
    not settings.openai_api_key or settings.llm_provider != "openai",
    reason="OpenAI API key not configured",
)
class TestLLMNameConverterOpenAIIntegration:
    """Integration tests using real OpenAI API."""

    def test_real_llm_abbreviation_expansion(self):
        """Test real LLM expands abbreviations correctly."""
        field_names = ["usr_prof_v2", "dt_created_ts", "fld_email_addr_1"]

        result = convert_batch_to_display_names_llm(field_names)

        # LLM should expand abbreviations and remove technical prefixes/suffixes
        assert "User" in result["usr_prof_v2"] or "Profile" in result["usr_prof_v2"]
        assert "Date" in result["dt_created_ts"] or "Created" in result["dt_created_ts"]
        assert "Email" in result["fld_email_addr_1"] or "Address" in result["fld_email_addr_1"]

        # Should not contain technical prefixes
        assert "fld_" not in result["fld_email_addr_1"]
        assert "_v2" not in result["usr_prof_v2"]

    def test_real_llm_removes_technical_prefixes(self):
        """Test real LLM removes technical prefixes."""
        field_names = ["fld_email", "tbl_users", "col_name"]

        result = convert_batch_to_display_names_llm(field_names)

        # Should not contain prefixes
        assert "fld_" not in result["fld_email"]
        assert "tbl_" not in result["tbl_users"]
        assert "col_" not in result["col_name"]

        # Should be readable
        assert "Email" in result["fld_email"]
        assert "User" in result["tbl_users"]
        assert "Name" in result["col_name"]

    def test_real_llm_removes_version_suffixes(self):
        """Test real LLM removes version suffixes."""
        field_names = ["user_profile_v2", "email_new", "status_old"]

        result = convert_batch_to_display_names_llm(field_names)

        # Should not contain version suffixes
        assert "_v2" not in result["user_profile_v2"]
        assert "_new" not in result["email_new"]
        assert "_old" not in result["status_old"]

        # Should be readable
        assert "User" in result["user_profile_v2"] or "Profile" in result["user_profile_v2"]
        assert "Email" in result["email_new"]
        assert "Status" in result["status_old"]

    def test_real_llm_handles_complex_names(self):
        """Test real LLM handles complex legacy field names."""
        field_names = [
            "usr_addr_ln_1",
            "dt_last_upd_ts",
            "is_actv_flg",
            "cust_id_num",
        ]

        result = convert_batch_to_display_names_llm(field_names)

        # All should be converted to readable names
        for field_name, display_name in result.items():
            # Should not be empty
            assert display_name, f"Display name for {field_name} should not be empty"

            # Should start with capital letter
            assert display_name[0].isupper(), f"Display name {display_name} should start with capital"

            # Should not contain underscores
            assert "_" not in display_name, f"Display name {display_name} should not contain underscores"

            # Should be different from original (unless already perfect)
            assert display_name != field_name, f"Display name should be transformed from {field_name}"

    def test_real_llm_batch_processing(self):
        """Test real LLM handles batch of 50+ names."""
        # Generate 60 field names to test batching
        field_names = [f"field_{i}" for i in range(60)]

        result = convert_batch_to_display_names_llm(field_names)

        # Should process all names
        assert len(result) == 60

        # All should be converted
        for field_name, display_name in result.items():
            assert display_name
            assert display_name[0].isupper()

    def test_real_llm_keeps_meaningful_numbers(self):
        """Test real LLM handles numbers appropriately."""
        field_names = ["phone_1", "phone_2", "address_line_1", "address_line_2"]

        result = convert_batch_to_display_names_llm(field_names)

        # Numbers might be kept or removed depending on context
        # Just verify they're readable
        for field_name, display_name in result.items():
            assert display_name
            assert "Phone" in display_name or "Address" in display_name


@pytest.mark.skipif(
    not settings.anthropic_api_key or settings.llm_provider != "anthropic",
    reason="Anthropic API key not configured",
)
class TestLLMNameConverterAnthropicIntegration:
    """Integration tests using real Anthropic API."""

    def setup_method(self):
        """Clear cache before each test."""
        clear_cache()

    def test_real_anthropic_abbreviation_expansion(self):
        """Test real Anthropic LLM expands abbreviations correctly."""
        field_names = ["usr_prof_v2", "dt_created_ts", "fld_email_addr_1"]

        result = convert_batch_to_display_names_llm(field_names)

        # LLM should expand abbreviations and remove technical prefixes/suffixes
        assert "User" in result["usr_prof_v2"] or "Profile" in result["usr_prof_v2"]
        assert "Date" in result["dt_created_ts"] or "Created" in result["dt_created_ts"]
        assert "Email" in result["fld_email_addr_1"] or "Address" in result["fld_email_addr_1"]

    def test_real_anthropic_handles_complex_names(self):
        """Test real Anthropic LLM handles complex legacy field names."""
        field_names = [
            "usr_addr_ln_1",
            "dt_last_upd_ts",
            "is_actv_flg",
        ]

        result = convert_batch_to_display_names_llm(field_names)

        # All should be converted to readable names
        for field_name, display_name in result.items():
            assert display_name
            assert display_name[0].isupper()
            assert "_" not in display_name
