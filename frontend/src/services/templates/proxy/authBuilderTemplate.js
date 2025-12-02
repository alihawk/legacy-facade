/**
 * Auth builder template for the standalone proxy server
 *
 * This generates the authentication module that builds HTTP headers
 * for different authentication modes (Bearer, API Key, Basic, WSSE).
 */
export function generateAuthBuilder() {
    return `/**
 * Authentication header builder for proxy requests
 */

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

/**
 * Build authentication headers for REST API requests
 * 
 * @param auth - Authentication configuration
 * @returns HTTP headers object
 */
export function buildAuthHeaders(auth: AuthConfig): Record<string, string> {
  switch (auth.mode) {
    case 'bearer':
      if (auth.bearerToken) {
        return { 'Authorization': \`Bearer \${auth.bearerToken}\` };
      }
      break;
      
    case 'apiKey':
      if (auth.apiKeyHeader && auth.apiKeyValue) {
        return { [auth.apiKeyHeader]: auth.apiKeyValue };
      }
      break;
      
    case 'basic':
      if (auth.basicUser && auth.basicPass) {
        const encoded = Buffer.from(\`\${auth.basicUser}:\${auth.basicPass}\`).toString('base64');
        return { 'Authorization': \`Basic \${encoded}\` };
      }
      break;
      
    default:
      return {};
  }
  
  return {};
}

/**
 * Build HTTP headers for SOAP API requests
 * 
 * @param soapAction - SOAP action URI
 * @param auth - Authentication configuration
 * @returns HTTP headers object
 */
export function buildSoapHeaders(soapAction: string, auth: AuthConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': \`"\${soapAction}"\`
  };
  
  // Add Basic auth to HTTP headers if configured
  // Note: WSSE auth goes in the SOAP envelope, not HTTP headers
  if (auth.mode === 'basic') {
    Object.assign(headers, buildAuthHeaders(auth));
  }
  
  return headers;
}

/**
 * Build WS-Security element for SOAP envelope
 * 
 * @param username - Username for WSSE authentication
 * @param password - Password for WSSE authentication
 * @returns XML string for wsse:Security element
 */
export function buildWsseSecurityElement(username: string, password: string): string {
  // Generate nonce (random unique value)
  const nonce = Buffer.from(Math.random().toString(36).substring(2, 15)).toString('base64');
  
  // Generate timestamp
  const created = new Date().toISOString();
  
  return \`<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
  <wsse:UsernameToken>
    <wsse:Username>\${username}</wsse:Username>
    <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">\${password}</wsse:Password>
    <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">\${nonce}</wsse:Nonce>
    <wsu:Created>\${created}</wsu:Created>
  </wsse:UsernameToken>
</wsse:Security>\`;
}
`;
}
