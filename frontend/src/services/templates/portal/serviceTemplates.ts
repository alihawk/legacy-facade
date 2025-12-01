/**
 * Service and configuration templates
 */

export const apiServiceTemplate = (baseUrl: string): string => {
  return `import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '${baseUrl}'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface CRUDService {
  getAll: (resource: string) => Promise<any[]>
  getOne: (resource: string, id: string | number) => Promise<any>
  create: (resource: string, data: any) => Promise<any>
  update: (resource: string, id: string | number, data: any) => Promise<any>
  delete: (resource: string, id: string | number) => Promise<void>
}

export const apiService: CRUDService = {
  async getAll(resource: string) {
    const response = await api.get(\`/\${resource}\`)
    return response.data.data || response.data || []
  },

  async getOne(resource: string, id: string | number) {
    const response = await api.get(\`/\${resource}/\${id}\`)
    return response.data.data || response.data
  },

  async create(resource: string, data: any) {
    const response = await api.post(\`/\${resource}\`, data)
    return response.data.data || response.data
  },

  async update(resource: string, id: string | number, data: any) {
    const response = await api.put(\`/\${resource}/\${id}\`, data)
    return response.data.data || response.data
  },

  async delete(resource: string, id: string | number) {
    await api.delete(\`/\${resource}/\${id}\`)
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
