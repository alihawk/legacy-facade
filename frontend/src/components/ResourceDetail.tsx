"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "./LoadingState"
import { ArrowLeft, Edit, Trash2, Mail, Calendar, Hash, Type, ToggleLeft } from "lucide-react"

interface ResourceDetailProps {
  resource: any
  id: string
  onEdit: () => void
}

export default function ResourceDetail({ resource, id, onEdit }: ResourceDetailProps) {
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

  const formatValue = (value: any, field: any) => {
    if (value === null || value === undefined) return "-"
    switch (field.type) {
      case "date":
        return new Date(value).toLocaleString()
      case "boolean":
        return value ? "Yes" : "No"
      case "number":
        return Number(value).toLocaleString()
      case "email":
        return value
      default:
        return String(value)
    }
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
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
        onClick={() => navigate(`/portal/${resource.name}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {resource.displayName}
      </Button>

      {/* Main Card */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900">{resource.displayName.slice(0, -1)} Details</CardTitle>
              <p className="text-gray-500 mt-1">
                ID: <span className="font-mono text-indigo-600 font-medium">#{primaryKeyValue}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
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
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resource.fields.map((field: any) => {
              const value = record[field.name]
              return (
                <div key={field.name} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    {getFieldIcon(field.type)}
                    <span className="uppercase tracking-wide font-medium">{field.displayName}</span>
                  </div>
                  {field.type === "boolean" ? (
                    <Badge
                      className={
                        value
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-200"
                      }
                    >
                      {formatValue(value, field)}
                    </Badge>
                  ) : field.type === "email" && value ? (
                    <a href={`mailto:${value}`} className="text-indigo-600 hover:underline font-medium">
                      {value}
                    </a>
                  ) : (
                    <div className="text-gray-900 font-medium">{formatValue(value, field)}</div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
