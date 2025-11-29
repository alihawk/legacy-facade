"use client"

import { useNavigate } from "react-router-dom"
import { Database, ArrowRight, BarChart3, Activity, TrendingUp, Sparkles, Zap } from "lucide-react"
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
    <div className="space-y-8 animate-emerge">
      <div className="relative overflow-hidden rounded-2xl p-8 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Decorative elements - purely visual, no interaction */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to Your Portal</h1>
          </div>
          <p className="text-white/85 text-lg max-w-2xl leading-relaxed">
            Your legacy API has been successfully resurrected into a modern, intuitive interface. Select a resource
            below to start managing your data.
          </p>
        </div>
      </div>

      {/* Stats Grid - Clean hover effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="group bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Resources</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                  {resources.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Database className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Fields</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                  {totalFields}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Operations</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                  {totalOperations}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">API Coverage</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
                  100%
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Your Resources</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource, index) => (
            <Card
              key={resource.name}
              className="group bg-white border border-gray-100 shadow-md hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
              onClick={() => navigate(`/portal/${resource.name}`)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-xl group-hover:from-indigo-200 group-hover:to-purple-100 transition-all duration-300 group-hover:scale-110">
                    <Database className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {resource.displayName}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fields</span>
                    <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {resource.fields.length}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {resource.operations.map((op: string) => (
                      <span
                        key={op}
                        className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full border border-gray-200 capitalize font-medium"
                      >
                        {op}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/30 transition-all duration-300">
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
