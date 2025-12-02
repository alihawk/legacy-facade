"""Deployment request/response models"""

from typing import Optional, Dict, List, Any
from pydantic import BaseModel


class DeploymentRequest(BaseModel):
    """Request to deploy to Vercel"""
    token: str
    resources: List[Dict[str, Any]]
    proxy_config: Dict[str, Any]
    frontend_files: Optional[Dict[str, str]] = None
    project_name: Optional[str] = None


class DeploymentResponse(BaseModel):
    """Response from deployment"""
    success: bool
    frontend_url: Optional[str] = None
    proxy_url: Optional[str] = None
    frontend_deployment_id: Optional[str] = None
    proxy_deployment_id: Optional[str] = None
    error: Optional[str] = None
    step_completed: str = "none"
    message: Optional[str] = None


class DeploymentStatusRequest(BaseModel):
    """Request to check deployment status"""
    proxy_deployment_id: Optional[str] = None
    frontend_deployment_id: Optional[str] = None


class DeploymentStatusResponse(BaseModel):
    """Response with deployment status"""
    step: str
    proxy_status: str
    frontend_status: str
    message: str


class TokenValidationRequest(BaseModel):
    """Request to validate token"""
    token: str


class TokenValidationResponse(BaseModel):
    """Response from token validation"""
    valid: bool
    error: Optional[str] = None
