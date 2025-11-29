"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Database, Home, LayoutDashboard, LogOut, ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  resources: any[]
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ resources, open, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const currentResource = location.pathname.split("/")[2]

  if (!open) {
    return (
      <aside className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-40 shadow-sm">
        {/* Toggle button at top */}
        <button
          onClick={onToggle}
          className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          title="Expand sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Icon-only navigation */}
        <nav className="flex-1 flex flex-col items-center gap-2 mt-6">
          <button
            onClick={() => navigate("/portal")}
            className={cn(
              "p-3 rounded-xl transition",
              !currentResource ? "bg-indigo-50 text-indigo-700" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600",
            )}
            title="Dashboard"
          >
            <Home className="w-5 h-5" />
          </button>

          <div className="w-8 h-px bg-gray-200 my-2" />

          {resources.map((resource) => (
            <button
              key={resource.name}
              onClick={() => navigate(`/portal/${resource.name}`)}
              className={cn(
                "p-3 rounded-xl transition",
                currentResource === resource.name
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600",
              )}
              title={resource.displayName}
            >
              <Database className="w-5 h-5" />
            </button>
          ))}
        </nav>

        {/* Footer icon */}
        <button
          onClick={() => navigate("/")}
          className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
          title="Back to Analyzer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40 shadow-sm">
      {/* Header - with flex justify-between for proper button placement */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900">Legacy Portal</span>
              <p className="text-xs text-gray-500">API Management</p>
            </div>
          </div>
          {/* Close button - properly aligned to the right */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard Link */}
        <button
          onClick={() => navigate("/portal")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left",
            !currentResource ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50",
          )}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <div className="pt-6 pb-2 px-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resources</span>
        </div>

        {/* Resource Links */}
        {resources.map((resource) => (
          <button
            key={resource.name}
            onClick={() => navigate(`/portal/${resource.name}`)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left",
              currentResource === resource.name
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <Database className="w-5 h-5" />
            <div className="flex-1">
              <div>{resource.displayName}</div>
              <div className="text-xs text-gray-400">{resource.fields.length} fields</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 mb-3">
          {resources.length} resource{resources.length !== 1 ? "s" : ""} loaded
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="w-full justify-start text-gray-600 hover:text-gray-900 border-gray-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Back to Analyzer
        </Button>
      </div>
    </aside>
  )
}
