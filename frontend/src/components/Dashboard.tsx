"use client"

import { useNavigate } from "react-router-dom"
import { Database, ArrowRight, BarChart3, Activity, TrendingUp } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DashboardProps {
  resources: any[]
}

export default function Dashboard({ resources }: DashboardProps) {
  const navigate = useNavigate()

  const totalFields = resources.reduce((sum: number, r: any) => sum + r.fields.length, 0)
  const totalOperations = resources.reduce((sum: number, r: any) => sum + r.operations.length, 0)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Portal</h1>
        <p className="text-indigo-100 text-lg">
          Your legacy API has been transformed into a modern, intuitive interface. Select a resource to get started.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Resources</p>
                <p className="text-3xl font-bold text-gray-900">{resources.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Fields</p>
                <p className="text-3xl font-bold text-gray-900">{totalFields}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Operations</p>
                <p className="text-3xl font-bold text-gray-900">{totalOperations}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">API Coverage</p>
                <p className="text-3xl font-bold text-gray-900">100%</p>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <Card
              key={resource.name}
              className="bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
              onClick={() => navigate(`/portal/${resource.name}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Database className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{resource.displayName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fields</span>
                    <span className="font-medium text-gray-900">{resource.fields.length}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {resource.operations.map((op: string) => (
                      <span key={op} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md capitalize">
                        {op}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white group-hover:shadow-md transition-all">
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
}
