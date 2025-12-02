"""
Deployment API endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.models.deployment_models import (
    DeploymentRequest,
    DeploymentResponse,
    TokenValidationRequest,
    TokenValidationResponse
)
from app.services.vercel_deployer import VercelDeployer
from app.services.vercel_api_client import VercelAPIClient, VercelAPIError


router = APIRouter()


@router.post("/vercel", response_model=DeploymentResponse)
async def deploy_to_vercel(request: DeploymentRequest):
    """Deploy both proxy server and frontend to Vercel."""
    import logging
    import traceback
    
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Starting deployment with project name: {request.project_name}")
        logger.info(f"Resources count: {len(request.resources)}")
        logger.info(f"Has proxy config: {request.proxy_config is not None}")
        
        deployer = VercelDeployer(request.token)
        
        project_name = request.project_name or "admin-portal"
        
        result = await deployer.deploy_full_stack(
            resources=request.resources,
            proxy_config=request.proxy_config,
            frontend_files=request.frontend_files,
            project_name_prefix=project_name
        )
        
        logger.info(f"Deployment result: success={result.success}, step={result.step_completed}")
        
        response = DeploymentResponse(
            success=result.success,
            frontend_url=result.frontend_url,
            proxy_url=result.proxy_url,
            frontend_deployment_id=result.frontend_deployment_id,
            proxy_deployment_id=result.proxy_deployment_id,
            error=result.error,
            step_completed=result.step_completed
        )
        
        if not result.success:
            logger.error(f"Deployment failed: {result.error}")
            return JSONResponse(
                status_code=status.HTTP_200_OK,  # Return 200 with error in body
                content=response.dict()
            )
        
        response.message = f"Deployment successful! Frontend: {result.frontend_url}, Proxy: {result.proxy_url}"
        
        return response
        
    except ValueError as e:
        logger.error(f"ValueError: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except VercelAPIError as e:
        logger.error(f"VercelAPIError: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Vercel API error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Deployment failed: {str(e)}"
        )


@router.post("/vercel/validate-token", response_model=TokenValidationResponse)
async def validate_vercel_token(request: TokenValidationRequest):
    """Validate a Vercel API token."""
    try:
        client = VercelAPIClient(request.token)
        is_valid = await client.validate_token()
        
        if is_valid:
            return TokenValidationResponse(valid=True)
        else:
            return TokenValidationResponse(
                valid=False,
                error="Invalid Vercel token"
            )
            
    except Exception as e:
        return TokenValidationResponse(
            valid=False,
            error=f"Token validation failed: {str(e)}"
        )


@router.get("/vercel/health")
async def deployment_health():
    """Health check endpoint for deployment service."""
    return {
        "status": "ok",
        "service": "vercel-deployment"
    }
