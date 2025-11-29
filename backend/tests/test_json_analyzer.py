"""Tests for JSON sample analyzer."""

import pytest

from app.services.json_analyzer import analyze_json_sample


class TestJSONAnalyzer:
    """Test suite for JSON sample analyzer."""

    @pytest.mark.asyncio
    async def test_analyze_array_sample(self):
        """Test analyzing a JSON array sample."""
        sample = [
            {"id": 1, "name": "Alice", "email": "alice@example.com"},
            {"id": 2, "name": "Bob", "email": "bob@example.com"},
            {"id": 3, "name": "Charlie", "email": "charlie@example.com"},
        ]

        resources = await analyze_json_sample(sample)

        assert len(resources) == 1
        resource = resources[0]

        assert resource.name == "sample"
        assert resource.primaryKey == "id"
        assert "list" in resource.operations
        assert len(resource.fields) == 3

        # Check field types
        field_types = {f.name: f.type for f in resource.fields}
        assert field_types["id"] == "number"
        assert field_types["name"] == "string"
        assert field_types["email"] == "email"

    @pytest.mark.asyncio
    async def test_analyze_single_object_sample(self):
        """Test analyzing a single JSON object sample."""
        sample = {"id": 1, "name": "Alice", "email": "alice@example.com", "active": True}

        resources = await analyze_json_sample(sample)

        assert len(resources) == 1
        resource = resources[0]

        assert resource.name == "sample"
        assert resource.primaryKey == "id"
        assert "detail" in resource.operations
        assert len(resource.fields) == 4

        # Check field types
        field_types = {f.name: f.type for f in resource.fields}
        assert field_types["id"] == "number"
        assert field_types["name"] == "string"
        assert field_types["email"] == "email"
        assert field_types["active"] == "boolean"

    @pytest.mark.asyncio
    async def test_analyze_nested_structure(self):
        """Test analyzing nested JSON structure (unwrapping)."""
        sample = {"data": {"users": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]}}

        resources = await analyze_json_sample(sample)

        assert len(resources) == 1
        resource = resources[0]

        # Should unwrap to the array
        assert "list" in resource.operations
        assert len(resource.fields) == 2

    @pytest.mark.asyncio
    async def test_analyze_mixed_types(self):
        """Test type inference with mixed types across items."""
        sample = [
            {"id": 1, "value": 100},
            {"id": 2, "value": "text"},
            {"id": 3, "value": 200},
        ]

        resources = await analyze_json_sample(sample)

        resource = resources[0]
        field_types = {f.name: f.type for f in resource.fields}

        # Should pick most flexible type (string over number)
        assert field_types["value"] == "string"

    @pytest.mark.asyncio
    async def test_analyze_with_datetime_fields(self):
        """Test detection of datetime fields."""
        sample = [
            {"id": 1, "created_at": "2024-01-15T10:30:00Z"},
            {"id": 2, "created_at": "2024-01-16T11:45:00Z"},
        ]

        resources = await analyze_json_sample(sample)

        resource = resources[0]
        field_types = {f.name: f.type for f in resource.fields}

        assert field_types["created_at"] == "datetime"

    @pytest.mark.asyncio
    async def test_analyze_with_uuid_fields(self):
        """Test detection of UUID fields."""
        sample = [
            {"id": "550e8400-e29b-41d4-a716-446655440000", "name": "Item 1"},
            {"id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "name": "Item 2"},
        ]

        resources = await analyze_json_sample(sample)

        resource = resources[0]
        field_types = {f.name: f.type for f in resource.fields}

        assert field_types["id"] == "uuid"

    @pytest.mark.asyncio
    async def test_analyze_with_url_fields(self):
        """Test detection of URL fields."""
        sample = [
            {"id": 1, "website": "https://example.com"},
            {"id": 2, "website": "https://test.org"},
        ]

        resources = await analyze_json_sample(sample)

        resource = resources[0]
        field_types = {f.name: f.type for f in resource.fields}

        assert field_types["website"] == "url"

    @pytest.mark.asyncio
    async def test_empty_sample_raises_error(self):
        """Test that empty sample raises ValueError."""
        with pytest.raises(ValueError, match="cannot be empty"):
            await analyze_json_sample([])

        with pytest.raises(ValueError, match="cannot be empty"):
            await analyze_json_sample({})

    @pytest.mark.asyncio
    async def test_invalid_sample_raises_error(self):
        """Test that invalid sample raises ValueError."""
        # Array with non-object items
        with pytest.raises(ValueError, match="Expected object"):
            await analyze_json_sample([1, 2, 3])

    @pytest.mark.asyncio
    async def test_display_name_generation(self):
        """Test display name generation from field names."""
        sample = [
            {
                "user_name": "Alice",
                "userId": 1,
                "api_key": "secret",
                "created_at": "2024-01-15",
            }
        ]

        resources = await analyze_json_sample(sample)

        resource = resources[0]
        field_names = {f.name: f.displayName for f in resource.fields}

        assert field_names["user_name"] == "User Name"
        assert field_names["userId"] == "User ID"  # LLM correctly expands ID
        assert field_names["api_key"] == "API Key"  # LLM correctly expands API
        assert field_names["created_at"] == "Created At"

    @pytest.mark.asyncio
    async def test_primary_key_detection_variations(self):
        """Test primary key detection with various naming patterns."""
        # Test with 'id'
        sample1 = [{"id": 1, "name": "Test"}]
        resources1 = await analyze_json_sample(sample1)
        assert resources1[0].primaryKey == "id"

        # Test with '_id'
        sample2 = [{"_id": "abc123", "name": "Test"}]
        resources2 = await analyze_json_sample(sample2)
        assert resources2[0].primaryKey == "_id"

        # Test with custom ID field
        sample3 = [{"userId": 1, "name": "Test"}]
        resources3 = await analyze_json_sample(sample3)
        assert resources3[0].primaryKey == "userId"

        # Test with no ID field (should default to "id")
        sample4 = [{"name": "Test", "email": "test@example.com"}]
        resources4 = await analyze_json_sample(sample4)
        assert resources4[0].primaryKey == "id"
