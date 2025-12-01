/**
 * Main application templates (App.tsx, main.tsx, App.css)
 */

export const appTsxTemplate = (schemas: any[]): string => {
  const routes = schemas.map(schema => `
            <Route path="${schema.name}" element={<ResourceListWrapper resources={resources} />} />
            <Route path="${schema.name}/new" element={<ResourceFormWrapper resources={resources} mode="create" />} />
            <Route path="${schema.name}/:id" element={<ResourceDetailWrapper resources={resources} />} />
            <Route path="${schema.name}/:id/edit" element={<ResourceFormWrapper resources={resources} mode="edit" />} />`
  ).join('')

  return `import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import ResourceList from "./components/ResourceList"
import ResourceDetail from "./components/ResourceDetail"
import ResourceForm from "./components/ResourceForm"
import { resources as configResources } from "./config/resources"
import type { ResourceSchema } from "./types"

export default function App() {
  const [resources] = useState<ResourceSchema[]>(configResources)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Sidebar resources={resources} open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className={\`transition-all duration-300 \${sidebarOpen ? "ml-64" : "ml-16"}\`}>
          <div className="p-8">
            <Routes>
              <Route index element={<Dashboard resources={resources} />} />${routes}
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

// Wrapper components to extract params
function ResourceListWrapper({ resources }: { resources: ResourceSchema[] }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className="text-gray-600">Resource not found</div>
  return <ResourceList resource={resource} />
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
}`
}

export const mainTsxTemplate = (): string => {
  return `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`
}

export const appCssTemplate = (): string => {
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
}`
}
