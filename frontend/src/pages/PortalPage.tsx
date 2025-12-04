"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import { Download, Loader2, CheckCircle2, AlertCircle, FolderDown } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import Dashboard from "@/components/Dashboard"
import ResourceList from "@/components/ResourceList"
import ResourceDetail from "@/components/ResourceDetail"
import ResourceForm from "@/components/ResourceForm"
import ResourceActivity from "@/components/ResourceActivity"
import ResourceSettings from "@/components/ResourceSettings"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { projectGenerator } from "@/services/ProjectGenerator"
import { DeployToVercelButton } from "@/components/DeployToVercelButton"
import { ThemeToggle } from "@/components/ThemeToggle"

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface ResourceSchema {
  name: string
  displayName: string
  endpoint: string
  primaryKey: string
  fields: { name: string; type: string; displayName: string }[]
  operations: string[]
}

export default function PortalPage() {
  const [resources, setResources] = useState<ResourceSchema[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [proxyConfig, setProxyConfig] = useState<any>(null)
  const [customization, setCustomization] = useState<any>(null)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [downloadModal, setDownloadModal] = useState<{
    open: boolean
    status: 'success' | 'error'
    message: string
    hasProxyConfig: boolean
  }>({ open: false, status: 'success', message: '', hasProxyConfig: false })
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem("app-schema")
    const storedCustomization = localStorage.getItem("portal-customization")
    
    if (stored) {
      const parsed = JSON.parse(stored)
      setResources(parsed.resources || [])
    } else {
      navigate("/")
    }

    // Load customization settings
    if (storedCustomization) {
      const parsedCustomization = JSON.parse(storedCustomization)
      setCustomization(parsedCustomization)
      // Set theme from customization (default to light if not set or if auto)
      const themeMode = parsedCustomization.theme?.mode
      setCurrentTheme(themeMode === 'dark' ? 'dark' : 'light')
    } else {
      // Default customization if none found
      const defaultCustomization = {
        dashboard: { statsCards: true, barChart: true, recentActivity: true },
        listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true },
        forms: { smartInputs: true },
        theme: { mode: 'light', accentColor: 'blue' }
      }
      setCustomization(defaultCustomization)
      setCurrentTheme('light')
    }

    // Fetch proxy configuration
    const fetchProxyConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/api/proxy/config`)
        if (response.ok) {
          const data = await response.json()
          setProxyConfig(data)
        }
      } catch (error) {
        console.warn("Could not fetch proxy config:", error)
      }
    }
    fetchProxyConfig()
  }, [navigate])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Get schemas from localStorage
      const stored = localStorage.getItem("app-schema")
      if (!stored) {
        alert("No schema found. Please analyze an API first.")
        return
      }

      const parsed = JSON.parse(stored)
      const schemas = parsed.resources || []

      if (schemas.length === 0) {
        alert("No resources found in schema.")
        return
      }

      // Get baseUrl from schema (extracted from OpenAPI spec) or use default
      const baseUrl = parsed.baseUrl || localStorage.getItem("api-base-url") || API_URL

      // Fetch proxy configuration from backend
      let proxyConfig = null
      try {
        const proxyConfigResponse = await fetch(`${API_URL}/api/proxy/config`)
        if (proxyConfigResponse.ok) {
          const data = await proxyConfigResponse.json()
          proxyConfig = data
          console.log("✓ Proxy configuration loaded from backend")
        } else if (proxyConfigResponse.status === 404) {
          console.warn("⚠ Proxy not configured - using defaults")
          // Show warning to user
          const useDefaults = confirm(
            "⚠️ Proxy server not configured.\n\n" +
            "The downloaded project will include a proxy server with default configuration.\n" +
            "You'll need to update proxy-server/config.json with your API details.\n\n" +
            "Continue with download?"
          )
          if (!useDefaults) {
            return
          }
        } else {
          console.warn("⚠ Failed to fetch proxy config - using defaults")
        }
      } catch (error) {
        console.warn("⚠ Could not connect to backend - using defaults", error)
        // Backend might not be running, continue with defaults
      }

      // Get customization settings
      const storedCustomization = localStorage.getItem("portal-customization")
      const customizationSettings = storedCustomization ? JSON.parse(storedCustomization) : null

      // Generate the project ZIP with proxy config and customization
      const blob = await projectGenerator.generate(schemas, baseUrl, proxyConfig, customizationSettings)

      // Create download link and trigger download
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `admin-portal-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show success modal
      setDownloadModal({
        open: true,
        status: 'success',
        message: proxyConfig 
          ? 'Your project has been downloaded with proxy configuration included.'
          : 'Your project has been downloaded. Please update proxy-server/config.json with your API details.',
        hasProxyConfig: !!proxyConfig
      })
    } catch (error) {
      console.error("Failed to generate project:", error)
      setDownloadModal({
        open: true,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        hasProxyConfig: false
      })
    } finally {
      setIsDownloading(false)
    }
  }

  if (resources.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    )
  }

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme)
    
    // Update customization in localStorage
    const updatedCustomization = {
      ...customization,
      theme: { ...customization?.theme, mode: theme }
    }
    setCustomization(updatedCustomization)
    localStorage.setItem("portal-customization", JSON.stringify(updatedCustomization))
  }

  // Determine if spooky theme is enabled
  const isSpookyTheme = currentTheme === 'dark'

  return (
    <div className={`min-h-screen ${isSpookyTheme ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <Sidebar resources={resources} open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} isSpooky={isSpookyTheme} />

      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header with Download Button */}
        <div className={`${isSpookyTheme ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-gray-200'} border-b px-8 py-4 sticky top-0 z-30 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-xl font-semibold ${isSpookyTheme ? 'text-cyan-400' : 'text-gray-900'}`}>
                Admin Portal{isSpookyTheme ? ' 💀' : ''}
              </h1>
              <p className={`text-sm ${isSpookyTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                {resources.length} resources loaded
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle currentTheme={currentTheme} onThemeChange={handleThemeChange} isSpooky={isSpookyTheme} />
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`shadow-lg text-white ${isSpookyTheme ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-violet-500/25' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Project
                  </>
                )}
              </Button>
              <DeployToVercelButton 
                resources={resources} 
                proxyConfig={proxyConfig}
                className={`shadow-lg text-white ${isSpookyTheme ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/25' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/25'}`}
                isSpooky={isSpookyTheme}
              />
            </div>
          </div>
        </div>

        <div className={`p-8 ${isSpookyTheme ? 'bg-slate-950' : ''}`}>
          <Routes>
            <Route index element={<Dashboard resources={resources} customization={customization} isSpooky={isSpookyTheme} />} />
            <Route path=":resourceName" element={<ResourceListWrapper resources={resources} isSpooky={isSpookyTheme} customization={customization} />} />
            <Route path=":resourceName/activity" element={<ResourceActivityWrapper resources={resources} isSpooky={isSpookyTheme} />} />
            <Route path=":resourceName/settings" element={<ResourceSettingsWrapper resources={resources} isSpooky={isSpookyTheme} />} />
            <Route path=":resourceName/new" element={<ResourceFormWrapper resources={resources} mode="create" isSpooky={isSpookyTheme} />} />
            <Route path=":resourceName/:id" element={<ResourceDetailWrapper resources={resources} isSpooky={isSpookyTheme} />} />
            <Route path=":resourceName/:id/edit" element={<ResourceFormWrapper resources={resources} mode="edit" isSpooky={isSpookyTheme} />} />
          </Routes>
        </div>
      </main>

      {/* Download Success/Error Modal */}
      <Dialog open={downloadModal.open} onOpenChange={(open) => setDownloadModal(prev => ({ ...prev, open }))}>
        <DialogContent className={`sm:max-w-md ${isSpookyTheme ? 'bg-slate-900 border-cyan-500/30' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isSpookyTheme ? 'text-cyan-400' : 'text-gray-900'}`}>
              {downloadModal.status === 'success' ? (
                <>
                  <CheckCircle2 className={`w-6 h-6 ${isSpookyTheme ? 'text-cyan-400' : 'text-green-600'}`} />
                  Download Complete
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  Download Failed
                </>
              )}
            </DialogTitle>
            <DialogDescription className={isSpookyTheme ? 'text-gray-400' : 'text-gray-600'}>
              {downloadModal.status === 'success' 
                ? 'Your admin portal project is ready!'
                : 'There was a problem generating your project.'}
            </DialogDescription>
          </DialogHeader>

          {downloadModal.status === 'success' ? (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-center">
                <div className={`p-4 rounded-full ${isSpookyTheme ? 'bg-cyan-500/20' : 'bg-green-100'}`}>
                  <FolderDown className={`w-12 h-12 ${isSpookyTheme ? 'text-cyan-400' : 'text-green-600'}`} />
                </div>
              </div>
              
              <div className={`rounded-lg p-4 ${isSpookyTheme ? 'bg-slate-800 border border-cyan-500/20' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isSpookyTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  {downloadModal.message}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${isSpookyTheme ? 'bg-violet-900/20 border border-violet-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm font-medium mb-2 ${isSpookyTheme ? 'text-violet-400' : 'text-blue-900'}`}>
                  Next Steps:
                </p>
                <ol className={`text-sm space-y-1 ml-4 list-decimal ${isSpookyTheme ? 'text-violet-300' : 'text-blue-800'}`}>
                  <li>Extract the ZIP file</li>
                  <li>Run <code className={`px-1 rounded ${isSpookyTheme ? 'bg-slate-700' : 'bg-blue-100'}`}>./start.sh</code> (Mac/Linux) or <code className={`px-1 rounded ${isSpookyTheme ? 'bg-slate-700' : 'bg-blue-100'}`}>start.bat</code> (Windows)</li>
                  <li>Open <code className={`px-1 rounded ${isSpookyTheme ? 'bg-slate-700' : 'bg-blue-100'}`}>http://localhost:5173</code> in your browser</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{downloadModal.message}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setDownloadModal(prev => ({ ...prev, open: false }))}
              className={`${isSpookyTheme ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Wrapper components to extract params
function ResourceListWrapper({ resources, isSpooky, customization }: { resources: ResourceSchema[], isSpooky: boolean, customization: any }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className={isSpooky ? "text-gray-400" : "text-gray-600"}>Resource not found</div>
  return <ResourceList resource={resource} isSpooky={isSpooky} customization={customization} />
}

function ResourceActivityWrapper({ resources, isSpooky }: { resources: ResourceSchema[], isSpooky: boolean }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className={isSpooky ? "text-gray-400" : "text-gray-600"}>Resource not found</div>
  return <ResourceActivity resource={resource} isSpooky={isSpooky} />
}

function ResourceSettingsWrapper({ resources, isSpooky }: { resources: ResourceSchema[], isSpooky: boolean }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className={isSpooky ? "text-gray-400" : "text-gray-600"}>Resource not found</div>
  return <ResourceSettings resource={resource} isSpooky={isSpooky} />
}

function ResourceDetailWrapper({ resources, isSpooky }: { resources: ResourceSchema[], isSpooky: boolean }) {
  const { resourceName, id } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource || !id) return <div className={isSpooky ? "text-gray-400" : "text-gray-600"}>Resource not found</div>
  return <ResourceDetail resource={resource} id={id} isSpooky={isSpooky} />
}

function ResourceFormWrapper({
  resources,
  mode,
  isSpooky,
}: {
  resources: ResourceSchema[]
  mode: "create" | "edit"
  isSpooky: boolean
}) {
  const { resourceName, id } = useParams()
  const navigate = useNavigate()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className={isSpooky ? "text-gray-400" : "text-gray-600"}>Resource not found</div>
  return (
    <ResourceForm
      resource={resource}
      mode={mode}
      id={id}
      onSuccess={() => navigate(`/portal/${resourceName}`)}
      onCancel={() => navigate(mode === "edit" ? `/portal/${resourceName}/${id}` : `/portal/${resourceName}`)}
      isSpooky={isSpooky}
    />
  )
}
