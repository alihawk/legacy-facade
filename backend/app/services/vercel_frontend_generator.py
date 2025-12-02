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
        """Generate package.json"""
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
                "react-dom": "^18.2.0"
            },
            "devDependencies": {
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "@vitejs/plugin-react": "^4.2.0",
                "typescript": "^5.3.0",
                "vite": "^5.0.0"
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
        """Generate index.html"""
        return """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
        """Generate src/App.tsx with resource display"""
        resources_json = json.dumps(resources, indent=2)
        return f"""import {{ useState }} from 'react'

function App() {{
  const proxyUrl = "{proxy_url}";
  const resources = {resources_json};

  return (
    <div style={{{{ padding: '2rem', fontFamily: 'system-ui' }}}}>
      <h1>Admin Portal</h1>
      <p>Connected to proxy: <code>{{proxyUrl}}</code></p>
      
      <h2>Available Resources</h2>
      <ul>
        {{resources.map((resource: any) => (
          <li key={{resource.name}}>
            <strong>{{resource.displayName || resource.name}}</strong>
            <br />
            <small>Endpoint: {{resource.endpoint}}</small>
          </li>
        ))}}
      </ul>
      
      <p style={{{{ marginTop: '2rem', color: '#666' }}}}>
        This is a minimal deployment. Customize this app to build your admin interface.
      </p>
    </div>
  )
}}

export default App
"""
    
    def _generate_index_css(self) -> str:
        """Generate src/index.css"""
        return """* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
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
