"""Tests for the /api/clean-names endpoint."""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestCleanNamesEndpoint:
    """Test suite for POST /api/clean-names endpoint."""

    def test_clean_names_requires_resources(self):
        """Test that endpoint requires resources array."""
        response = client.post("/api/clean-names", json={})

        assert response.status_code == 422  # Pydantic validation error

    def test_clean_names_empty_resources_array(self):
        """Test that endpoint rejects empty resources array."""
        response = client.post("/api/clean-names", json={"resources": []})

        assert response.status_code == 400
        assert "No resources provided" in response.json()["detail"]

    @patch("app.api.clean_names.convert_batch_to_display_names_llm")
    def test_clean_names_success(self, mock_llm):
        """Test successful name cleaning."""
        # Mock LLM response
        mock_llm.return_value = {
            "users": "Users",
            "usr_prof_id": "User Profile ID",
            "dt_created_ts": "Date Created",
            "fld_email_addr": "Email Address",
        }

        request_data = {
            "resources": [
                {
                    "name": "users",
                    "displayName": "Users",
                    "endpoint": "/api/v1/users",
                    "primaryKey": "usr_prof_id",
                    "fields": [
                        {
                            "name": "usr_prof_id",
                            "type": "number",
                            "displayName": "Usr Prof Id",
                        },
                        {
                            "name": "dt_created_ts",
                            "type": "date",
                            "displayName": "Dt Created Ts",
                        },
                        {
                            "name": "fld_email_addr",
                            "type": "email",
                            "displayName": "Fld Email Addr",
                        },
                    ],
                    "operations": ["list", "detail"],
                }
            ]
        }

        response = client.post("/api/clean-names", json=request_data)

        assert response.status_code == 200
        data = response.json()

        assert "resources" in data
        assert len(data["resources"]) == 1

        resource = data["resources"][0]
        assert resource["name"] == "users"
        assert resource["displayName"] == "Users"

        # Verify field display names were cleaned
        fields = {f["name"]: f["displayName"] for f in resource["fields"]}
        assert fields["usr_prof_id"] == "User Profile ID"
        assert fields["dt_created_ts"] == "Date Created"
        assert fields["fld_email_addr"] == "Email Address"

    @patch("app.api.clean_names.convert_batch_to_display_names_llm")
    def test_clean_names_multiple_resources(self, mock_llm):
        """Test cleaning names for multiple resources."""
        mock_llm.return_value = {
            "users": "Users",
            "products": "Products",
            "usr_id": "User ID",
            "prod_code": "Product Code",
        }

        request_data = {
            "resources": [
                {
                    "name": "users",
                    "displayName": "Users",
                    "endpoint": "/api/users",
                    "primaryKey": "usr_id",
                    "fields": [
                        {"name": "usr_id", "type": "number", "displayName": "Usr Id"}
                    ],
                    "operations": ["list"],
                },
                {
                    "name": "products",
                    "displayName": "Products",
                    "endpoint": "/api/products",
                    "primaryKey": "prod_code",
                    "fields": [
                        {
                            "name": "prod_code",
                            "type": "string",
                            "displayName": "Prod Code",
                        }
                    ],
                    "operations": ["list"],
                },
            ]
        }

        response = client.post("/api/clean-names", json=request_data)

        assert response.status_code == 200
        data = response.json()

        assert len(data["resources"]) == 2

        # Verify both resources were cleaned
        resource_names = [r["name"] for r in data["resources"]]
        assert "users" in resource_names
        assert "products" in resource_names

    @patch("app.api.clean_names.convert_batch_to_display_names_llm")
    def test_clean_names_deduplicates_field_names(self, mock_llm):
        """Test that duplicate field names across resources are deduplicated."""
        mock_llm.return_value = {
            "users": "Users",
            "products": "Products",
            "id": "ID",  # Common field in both resources
            "name": "Name",  # Common field in both resources
        }

        request_data = {
            "resources": [
                {
                    "name": "users",
                    "displayName": "Users",
                    "endpoint": "/api/users",
                    "primaryKey": "id",
                    "fields": [
                        {"name": "id", "type": "number", "displayName": "Id"},
                        {"name": "name", "type": "string", "displayName": "Name"},
                    ],
                    "operations": ["list"],
                },
                {
                    "name": "products",
                    "displayName": "Products",
                    "endpoint": "/api/products",
                    "primaryKey": "id",
                    "fields": [
                        {"name": "id", "type": "number", "displayName": "Id"},
                        {"name": "name", "type": "string", "displayName": "Name"},
                    ],
                    "operations": ["list"],
                },
            ]
        }

        response = client.post("/api/clean-names", json=request_data)

        assert response.status_code == 200

        # Verify LLM was called with deduplicated names
        mock_llm.assert_called_once()
        called_names = mock_llm.call_args[0][0]

        # Should have: users, products, id, name (4 unique names)
        assert len(called_names) == 4
        assert "users" in called_names
        assert "products" in called_names
        assert "id" in called_names
        assert "name" in called_names

    @patch("app.api.clean_names.convert_batch_to_display_names_llm")
    def test_clean_names_llm_unavailable(self, mock_llm):
        """Test error handling when LLM is unavailable."""
        # Simulate LLM error
        mock_llm.side_effect = ValueError("LLM provider not configured")

        request_data = {
            "resources": [
                {
                    "name": "users",
                    "displayName": "Users",
                    "endpoint": "/api/users",
                    "primaryKey": "id",
                    "fields": [
                        {"name": "id", "type": "number", "displayName": "Id"}
                    ],
                    "operations": ["list"],
                }
            ]
        }

        response = client.post("/api/clean-names", json=request_data)

        assert response.status_code == 503
        assert "LLM service unavailable" in response.json()["detail"]

    @patch("app.api.clean_names.convert_batch_to_display_names_llm")
    def test_clean_names_preserves_structure(self, mock_llm):
        """Test that endpoint preserves all resource structure."""
        mock_llm.return_value = {
            "users": "Users",
            "id": "ID",
            "email": "Email",
        }

        request_data = {
            "resources": [
                {
                    "name": "users",
                    "displayName": "Users",
                    "endpoint": "/api/v1/users",
                    "primaryKey": "id",
                    "fields": [
                        {"name": "id", "type": "number", "displayName": "Id"},
                        {"name": "email", "type": "email", "displayName": "Email"},
                    ],
                    "operations": ["list", "detail", "create", "update", "delete"],
                }
            ]
        }

        response = client.post("/api/clean-names", json=request_data)

        assert response.status_code == 200
        data = response.json()

        resource = data["resources"][0]

        # Verify all structure is preserved
        assert resource["name"] == "users"
        assert resource["endpoint"] == "/api/v1/users"
        assert resource["primaryKey"] == "id"
        assert resource["operations"] == [
            "list",
            "detail",
            "create",
            "update",
            "delete",
        ]

        # Verify field types are preserved
        fields = resource["fields"]
        assert fields[0]["type"] == "number"
        assert fields[1]["type"] == "email"

        # Verify field names are preserved (only displayName changes)
        assert fields[0]["name"] == "id"
        assert fields[1]["name"] == "email"

    @patch("app.api.clean_names.convert_batch_to_display_names_llm")
    def test_clean_names_handles_complex_names(self, mock_llm):
        """Test cleaning of complex legacy field names."""
        mock_llm.return_value = {
            "legacy_data": "Legacy Data",
            "fld_usr_prof_v2": "User Profile",
            "tbl_dt_created_ts": "Date Created",
            "col_email_addr_1": "Email Address",
            "usr$name": "User Name",
        }

        request_data = {
            "resources": [
                {
                    "name": "legacy_data",
                    "displayName": "Legacy Data",
                    "endpoint": "/api/legacy",
                    "primaryKey": "fld_usr_prof_v2",
                    "fields": [
                        {
                            "name": "fld_usr_prof_v2",
                            "type": "number",
                            "displayName": "Fld Usr Prof V2",
                        },
                        {
                            "name": "tbl_dt_created_ts",
                            "type": "date",
                            "displayName": "Tbl Dt Created Ts",
                        },
                        {
                            "name": "col_email_addr_1",
                            "type": "email",
                            "displayName": "Col Email Addr 1",
                        },
                        {
                            "name": "usr$name",
                            "type": "string",
                            "displayName": "Usr$Name",
                        },
                    ],
                    "operations": ["list"],
                }
            ]
        }

        response = client.post("/api/clean-names", json=request_data)

        assert response.status_code == 200
        data = response.json()

        fields = {f["name"]: f["displayName"] for f in data["resources"][0]["fields"]}

        # Verify LLM cleaned the complex names
        assert fields["fld_usr_prof_v2"] == "User Profile"
        assert fields["tbl_dt_created_ts"] == "Date Created"
        assert fields["col_email_addr_1"] == "Email Address"
        assert fields["usr$name"] == "User Name"

    def test_clean_names_invalid_json(self):
        """Test error handling for invalid JSON."""
        response = client.post(
            "/api/clean-names",
            content="invalid json",
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422  # Pydantic validation error

    def test_clean_names_missing_required_fields(self):
        """Test error handling for missing required fields in resources."""
        request_data = {
            "resources": [
                {
                    "name": "users",
                    # Missing displayName, endpoint, primaryKey, fields, operations
                }
            ]
        }

        response = client.post("/api/clean-names", json=request_data)

        assert response.status_code == 422  # Pydantic validation error
