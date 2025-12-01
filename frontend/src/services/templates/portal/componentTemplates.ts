/**
 * Portal component templates (Sidebar, Dashboard, ResourceList, etc.)
 * These are simplified versions for the generated project
 */

export const sidebarTemplate = (): string => {
  return `import { useNavigate, useLocation } from "react-router-dom"
import { Database, Home, LayoutDashboard, LogOut, ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ResourceSchema } from "@/types"

interface SidebarProps {
  resources: ResourceSchema[]
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ resources, open, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentResource = location.pathname.split("/")[1]

  if (!open) {
    return (
      <aside className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-40 shadow-sm">
        <button
          onClick={onToggle}
          className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <nav className="flex-1 flex flex-col items-center gap-2 mt-6">
          <button
            onClick={() => navigate("/")}
            className={cn(
              "p-3 rounded-xl transition",
              !currentResource ? "bg-indigo-50 text-indigo-700" : "text-gray-400 hover:bg-gray-50"
            )}
          >
            <Home className="w-5 h-5" />
          </button>
          <div className="w-8 h-px bg-gray-200 my-2" />
          {resources.map((resource) => (
            <button
              key={resource.name}
              onClick={() => navigate(\`/\${resource.name}\`)}
              className={cn(
                "p-3 rounded-xl transition",
                currentResource === resource.name ? "bg-indigo-50 text-indigo-700" : "text-gray-400 hover:bg-gray-50"
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40 shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900">Admin Portal</span>
              <p className="text-xs text-gray-500">API Management</p>
            </div>
          </div>
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button
          onClick={() => navigate("/")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left",
            !currentResource ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <div className="pt-6 pb-2 px-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resources</span>
        </div>
        {resources.map((resource) => (
          <button
            key={resource.name}
            onClick={() => navigate(\`/\${resource.name}\`)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left",
              currentResource === resource.name ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
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
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 mb-3">
          {resources.length} resource{resources.length !== 1 ? "s" : ""} loaded
        </div>
      </div>
    </aside>
  )
}`
}

export const dashboardTemplate = (): string => {
  return `import { useNavigate } from "react-router-dom"
import { Database, ArrowRight, BarChart3, Activity, TrendingUp, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ResourceSchema } from "@/types"

interface DashboardProps {
  resources: ResourceSchema[]
}

export default function Dashboard({ resources }: DashboardProps) {
  const navigate = useNavigate()
  const totalFields = resources.reduce((sum, r) => sum + r.fields.length, 0)
  const totalOperations = resources.reduce((sum, r) => sum + r.operations.length, 0)

  return (
    <div className="space-y-8 animate-emerge">
      <div className="relative overflow-hidden rounded-2xl p-8 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to Your Portal</h1>
          </div>
          <p className="text-white/85 text-lg max-w-2xl">
            Your API has been successfully transformed into a modern interface. Select a resource below to start managing your data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-gray-100 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Resources</p>
                <p className="text-4xl font-bold text-indigo-600">{resources.length}</p>
              </div>
              <div className="p-4 bg-indigo-100 rounded-2xl">
                <Database className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Fields</p>
                <p className="text-4xl font-bold text-emerald-600">{totalFields}</p>
              </div>
              <div className="p-4 bg-emerald-100 rounded-2xl">
                <BarChart3 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Operations</p>
                <p className="text-4xl font-bold text-amber-600">{totalOperations}</p>
              </div>
              <div className="p-4 bg-amber-100 rounded-2xl">
                <Activity className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">API Coverage</p>
                <p className="text-4xl font-bold text-rose-600">100%</p>
              </div>
              <div className="p-4 bg-rose-100 rounded-2xl">
                <TrendingUp className="w-7 h-7 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Your Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <Card
              key={resource.name}
              className="bg-white border border-gray-100 shadow-md hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer"
              onClick={() => navigate(\`/\${resource.name}\`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Database className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{resource.displayName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fields</span>
                    <span className="font-semibold text-gray-900">{resource.fields.length}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {resource.operations.map((op) => (
                      <span key={op} className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full capitalize">
                        {op}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    View Records
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}`
}
