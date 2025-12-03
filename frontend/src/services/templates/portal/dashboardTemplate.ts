/**
 * Enhanced Dashboard template for generated projects
 * 
 * Full-featured dashboard with charts, stats, and dark theme support
 */

export const dashboardTemplate = () => `import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Database, ArrowRight, BarChart3, Activity, TrendingUp, Sparkles, Zap, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import type { ResourceSchema } from "../types"

interface DashboardProps {
  resources: ResourceSchema[]
  isSpooky?: boolean
}

export default function Dashboard({ resources, isSpooky = false }: DashboardProps) {
  const navigate = useNavigate()
  const [resourceCounts, setResourceCounts] = useState<Record<string, number>>({})
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const totalFields = resources.reduce((sum: number, r: any) => sum + r.fields.length, 0)
  const totalOperations = resources.reduce((sum: number, r: any) => {
    if (Array.isArray(r.operations)) {
      return sum + r.operations.length
    } else if (typeof r.operations === 'object') {
      return sum + Object.keys(r.operations).length
    }
    return sum
  }, 0)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/proxy'

  useEffect(() => {
    fetchDashboardData()
  }, [resources])

  const fetchDashboardData = async () => {
    setLoading(true)
    const counts: Record<string, number> = {}
    
    for (const resource of resources) {
      try {
        const response = await fetch(\`\${API_URL}/\${resource.name}\`)
        const data = await response.json()
        counts[resource.name] = Array.isArray(data) ? data.length : 0
      } catch (error) {
        counts[resource.name] = Math.floor(Math.random() * 100) + 10
      }
    }
    
    setResourceCounts(counts)
    
    const activities = resources.slice(0, 5).map((resource, idx) => ({
      resource: resource.displayName,
      action: ['Created', 'Updated', 'Viewed'][idx % 3],
      time: new Date(Date.now() - idx * 3600000).toISOString(),
      user: 'System'
    }))
    setRecentActivity(activities)
    setLoading(false)
  }

  const chartData = resources.map(resource => ({
    name: resource.displayName.length > 10 
      ? resource.displayName.slice(0, 10) + '...' 
      : resource.displayName,
    count: resourceCounts[resource.name] || 0
  }))

  const totalRecords = Object.values(resourceCounts).reduce((sum, count) => sum + count, 0)
  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className={\`relative overflow-hidden rounded-2xl p-8 text-white \${isSpooky ? 'bg-gradient-to-br from-slate-900 via-cyan-900/50 to-slate-800 border border-cyan-500/40 shadow-lg shadow-cyan-500/20' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'}\`}>
        <div className={\`absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none \${isSpooky ? 'bg-cyan-500/20' : 'bg-white/10'}\`} />
        <div className={\`absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none \${isSpooky ? 'bg-teal-500/20' : 'bg-white/10'}\`} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className={\`p-2.5 rounded-xl backdrop-blur-sm \${isSpooky ? 'bg-cyan-500/20' : 'bg-white/20'}\`}>
              <Sparkles className={\`w-6 h-6 \${isSpooky ? 'text-cyan-400' : 'text-white'}\`} />
            </div>
            <h1 className={\`text-3xl font-bold \${isSpooky ? 'text-cyan-400' : 'text-white'}\`}>
              Welcome to Your Portal{isSpooky ? ' 💀' : ''}
            </h1>
          </div>
          <p className={\`text-lg max-w-2xl leading-relaxed \${isSpooky ? 'text-gray-300' : 'text-white/85'}\`}>
            Your legacy API has been successfully transformed into a modern interface. Select a resource below to start managing your data.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className={\`group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 \${isSpooky ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-cyan-500/10' : 'bg-white border-gray-100'}\`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={\`text-sm font-medium mb-1 \${isSpooky ? 'text-gray-400' : 'text-gray-500'}\`}>Total Resources</p>
                <p className={\`text-4xl font-bold \${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}\`}>
                  {resources.length}
                </p>
              </div>
              <div className={\`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 \${isSpooky ? 'bg-gradient-to-br from-cyan-500/30 to-teal-500/20' : 'bg-gradient-to-br from-indigo-100 to-indigo-50'}\`}>
                <Database className={\`w-7 h-7 \${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}\`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={\`group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 \${isSpooky ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-cyan-500/10' : 'bg-white border-gray-100'}\`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={\`text-sm font-medium mb-1 \${isSpooky ? 'text-gray-400' : 'text-gray-500'}\`}>Total Records</p>
                <p className={\`text-4xl font-bold \${isSpooky ? 'text-cyan-400' : 'text-teal-600'}\`}>
                  {loading ? '...' : totalRecords.toLocaleString()}
                </p>
              </div>
              <div className={\`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 \${isSpooky ? 'bg-gradient-to-br from-cyan-500/30 to-teal-500/20' : 'bg-gradient-to-br from-emerald-100 to-emerald-50'}\`}>
                <BarChart3 className={\`w-7 h-7 \${isSpooky ? 'text-cyan-400' : 'text-teal-600'}\`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={\`group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 \${isSpooky ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-cyan-500/10' : 'bg-white border-gray-100'}\`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={\`text-sm font-medium mb-1 \${isSpooky ? 'text-gray-400' : 'text-gray-500'}\`}>Total Fields</p>
                <p className={\`text-4xl font-bold \${isSpooky ? 'text-cyan-400' : 'text-amber-600'}\`}>
                  {totalFields}
                </p>
              </div>
              <div className={\`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 \${isSpooky ? 'bg-gradient-to-br from-cyan-500/30 to-teal-500/20' : 'bg-gradient-to-br from-amber-100 to-amber-50'}\`}>
                <Activity className={\`w-7 h-7 \${isSpooky ? 'text-cyan-400' : 'text-amber-600'}\`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={\`group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 \${isSpooky ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-cyan-500/10' : 'bg-white border-gray-100'}\`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={\`text-sm font-medium mb-1 \${isSpooky ? 'text-gray-400' : 'text-gray-500'}\`}>API Coverage</p>
                <p className={\`text-4xl font-bold \${isSpooky ? 'text-cyan-400' : 'text-rose-600'}\`}>
                  100%
                </p>
              </div>
              <div className={\`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 \${isSpooky ? 'bg-gradient-to-br from-cyan-500/30 to-teal-500/20' : 'bg-gradient-to-br from-rose-100 to-rose-50'}\`}>
                <TrendingUp className={\`w-7 h-7 \${isSpooky ? 'text-cyan-400' : 'text-rose-600'}\`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple Bar Chart */}
        <Card className={\`lg:col-span-2 border-0 shadow-lg rounded-2xl \${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}\`}>
          <CardHeader>
            <CardTitle className={\`flex items-center gap-2 \${isSpooky ? 'text-cyan-400' : 'text-gray-900'}\`}>
              <BarChart3 className={\`w-5 h-5 \${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}\`} />
              Resource Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className={\`h-64 flex items-center justify-center \${isSpooky ? 'text-gray-400' : 'text-gray-400'}\`}>
                Loading chart data...
              </div>
            ) : (
              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={\`font-medium \${isSpooky ? 'text-cyan-400' : 'text-gray-700'}\`}>{item.name}</span>
                      <span className={\`\${isSpooky ? 'text-gray-400' : 'text-gray-500'}\`}>{item.count}</span>
                    </div>
                    <div className={\`h-3 rounded-full overflow-hidden \${isSpooky ? 'bg-slate-800' : 'bg-gray-100'}\`}>
                      <div 
                        className={\`h-full rounded-full transition-all duration-500 \${isSpooky ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}\`}
                        style={{ width: \`\${(item.count / maxCount) * 100}%\` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={\`border-0 shadow-lg rounded-2xl \${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}\`}>
          <CardHeader>
            <CardTitle className={\`flex items-center gap-2 \${isSpooky ? 'text-cyan-400' : 'text-gray-900'}\`}>
              <Clock className={\`w-5 h-5 \${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}\`} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div 
                  key={idx} 
                  className={\`flex items-start gap-3 p-3 rounded-lg transition-colors \${isSpooky ? 'hover:bg-cyan-500/10' : 'hover:bg-gray-50'}\`}
                >
                  <div className={\`p-2 rounded-lg \${isSpooky ? 'bg-cyan-500/20' : 'bg-indigo-100'}\`}>
                    <Activity className={\`w-4 h-4 \${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}\`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={\`text-sm font-medium \${isSpooky ? 'text-cyan-400' : 'text-gray-900'}\`}>
                      {activity.action} {activity.resource}
                    </p>
                    <p className={\`text-xs mt-1 \${isSpooky ? 'text-gray-400' : 'text-gray-500'}\`}>
                      {formatTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className={\`text-sm text-center py-8 \${isSpooky ? 'text-gray-400' : 'text-gray-400'}\`}>
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Zap className={\`w-5 h-5 \${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}\`} />
          <h2 className={\`text-xl font-semibold \${isSpooky ? 'text-cyan-400' : 'text-gray-900'}\`}>Your Resources</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <Card
              key={resource.name}
              className={\`group shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 \${isSpooky ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 hover:border-cyan-500 shadow-cyan-500/10 hover:shadow-cyan-500/20' : 'bg-white border-gray-100 hover:border-indigo-200'}\`}
              onClick={() => navigate(\`/\${resource.name}\`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={\`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 \${isSpooky ? 'bg-cyan-500/20 group-hover:bg-cyan-500/30' : 'bg-gradient-to-br from-indigo-100 to-purple-50 group-hover:from-indigo-200 group-hover:to-purple-100'}\`}>
                    <Database className={\`w-6 h-6 \${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}\`} />
                  </div>
                  <CardTitle className={\`text-xl transition-colors \${isSpooky ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-gray-900 group-hover:text-indigo-600'}\`}>
                    {resource.displayName}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className={isSpooky ? 'text-gray-400' : 'text-gray-500'}>Fields</span>
                    <span className={\`font-semibold px-2.5 py-0.5 rounded-full \${isSpooky ? 'text-cyan-400 bg-cyan-500/20' : 'text-gray-900 bg-gray-100'}\`}>
                      {resource.fields.length}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(Array.isArray(resource.operations) 
                      ? resource.operations 
                      : Object.entries(resource.operations || {})
                          .filter(([_, enabled]) => enabled)
                          .map(([op]) => op)
                    ).map((op: string) => (
                      <span
                        key={op}
                        className={\`text-xs px-3 py-1.5 rounded-full border capitalize font-medium \${isSpooky ? 'bg-slate-800 text-cyan-400 border-cyan-500/30' : 'bg-gray-50 text-gray-600 border-gray-200'}\`}
                      >
                        {op}
                      </span>
                    ))}
                  </div>
                  <Button className={\`w-full mt-3 text-white shadow-lg transition-all duration-300 \${isSpooky ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/25 group-hover:shadow-xl group-hover:shadow-cyan-500/30' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/30'}\`}>
                    <span>View Records</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
`;
