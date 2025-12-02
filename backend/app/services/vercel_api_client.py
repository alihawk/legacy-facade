"""Vercel API client for creating and managing deployments."""

import asyncio
import time
from typing import Dict, Optional, Any

import httpx
from pydantic import BaseModel


class DeploymentStatus(BaseModel):
    """Represents the status of a Vercel deployment"""
    state: str
    url: Optional[str] = None
    ready_state: Optional[str] = None
    error: Optional[Dict[str, Any]] = None


class VercelAPIError(Exception):
    """Raised when Vercel API returns an error"""
    pass


class VercelAPIClient:
    """Client for interacting with Vercel API"""
    
    def __init__(self, token: str):
        self.token = token
        self.api_base = "https://api.vercel.com"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        self.timeout = httpx.Timeout(30.0, connect=10.0)

    async def create_deployment(
        self,
        files: Dict[str, str],
        project_name: str,
        env_vars: Optional[Dict[str, str]] = None
    ) -> str:
        """Create a new deployment on Vercel."""
        vercel_files = []
        for file_path, content in files.items():
            vercel_files.append({
                "file": file_path,
                "data": content,
                "encoding": "utf-8"
            })
        
        payload = {
            "name": project_name,
            "files": vercel_files,
            "projectSettings": {"framework": None}
        }
        
        if env_vars:
            payload["env"] = env_vars
        
        max_retries = 3
        retry_delay = 1.0
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        f"{self.api_base}/v13/deployments",
                        headers=self.headers,
                        json=payload
                    )
                    
                    if response.status_code == 429:
                        if attempt < max_retries - 1:
                            await asyncio.sleep(retry_delay * (2 ** attempt))
                            continue
                        raise VercelAPIError("Rate limit exceeded")
                    
                    if response.status_code == 401:
                        raise VercelAPIError("Invalid Vercel token")
                    
                    if response.status_code == 403:
                        raise VercelAPIError("Insufficient permissions")
                    
                    if response.status_code >= 400:
                        error_data = response.json() if response.text else {}
                        error_message = error_data.get("error", {}).get("message", "Unknown error")
                        raise VercelAPIError(f"Deployment failed: {error_message}")
                    
                    data = response.json()
                    deployment_id = data.get("id") or data.get("uid")
                    
                    if not deployment_id:
                        raise VercelAPIError("No deployment ID returned")
                    
                    return deployment_id
                    
            except httpx.TimeoutException:
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                raise VercelAPIError("Request timed out")
            
            except httpx.RequestError as e:
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                raise VercelAPIError(f"Network error: {str(e)}")
        
        raise VercelAPIError("Failed after retries")

    async def get_deployment_status(self, deployment_id: str) -> DeploymentStatus:
        """Get the status of a deployment."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.api_base}/v13/deployments/{deployment_id}",
                    headers=self.headers
                )
                
                if response.status_code >= 400:
                    raise VercelAPIError(f"Status check failed: {response.status_code}")
                
                data = response.json()
                
                return DeploymentStatus(
                    state=data.get("readyState", "UNKNOWN"),
                    url=data.get("url"),
                    ready_state=data.get("readyState"),
                    error=data.get("error")
                )
                
        except httpx.RequestError as e:
            raise VercelAPIError(f"Network error: {str(e)}")
    
    async def wait_for_deployment(
        self,
        deployment_id: str,
        timeout: int = 300,
        poll_interval: int = 5
    ) -> DeploymentStatus:
        """Wait for a deployment to complete."""
        start_time = time.time()
        
        while True:
            if time.time() - start_time > timeout:
                raise VercelAPIError(f"Deployment timed out after {timeout} seconds")
            
            status = await self.get_deployment_status(deployment_id)
            
            if status.state == "READY":
                return status
            
            if status.state == "ERROR":
                error_msg = "Deployment failed"
                if status.error:
                    error_msg += f": {status.error.get('message', 'Unknown error')}"
                raise VercelAPIError(error_msg)
            
            if status.state == "CANCELED":
                raise VercelAPIError("Deployment was canceled")
            
            await asyncio.sleep(poll_interval)
    
    async def validate_token(self) -> bool:
        """Validate that the Vercel token is valid."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.api_base}/v2/user",
                    headers=self.headers
                )
                return response.status_code == 200
        except Exception:
            return False
