/**
 * Express server entry point template for the standalone proxy server
 * 
 * This generates the main index.ts file that starts the Express server
 * and sets up middleware for handling requests to legacy APIs.
 */

export function generateProxyIndex(): string {
  return `import express from 'express';
import cors from 'cors';
import { createProxyRouter } from './proxy.js';
import { loadConfig } from './config.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/xml' }));

// Load configuration
const config = loadConfig();
console.log('Loaded config for', config.resources.length, 'resources');

// Proxy routes
app.use('/proxy', createProxyRouter(config));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', apiType: config.apiType });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(\`Proxy server running on http://localhost:\${PORT}\`);
});
`;
}
