"""
Vercel deployment orchestrator.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel

from .vercel_api_client import VercelAPIClient, VercelAPIError
from .vercel_proxy_generator import VercelProxyGenerator
from .vercel_frontend_generator import VercelFrontendGenerator


class DeploymentResult(BaseModel):
    """Result of a deployment operation"""
    success: bool
    frontend_url: Optional[str] = None
    proxy_url: Optional[str] = None
    frontend_deployment_id: Optional[str] = None
    proxy_deployment_id: Optional[str] = None
    error: Optional[str] = None
    step_completed: str = "none"


class VercelDeployer:
    """Orchestrates deployment of both proxy and frontend to Vercel"""
    
    def __init__(self, token: str):
        self.token = token
        self.client = VercelAPIClient(token)
        self.proxy_generator = VercelProxyGenerator()
        self.frontend_generator = VercelFrontendGenerator()
    
    async def deploy_full_stack(
        self,
        resources: List[Dict[str, Any]],
        proxy_config: Dict[str, Any],
        frontend_files: Optional[Dict[str, str]] = None,
        project_name_prefix: str = "admin-portal"
    ) -> DeploymentResult:
        """Deploy both proxy server and frontend to Vercel."""
        try:
            # Step 1: Validate token
            is_valid = await self.client.validate_token()
            if not is_valid:
                return DeploymentResult(
                    success=False,
                    error="Invalid Vercel token",
                    step_completed="none"
                )
            
            # Step 2: Deploy proxy server
            proxy_result = await self._deploy_proxy(proxy_config, project_name_prefix)
            
            if not proxy_result.success:
                return DeploymentResult(
                    success=False,
                    error=f"Proxy deployment failed: {proxy_result.error}",
                    step_completed="none",
                    proxy_deployment_id=proxy_result.proxy_deployment_id
                )
            
            # Step 3: Deploy frontend with proxy URL
            frontend_result = await self._deploy_frontend(
                resources,
                proxy_result.proxy_url,
                frontend_files,
                project_name_prefix
            )
            
            if not frontend_result.success:
                return DeploymentResult(
                    success=False,
                    error=f"Frontend deployment failed: {frontend_result.error}",
                    step_completed="proxy",
                    proxy_url=proxy_result.proxy_url,
                    proxy_deployment_id=proxy_result.proxy_deployment_id,
                    frontend_deployment_id=frontend_result.frontend_deployment_id
                )
            
            # Success!
            return DeploymentResult(
                success=True,
                frontend_url=frontend_result.frontend_url,
                proxy_url=proxy_result.proxy_url,
                frontend_deployment_id=frontend_result.frontend_deployment_id,
                proxy_deployment_id=proxy_result.proxy_deployment_id,
                step_completed="complete"
            )
            
        except VercelAPIError as e:
            return DeploymentResult(
                success=False,
                error=str(e),
                step_completed="none"
            )
        except Exception as e:
            return DeploymentResult(
                success=False,
                error=f"Unexpected error: {str(e)}",
                step_completed="none"
            )
    
    async def _deploy_proxy(
        self,
        proxy_config: Dict[str, Any],
        project_name_prefix: str
    ) -> DeploymentResult:
        """Deploy proxy server to Vercel."""
        try:
            # Generate proxy files
            proxy_files = self.proxy_generator.generate_files(proxy_config)
            
            # Create deployment
            project_name = f"{project_name_prefix}-proxy"
            deployment_id = await self.client.create_deployment(
                files=proxy_files,
                project_name=project_name,
                env_vars={"NODE_ENV": "production"}
            )
            
            # Wait for deployment to complete
            status = await self.client.wait_for_deployment(deployment_id, timeout=300)
            
            if status.state != "READY":
                return DeploymentResult(
                    success=False,
                    error=f"Proxy deployment failed with state: {status.state}",
                    proxy_deployment_id=deployment_id
                )
            
            proxy_url = f"https://{status.url}" if status.url else None
            
            if not proxy_url:
                return DeploymentResult(
                    success=False,
                    error="No URL returned for proxy deployment",
                    proxy_deployment_id=deployment_id
                )
            
            return DeploymentResult(
                success=True,
                proxy_url=proxy_url,
                proxy_deployment_id=deployment_id,
                step_completed="proxy"
            )
            
        except VercelAPIError as e:
            return DeploymentResult(
                success=False,
                error=str(e),
                step_completed="none"
            )
    
    async def _deploy_frontend(
        self,
        resources: List[Dict[str, Any]],
        proxy_url: str,
        frontend_files: Optional[Dict[str, str]],
        project_name_prefix: str
    ) -> DeploymentResult:
        """Deploy frontend to Vercel."""
        try:
            # Generate or update frontend files
            if frontend_files:
                files = self.frontend_generator.merge_with_existing_files(
                    frontend_files,
                    proxy_url
                )
            else:
                files = self.frontend_generator.generate_files(resources, proxy_url)
            
            # Create deployment
            project_name = f"{project_name_prefix}-frontend"
            deployment_id = await self.client.create_deployment(
                files=files,
                project_name=project_name,
                env_vars={
                    "VITE_PROXY_URL": proxy_url,
                    "VITE_API_BASE_URL": f"{proxy_url}/api/proxy",
                    "NODE_ENV": "production"
                }
            )
            
            # Wait for deployment to complete
            status = await self.client.wait_for_deployment(deployment_id, timeout=300)
            
            if status.state != "READY":
                return DeploymentResult(
                    success=False,
                    error=f"Frontend deployment failed with state: {status.state}",
                    frontend_deployment_id=deployment_id
                )
            
            frontend_url = f"https://{status.url}" if status.url else None
            
            if not frontend_url:
                return DeploymentResult(
                    success=False,
                    error="No URL returned for frontend deployment",
                    frontend_deployment_id=deployment_id
                )
            
            return DeploymentResult(
                success=True,
                frontend_url=frontend_url,
                frontend_deployment_id=deployment_id,
                step_completed="frontend"
            )
            
        except VercelAPIError as e:
            return DeploymentResult(
                success=False,
                error=str(e),
                step_completed="none"
            )
