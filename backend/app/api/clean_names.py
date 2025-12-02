"""Clean names endpoint for LLM-based display name enhancement."""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.models.resource_schema import ResourceField, ResourceSchema
from app.utils.llm_name_converter import convert_batch_to_display_names_llm

logger = logging.getLogger(__name__)

router = APIRouter()


class CleanNamesRequest(BaseModel):
    """Request model for POST /api/clean-names endpoint."""

    resources: list[ResourceSchema]


class CleanNamesResponse(BaseModel):
    """Response model for POST /api/clean-names endpoint."""

    resources: list[ResourceSchema]


@router.post("/clean-names")
async def clean_names(request: CleanNamesRequest) -> JSONResponse:
    """Clean field and resource display names using LLM.

    Takes existing ResourceSchema array with simple display names and returns
    updated array with LLM-cleaned display names that handle:
    - Abbreviations (usr → User, addr → Address, dt → Date)
    - Prefixes (fld_, tbl_, col_)
    - Version suffixes (_v1, _v2, _new, _old)
    - Mixed formats (camelCase_with_snake)
    - Numbers and special characters

    Args:
        request: CleanNamesRequest with resources array

    Returns:
        JSONResponse with {"resources": [...]} containing cleaned display names

    Raises:
        HTTPException: 400 if no resources provided, 503 if LLM unavailable
    """
    if not request.resources:
        logger.warning("No resources provided in clean-names request")
        raise HTTPException(
            status_code=400, detail="No resources provided. 'resources' array is required."
        )

    try:
        # Collect all field names and resource names
        all_names = []

        # Add resource names
        for resource in request.resources:
            all_names.append(resource.name)

        # Add all field names from all resources
        for resource in request.resources:
            for field in resource.fields:
                all_names.append(field.name)

        # Remove duplicates while preserving order
        unique_names = list(dict.fromkeys(all_names))

        logger.info(
            "Cleaning %d unique names from %d resources using LLM",
            len(unique_names),
            len(request.resources),
        )

        # Convert all names using LLM
        display_names = convert_batch_to_display_names_llm(unique_names)

        # Update display names in resources
        cleaned_resources = []
        for resource in request.resources:
            # Update resource display name
            cleaned_resource_name = display_names.get(resource.name, resource.displayName)

            # Update field display names
            cleaned_fields = []
            for field in resource.fields:
                cleaned_field_name = display_names.get(field.name, field.displayName)
                cleaned_fields.append(
                    ResourceField(
                        name=field.name,
                        type=field.type,
                        displayName=cleaned_field_name,
                    )
                )

            cleaned_resources.append(
                ResourceSchema(
                    name=resource.name,
                    displayName=cleaned_resource_name,
                    endpoint=resource.endpoint,
                    primaryKey=resource.primaryKey,
                    fields=cleaned_fields,
                    operations=resource.operations,
                )
            )

        logger.info("Successfully cleaned display names for %d resources", len(cleaned_resources))

        return JSONResponse(
            content={"resources": [r.model_dump() for r in cleaned_resources]},
            status_code=200,
        )

    except ValueError as e:
        # LLM not configured or failed
        logger.error("LLM name cleaning failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"LLM service unavailable: {e}",
        ) from e

    except Exception as e:
        # Catch-all for unexpected errors
        logger.exception("Unexpected error during name cleaning")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}",
        ) from e
