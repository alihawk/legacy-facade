/**
 * Base project file templates (README, CSS, utils)
 */
export const readmeTemplate = `# Admin Portal

Auto-generated admin portal for your legacy API.

## 🏗️ Architecture

This project consists of two servers working together:

- **Frontend** (React + Vite): Runs on \`http://localhost:5173\`
- **Proxy Server** (Node.js + Express): Runs on \`http://localhost:4000\`

### Why a Proxy Server?

The proxy server handles all communication with your legacy API, solving common integration challenges:

- **Authentication**: Securely manages API keys, tokens, and credentials
- **Field Mapping**: Translates between normalized field names and legacy field names
- **SOAP Translation**: Converts SOAP XML to/from JSON (if applicable)
- **CORS Handling**: Eliminates cross-origin request issues
- **Error Normalization**: Provides consistent error responses

\`\`\`
[Browser/Frontend] --> [Proxy Server:4000] --> [Legacy API]
                              |
                       - Field Mapping
                       - Auth Headers  
                       - SOAP/REST
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Option 1: Use Startup Script (Recommended)

**Unix/Linux/macOS:**
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

**Windows:**
\`\`\`cmd
start.bat
\`\`\`

The script will:
1. Install dependencies for both servers
2. Start the proxy server on port 4000
3. Start the frontend on port 5173
4. Display URLs for both services

Press \`Ctrl+C\` (Unix) or any key (Windows) to stop both servers.

### Option 2: Manual Startup

**Terminal 1 - Start Proxy Server:**
\`\`\`bash
cd proxy-server
npm install
npm start
\`\`\`

**Terminal 2 - Start Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Accessing the Application

- **Frontend**: http://localhost:5173
- **Proxy API**: http://localhost:4000

## 🔧 Configuration

### Proxy Server Configuration

Edit \`proxy-server/config.json\` to configure your legacy API connection:

\`\`\`json
{
  "baseUrl": "https://your-legacy-api.com",
  "apiType": "rest",
  "auth": {
    "mode": "bearer",
    "bearerToken": "{{YOUR_TOKEN}}"
  },
  "resources": [
    {
      "name": "users",
      "endpoint": "/api/v1/users",
      "operations": { ... },
      "fieldMappings": [
        {
          "normalizedName": "user_id",
          "legacyName": "USR_ID"
        }
      ]
    }
  ]
}
\`\`\`

**Configuration Options:**

- \`baseUrl\`: Your legacy API base URL
- \`apiType\`: Either \`"rest"\` or \`"soap"\`
- \`auth.mode\`: Authentication type (\`"none"\`, \`"bearer"\`, \`"apiKey"\`, \`"basic"\`, \`"wsse"\`)
- \`resources\`: Array of resource configurations with field mappings
- \`soapNamespace\`: SOAP namespace (required for SOAP APIs)

### Frontend Resources

Resource schemas are defined in \`frontend/src/config/resources.ts\`. These define the UI structure and available operations.

## 📁 Project Structure

\`\`\`
admin-portal/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # UI primitives
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ResourceList.tsx
│   │   │   ├── ResourceDetail.tsx
│   │   │   └── ResourceForm.tsx
│   │   ├── services/       # API service layer
│   │   │   └── api.ts      # Calls proxy server
│   │   ├── config/         # Configuration
│   │   │   └── resources.ts
│   │   ├── types/          # TypeScript types
│   │   ├── lib/            # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── proxy-server/            # Express proxy server
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── proxy.ts        # Proxy route handlers
│   │   ├── fieldMapper.ts  # Field name translation
│   │   ├── authBuilder.ts  # Auth header construction
│   │   ├── soapBuilder.ts  # SOAP XML handling
│   │   └── config.ts       # Config loader
│   ├── config.json         # Proxy configuration
│   ├── package.json
│   └── tsconfig.json
│
├── start.sh                 # Unix startup script
├── start.bat                # Windows startup script
└── README.md               # This file
\`\`\`

## 🚀 Production Deployment

### 1. Build the Frontend

\`\`\`bash
cd frontend
npm run build
\`\`\`

The production build will be in \`frontend/dist/\`.

### 2. Deploy the Proxy Server

Deploy the \`proxy-server/\` directory to your backend infrastructure:

- **Option A**: Deploy to a Node.js hosting service (Heroku, Railway, Render)
- **Option B**: Deploy to a VPS with PM2 for process management
- **Option C**: Containerize with Docker

**Example with PM2:**
\`\`\`bash
cd proxy-server
npm install --production
pm2 start src/index.ts --name admin-portal-proxy
\`\`\`

### 3. Update Frontend Configuration

Update \`frontend/src/services/api.ts\` to point to your deployed proxy URL:

\`\`\`typescript
const PROXY_URL = 'https://your-proxy-server.com/proxy';
\`\`\`

### 4. Deploy Frontend

Deploy the \`frontend/dist/\` directory to:
- Static hosting (Vercel, Netlify, Cloudflare Pages)
- CDN
- Web server (Nginx, Apache)

## 🔒 Security Notes

- **Never commit secrets**: Replace placeholders in \`config.json\` with actual credentials
- **Use environment variables**: For production, use environment variables instead of hardcoded credentials
- **HTTPS in production**: Always use HTTPS for both frontend and proxy in production
- **Rate limiting**: Consider adding rate limiting to the proxy server
- **CORS configuration**: Update CORS settings in \`proxy-server/src/index.ts\` for production

## 🎨 Customization

### Styling

This project uses Tailwind CSS. Customize styles in:
- \`frontend/tailwind.config.js\` - Tailwind configuration
- \`frontend/src/index.css\` - Global styles
- Component files - Component-specific styles

### Adding Features

1. **Add new routes**: Edit \`frontend/src/App.tsx\`
2. **Add new components**: Create in \`frontend/src/components/\`
3. **Modify API calls**: Edit \`frontend/src/services/api.ts\`
4. **Add proxy middleware**: Edit \`proxy-server/src/proxy.ts\`

## 🐛 Troubleshooting

### Proxy server won't start
- Check if port 4000 is already in use
- Verify \`config.json\` is valid JSON
- Check Node.js version (18+ required)

### Frontend can't connect to proxy
- Ensure proxy server is running on port 4000
- Check browser console for CORS errors
- Verify \`frontend/src/services/api.ts\` has correct proxy URL

### Legacy API authentication fails
- Verify credentials in \`proxy-server/config.json\`
- Check auth mode matches your API's requirements
- Review proxy server logs for error details

### Field names don't match
- Update \`fieldMappings\` in \`proxy-server/config.json\`
- Ensure \`normalizedName\` matches frontend schema
- Ensure \`legacyName\` matches legacy API response

## 📝 License

MIT License - feel free to use and modify as needed.

---

Generated by Legacy UX Reviver
`;
export const indexCssTemplate = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}`;
export const utilsTemplate = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
export const typesTemplate = `/**
 * Core TypeScript types for the admin portal
 */

export interface ResourceField {
  name: string
  type: string
  displayName: string
}

export interface ResourceSchema {
  name: string
  displayName: string
  endpoint: string
  primaryKey: string
  fields: ResourceField[]
  operations: string[]
}`;
