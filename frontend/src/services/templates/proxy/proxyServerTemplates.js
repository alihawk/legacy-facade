/**
 * Proxy server configuration templates
 *
 * Templates for package.json, tsconfig.json, and main server files
 */
export function generateProxyPackageJson() {
    return `{
  "name": "admin-portal-proxy",
  "version": "1.0.0",
  "description": "Proxy server for admin portal - handles legacy API communication",
  "main": "dist/index.js",
  "scripts": {
    "start": "ts-node src/index.ts",
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "serve": "node dist/index.js"
  },
  "keywords": ["proxy", "api", "legacy"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "xml2js": "^0.6.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "@types/xml2js": "^0.4.14",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
`;
}
export function generateProxyTsConfig() {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;
}
export function generateProxyIndexTemplate() {
    return `/**
 * Proxy Server Entry Point
 * 
 * Express server that forwards requests from the frontend to the legacy API,
 * handling authentication, field mapping, and SOAP translation.
 */

import express from 'express';
import cors from 'cors';
import { proxyRouter } from './proxy';
import { loadConfig } from './config';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Load configuration
let config;
try {
  config = loadConfig();
  console.log(\`✓ Configuration loaded successfully\`);
  console.log(\`  API Type: \${config.apiType}\`);
  console.log(\`  Base URL: \${config.baseUrl}\`);
  console.log(\`  Resources: \${config.resources.length}\`);
} catch (error) {
  console.error('Failed to load configuration:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy routes
app.use('/proxy', proxyRouter(config));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`\\n🚀 Proxy server running on http://localhost:\${PORT}\`);
  console.log(\`   Health check: http://localhost:\${PORT}/health\`);
  console.log(\`   Proxy endpoint: http://localhost:\${PORT}/proxy\`);
  console.log(\`\\nPress Ctrl+C to stop\\n\`);
});
`;
}
export function generateProxyRouterTemplate() {
    return `/**
 * Proxy Router - Handles CRUD operations and forwards to legacy API
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { ProxyConfig } from './config';
import { mapFieldsToLegacy, mapFieldsFromLegacy } from './fieldMapper';
import { buildAuthHeaders, buildSoapHeaders } from './authBuilder';
import { buildSoapRequest, parseSoapResponse } from './soapBuilder';

export function proxyRouter(config: ProxyConfig): Router {
  const router = Router();

  /**
   * GET /proxy/:resource - List all records
   */
  router.get('/:resource', async (req: Request, res: Response) => {
    const { resource } = req.params;
    const resourceConfig = config.resources.find(r => r.name === resource);

    if (!resourceConfig) {
      return res.status(404).json({ error: \`Resource '\${resource}' not found\` });
    }

    try {
      if (config.apiType === 'rest') {
        // REST API call
        const operation = resourceConfig.operations['list'];
        if (!operation?.rest) {
          return res.status(400).json({ error: 'List operation not configured' });
        }

        const url = \`\${config.baseUrl}\${operation.rest.path}\`;
        const headers = buildAuthHeaders(config.auth);

        const response = await axios({
          method: operation.rest.method,
          url,
          headers
        });

        // Extract data from response
        let data = response.data;
        if (resourceConfig.responsePath) {
          const path = resourceConfig.responsePath.split('.');
          for (const key of path) {
            data = data[key];
          }
        }

        // Map fields from legacy to normalized
        if (resourceConfig.fieldMappings && Array.isArray(data)) {
          data = data.map((item: any) => mapFieldsFromLegacy(item, resourceConfig.fieldMappings!));
        }

        res.json(data);
      } else {
        // SOAP API call
        const operation = resourceConfig.operations['list'];
        if (!operation?.soap) {
          return res.status(400).json({ error: 'List operation not configured for SOAP' });
        }

        const soapRequest = buildSoapRequest(
          operation.soap.operationName,
          config.soapNamespace || '',
          {},
          config.auth
        );

        const headers = buildSoapHeaders(operation.soap.soapAction, config.auth);

        const response = await axios.post(config.baseUrl, soapRequest, { headers });
        const data = await parseSoapResponse(response.data, operation.soap.operationName);

        // Map fields if needed
        let result = data;
        if (resourceConfig.fieldMappings && Array.isArray(result)) {
          result = result.map((item: any) => mapFieldsFromLegacy(item, resourceConfig.fieldMappings!));
        }

        res.json(result);
      }
    } catch (error: any) {
      console.error(\`Error fetching \${resource}:\`, error.message);
      res.status(error.response?.status || 500).json({
        error: error.message || 'Failed to fetch data'
      });
    }
  });

  /**
   * GET /proxy/:resource/:id - Get single record
   */
  router.get('/:resource/:id', async (req: Request, res: Response) => {
    const { resource, id } = req.params;
    const resourceConfig = config.resources.find(r => r.name === resource);

    if (!resourceConfig) {
      return res.status(404).json({ error: \`Resource '\${resource}' not found\` });
    }

    try {
      if (config.apiType === 'rest') {
        const operation = resourceConfig.operations['detail'];
        if (!operation?.rest) {
          return res.status(400).json({ error: 'Detail operation not configured' });
        }

        const url = \`\${config.baseUrl}\${operation.rest.path.replace(/\\{[^}]+\\}/g, id)}\`;
        const headers = buildAuthHeaders(config.auth);

        const response = await axios({
          method: operation.rest.method,
          url,
          headers
        });

        let data = response.data;
        if (resourceConfig.responsePath) {
          const path = resourceConfig.responsePath.split('.');
          for (const key of path) {
            data = data[key];
          }
        }

        if (resourceConfig.fieldMappings) {
          data = mapFieldsFromLegacy(data, resourceConfig.fieldMappings);
        }

        res.json(data);
      } else {
        // SOAP implementation similar to list
        const operation = resourceConfig.operations['detail'];
        if (!operation?.soap) {
          return res.status(400).json({ error: 'Detail operation not configured for SOAP' });
        }

        const soapRequest = buildSoapRequest(
          operation.soap.operationName,
          config.soapNamespace || '',
          { id },
          config.auth
        );

        const headers = buildSoapHeaders(operation.soap.soapAction, config.auth);
        const response = await axios.post(config.baseUrl, soapRequest, { headers });
        let data = await parseSoapResponse(response.data, operation.soap.operationName);

        if (resourceConfig.fieldMappings) {
          data = mapFieldsFromLegacy(data, resourceConfig.fieldMappings);
        }

        res.json(data);
      }
    } catch (error: any) {
      console.error(\`Error fetching \${resource}/\${id}:\`, error.message);
      res.status(error.response?.status || 500).json({
        error: error.message || 'Failed to fetch record'
      });
    }
  });

  /**
   * POST /proxy/:resource - Create new record
   */
  router.post('/:resource', async (req: Request, res: Response) => {
    const { resource } = req.params;
    const resourceConfig = config.resources.find(r => r.name === resource);

    if (!resourceConfig) {
      return res.status(404).json({ error: \`Resource '\${resource}' not found\` });
    }

    try {
      let data = req.body;

      // Map fields to legacy format
      if (resourceConfig.fieldMappings) {
        data = mapFieldsToLegacy(data, resourceConfig.fieldMappings);
      }

      if (config.apiType === 'rest') {
        const operation = resourceConfig.operations['create'];
        if (!operation?.rest) {
          return res.status(400).json({ error: 'Create operation not configured' });
        }

        const url = \`\${config.baseUrl}\${operation.rest.path}\`;
        const headers = buildAuthHeaders(config.auth);

        const response = await axios({
          method: operation.rest.method,
          url,
          headers,
          data
        });

        res.status(201).json(response.data);
      } else {
        const operation = resourceConfig.operations['create'];
        if (!operation?.soap) {
          return res.status(400).json({ error: 'Create operation not configured for SOAP' });
        }

        const soapRequest = buildSoapRequest(
          operation.soap.operationName,
          config.soapNamespace || '',
          data,
          config.auth
        );

        const headers = buildSoapHeaders(operation.soap.soapAction, config.auth);
        const response = await axios.post(config.baseUrl, soapRequest, { headers });
        const result = await parseSoapResponse(response.data, operation.soap.operationName);

        res.status(201).json(result);
      }
    } catch (error: any) {
      console.error(\`Error creating \${resource}:\`, error.message);
      res.status(error.response?.status || 500).json({
        error: error.message || 'Failed to create record'
      });
    }
  });

  /**
   * PUT /proxy/:resource/:id - Update record
   */
  router.put('/:resource/:id', async (req: Request, res: Response) => {
    const { resource, id } = req.params;
    const resourceConfig = config.resources.find(r => r.name === resource);

    if (!resourceConfig) {
      return res.status(404).json({ error: \`Resource '\${resource}' not found\` });
    }

    try {
      let data = req.body;

      if (resourceConfig.fieldMappings) {
        data = mapFieldsToLegacy(data, resourceConfig.fieldMappings);
      }

      if (config.apiType === 'rest') {
        const operation = resourceConfig.operations['update'];
        if (!operation?.rest) {
          return res.status(400).json({ error: 'Update operation not configured' });
        }

        const url = \`\${config.baseUrl}\${operation.rest.path.replace(/\\{[^}]+\\}/g, id)}\`;
        const headers = buildAuthHeaders(config.auth);

        const response = await axios({
          method: operation.rest.method,
          url,
          headers,
          data
        });

        res.json(response.data);
      } else {
        const operation = resourceConfig.operations['update'];
        if (!operation?.soap) {
          return res.status(400).json({ error: 'Update operation not configured for SOAP' });
        }

        const soapRequest = buildSoapRequest(
          operation.soap.operationName,
          config.soapNamespace || '',
          { ...data, id },
          config.auth
        );

        const headers = buildSoapHeaders(operation.soap.soapAction, config.auth);
        const response = await axios.post(config.baseUrl, soapRequest, { headers });
        const result = await parseSoapResponse(response.data, operation.soap.operationName);

        res.json(result);
      }
    } catch (error: any) {
      console.error(\`Error updating \${resource}/\${id}:\`, error.message);
      res.status(error.response?.status || 500).json({
        error: error.message || 'Failed to update record'
      });
    }
  });

  /**
   * DELETE /proxy/:resource/:id - Delete record
   */
  router.delete('/:resource/:id', async (req: Request, res: Response) => {
    const { resource, id } = req.params;
    const resourceConfig = config.resources.find(r => r.name === resource);

    if (!resourceConfig) {
      return res.status(404).json({ error: \`Resource '\${resource}' not found\` });
    }

    try {
      if (config.apiType === 'rest') {
        const operation = resourceConfig.operations['delete'];
        if (!operation?.rest) {
          return res.status(400).json({ error: 'Delete operation not configured' });
        }

        const url = \`\${config.baseUrl}\${operation.rest.path.replace(/\\{[^}]+\\}/g, id)}\`;
        const headers = buildAuthHeaders(config.auth);

        await axios({
          method: operation.rest.method,
          url,
          headers
        });

        res.status(204).send();
      } else {
        const operation = resourceConfig.operations['delete'];
        if (!operation?.soap) {
          return res.status(400).json({ error: 'Delete operation not configured for SOAP' });
        }

        const soapRequest = buildSoapRequest(
          operation.soap.operationName,
          config.soapNamespace || '',
          { id },
          config.auth
        );

        const headers = buildSoapHeaders(operation.soap.soapAction, config.auth);
        await axios.post(config.baseUrl, soapRequest, { headers });

        res.status(204).send();
      }
    } catch (error: any) {
      console.error(\`Error deleting \${resource}/\${id}:\`, error.message);
      res.status(error.response?.status || 500).json({
        error: error.message || 'Failed to delete record'
      });
    }
  });

  return router;
}
`;
}
