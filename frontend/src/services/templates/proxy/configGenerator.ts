/**
 * Config generator for proxy server configuration
 * 
 * Generates config.json content from ProxyConfig and ResourceSchema[]
 */

// Import types from config loader template
interface AuthConfig {
  mode: 'none' | 'bearer' | 'apiKey' | 'basic' | 'wsse';
  bearerToken?: string;
  apiKeyHeader?: string;
  apiKeyValue?: string;
  basicUser?: string;
  basicPass?: string;
  wsseUsername?: string;
  wssePassword?: string;
}

interface RestOperationConfig {
  method: string;
  path: string;
}

interface SoapOperationConfig {
  operationName: string;
  soapAction: string;
  responseElement?: string;
}

interface OperationConfig {
  rest?: RestOperationConfig;
  soap?: SoapOperationConfig;
}

interface FieldMapping {
  normalizedName: string;
  legacyName: string;
}

interface ResourceConfig {
  name: string;
  endpoint: string;
  operations: Record<string, OperationConfig>;
  fieldMappings?: FieldMapping[];
  responsePath?: string;
}

interface ProxyConfig {
  baseUrl: string;
  apiType: 'rest' | 'soap';
  auth: AuthConfig;
  resources: ResourceConfig[];
  soapNamespace?: string;
}

// ResourceSchema from frontend
interface ResourceSchema {
  name: string;
  displayName: string;
  endpoint: string;
  primaryKey: string;
  fields: Array<{
    name: string;
    type: string;
    displayName: string;
  }>;
  operations: string[];
}

/**
 * Generate proxy configuration JSON from ProxyConfig and ResourceSchema[]
 * 
 * @param proxyConfig - Proxy configuration from backend (can be null)
 * @param schemas - Resource schemas from API analysis
 * @returns JSON string for config.json
 */
export function generateProxyConfig(
  proxyConfig: ProxyConfig | null,
  schemas: ResourceSchema[]
): string {
  // Use defaults if proxyConfig is null
  const baseUrl = proxyConfig?.baseUrl || '{{YOUR_API_BASE_URL}}';
  const apiType = proxyConfig?.apiType || 'rest';
  const soapNamespace = proxyConfig?.soapNamespace;

  // Sanitize auth config (replace secrets with placeholders)
  const auth = sanitizeAuthConfig(proxyConfig?.auth);

  // Build resources array
  const resources = schemas.map(schema => {
    // Find matching resource config from proxyConfig
    const resourceConfig = proxyConfig?.resources.find(r => r.name === schema.name);

    // Build operations config
    const operations: Record<string, OperationConfig> = {};

    for (const op of schema.operations) {
      if (apiType === 'rest') {
        operations[op] = buildRestOperation(op, schema.endpoint, schema.primaryKey);
      } else {
        operations[op] = buildSoapOperation(op, schema.name, soapNamespace || '');
      }
    }

    return {
      name: schema.name,
      endpoint: schema.endpoint,
      operations,
      fieldMappings: resourceConfig?.fieldMappings || [],
      ...(resourceConfig?.responsePath && { responsePath: resourceConfig.responsePath })
    };
  });

  const config = {
    baseUrl,
    apiType,
    auth,
    resources,
    ...(soapNamespace && { soapNamespace })
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Sanitize auth config by replacing secrets with placeholders
 */
function sanitizeAuthConfig(auth?: AuthConfig): AuthConfig {
  if (!auth) {
    return { mode: 'none' };
  }

  const sanitized: AuthConfig = {
    mode: auth.mode
  };

  switch (auth.mode) {
    case 'bearer':
      sanitized.bearerToken = '{{YOUR_BEARER_TOKEN}}';
      break;

    case 'apiKey':
      sanitized.apiKeyHeader = auth.apiKeyHeader || 'X-API-Key';
      sanitized.apiKeyValue = '{{YOUR_API_KEY}}';
      break;

    case 'basic':
      sanitized.basicUser = '{{YOUR_USERNAME}}';
      sanitized.basicPass = '{{YOUR_PASSWORD}}';
      break;

    case 'wsse':
      sanitized.wsseUsername = '{{YOUR_USERNAME}}';
      sanitized.wssePassword = '{{YOUR_PASSWORD}}';
      break;

    case 'none':
    default:
      // No auth fields needed
      break;
  }

  return sanitized;
}

/**
 * Build REST operation configuration
 */
function buildRestOperation(
  operation: string,
  endpoint: string,
  primaryKey: string
): OperationConfig {
  const config: OperationConfig = { rest: { method: 'GET', path: endpoint } };

  switch (operation) {
    case 'list':
      config.rest = {
        method: 'GET',
        path: endpoint
      };
      break;

    case 'detail':
      config.rest = {
        method: 'GET',
        path: `${endpoint}/{${primaryKey}}`
      };
      break;

    case 'create':
      config.rest = {
        method: 'POST',
        path: endpoint
      };
      break;

    case 'update':
      config.rest = {
        method: 'PUT',
        path: `${endpoint}/{${primaryKey}}`
      };
      break;

    case 'delete':
      config.rest = {
        method: 'DELETE',
        path: `${endpoint}/{${primaryKey}}`
      };
      break;

    default:
      config.rest = {
        method: 'GET',
        path: endpoint
      };
  }

  return config;
}

/**
 * Build SOAP operation configuration
 */
function buildSoapOperation(
  operation: string,
  resourceName: string,
  namespace: string
): OperationConfig {
  // Convert resource name to PascalCase for SOAP operation names
  const pascalResource = toPascalCase(resourceName);

  const config: OperationConfig = { soap: { operationName: '', soapAction: '' } };

  switch (operation) {
    case 'list':
      config.soap = {
        operationName: `Get${pascalResource}`,
        soapAction: `${namespace}/Get${pascalResource}`,
        responseElement: `Get${pascalResource}Response`
      };
      break;

    case 'detail':
      config.soap = {
        operationName: `Get${pascalResource}ById`,
        soapAction: `${namespace}/Get${pascalResource}ById`,
        responseElement: `Get${pascalResource}ByIdResponse`
      };
      break;

    case 'create':
      config.soap = {
        operationName: `Create${pascalResource}`,
        soapAction: `${namespace}/Create${pascalResource}`,
        responseElement: `Create${pascalResource}Response`
      };
      break;

    case 'update':
      config.soap = {
        operationName: `Update${pascalResource}`,
        soapAction: `${namespace}/Update${pascalResource}`,
        responseElement: `Update${pascalResource}Response`
      };
      break;

    case 'delete':
      config.soap = {
        operationName: `Delete${pascalResource}`,
        soapAction: `${namespace}/Delete${pascalResource}`,
        responseElement: `Delete${pascalResource}Response`
      };
      break;

    default:
      config.soap = {
        operationName: `Get${pascalResource}`,
        soapAction: `${namespace}/Get${pascalResource}`
      };
  }

  return config;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
