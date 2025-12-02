"""
Vercel proxy file generator.

Generates serverless functions for Vercel deployment.
"""

import json
from typing import Dict, Any


class VercelProxyGenerator:
    """Generates proxy server files optimized for Vercel serverless"""
    
    def generate_files(self, proxy_config: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate all files needed for Vercel proxy deployment.
        
        Args:
            proxy_config: Proxy configuration
            
        Returns:
            Dictionary mapping file paths to file contents
        """
        files = {}
        
        # Generate package.json
        files["package.json"] = self._generate_package_json()
        
        # Generate vercel.json with proper routing
        files["vercel.json"] = self._generate_vercel_json()
        
        # Generate main proxy handler
        files["api/proxy/[...path].js"] = self._generate_proxy_handler(proxy_config)
        
        # Generate health check
        files["api/health.js"] = self._generate_health_handler()
        
        # Generate index handler for root
        files["api/index.js"] = self._generate_index_handler()
        
        return files
    
    def _generate_package_json(self) -> str:
        """Generate package.json for proxy server"""
        package = {
            "name": "proxy-server",
            "version": "1.0.0",
            "type": "commonjs",
            "dependencies": {
                "axios": "^1.6.0"
            }
        }
        return json.dumps(package, indent=2)
    
    def _generate_vercel_json(self) -> str:
        """Generate vercel.json configuration with proper routing"""
        config = {
            "version": 2,
            "builds": [
                {
                    "src": "api/**/*.js",
                    "use": "@vercel/node"
                }
            ],
            "routes": [
                {
                    "src": "/",
                    "dest": "/api/index.js"
                },
                {
                    "src": "/api/health",
                    "dest": "/api/health.js"
                },
                {
                    "src": "/api/proxy/(.*)",
                    "dest": "/api/proxy/[...path].js"
                }
            ]
        }
        return json.dumps(config, indent=2)
    
    def _generate_proxy_handler(self, proxy_config: Dict[str, Any]) -> str:
        """Generate main proxy handler with catch-all routing"""
        config_json = json.dumps(proxy_config, indent=2)
        
        return f"""const axios = require('axios');

const config = {config_json};

module.exports = async (req, res) => {{
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {{
    return res.status(200).end();
  }}
  
  try {{
    // Extract resource and ID from URL path
    // URL format: /api/proxy/resourceName or /api/proxy/resourceName/id
    const url = req.url || '';
    const pathMatch = url.match(/\\/api\\/proxy\\/([^\\/\\?]+)(?:\\/([^\\/\\?]+))?/);
    
    if (!pathMatch) {{
      return res.status(400).json({{ 
        error: 'Invalid path',
        message: 'Expected /api/proxy/{{resource}} or /api/proxy/{{resource}}/{{id}}',
        receivedUrl: url
      }});
    }}
    
    const resourceName = pathMatch[1];
    const resourceId = pathMatch[2];
    
    // Find resource config
    const resource = config.resources?.find(r => r.name === resourceName);
    if (!resource) {{
      return res.status(404).json({{ 
        error: 'Resource not found',
        message: `Resource '${{resourceName}}' is not configured`,
        availableResources: config.resources?.map(r => r.name) || []
      }});
    }}
    
    // Determine operation based on method and presence of ID
    let operation;
    if (req.method === 'GET' && resourceId) {{
      operation = 'detail';
    }} else if (req.method === 'GET') {{
      operation = 'list';
    }} else if (req.method === 'POST') {{
      operation = 'create';
    }} else if (req.method === 'PUT' || req.method === 'PATCH') {{
      operation = 'update';
    }} else if (req.method === 'DELETE') {{
      operation = 'delete';
    }} else {{
      return res.status(405).json({{ error: 'Method not allowed' }});
    }}
    
    // Build target URL using endpoint or heuristics
    let targetPath = resource.endpoint || `/${{resourceName}}`;
    
    // Check for explicit operation config
    const opConfig = resource.operations?.[operation];
    if (opConfig?.rest?.path) {{
      targetPath = opConfig.rest.path;
    }}
    
    // Replace {{id}} placeholder with actual ID
    if (resourceId) {{
      if (targetPath.includes('{{id}}')) {{
        targetPath = targetPath.replace('{{id}}', resourceId);
      }} else {{
        targetPath = `${{targetPath}}/${{resourceId}}`;
      }}
    }}
    
    const targetUrl = config.baseUrl.replace(/\\/$/, '') + targetPath;
    
    // Build headers
    const headers = {{}};
    
    // Add authentication
    if (config.auth?.mode === 'bearer' && config.auth?.bearerToken) {{
      headers['Authorization'] = `Bearer ${{config.auth.bearerToken}}`;
    }} else if (config.auth?.mode === 'apiKey' && config.auth?.apiKeyHeader && config.auth?.apiKeyValue) {{
      headers[config.auth.apiKeyHeader] = config.auth.apiKeyValue;
    }} else if (config.auth?.mode === 'basic' && config.auth?.basicUser && config.auth?.basicPass) {{
      const credentials = Buffer.from(`${{config.auth.basicUser}}:${{config.auth.basicPass}}`).toString('base64');
      headers['Authorization'] = `Basic ${{credentials}}`;
    }}
    
    // Add content type for POST/PUT
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {{
      headers['Content-Type'] = 'application/json';
    }}
    
    // Prepare request body with field mapping (normalized → legacy)
    let requestBody = req.body;
    if (requestBody && resource.fieldMappings && resource.fieldMappings.length > 0) {{
      requestBody = mapFields(requestBody, resource.fieldMappings, false);
    }}
    
    console.log(`Proxying ${{req.method}} ${{targetUrl}}`);
    
    // Forward request to legacy API
    const response = await axios({{
      method: opConfig?.rest?.method || req.method,
      url: targetUrl,
      headers,
      data: requestBody,
      params: req.query,
      validateStatus: () => true,
      timeout: 30000
    }});
    
    // Get response data
    let responseData = response.data;
    
    // Unwrap response if responsePath is configured
    if (resource.responsePath && responseData) {{
      const pathParts = resource.responsePath.split('.');
      for (const part of pathParts) {{
        if (responseData && typeof responseData === 'object' && part in responseData) {{
          responseData = responseData[part];
        }} else {{
          break;
        }}
      }}
    }}
    
    // Map response fields (legacy → normalized)
    if (responseData && resource.fieldMappings && resource.fieldMappings.length > 0) {{
      responseData = mapFields(responseData, resource.fieldMappings, true);
    }}
    
    return res.status(response.status).json(responseData);
    
  }} catch (error) {{
    console.error('Proxy error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {{
      return res.status(503).json({{ 
        error: 'Backend unavailable',
        message: 'Could not connect to legacy API'
      }});
    }}
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {{
      return res.status(504).json({{ 
        error: 'Timeout',
        message: 'Legacy API did not respond in time'
      }});
    }}
    
    return res.status(500).json({{ 
      error: 'Proxy error',
      message: error.message 
    }});
  }}
}};

/**
 * Map field names between normalized and legacy formats
 */
function mapFields(data, mappings, toLegacy) {{
  if (!data || !mappings || mappings.length === 0) {{
    return data;
  }}
  
  // Build mapping dictionary
  const fieldMap = {{}};
  for (const m of mappings) {{
    if (toLegacy) {{
      // Legacy → Normalized (for responses)
      fieldMap[m.legacyName] = m.normalizedName;
    }} else {{
      // Normalized → Legacy (for requests)
      fieldMap[m.normalizedName] = m.legacyName;
    }}
  }}
  
  // Handle array or single object
  if (Array.isArray(data)) {{
    return data.map(item => mapSingleRecord(item, fieldMap));
  }}
  return mapSingleRecord(data, fieldMap);
}}

function mapSingleRecord(record, fieldMap) {{
  if (!record || typeof record !== 'object') {{
    return record;
  }}
  
  const result = {{}};
  for (const [key, value] of Object.entries(record)) {{
    const mappedKey = fieldMap[key] || key;
    result[mappedKey] = value;
  }}
  return result;
}}
"""
    
    def _generate_health_handler(self) -> str:
        """Generate health check handler"""
        return """module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ 
    status: 'ok', 
    service: 'proxy-server',
    timestamp: new Date().toISOString()
  });
};
"""
    
    def _generate_index_handler(self) -> str:
        """Generate index/root handler that returns HTML"""
        return """module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`
<!DOCTYPE html>
<html>
  <head>
    <title>Proxy Server</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .container {
        background: white;
        padding: 2.5rem;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        max-width: 600px;
        width: 100%;
      }
      h1 { 
        color: #16a34a; 
        margin-bottom: 0.5rem;
        font-size: 1.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .status { 
        color: #16a34a; 
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .status::before {
        content: '';
        width: 10px;
        height: 10px;
        background: #16a34a;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      h2 {
        font-size: 1.1rem;
        color: #374151;
        margin-bottom: 0.75rem;
      }
      code { 
        background: #f3f4f6; 
        padding: 3px 8px; 
        border-radius: 4px;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 0.85em;
        color: #1f2937;
      }
      ul {
        list-style: none;
        margin-bottom: 1.5rem;
      }
      li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #f3f4f6;
      }
      li:last-child { border-bottom: none; }
      .method {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 0.5rem;
      }
      .get { background: #dbeafe; color: #1d4ed8; }
      .post { background: #dcfce7; color: #16a34a; }
      .put { background: #fef3c7; color: #d97706; }
      .delete { background: #fee2e2; color: #dc2626; }
      .footer {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 0.875rem;
      }
      .footer p { margin-bottom: 0.5rem; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🚀 Proxy Server</h1>
      <p class="status">Running</p>
      
      <h2>Available Endpoints</h2>
      <ul>
        <li><span class="method get">GET</span> <code>/api/health</code> - Health check</li>
        <li><span class="method get">GET</span> <code>/api/proxy/{resource}</code> - List resources</li>
        <li><span class="method get">GET</span> <code>/api/proxy/{resource}/{id}</code> - Get single resource</li>
        <li><span class="method post">POST</span> <code>/api/proxy/{resource}</code> - Create resource</li>
        <li><span class="method put">PUT</span> <code>/api/proxy/{resource}/{id}</code> - Update resource</li>
        <li><span class="method delete">DELETE</span> <code>/api/proxy/{resource}/{id}</code> - Delete resource</li>
      </ul>
      
      <div class="footer">
        <p><strong>What is this?</strong></p>
        <p>This proxy server forwards requests to your legacy API, handling authentication, field mapping, and CORS automatically.</p>
        <p style="margin-top: 1rem;">Your frontend should call these <code>/api/proxy/*</code> endpoints.</p>
      </div>
    </div>
  </body>
</html>
  `);
};
"""