/**
 * Portal component templates (Sidebar)
 * With full dark theme support
 */
export const sidebarTemplate = () => {
    return `import { useNavigate, useLocation } from "react-router-dom"
import { Database, Home, LayoutDashboard, ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResourceSchema } from "@/types"

interface SidebarProps {
  resources: ResourceSchema[]
  open: boolean
  onToggle: () => void
  isSpooky?: boolean
}

export default function Sidebar({ resources, open, onToggle, isSpooky = false }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentResource = location.pathname.split("/")[1]

  if (!open) {
    return (
      <aside className={\`fixed left-0 top-0 h-full w-16 flex flex-col items-center py-4 z-40 shadow-sm \${isSpooky ? 'bg-slate-900 border-r border-cyan-500/30' : 'bg-white border-r border-gray-200'}\`}>
        <button
          onClick={onToggle}
          className={\`p-3 rounded-xl text-white transition-all shadow-md hover:shadow-lg \${isSpooky ? 'bg-gradient-to-br from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}\`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <nav className="flex-1 flex flex-col items-center gap-2 mt-6">
          <button
            onClick={() => navigate("/")}
            className={cn(
              "p-3 rounded-xl transition",
              !currentResource 
                ? isSpooky ? "bg-cyan-500/20 text-cyan-400" : "bg-indigo-50 text-indigo-700"
                : isSpooky ? "text-gray-400 hover:bg-cyan-500/10" : "text-gray-400 hover:bg-gray-50"
            )}
          >
            <Home className="w-5 h-5" />
          </button>
          <div className={\`w-8 h-px my-2 \${isSpooky ? 'bg-cyan-500/30' : 'bg-gray-200'}\`} />
          {resources.map((resource) => (
            <button
              key={resource.name}
              onClick={() => navigate(\`/\${resource.name}\`)}
              className={cn(
                "p-3 rounded-xl transition",
                currentResource === resource.name 
                  ? isSpooky ? "bg-cyan-500/20 text-cyan-400" : "bg-indigo-50 text-indigo-700"
                  : isSpooky ? "text-gray-400 hover:bg-cyan-500/10" : "text-gray-400 hover:bg-gray-50"
              )}
            >
              <Database className="w-5 h-5" />
            </button>
          ))}
        </nav>
      </aside>
    )
  }

  return (
    <aside className={\`fixed left-0 top-0 h-full w-64 flex flex-col z-40 shadow-sm \${isSpooky ? 'bg-slate-900 border-r border-cyan-500/30' : 'bg-white border-r border-gray-200'}\`}>
      <div className={\`p-4 \${isSpooky ? 'border-b border-cyan-500/30' : 'border-b border-gray-100'}\`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={\`p-2 rounded-xl \${isSpooky ? 'bg-gradient-to-br from-cyan-600 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}\`}>
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={\`font-bold \${isSpooky ? 'text-cyan-400' : 'text-gray-900'}\`}>
                {isSpooky ? '💀 ' : ''}Admin Portal
              </span>
              <p className={\`text-xs \${isSpooky ? 'text-gray-400' : 'text-gray-500'}\`}>API Management</p>
            </div>
          </div>
          <button onClick={onToggle} className={\`p-2 rounded-lg \${isSpooky ? 'hover:bg-cyan-500/10 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}\`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button
          onClick={() => navigate("/")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left",
            !currentResource 
              ? isSpooky ? "bg-cyan-500/20 text-cyan-400 font-medium" : "bg-indigo-50 text-indigo-700 font-medium"
              : isSpooky ? "text-gray-400 hover:bg-cyan-500/10" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <div className="pt-6 pb-2 px-2">
          <span className={\`text-xs font-semibold uppercase tracking-wider \${isSpooky ? 'text-cyan-500/70' : 'text-gray-400'}\`}>Resources</span>
        </div>
        {resources.map((resource) => (
          <button
            key={resource.name}
            onClick={() => navigate(\`/\${resource.name}\`)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left",
              currentResource === resource.name 
                ? isSpooky ? "bg-cyan-500/20 text-cyan-400 font-medium" : "bg-indigo-50 text-indigo-700 font-medium"
                : isSpooky ? "text-gray-400 hover:bg-cyan-500/10" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Database className="w-5 h-5" />
            <div className="flex-1">
              <div>{resource.displayName}</div>
              <div className={\`text-xs \${isSpooky ? 'text-gray-500' : 'text-gray-400'}\`}>{resource.fields.length} fields</div>
            </div>
          </button>
        ))}
      </nav>
      <div className={\`p-4 \${isSpooky ? 'border-t border-cyan-500/30' : 'border-t border-gray-100'}\`}>
        <div className={\`text-xs mb-3 \${isSpooky ? 'text-gray-500' : 'text-gray-400'}\`}>
          {resources.length} resource{resources.length !== 1 ? "s" : ""} loaded
        </div>
      </div>
    </aside>
  )
}`;
};
