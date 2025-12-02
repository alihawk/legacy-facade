/**
 * SOAP builder template for the standalone proxy server
 * 
 * This generates the SOAP request/response handling module for building
 * XML SOAP envelopes and parsing SOAP responses.
 */

export function generateSoapBuilder(): string {
  return `/**
 * SOAP request builder and response parser
 */

import { parseStringPromise } from 'xml2js';

interface AuthConfig {
  mode: 'none' | 'bearer' | 'apiKey' | 'basic' | 'wsse';
  wsseUsername?: string;
  wssePassword?: string;
}

/**
 * Build a SOAP XML request envelope
 * 
 * @param operationName - Name of the SOAP operation (e.g., "GetCustomers")
 * @param namespace - Target namespace for the operation
 * @param parameters - Dictionary of parameters to include in the operation
 * @param auth - Authentication configuration (for WSSE)
 * @returns Complete SOAP XML request as a string
 */
export function buildSoapRequest(
  operationName: string,
  namespace: string,
  parameters: Record<string, any> = {},
  auth?: AuthConfig
): string {
  // Build SOAP header (with WSSE if configured)
  let headerContent = '';
  if (auth && auth.mode === 'wsse' && auth.wsseUsername && auth.wssePassword) {
    headerContent = buildWsseHeader(auth.wsseUsername, auth.wssePassword);
  }

  // Build operation parameters
  const paramsXml = dictToXmlElements(parameters, 'ns', 12);

  // Construct SOAP envelope
  const soapEnvelope = \`<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="\${namespace}">
    <soap:Header>
\${headerContent}    </soap:Header>
    <soap:Body>
        <ns:\${operationName}>
\${paramsXml}        </ns:\${operationName}>
    </soap:Body>
</soap:Envelope>\`;

  return soapEnvelope;
}

/**
 * Build WS-Security UsernameToken header
 * 
 * @param username - Username for authentication
 * @param password - Password for authentication
 * @returns WS-Security XML header content
 */
export function buildWsseHeader(username: string, password: string): string {
  // Generate nonce (random unique value)
  const nonce = Buffer.from(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    .toString('base64');

  // Generate timestamp in ISO 8601 format
  const created = new Date().toISOString();

  // Build WS-Security header
  const wsseHeader = \`        <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
            <wsse:UsernameToken>
                <wsse:Username>\${username}</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">\${password}</wsse:Password>
                <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">\${nonce}</wsse:Nonce>
                <wsu:Created>\${created}</wsu:Created>
            </wsse:UsernameToken>
        </wsse:Security>
\`;

  return wsseHeader;
}

/**
 * Convert a dictionary to XML elements
 * 
 * @param data - Dictionary to convert
 * @param nsPrefix - Namespace prefix to use (e.g., "ns")
 * @param indent - Number of spaces for indentation
 * @returns XML elements as a string with proper indentation
 */
function dictToXmlElements(
  data: Record<string, any>,
  nsPrefix: string,
  indent: number
): string {
  const xmlLines: string[] = [];
  const indentStr = ' '.repeat(indent);

  for (const [key, value] of Object.entries(data)) {
    const safeKey = sanitizeXmlName(key);

    if (value === null || value === undefined) {
      // Null values as self-closing tags
      xmlLines.push(\`\${indentStr}<\${nsPrefix}:\${safeKey}/>\`);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Nested object - recurse
      xmlLines.push(\`\${indentStr}<\${nsPrefix}:\${safeKey}>\`);
      const nestedXml = dictToXmlElements(value, nsPrefix, indent + 4);
      xmlLines.push(nestedXml.trimEnd());
      xmlLines.push(\`\${indentStr}</\${nsPrefix}:\${safeKey}>\`);
    } else if (Array.isArray(value)) {
      // Array - create multiple elements with same name
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          xmlLines.push(\`\${indentStr}<\${nsPrefix}:\${safeKey}>\`);
          const nestedXml = dictToXmlElements(item, nsPrefix, indent + 4);
          xmlLines.push(nestedXml.trimEnd());
          xmlLines.push(\`\${indentStr}</\${nsPrefix}:\${safeKey}>\`);
        } else {
          xmlLines.push(\`\${indentStr}<\${nsPrefix}:\${safeKey}>\${escapeXml(String(item))}</\${nsPrefix}:\${safeKey}>\`);
        }
      }
    } else if (typeof value === 'boolean') {
      // Boolean - lowercase string
      xmlLines.push(\`\${indentStr}<\${nsPrefix}:\${safeKey}>\${value.toString().toLowerCase()}</\${nsPrefix}:\${safeKey}>\`);
    } else {
      // Primitive value
      xmlLines.push(\`\${indentStr}<\${nsPrefix}:\${safeKey}>\${escapeXml(String(value))}</\${nsPrefix}:\${safeKey}>\`);
    }
  }

  return xmlLines.length > 0 ? xmlLines.join('\\n') + '\\n' : '';
}

/**
 * Sanitize a string to be a valid XML element name
 * 
 * @param name - Original name
 * @returns Sanitized name safe for use as XML element name
 */
function sanitizeXmlName(name: string): string {
  // Replace invalid characters with underscores
  let sanitized = name.replace(/[^a-zA-Z0-9_.-]/g, '_');

  // Ensure it starts with a letter or underscore
  if (sanitized && !/^[a-zA-Z_]/.test(sanitized[0])) {
    sanitized = '_' + sanitized;
  }

  // Ensure it's not empty
  if (!sanitized) {
    sanitized = 'element';
  }

  return sanitized;
}

/**
 * Escape special XML characters
 * 
 * @param text - Text to escape
 * @returns Escaped text safe for XML content
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Parse a SOAP XML response and extract data
 * 
 * @param xmlContent - Raw XML response string
 * @param operationName - Name of the operation (used to find response element)
 * @returns Parsed data as object or array
 * @throws Error if SOAP Fault is present or XML is malformed
 */
export async function parseSoapResponse(
  xmlContent: string,
  operationName: string
): Promise<any> {
  try {
    // Parse XML to JavaScript object
    const result = await parseStringPromise(xmlContent, {
      explicitArray: false,
      ignoreAttrs: false,
      tagNameProcessors: [stripNamespace],
      attrNameProcessors: [stripNamespace]
    });

    // Extract SOAP Body
    const envelope = result.Envelope || result;
    const body = envelope.Body || envelope;

    // Check for SOAP Fault
    if (body.Fault) {
      const fault = body.Fault;
      const faultCode = fault.faultcode || fault.Code?.Value || 'Unknown';
      const faultString = fault.faultstring || fault.Reason?.Text || 'Unknown error';
      throw new Error(\`SOAP Fault [\${faultCode}]: \${faultString}\`);
    }

    // Extract response data
    const responseName = \`\${operationName}Response\`;
    let responseData = body[responseName] || body[operationName] || body;

    // If response contains a 'return' or 'result' field, unwrap it
    if (responseData.return) {
      responseData = responseData.return;
    } else if (responseData.result) {
      responseData = responseData.result;
    } else if (responseData.Result) {
      responseData = responseData.Result;
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('SOAP Fault')) {
      throw error;
    }
    throw new Error(\`Failed to parse SOAP response: \${error instanceof Error ? error.message : String(error)}\`);
  }
}

/**
 * Strip namespace from XML tag name
 * 
 * @param name - Tag name (possibly with namespace)
 * @returns Tag name without namespace
 */
function stripNamespace(name: string): string {
  const colonIndex = name.indexOf(':');
  return colonIndex !== -1 ? name.substring(colonIndex + 1) : name;
}
`;
}
