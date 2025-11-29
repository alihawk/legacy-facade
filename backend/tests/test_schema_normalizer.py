"""Tests for schema normalizer."""

import pytest

from app.models.resource_schema import ResourceField, ResourceSchema
from app.services.schema_normalizer import normalize_resources


class TestSchemaNormalizer:
    """Test suite for schema normalizer."""

    def test_normalize_valid_resources(self):
        """Test normalizing valid resource schemas."""
        resources = [
            ResourceSchema(
                name="users",
                displayName="Users",
                endpoint="/api/users",
                primaryKey="id",
                fields=[
                    ResourceField(name="id", type="number", displayName="ID"),
                    ResourceField(name="name", type="string", displayName="Name"),
                ],
                operations=["list", "detail", "create"],
            )
        ]

        result = normalize_resources(resources)

        assert "resources" in result
        assert len(result["resources"]) == 1

        resource = result["resources"][0]
        assert resource["name"] == "users"
        assert resource["displayName"] == "Users"
        assert resource["endpoint"] == "/api/users"
        assert resource["primaryKey"] == "id"
        assert len(resource["fields"]) == 2
        assert resource["operations"] == ["list", "detail", "create"]

    def test_normalize_multiple_resources(self):
        """Test normalizing multiple resources."""
        resources = [
            ResourceSchema(
                name="users",
                displayName="Users",
                endpoint="/users",
                primaryKey="id",
                fields=[ResourceField(name="id", type="number", displayName="ID")],
                operations=["list"],
            ),
            ResourceSchema(
                name="products",
                displayName="Products",
                endpoint="/products",
                primaryKey="product_id",
                fields=[
                    ResourceField(name="product_id", type="number", displayName="Product ID")
                ],
                operations=["list", "detail"],
            ),
        ]

        result = normalize_resources(resources)

        assert len(result["resources"]) == 2
        assert result["resources"][0]["name"] == "users"
        assert result["resources"][1]["name"] == "products"

    def test_normalize_empty_resources_raises_error(self):
        """Test that empty resources list raises error."""
        with pytest.raises(ValueError, match="No resources provided"):
            normalize_resources([])

    def test_normalize_resource_without_name_raises_error(self):
        """Test that resource without name raises error."""
        resources = [
            ResourceSchema(
                name="",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[],
                operations=["list"],
            )
        ]

        with pytest.raises(ValueError, match="must have a name"):
            normalize_resources(resources)

    def test_normalize_resource_without_display_name_raises_error(self):
        """Test that resource without displayName raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="",
                endpoint="/test",
                primaryKey="id",
                fields=[],
                operations=["list"],
            )
        ]

        with pytest.raises(ValueError, match="must have a displayName"):
            normalize_resources(resources)

    def test_normalize_resource_without_endpoint_raises_error(self):
        """Test that resource without endpoint raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="",
                primaryKey="id",
                fields=[],
                operations=["list"],
            )
        ]

        with pytest.raises(ValueError, match="must have an endpoint"):
            normalize_resources(resources)

    def test_normalize_resource_without_primary_key_raises_error(self):
        """Test that resource without primaryKey raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="",
                fields=[],
                operations=["list"],
            )
        ]

        with pytest.raises(ValueError, match="must have a primaryKey"):
            normalize_resources(resources)

    def test_normalize_resource_without_operations_raises_error(self):
        """Test that resource without operations raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[],
                operations=[],
            )
        ]

        with pytest.raises(ValueError, match="must have at least one operation"):
            normalize_resources(resources)

    def test_normalize_resource_with_invalid_operations_raises_error(self):
        """Test that resource with invalid operations raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[],
                operations=["list", "invalid_op", "delete"],
            )
        ]

        with pytest.raises(ValueError, match="invalid operations"):
            normalize_resources(resources)

    def test_normalize_field_without_name_raises_error(self):
        """Test that field without name raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[ResourceField(name="", type="string", displayName="Test")],
                operations=["list"],
            )
        ]

        with pytest.raises(ValueError, match="field without a name"):
            normalize_resources(resources)

    def test_normalize_field_without_type_raises_error(self):
        """Test that field without type raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[ResourceField(name="field1", type="", displayName="Field 1")],
                operations=["list"],
            )
        ]

        with pytest.raises(ValueError, match="must have a type"):
            normalize_resources(resources)

    def test_normalize_field_without_display_name_raises_error(self):
        """Test that field without displayName raises error."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[ResourceField(name="field1", type="string", displayName="")],
                operations=["list"],
            )
        ]

        with pytest.raises(ValueError, match="must have a displayName"):
            normalize_resources(resources)

    def test_normalize_all_valid_operations(self):
        """Test that all valid operations are accepted."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[ResourceField(name="id", type="number", displayName="ID")],
                operations=["list", "detail", "create", "update", "delete"],
            )
        ]

        result = normalize_resources(resources)

        assert len(result["resources"][0]["operations"]) == 5

    def test_normalize_preserves_field_order(self):
        """Test that field order is preserved."""
        resources = [
            ResourceSchema(
                name="test",
                displayName="Test",
                endpoint="/test",
                primaryKey="id",
                fields=[
                    ResourceField(name="id", type="number", displayName="ID"),
                    ResourceField(name="name", type="string", displayName="Name"),
                    ResourceField(name="email", type="email", displayName="Email"),
                ],
                operations=["list"],
            )
        ]

        result = normalize_resources(resources)

        fields = result["resources"][0]["fields"]
        assert fields[0]["name"] == "id"
        assert fields[1]["name"] == "name"
        assert fields[2]["name"] == "email"
