/**
 * Main application templates (App.tsx, main.tsx, App.css)
 */
export const appTsxTemplate = (schemas) => {
    const routes = schemas.map(schema => `
            <Route path="${schema.name}" element={<ResourceListWrapper resources={resources} isSpooky={isSpookyTheme} />} />
            <Route path="${schema.name}/new" element={<ResourceFormWrapper resources={resources} mode="create" />} />
            <Route path="${schema.name}/:id" element={<ResourceDetailWrapper resources={resources} />} />
            <Route path="${schema.name}/:id/edit" element={<ResourceFormWrapper resources={resources} mode="edit" />} />`).join('');
    return `import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import ResourceList from "./components/ResourceList"
import ResourceDetail from "./components/ResourceDetail"
import ResourceForm from "./components/ResourceForm"
import { Button } from "./components/ui/button"
import { resources as configResources } from "./config/resources"
import type { ResourceSchema } from "./types"

export default function App() {
  const [resources] = useState<ResourceSchema[]>(configResources)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme')
    return (stored === 'dark' ? 'dark' : 'light') as 'light' | 'dark'
  })

  const isSpookyTheme = currentTheme === 'dark'

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    setCurrentTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <BrowserRouter>
      <div className={\`min-h-screen \${isSpookyTheme ? 'bg-slate-950' : 'bg-gray-50'}\`}>
        <Sidebar resources={resources} open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} isSpooky={isSpookyTheme} />

        <main className={\`transition-all duration-300 \${sidebarOpen ? "ml-64" : "ml-16"}\`}>
          {/* Theme Toggle Header */}
          <div className={\`\${isSpookyTheme ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-gray-200'} border-b px-8 py-4 sticky top-0 z-30 shadow-sm\`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={\`text-xl font-semibold \${isSpookyTheme ? 'text-cyan-400' : 'text-gray-900'}\`}>
                  {isSpookyTheme ? '💀 ' : ''}Admin Portal
                </h1>
                <p className={\`text-sm \${isSpookyTheme ? 'text-gray-400' : 'text-gray-500'}\`}>
                  {resources.length} resources loaded
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className={\`gap-2 px-3 \${isSpookyTheme ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 hover:bg-gray-50'}\`}
              >
                {currentTheme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className={\`p-8 \${isSpookyTheme ? 'bg-slate-950' : ''}\`}>
            <Routes>
              <Route index element={<Dashboard resources={resources} isSpooky={isSpookyTheme} />} />${routes}
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

// Wrapper components to extract params
function ResourceListWrapper({ resources, isSpooky }: { resources: ResourceSchema[], isSpooky: boolean }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className={isSpooky ? "text-gray-400" : "text-gray-600"}>Resource not found</div>
  return <ResourceList resource={resource} isSpooky={isSpooky} />
}

function ResourceDetailWrapper({ resources }: { resources: ResourceSchema[] }) {
  const { resourceName, id } = useParams()
  const navigate = useNavigate()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource || !id) return <div className="text-gray-600">Resource not found</div>
  return <ResourceDetail resource={resource} id={id} onEdit={() => navigate(\`/\${resourceName}/\${id}/edit\`)} />
}

function ResourceFormWrapper({
  resources,
  mode,
}: {
  resources: ResourceSchema[]
  mode: "create" | "edit"
}) {
  const { resourceName, id } = useParams()
  const navigate = useNavigate()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className="text-gray-600">Resource not found</div>
  return (
    <ResourceForm
      resource={resource}
      mode={mode}
      id={id}
      onSuccess={() => navigate(\`/\${resourceName}\`)}
      onCancel={() => navigate(mode === "edit" ? \`/\${resourceName}/\${id}\` : \`/\${resourceName}\`)}
    />
  )
}`;
};
export const mainTsxTemplate = () => {
    return `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`;
};
export const appCssTemplate = () => {
    return `/* App-specific styles */

@keyframes emerge {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-emerge {
  animation: emerge 0.4s ease-out;
}`;
};
