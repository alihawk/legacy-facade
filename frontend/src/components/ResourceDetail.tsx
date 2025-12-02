"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "./LoadingState"
import { ArrowLeft, Edit, Trash2, Mail, Calendar, Hash, Type, ToggleLeft, Sparkles } from "lucide-react"
import { FieldRenderer } from "./FieldRenderer"

interface ResourceDetailProps {
  resource: any
  id: string
  onEdit?: () => void
  isSpooky?: boolean
}

export default function ResourceDetail({ resource, id, onEdit, isSpooky = false }: ResourceDetailProps) {
  const [record, setRecord] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchDetail()
  }, [resource, id])

  const fetchDetail = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axios.get(`http://localhost:8000/proxy/${resource.name}/${id}`)
      setRecord(response.data)
    } catch (err) {
      console.error("Failed to fetch detail, using mock detail.", err)
      setError("Backend not reachable. Showing mock record.")
      setRecord(generateMockRecord(Number.parseInt(id, 10) || 1))
    } finally {
      setLoading(false)
    }
  }

  const generateMockRecord = (num: number) => {
    const mock: any = {}
    mock[resource.primaryKey] = num
    resource.fields.forEach((field: any, idx: number) => {
      if (field.name === resource.primaryKey) return
      switch (field.type) {
        case "string":
          mock[field.name] = `Sample ${field.displayName} ${num}`
          break
        case "email":
          mock[field.name] = `user${num}@example.com`
          break
        case "number":
          mock[field.name] = 1000 + num * 7
          break
        case "boolean":
          mock[field.name] = num % 2 === 0
          break
        case "date":
          mock[field.name] = new Date(2024, 0, idx + 1).toISOString()
          break
        default:
          mock[field.name] = `Value ${num}`
      }
    })
    return mock
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "date":
        return <Calendar className="w-4 h-4" />
      case "number":
        return <Hash className="w-4 h-4" />
      case "boolean":
        return <ToggleLeft className="w-4 h-4" />
      default:
        return <Type className="w-4 h-4" />
    }
  }

  if (loading || !record) {
    return <LoadingSpinner message={`Loading ${resource.displayName} #${id}`} />
  }

  const primaryKeyValue = record[resource.primaryKey]

  return (
    <div className="space-y-6 animate-emerge">
      {/* Back Button */}
      <Button
        variant="outline"
        className={`rounded-xl shadow-sm ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
        onClick={() => navigate(`/portal/${resource.name}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {resource.displayName}
      </Button>

      {/* Main Card - Enhanced */}
      <Card className={`border-0 shadow-xl rounded-2xl overflow-hidden ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`}>
        <CardHeader className={`border-b ${isSpooky ? 'border-cyan-500/20 bg-slate-800' : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isSpooky ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-50'}`}>
                <Sparkles className={`w-6 h-6 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`} />
              </div>
              <div>
                <CardTitle className={`text-2xl ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'}`}>
                  {isSpooky ? '💀 ' : ''}{resource.displayName.slice(0, -1)} Details
                </CardTitle>
                <p className={`mt-1 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`}>
                  ID:{" "}
                  <span className={`font-mono font-semibold ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
                    #{primaryKeyValue}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {onEdit && (
                <Button
                  variant="outline"
                  className={`rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                  onClick={onEdit}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                className={`rounded-xl ${isSpooky ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 bg-slate-800' : 'border-red-200 text-red-600 hover:bg-red-50 bg-white'}`}
                onClick={() => window.alert("Delete is not wired yet. This is a demo action.")}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className={`p-4 rounded-xl border text-sm mb-6 ${isSpooky ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {resource.fields.map((field: any, index: number) => {
              const value = record[field.name]
              return (
                <div
                  key={field.name}
                  className={`group p-5 rounded-xl border transition-all duration-300 ${isSpooky ? 'bg-slate-800 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10' : 'bg-gradient-to-br from-gray-50 to-white border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50'}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`flex items-center gap-2 text-sm mb-3 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className={`p-1.5 rounded-lg transition-colors ${isSpooky ? 'bg-slate-700 group-hover:bg-cyan-500/20' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>
                      {getFieldIcon(field.type)}
                    </div>
                    <span className="uppercase tracking-wider font-semibold text-xs">{field.displayName}</span>
                  </div>
                  <div className={`font-medium text-lg ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>
                    <FieldRenderer
                      value={value}
                      type={field.type}
                      mode="detail"
                      isSpooky={isSpooky}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
