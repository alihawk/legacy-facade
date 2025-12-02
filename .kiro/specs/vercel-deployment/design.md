# Design Document - Vercel Deployment Feature

## Overview

This feature enables one-click deployment of both the React frontend and Node.js proxy server to Vercel. The system will use the Vercel API to create two separate projects that are automatically configured to work together.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (React)                                       │ │
│  │  - PortalPage with "Deploy to Vercel" button          │ │
│  │  - Token input modal                                   │ │
│  │  - Deployment progress modal                           │ │
│  │  - Success modal with URLs                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/deploy/vercel
                            │ { token, resources, config }
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /api/deploy/vercel endpoint                           │ │
│  │  1. Validate token                                     │ │
│  │  2. Generate frontend files                            │ │
│  │  3. Generate proxy files                               │ │
│  │  4. Deploy proxy to Vercel                             │ │
│  │  5. Deploy frontend to Vercel (with proxy URL)         │ │
│  │  6. Return deployment URLs                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Vercel API calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Platform                         │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  Proxy Server        │    │  Frontend                │  │
│  │  (Serverless)        │◄───│  (Static + SSR)          │  │
│  │                      │    │                          │  │
│  │  /api/proxy/*        │    │  React App               │  │
│  │  /api/health         │    │  Vite Build              │  │
│  └──────────────────────┘    └──────────────────────────┘  │
│                                                              │
│  proxy-abc123.vercel.app    admin-portal-xyz.vercel.app    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. DeployToVercelButton Component

```typescript
interface DeployToVercelButtonProps {
  resources: ResourceSchema[];
  proxyConfig: ProxyConfig;
  onDeployStart?: () => void;
  onDeployComplete?: (urls: DeploymentResult) => void;
  onDeployError?: (error: string) => void;
}

// Component renders a button that triggers deployment
// Handles token management and deployment flow
```

#### 2. VercelTokenModal Component

```typescript
interface VercelTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSubmit: (token: string) => void;
}

// Modal for entering/updating Vercel token
// Includes link to Vercel token creation page
// Validates token format
```

#### 3. DeploymentProgressModal Component

```typescript
interface DeploymentProgressModalProps {
  isOpen: boolean;
  currentStep: 'proxy' | 'frontend' | 'complete';
  proxyStatus: 'pending' | 'deploying' | 'success' | 'error';
  frontendStatus: 'pending' | 'deploying' | 'success' | 'error';
  error?: string;
}

// Shows real-time deployment progress
// Displays current step and status
```

#### 4. DeploymentSuccessModal Component

```typescript
interface DeploymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontendUrl: string;
  proxyUrl: string;
}

// Shows deployment success with URLs
// Provides next steps and instructions
```

### Backend Services

#### 1. Vercel Deployment Service

```python
# backend/app/services/vercel_deployer.py

class VercelDeployer:
    """Handles deployment to Vercel platform"""
    
    def __init__(self, token: str):
        self.token = token
        self.api_base = "https://api.vercel.com"
    
    async def deploy_proxy(
        self,
        files: Dict[str, str],
        project_name: str,
        config: ProxyConfig
    ) -> DeploymentResult:
        """Deploy proxy server as Vercel serverless functions"""
        pass
    
    async def deploy_frontend(
        self,
        files: Dict[str, str],
        project_name: str,
        proxy_url: str,
        resources: List[ResourceSchema]
    ) -> DeploymentResult:
        """Deploy React frontend to Vercel"""
        pass
    
    async def create_deployment(
        self,
        files: Dict[str, str],
        project_name: str,
        env_vars: Dict[str, str]
    ) -> str:
        """Create a Vercel deployment"""
        pass
    
    async def wait_for_deployment(
        self,
        deployment_id: str,
        timeout: int = 300
    ) -> DeploymentStatus:
        """Poll deployment status until complete"""
        pass
```

#### 2. Vercel File Generator

```python
# backend/app/services/vercel_file_generator.py

class VercelFileGenerator:
    """Generates files optimized for Vercel deployment"""
    
    def generate_proxy_files(
        self,
        config: ProxyConfig
    ) -> Dict[str, str]:
        """Generate proxy server files for Vercel serverless"""
        # Returns:
        # - api/proxy.js (serverless function)
        # - api/health.js (health check)
        # - vercel.json (configuration)
        # - package.json
        pass
    
    def generate_frontend_files(
        self,
        resources: List[ResourceSchema],
        proxy_url: str
    ) -> Dict[str, str]:
        """Generate frontend files for Vercel"""
        # Returns all React files with proxy URL configured
        pass
    
    def generate_vercel_json(
        self,
        project_type: str,  # 'frontend' or 'proxy'
        env_vars: Dict[str, str]
    ) -> str:
        """Generate vercel.json configuration"""
        pass
```

## Data Models

### Deployment Request

```python
class DeploymentRequest(BaseModel):
    token: str  # Vercel API token
    resources: List[ResourceSchema]
    proxy_config: ProxyConfig
    project_name: Optional[str] = None  # Auto-generated if not provided
```

### Deployment Result

```python
class DeploymentResult(BaseModel):
    success: bool
    frontend_url: Optional[str]
    proxy_url: Optional[str]
    deployment_id: str
    error: Optional[str]
```

### Deployment Status

```python
class DeploymentStatus(BaseModel):
    state: str  # 'BUILDING', 'READY', 'ERROR', 'CANCELED'
    url: Optional[str]
    error: Optional[str]
```

## Vercel Serverless Function Structure

The proxy server will be converted to Vercel serverless functions:

```
proxy-server/
├── api/
│   ├── proxy.js          # Main proxy handler
│   ├── health.js         # Health check endpoint
│   └── _lib/
│       ├── config.js     # Config loader
│       ├── fieldMapper.js
│       ├── authBuilder.js
│       └── soapBuilder.js
├── vercel.json           # Vercel configuration
└── package.json
```

### vercel.json for Proxy

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/proxy/(.*)",
      "dest": "/api/proxy.js"
    },
    {
      "src": "/api/health",
      "dest": "/api/health.js"
    }
  ],
  "env": {
    "PROXY_CONFIG": "@proxy_config"
  }
}
```

### Serverless Function Example

```javascript
// api/proxy.js
const { loadConfig } = require('./_lib/config');
const { forwardRequest } = require('./_lib/forwarder');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const config = loadConfig();
    const result = await forwardRequest(req, config);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Token validation before deployment

*For any* deployment request, if the Vercel token is invalid, the system should reject the request before attempting any file generation or API calls
**Validates: Requirements 1.3, 7.2**

### Property 2: Proxy deployed before frontend

*For any* successful deployment, the proxy server deployment must complete before the frontend deployment begins
**Validates: Requirements 4.1, 4.2**

### Property 3: Frontend configured with proxy URL

*For any* successful deployment, the frontend environment variables must include the proxy server URL
**Validates: Requirements 2.3, 4.2**

### Property 4: CORS configuration matches frontend

*For any* deployed proxy server, the CORS configuration must allow requests from the deployed frontend domain
**Validates: Requirements 3.3, 6.4**

### Property 5: Deployment atomicity

*For any* deployment attempt, if either the proxy or frontend deployment fails, the system should report failure and not claim partial success
**Validates: Requirements 4.4, 5.4**

### Property 6: Token security

*For any* API call involving the Vercel token, the token must never be logged, persisted to disk, or included in error messages
**Validates: Requirements 7.2, 7.3**

### Property 7: Environment variable propagation

*For any* proxy deployment, all configuration from config.json must be available as environment variables in the deployed serverless functions
**Validates: Requirements 3.5, 6.3**

### Property 8: Deployment URL validity

*For any* successful deployment, the returned URLs must be valid HTTPS URLs ending in .vercel.app
**Validates: Requirements 2.4, 3.4, 6.5**

## Error Handling

### Token Errors

- **Invalid token format**: Show modal with instructions to get token from Vercel
- **Expired token**: Prompt user to generate new token
- **Insufficient permissions**: Explain required Vercel permissions

### Deployment Errors

- **Rate limit exceeded**: Show retry countdown
- **Build failed**: Display build logs and common solutions
- **Timeout**: Suggest checking Vercel dashboard for status

### Network Errors

- **Connection failed**: Suggest checking internet connection
- **API unavailable**: Suggest retrying later

## Testing Strategy

### Unit Tests

- Test Vercel API client methods
- Test file generation for both proxy and frontend
- Test token validation
- Test error handling

### Integration Tests

- Test deployment flow with mock Vercel API
- Test file generation produces valid Vercel projects
- Test environment variable configuration

### End-to-End Tests

- Deploy to actual Vercel account (test account)
- Verify deployed frontend loads
- Verify deployed proxy responds to requests
- Verify frontend can communicate with proxy

### Manual Testing

- Test with different resource configurations
- Test with REST and SOAP APIs
- Test error scenarios (invalid token, network issues)
- Test deployment updates (redeploy existing project)

## Performance Considerations

- File generation should complete in < 5 seconds
- Deployment API calls should timeout after 5 minutes
- Progress updates should be real-time (WebSocket or polling)
- Large projects (many resources) should still deploy successfully

## Security Considerations

- Vercel token stored only in browser localStorage
- Token sent to backend only over HTTPS
- Backend never persists token
- Deployed proxy uses environment variables for sensitive config
- CORS properly configured to prevent unauthorized access

## Deployment Flow Diagram

```
User clicks "Deploy to Vercel"
         │
         ▼
    Has token? ──No──► Show token modal
         │                    │
        Yes                   │
         │◄───────────────────┘
         ▼
Generate proxy files
         │
         ▼
Deploy proxy to Vercel
         │
         ▼
Wait for proxy deployment
         │
         ▼
Get proxy URL
         │
         ▼
Generate frontend files
(with proxy URL)
         │
         ▼
Deploy frontend to Vercel
         │
         ▼
Wait for frontend deployment
         │
         ▼
Show success modal
(frontend URL + proxy URL)
```

## Future Enhancements

- Support for custom domains
- Automatic SSL certificate setup
- Deployment history and rollback
- Environment variable management UI
- Team/organization support
- Deployment analytics
- Cost estimation
