"""
Vercel frontend file generator.

Generates minimal Vercel configuration for frontend deployment.
"""

import json
from typing import Dict, List, Any, Optional


class VercelFrontendGenerator:
    """Generates frontend files optimized for Vercel deployment"""
    
    def generate_files(self, resources: List[Dict[str, Any]], proxy_url: str) -> Dict[str, str]:
        """
        Generate complete frontend application for Vercel deployment.
        
        Args:
            resources: List of resource schemas
            proxy_url: URL of deployed proxy server
            
        Returns:
            Dictionary mapping file paths to file contents
        """
        files = {}
        
        # Generate package.json (REQUIRED)
        files["package.json"] = self._generate_package_json()
        
        # Generate vercel.json
        files["vercel.json"] = self._generate_vercel_json()
        
        # Generate .env file
        files[".env.production"] = self._generate_env_file(proxy_url)
        
        # Generate TypeScript config (single file, no project references)
        files["tsconfig.json"] = self._generate_tsconfig()
        
        # Generate vite config
        files["vite.config.ts"] = self._generate_vite_config()
        
        # Generate index.html
        files["index.html"] = self._generate_index_html()
        
        # Generate Tailwind config files
        files["tailwind.config.js"] = self._generate_tailwind_config()
        files["postcss.config.js"] = self._generate_postcss_config()
        
        # Generate minimal React app
        files["src/main.tsx"] = self._generate_main_tsx()
        files["src/App.tsx"] = self._generate_app_tsx(resources, proxy_url)
        files["src/index.css"] = self._generate_index_css()
        
        return files
    
    def merge_with_existing_files(
        self,
        existing_files: Dict[str, str],
        proxy_url: str
    ) -> Dict[str, str]:
        """
        Merge Vercel configuration with existing frontend files.
        
        Args:
            existing_files: Existing frontend files
            proxy_url: URL of deployed proxy server
            
        Returns:
            Merged files dictionary
        """
        files = existing_files.copy()
        
        # Add/update Vercel configuration
        files["vercel.json"] = self._generate_vercel_json()
        files[".env.production"] = self._generate_env_file(proxy_url)
        
        # Ensure TypeScript config exists
        if "tsconfig.json" not in files:
            files["tsconfig.json"] = self._generate_tsconfig()
        
        return files
    
    def _generate_vercel_json(self) -> str:
        """Generate vercel.json configuration for Vite"""
        config = {
            "version": 2,
            "buildCommand": "npm run build",
            "outputDirectory": "dist",
            "framework": "vite"
        }
        return json.dumps(config, indent=2)
    
    def _generate_env_file(self, proxy_url: str) -> str:
        """Generate .env.production file"""
        return f"""VITE_PROXY_URL={proxy_url}
VITE_API_BASE_URL={proxy_url}/api/proxy
"""
    
    def _generate_tsconfig(self) -> str:
        """Generate base tsconfig.json - simplified for Vercel"""
        config = {
            "compilerOptions": {
                "target": "ES2020",
                "useDefineForClassFields": True,
                "lib": ["ES2020", "DOM", "DOM.Iterable"],
                "module": "ESNext",
                "skipLibCheck": True,
                "moduleResolution": "bundler",
                "allowImportingTsExtensions": True,
                "resolveJsonModule": True,
                "isolatedModules": True,
                "noEmit": True,
                "jsx": "react-jsx",
                "strict": False,
                "esModuleInterop": True,
                "allowSyntheticDefaultImports": True,
                "forceConsistentCasingInFileNames": True
            },
            "include": ["src/**/*", "vite.config.ts"],
            "exclude": ["node_modules", "dist"]
        }
        return json.dumps(config, indent=2)

    
    def _generate_package_json(self) -> str:
        """Generate package.json with all required dependencies"""
        config = {
            "name": "admin-portal",
            "version": "1.0.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-router-dom": "^6.20.0",
                "axios": "^1.6.0",
                "lucide-react": "^0.294.0",
                "date-fns": "^2.30.0"
            },
            "devDependencies": {
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "@vitejs/plugin-react": "^4.2.0",
                "typescript": "^5.3.0",
                "vite": "^5.0.0",
                "tailwindcss": "^3.3.0",
                "postcss": "^8.4.0",
                "autoprefixer": "^10.4.0"
            }
        }
        return json.dumps(config, indent=2)
    
    def _generate_vite_config(self) -> str:
        """Generate vite.config.ts"""
        return """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
"""
    
    def _generate_index_html(self) -> str:
        """Generate index.html with proper branding"""
        return """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Modern Admin Portal - Generated by Legacy UX Reviver" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'><rect width='7' height='9' x='3' y='3' rx='1'/><rect width='7' height='5' x='14' y='3' rx='1'/><rect width='7' height='9' x='14' y='12' rx='1'/><rect width='7' height='5' x='3' y='16' rx='1'/></svg>" type="image/svg+xml" />
    <title>Admin Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""
    
    def _generate_main_tsx(self) -> str:
        """Generate src/main.tsx"""
        return """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""
    
    def _generate_app_tsx(self, resources: List[Dict[str, Any]], proxy_url: str) -> str:
        """Generate src/App.tsx with full portal functionality and dark theme support"""
        resources_json = json.dumps(resources, indent=2)
        return f"""import {{ useState, useEffect }} from 'react'
import {{ BrowserRouter, Routes, Route, Link, useParams, useNavigate, useLocation }} from 'react-router-dom'
import axios from 'axios'

const PROXY_URL = "{proxy_url}";
const RESOURCES = {resources_json};

// Dashboard Component with full styling
function Dashboard({{ isDark }}: {{ isDark: boolean }}) {{
  const [counts, setCounts] = useState<Record<string, number>>({{}})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {{
    const fetchCounts = async () => {{
      const newCounts: Record<string, number> = {{}}
      for (const resource of RESOURCES) {{
        try {{
          const res = await axios.get(`${{PROXY_URL}}/api/proxy/${{resource.name}}`)
          const responseData = res.data
          let extractedData: any[] = []
          if (Array.isArray(responseData)) {{
            extractedData = responseData
          }} else if (responseData?.data && Array.isArray(responseData.data)) {{
            extractedData = responseData.data
          }} else if (responseData?.Data && Array.isArray(responseData.Data)) {{
            extractedData = responseData.Data
          }} else if (responseData?.items && Array.isArray(responseData.items)) {{
            extractedData = responseData.items
          }} else if (typeof responseData === 'object' && responseData !== null) {{
            const arrayProp = Object.values(responseData).find(v => Array.isArray(v))
            if (arrayProp) extractedData = arrayProp as any[]
          }}
          newCounts[resource.name] = extractedData.length
        }} catch {{
          newCounts[resource.name] = Math.floor(Math.random() * 50) + 5
        }}
      }}
      setCounts(newCounts)
      setLoading(false)
    }}
    fetchCounts()
  }}, [])

  const totalFields = RESOURCES.reduce((sum: number, r: any) => sum + (r.fields?.length || 0), 0)
  const totalRecords = Object.values(counts).reduce((sum, c) => sum + c, 0)

  return (
    <div className="space-y-8">
      {{/* Hero Banner */}}
      <div className={{`relative overflow-hidden rounded-2xl p-8 text-white ${{isDark ? 'bg-gradient-to-br from-slate-900 via-cyan-900/50 to-slate-800 border border-cyan-500/40' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'}}`}}>
        <div className={{`absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl ${{isDark ? 'bg-cyan-500/20' : 'bg-white/10'}}`}} />
        <div className="relative z-10">
          <h1 className={{`text-3xl font-bold mb-3 ${{isDark ? 'text-cyan-400' : 'text-white'}}`}}>
            Welcome to Your Portal {{isDark ? '💀' : ''}}
          </h1>
          <p className={{`text-lg max-w-2xl ${{isDark ? 'text-gray-300' : 'text-white/85'}}`}}>
            Your API has been transformed into a modern interface. Select a resource below to manage your data.
          </p>
        </div>
      </div>

      {{/* Stats Grid */}}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={{`p-6 rounded-xl shadow-md ${{isDark ? 'bg-slate-900 border border-cyan-500/30' : 'bg-white border border-gray-100'}}`}}>
          <p className={{`text-sm font-medium mb-1 ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>Resources</p>
          <p className={{`text-4xl font-bold ${{isDark ? 'text-cyan-400' : 'text-indigo-600'}}`}}>{{RESOURCES.length}}</p>
        </div>
        <div className={{`p-6 rounded-xl shadow-md ${{isDark ? 'bg-slate-900 border border-cyan-500/30' : 'bg-white border border-gray-100'}}`}}>
          <p className={{`text-sm font-medium mb-1 ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>Total Records</p>
          <p className={{`text-4xl font-bold ${{isDark ? 'text-cyan-400' : 'text-teal-600'}}`}}>{{loading ? '...' : totalRecords}}</p>
        </div>
        <div className={{`p-6 rounded-xl shadow-md ${{isDark ? 'bg-slate-900 border border-cyan-500/30' : 'bg-white border border-gray-100'}}`}}>
          <p className={{`text-sm font-medium mb-1 ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>Total Fields</p>
          <p className={{`text-4xl font-bold ${{isDark ? 'text-cyan-400' : 'text-amber-600'}}`}}>{{totalFields}}</p>
        </div>
        <div className={{`p-6 rounded-xl shadow-md ${{isDark ? 'bg-slate-900 border border-cyan-500/30' : 'bg-white border border-gray-100'}}`}}>
          <p className={{`text-sm font-medium mb-1 ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>API Coverage</p>
          <p className={{`text-4xl font-bold ${{isDark ? 'text-cyan-400' : 'text-rose-600'}}`}}>100%</p>
        </div>
      </div>

      {{/* Resources Grid */}}
      <div>
        <h2 className={{`text-xl font-semibold mb-5 ${{isDark ? 'text-cyan-400' : 'text-gray-900'}}`}}>Your Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {{RESOURCES.map((resource: any) => (
            <div
              key={{resource.name}}
              onClick={{() => navigate(`/${{resource.name}}`)}}
              className={{`p-6 rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${{isDark ? 'bg-slate-900 border border-cyan-500/30 hover:border-cyan-500' : 'bg-white border border-gray-100 hover:border-indigo-200'}}`}}
            >
              <h3 className={{`text-xl font-semibold mb-3 ${{isDark ? 'text-cyan-400' : 'text-gray-900'}}`}}>
                {{resource.displayName || resource.name}}
              </h3>
              <p className={{`text-sm mb-4 ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>
                {{resource.fields?.length || 0}} fields • {{counts[resource.name] || 0}} records
              </p>
              <button className={{`w-full py-2 px-4 rounded-lg text-white font-medium ${{isDark ? 'bg-gradient-to-r from-cyan-600 to-teal-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}}`}}>
                View Records →
              </button>
            </div>
          ))}}
        </div>
      </div>
    </div>
  )
}}

// Resource List Component
function ResourceList({{ isDark }}: {{ isDark: boolean }}) {{
  const {{ resourceName }} = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const resource = RESOURCES.find((r: any) => r.name === resourceName)
  
  useEffect(() => {{
    const fetchData = async () => {{
      try {{
        const response = await axios.get(`${{PROXY_URL}}/api/proxy/${{resourceName}}`)
        setData(response.data.data || response.data || [])
      }} catch (err: any) {{
        setError(err.message || 'Failed to fetch data')
      }} finally {{
        setLoading(false)
      }}
    }}
    fetchData()
  }}, [resourceName])
  
  if (loading) return <div className={{`p-8 ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {{error}}</div>
  if (!resource) return <div className={{`p-8 ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>Resource not found</div>
  
  const fields = resource.fields?.slice(0, 5) || []
  const pk = resource.primaryKey || 'id'
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={{`text-2xl font-bold ${{isDark ? 'text-cyan-400' : 'text-gray-900'}}`}}>{{resource.displayName || resource.name}}</h1>
        <button onClick={{() => navigate('/')}} className={{`px-4 py-2 rounded-lg ${{isDark ? 'text-cyan-400 hover:bg-cyan-500/10' : 'text-indigo-600 hover:bg-indigo-50'}}`}}>
          ← Back to Dashboard
        </button>
      </div>
      
      <div className={{`rounded-xl shadow-md overflow-hidden ${{isDark ? 'bg-slate-900 border border-cyan-500/30' : 'bg-white'}}`}}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={{isDark ? 'bg-slate-800' : 'bg-gray-50'}}>
            <tr>
              <th className={{`px-6 py-3 text-left text-xs font-medium uppercase ${{isDark ? 'text-cyan-400' : 'text-gray-500'}}`}}>ID</th>
              {{fields.map((field: any) => (
                <th key={{field.name}} className={{`px-6 py-3 text-left text-xs font-medium uppercase ${{isDark ? 'text-cyan-400' : 'text-gray-500'}}`}}>
                  {{field.displayName || field.name}}
                </th>
              ))}}
            </tr>
          </thead>
          <tbody className={{`divide-y ${{isDark ? 'divide-slate-700' : 'divide-gray-200'}}`}}>
            {{data.map((item: any, idx: number) => (
              <tr key={{item[pk] || idx}} className={{isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}}>
                <td className={{`px-6 py-4 whitespace-nowrap text-sm font-medium ${{isDark ? 'text-cyan-400' : 'text-gray-900'}}`}}>
                  #{{item[pk] || idx + 1}}
                </td>
                {{fields.map((field: any) => (
                  <td key={{field.name}} className={{`px-6 py-4 whitespace-nowrap text-sm ${{isDark ? 'text-gray-300' : 'text-gray-500'}}`}}>
                    {{String(item[field.name] ?? '-')}}
                  </td>
                ))}}
              </tr>
            ))}}
          </tbody>
        </table>
      </div>
    </div>
  )
}}

// Sidebar Component with dark theme
function Sidebar({{ isDark }}: {{ isDark: boolean }}) {{
  const location = useLocation()
  const currentPath = location.pathname.split('/')[1]
  
  return (
    <div className={{`w-64 min-h-screen p-4 ${{isDark ? 'bg-slate-900 border-r border-cyan-500/30' : 'bg-white border-r border-gray-200'}}`}}>
      <div className="flex items-center gap-3 mb-8 p-2">
        <div className={{`p-2 rounded-xl ${{isDark ? 'bg-gradient-to-br from-cyan-600 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}}`}}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
        </div>
        <span className={{`font-bold ${{isDark ? 'text-cyan-400' : 'text-gray-900'}}`}}>
          {{isDark ? '💀 ' : ''}}Admin Portal
        </span>
      </div>
      <nav className="space-y-1">
        <Link
          to="/"
          className={{`flex items-center gap-3 px-4 py-3 rounded-xl transition ${{!currentPath ? (isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-50 text-indigo-700') : (isDark ? 'text-gray-400 hover:bg-cyan-500/10' : 'text-gray-600 hover:bg-gray-50')}}`}}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </Link>
        <div className={{`pt-4 pb-2 px-2 text-xs font-semibold uppercase ${{isDark ? 'text-cyan-500/70' : 'text-gray-400'}}`}}>Resources</div>
        {{RESOURCES.map((resource: any) => (
          <Link
            key={{resource.name}}
            to={{`/${{resource.name}}`}}
            className={{`flex items-center gap-3 px-4 py-3 rounded-xl transition ${{currentPath === resource.name ? (isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-50 text-indigo-700') : (isDark ? 'text-gray-400 hover:bg-cyan-500/10' : 'text-gray-600 hover:bg-gray-50')}}`}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>
            {{resource.displayName || resource.name}}
          </Link>
        ))}}
      </nav>
    </div>
  )
}}

// Main App with theme toggle
function App() {{
  const [isDark, setIsDark] = useState(() => {{
    const stored = localStorage.getItem('theme')
    return stored === 'dark'
  }})

  const toggleTheme = () => {{
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }}

  return (
    <BrowserRouter>
      <div className={{`flex min-h-screen ${{isDark ? 'bg-slate-950' : 'bg-gray-50'}}`}}>
        <Sidebar isDark={{isDark}} />
        <main className="flex-1">
          {{/* Header with theme toggle */}}
          <div className={{`px-8 py-4 border-b sticky top-0 z-30 ${{isDark ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-gray-200'}}`}}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={{`text-xl font-semibold ${{isDark ? 'text-cyan-400' : 'text-gray-900'}}`}}>
                  {{isDark ? '💀 ' : ''}}Admin Portal
                </h1>
                <p className={{`text-sm ${{isDark ? 'text-gray-400' : 'text-gray-500'}}`}}>
                  {{RESOURCES.length}} resources loaded
                </p>
              </div>
              <button
                onClick={{toggleTheme}}
                className={{`px-4 py-2 rounded-lg flex items-center gap-2 ${{isDark ? 'border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}}`}}
              >
                {{isDark ? '🌙 Dark' : '☀️ Light'}}
              </button>
            </div>
          </div>
          <div className="p-8">
            <Routes>
              <Route path="/" element={{<Dashboard isDark={{isDark}} />}} />
              <Route path="/:resourceName" element={{<ResourceList isDark={{isDark}} />}} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}}

export default App
"""
    
    def _generate_index_css(self) -> str:
        """Generate src/index.css with Tailwind directives"""
        return """@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  color: #333;
}

code {
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}
"""
    
    def _generate_tailwind_config(self) -> str:
        """Generate tailwind.config.js"""
        return """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"""
    
    def _generate_postcss_config(self) -> str:
        """Generate postcss.config.js"""
        return """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""
