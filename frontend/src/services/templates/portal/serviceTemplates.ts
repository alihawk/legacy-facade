/**
 * Service and configuration templates
 */

export const apiServiceTemplate = (baseUrl: string): string => {
  return `/**
 * API Service - Communicates with the proxy server
 * 
 * The proxy server handles all communication with the legacy API,
 * including authentication, field mapping, and SOAP translation.
 */

// Proxy server URL (defaults to localhost:4000 for development)
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:4000/proxy'

export interface CRUDService {
  getAll: (resource: string) => Promise<any[]>
  getOne: (resource: string, id: string | number) => Promise<any>
  create: (resource: string, data: any) => Promise<any>
  update: (resource: string, id: string | number, data: any) => Promise<any>
  delete: (resource: string, id: string | number) => Promise<void>
}

/**
 * Handle API errors and extract error messages
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = 'Request failed'
    try {
      const error = await response.json()
      errorMessage = error.message || error.error || errorMessage
    } catch {
      errorMessage = \`HTTP \${response.status}: \${response.statusText}\`
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

/**
 * API service for CRUD operations
 * All requests go through the proxy server
 */
export const apiService: CRUDService = {
  /**
   * Get all records for a resource
   */
  async getAll(resource: string): Promise<any[]> {
    const response = await fetch(\`\${PROXY_URL}/\${resource}\`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await handleResponse(response)
    // Handle both array responses and wrapped responses
    return Array.isArray(data) ? data : (data.data || data.items || [])
  },

  /**
   * Get a single record by ID
   */
  async getOne(resource: string, id: string | number): Promise<any> {
    const response = await fetch(\`\${PROXY_URL}/\${resource}/\${id}\`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await handleResponse(response)
    // Unwrap if data is nested
    return data.data || data
  },

  /**
   * Create a new record
   */
  async create(resource: string, data: any): Promise<any> {
    const response = await fetch(\`\${PROXY_URL}/\${resource}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const result = await handleResponse(response)
    return result.data || result
  },

  /**
   * Update an existing record
   */
  async update(resource: string, id: string | number, data: any): Promise<any> {
    const response = await fetch(\`\${PROXY_URL}/\${resource}/\${id}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const result = await handleResponse(response)
    return result.data || result
  },

  /**
   * Delete a record
   */
  async delete(resource: string, id: string | number): Promise<void> {
    const response = await fetch(\`\${PROXY_URL}/\${resource}/\${id}\`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    await handleResponse(response)
  },
}

export default apiService`
}

export const resourcesConfigTemplate = (schemas: any[]): string => {
  const schemasJson = JSON.stringify(schemas, null, 2)
  
  return `import type { ResourceSchema } from '../types'

/**
 * Resource schemas configuration
 * Generated from API analysis
 */
export const resources: ResourceSchema[] = ${schemasJson}

export default resources`
}
