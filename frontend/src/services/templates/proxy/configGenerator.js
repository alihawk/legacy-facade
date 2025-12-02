/**
 * Config generator for proxy server configuration
 *
 * Generates config.json content from ProxyConfig and ResourceSchema[]
 */
/**
 * Generate proxy configuration JSON from ProxyConfig and ResourceSchema[]
 *
 * @param proxyConfig - Proxy configuration from backend (can be null)
 * @param schemas - Resource schemas from API analysis
 * @returns JSON string for config.json
 */
export function generateProxyConfig(proxyConfig, schemas) {
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
        const operations = {};
        for (const op of schema.operations) {
            if (apiType === 'rest') {
                operations[op] = buildRestOperation(op, schema.endpoint, schema.primaryKey);
            }
            else {
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
function sanitizeAuthConfig(auth) {
    if (!auth) {
        return { mode: 'none' };
    }
    const sanitized = {
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
function buildRestOperation(operation, endpoint, primaryKey) {
    const config = { rest: { method: 'GET', path: endpoint } };
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
function buildSoapOperation(operation, resourceName, namespace) {
    // Convert resource name to PascalCase for SOAP operation names
    const pascalResource = toPascalCase(resourceName);
    const config = { soap: { operationName: '', soapAction: '' } };
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
function toPascalCase(str) {
    return str
        .split(/[-_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
