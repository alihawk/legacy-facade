/**
 * Config loader template for the standalone proxy server
 * 
 * This generates the configuration loader module that reads and validates
 * the proxy configuration from config.json.
 */

export function generateConfigLoader(): string {
  return `/**
 * Configuration loader for proxy server
 */

import fs from 'fs';
import path from 'path';

/**
 * Authentication configuration for legacy API
 */
export interface AuthConfig {
  mode: 'none' | 'bearer' | 'apiKey' | 'basic' | 'wsse';
  
  // Bearer token auth
  bearerToken?: string;
  
  // API Key auth
  apiKeyHeader?: string;
  apiKeyValue?: string;
  
  // Basic auth
  basicUser?: string;
  basicPass?: string;
  
  // WSSE auth (SOAP only)
  wsseUsername?: string;
  wssePassword?: string;
}

/**
 * Configuration for a REST API operation
 */
export interface RestOperationConfig {
  method: string;  // GET, POST, PUT, DELETE, PATCH
  path: string;    // e.g., "/api/v1/users/{id}"
}

/**
 * Configuration for a SOAP API operation
 */
export interface SoapOperationConfig {
  operationName: string;      // e.g., "GetCustomers"
  soapAction: string;         // e.g., "http://example.com/GetCustomers"
  responseElement?: string;   // Optional element name to extract from response
}

/**
 * Configuration for a single CRUD operation
 */
export interface OperationConfig {
  rest?: RestOperationConfig;
  soap?: SoapOperationConfig;
}

/**
 * Mapping between normalized field names and legacy field names
 */
export interface FieldMapping {
  normalizedName: string;  // Field name in frontend schema
  legacyName: string;      // Field name in legacy API
}

/**
 * Configuration for a single resource (e.g., users, orders)
 */
export interface ResourceConfig {
  name: string;                              // Resource name (e.g., "users")
  endpoint: string;                          // Base endpoint (e.g., "/api/v1/users")
  operations: Record<string, OperationConfig>;  // Map of operation name to config
  fieldMappings?: FieldMapping[];            // Optional field name mappings
  responsePath?: string;                     // Optional JSON path to unwrap response
}

/**
 * Complete proxy configuration
 */
export interface ProxyConfig {
  baseUrl: string;                // Legacy API base URL
  apiType: 'rest' | 'soap';       // API protocol type
  auth: AuthConfig;               // Authentication configuration
  resources: ResourceConfig[];    // Resource configurations
  soapNamespace?: string;         // SOAP namespace (for SOAP APIs only)
}

/**
 * Load proxy configuration from config.json
 * 
 * @returns Parsed proxy configuration
 * @throws Error if config file is missing or invalid
 */
export function loadConfig(): ProxyConfig {
  const configPath = path.join(process.cwd(), 'config.json');
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content) as ProxyConfig;
    
    // Validate required fields
    if (!config.baseUrl) {
      throw new Error('Missing required field: baseUrl');
    }
    
    if (!config.apiType || !['rest', 'soap'].includes(config.apiType)) {
      throw new Error('Invalid or missing apiType. Must be "rest" or "soap"');
    }
    
    if (!config.auth) {
      throw new Error('Missing required field: auth');
    }
    
    if (!config.resources || !Array.isArray(config.resources)) {
      throw new Error('Missing or invalid resources array');
    }
    
    // Validate SOAP-specific requirements
    if (config.apiType === 'soap' && !config.soapNamespace) {
      console.warn('Warning: SOAP API configured but soapNamespace is missing');
    }
    
    return config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(\`Configuration file not found: \${configPath}\`);
    }
    
    if (error instanceof SyntaxError) {
      throw new Error(\`Invalid JSON in configuration file: \${error.message}\`);
    }
    
    throw error;
  }
}

/**
 * Get configuration for a specific resource
 * 
 * @param config - Proxy configuration
 * @param resourceName - Name of the resource to find
 * @returns Resource configuration or undefined if not found
 */
export function getResourceConfig(
  config: ProxyConfig,
  resourceName: string
): ResourceConfig | undefined {
  return config.resources.find(r => r.name === resourceName);
}

/**
 * Get operation configuration for a resource
 * 
 * @param resourceConfig - Resource configuration
 * @param operationName - Name of the operation (list, detail, create, update, delete)
 * @returns Operation configuration or undefined if not found
 */
export function getOperationConfig(
  resourceConfig: ResourceConfig,
  operationName: string
): OperationConfig | undefined {
  return resourceConfig.operations[operationName];
}

/**
 * Validate that required auth fields are present for the configured mode
 * 
 * @param auth - Authentication configuration
 * @throws Error if required fields are missing
 */
export function validateAuthConfig(auth: AuthConfig): void {
  switch (auth.mode) {
    case 'bearer':
      if (!auth.bearerToken) {
        throw new Error('Bearer token is required for bearer authentication');
      }
      break;
      
    case 'apiKey':
      if (!auth.apiKeyHeader || !auth.apiKeyValue) {
        throw new Error('API key header and value are required for API key authentication');
      }
      break;
      
    case 'basic':
      if (!auth.basicUser || !auth.basicPass) {
        throw new Error('Username and password are required for basic authentication');
      }
      break;
      
    case 'wsse':
      if (!auth.wsseUsername || !auth.wssePassword) {
        throw new Error('Username and password are required for WSSE authentication');
      }
      break;
      
    case 'none':
      // No validation needed
      break;
      
    default:
      throw new Error(\`Unknown authentication mode: \${auth.mode}\`);
  }
}
`;
}
