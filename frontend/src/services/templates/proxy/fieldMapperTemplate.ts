/**
 * Field mapper template for the standalone proxy server
 * 
 * This generates the field mapping module that transforms field names
 * between normalized (frontend) and legacy (backend) formats.
 */

export function generateFieldMapper(): string {
  return `/**
 * Field mapping utilities for transforming data between normalized and legacy formats
 */

interface FieldMapping {
  normalizedName: string;
  legacyName: string;
}

/**
 * Map field names from normalized to legacy format
 * 
 * @param data - Single record or array of records to transform
 * @param mappings - Field mapping definitions
 * @returns Transformed data with legacy field names
 */
export function mapFieldsToLegacy(
  data: Record<string, any> | Record<string, any>[],
  mappings: FieldMapping[]
): Record<string, any> | Record<string, any>[] {
  if (!mappings || mappings.length === 0) {
    return data;
  }

  // Build mapping dictionary (normalized → legacy)
  const map = new Map<string, string>();
  for (const m of mappings) {
    map.set(m.normalizedName, m.legacyName);
  }

  // Handle array or single object
  if (Array.isArray(data)) {
    return data.map(item => mapSingleRecord(item, map));
  }
  return mapSingleRecord(data, map);
}

/**
 * Map field names from legacy to normalized format
 * 
 * @param data - Single record or array of records to transform
 * @param mappings - Field mapping definitions
 * @returns Transformed data with normalized field names
 */
export function mapFieldsFromLegacy(
  data: Record<string, any> | Record<string, any>[],
  mappings: FieldMapping[]
): Record<string, any> | Record<string, any>[] {
  if (!mappings || mappings.length === 0) {
    return data;
  }

  // Build mapping dictionary (legacy → normalized)
  const map = new Map<string, string>();
  for (const m of mappings) {
    map.set(m.legacyName, m.normalizedName);
  }

  // Handle array or single object
  if (Array.isArray(data)) {
    return data.map(item => mapSingleRecord(item, map));
  }
  return mapSingleRecord(data, map);
}

/**
 * Map field names in a single record
 */
function mapSingleRecord(
  record: Record<string, any>,
  map: Map<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(record)) {
    const mappedKey = map.get(key) || key;
    result[mappedKey] = value;
  }
  
  return result;
}

/**
 * Unwrap nested response data
 * 
 * Legacy APIs often wrap data in nested structures like:
 * - { data: [...] }
 * - { Data: { Users: [...] } }
 * - { result: { items: [...] } }
 * 
 * @param data - Response data to unwrap
 * @param responsePath - Optional path to data (e.g., "data.users")
 * @returns Unwrapped data
 */
export function unwrapResponse(
  data: any,
  responsePath?: string
): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // If responsePath is specified, follow it
  if (responsePath) {
    const parts = responsePath.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return data; // Path not found, return original
      }
    }
    
    return current;
  }

  // Auto-unwrap common wrapper patterns
  let current = data;
  const maxDepth = 10;
  let depth = 0;

  while (typeof current === 'object' && !Array.isArray(current) && depth < maxDepth) {
    // Check if this object has exactly one key (common wrapper pattern)
    const keys = Object.keys(current);
    
    if (keys.length === 1) {
      const key = keys[0];
      const value = current[key];
      
      if (typeof value === 'object') {
        current = value;
        depth++;
        continue;
      }
    }

    // Check for common wrapper keys
    const wrapperKeys = ['data', 'Data', 'result', 'Result', 'results', 'Results', 
                         'items', 'Items', 'response', 'Response', 'payload', 'Payload'];
    
    let found = false;
    for (const wrapperKey of wrapperKeys) {
      if (wrapperKey in current) {
        const value = current[wrapperKey];
        if (typeof value === 'object') {
          current = value;
          depth++;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      break;
    }
  }

  return current;
}
`;
}
