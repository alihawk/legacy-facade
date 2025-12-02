"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Database, Home, LayoutDashboard, LogOut, ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  resources: any[]
  open: boolean
  onToggle: () => void
  isSpooky?: boolean
}

export default function Sidebar({ resources, open, onToggle, isSpooky = false }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const currentResource = location.pathname.split("/")[2]

  if (!open) {
    return (
      <aside className={`fixed left-0 top-0 h-full w-16 ${isSpooky ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-gray-200'} border-r flex flex-col items-center py-4 z-40 shadow-sm`}>
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
          className={`p-3 rounded-xl transition ${isSpooky ? 'text-cyan-400 hover:bg-slate-800 hover:text-cyan-300' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
          title="Back to Analyzer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>
    )
  }

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 ${isSpooky ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-gray-200'} border-r flex flex-col z-40 shadow-sm`}>
      {/* Header - with flex justify-between for proper button placement */}
      <div className={`p-4 ${isSpooky ? 'border-cyan-500/20' : 'border-gray-100'} border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isSpooky ? 'bg-gradient-to-br from-cyan-600 to-teal-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`font-bold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>
                {isSpooky ? '💀 ' : ''}Legacy Portal
              </span>
              <p className={`text-xs ${isSpooky ? 'text-gray-500' : 'text-gray-500'}`}>API Management</p>
            </div>
          </div>
          {/* Close button - properly aligned to the right */}
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition ${isSpooky ? 'hover:bg-slate-800 text-gray-400 hover:text-cyan-400' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
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
            !currentResource 
              ? isSpooky ? "bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30" : "bg-indigo-50 text-indigo-700 font-medium"
              : isSpooky ? "text-gray-400 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-50",
          )}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <div className="pt-6 pb-2 px-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isSpooky ? 'text-gray-500' : 'text-gray-400'}`}>Resources</span>
        </div>

        {/* Resource Links */}
        {resources.map((resource) => (
          <button
            key={resource.name}
            onClick={() => navigate(`/portal/${resource.name}`)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left",
              currentResource === resource.name
                ? isSpooky ? "bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30" : "bg-indigo-50 text-indigo-700 font-medium"
                : isSpooky ? "text-gray-400 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <Database className="w-5 h-5" />
            <div className="flex-1">
              <div>{resource.displayName}</div>
              <div className={`text-xs ${isSpooky ? 'text-gray-500' : 'text-gray-400'}`}>{resource.fields.length} fields</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-4 ${isSpooky ? 'border-cyan-500/20' : 'border-gray-100'} border-t`}>
        <div className={`text-xs mb-3 ${isSpooky ? 'text-gray-500' : 'text-gray-400'}`}>
          {resources.length} resource{resources.length !== 1 ? "s" : ""} loaded
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className={`w-full justify-start rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300' : 'text-gray-600 hover:text-gray-900 border-gray-200 hover:bg-gray-50'}`}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Back to Analyzer
        </Button>
      </div>
    </aside>
  )
}
