"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import Dashboard from "@/components/Dashboard"
import ResourceList from "@/components/ResourceList"
import ResourceDetail from "@/components/ResourceDetail"
import ResourceForm from "@/components/ResourceForm"
import ResourceActivity from "@/components/ResourceActivity"
import ResourceSettings from "@/components/ResourceSettings"

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
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem("app-schema")
    if (stored) {
      const parsed = JSON.parse(stored)
      setResources(parsed.resources || [])
    } else {
      navigate("/")
    }
  }, [navigate])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar resources={resources} open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <div className="p-8">
          <Routes>
            <Route index element={<Dashboard resources={resources} />} />
            <Route path=":resourceName" element={<ResourceListWrapper resources={resources} />} />
            <Route path=":resourceName/activity" element={<ResourceActivityWrapper resources={resources} />} />
            <Route path=":resourceName/settings" element={<ResourceSettingsWrapper resources={resources} />} />
            <Route path=":resourceName/new" element={<ResourceFormWrapper resources={resources} mode="create" />} />
            <Route path=":resourceName/:id" element={<ResourceDetailWrapper resources={resources} />} />
            <Route path=":resourceName/:id/edit" element={<ResourceFormWrapper resources={resources} mode="edit" />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

// Wrapper components to extract params
function ResourceListWrapper({ resources }: { resources: ResourceSchema[] }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className="text-gray-600">Resource not found</div>
  return <ResourceList resource={resource} />
}

function ResourceActivityWrapper({ resources }: { resources: ResourceSchema[] }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className="text-gray-600">Resource not found</div>
  return <ResourceActivity resource={resource} />
}

function ResourceSettingsWrapper({ resources }: { resources: ResourceSchema[] }) {
  const { resourceName } = useParams()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource) return <div className="text-gray-600">Resource not found</div>
  return <ResourceSettings resource={resource} />
}

function ResourceDetailWrapper({ resources }: { resources: ResourceSchema[] }) {
  const { resourceName, id } = useParams()
  const navigate = useNavigate()
  const resource = resources.find((r) => r.name === resourceName)
  if (!resource || !id) return <div className="text-gray-600">Resource not found</div>
  return <ResourceDetail resource={resource} id={id} onEdit={() => navigate(`/portal/${resourceName}/${id}/edit`)} />
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
      onSuccess={() => navigate(`/portal/${resourceName}`)}
      onCancel={() => navigate(mode === "edit" ? `/portal/${resourceName}/${id}` : `/portal/${resourceName}`)}
    />
  )
}
