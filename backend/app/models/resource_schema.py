"""Resource schema models for API analysis."""

from pydantic import BaseModel


class ResourceField(BaseModel):
    """Field definition in a resource schema."""

    name: str
    type: str
    displayName: str


class ResourceSchema(BaseModel):
    """Complete schema for an API resource."""

    name: str
    displayName: str
    endpoint: str
    primaryKey: str
    fields: list[ResourceField]
    operations: list[str]
