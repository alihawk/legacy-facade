"use client"

import { useEffect, useState, type FormEvent } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Sparkles } from "lucide-react"

interface ResourceFormProps {
  resource: any
  mode: "create" | "edit"
  id?: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ResourceForm({ resource, mode, id, onSuccess, onCancel }: ResourceFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (mode === "edit" && id) {
      fetchExisting()
    } else {
      const initial: Record<string, any> = {}
      resource.fields.forEach((field: any) => {
        if (field.name === resource.primaryKey) return
        initial[field.name] = field.type === "boolean" ? false : field.type === "number" ? 0 : ""
      })
      setFormData(initial)
    }
  }, [mode, id, resource])

  const fetchExisting = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const response = await axios.get(`http://localhost:8000/proxy/${resource.name}/${id}`)
      setFormData(response.data)
    } catch (err) {
      console.error("Failed to fetch record for edit, using mock data.", err)
      setLoadError("Backend not reachable. Using mock values for editing.")
      const mock: Record<string, any> = {}
      resource.fields.forEach((field: any, idx: number) => {
        if (field.name === resource.primaryKey) {
          mock[field.name] = id
          return
        }
        switch (field.type) {
          case "string":
            mock[field.name] = `Sample ${field.displayName} ${id}`
            break
          case "email":
            mock[field.name] = `user${id}@example.com`
            break
          case "number":
            mock[field.name] = 1000 + Number(id || 1) * 7 + idx
            break
          case "boolean":
            mock[field.name] = Number(id || 1) % 2 === 0
            break
          case "date":
            mock[field.name] = new Date(2024, 0, idx + 1).toISOString().substring(0, 10)
            break
          default:
            mock[field.name] = `Value ${id}`
        }
      })
      setFormData(mock)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError("")
    setLoading(true)
    try {
      if (mode === "create") {
        await axios.post(`http://localhost:8000/proxy/${resource.name}`, formData)
      } else if (mode === "edit" && id) {
        await axios.put(`http://localhost:8000/proxy/${resource.name}/${id}`, formData)
      }
      onSuccess()
    } catch (err) {
      console.error("Save failed, simulating success in demo.", err)
      setSaveError("Backend not reachable. Simulating successful save for demo.")
      setTimeout(() => {
        onSuccess()
      }, 600)
    } finally {
      setLoading(false)
    }
  }

  const titlePrefix = mode === "create" ? "Create New" : "Edit"

  return (
    <div className="space-y-6 animate-emerge">
      {/* Back Button */}
      <Button
        variant="outline"
        className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-white rounded-xl shadow-sm"
        onClick={() =>
          mode === "create" ? navigate(`/portal/${resource.name}`) : navigate(`/portal/${resource.name}/${id}`)
        }
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="bg-white border-0 shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-xl">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {titlePrefix} {resource.displayName.slice(0, -1)}
              </CardTitle>
              {loadError && <p className="text-sm text-amber-600 mt-2">{loadError}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {resource.fields.map((field: any, index: number) => {
                const isPrimary = field.name === resource.primaryKey
                const value = formData[field.name] ?? ""

                if (mode === "create" && isPrimary) {
                  return null
                }

                const label = field.displayName

                if (field.type === "boolean") {
                  return (
                    <div key={field.name} className="space-y-2" style={{ animationDelay: `${index * 0.05}s` }}>
                      <label className="text-sm font-semibold text-gray-700">{label}</label>
                      <Select
                        value={value ? "true" : "false"}
                        onValueChange={(v) => handleChange(field.name, v === "true")}
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl h-12 focus:ring-2 focus:ring-indigo-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }

                if (field.type === "text") {
                  return (
                    <div
                      key={field.name}
                      className="space-y-2 md:col-span-2"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <label className="text-sm font-semibold text-gray-700">{label}</label>
                      <Textarea
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                      />
                    </div>
                  )
                }

                const inputType =
                  field.type === "number"
                    ? "number"
                    : field.type === "email"
                      ? "email"
                      : field.type === "date"
                        ? "date"
                        : "text"

                return (
                  <div key={field.name} className="space-y-2" style={{ animationDelay: `${index * 0.05}s` }}>
                    <label className="text-sm font-semibold text-gray-700">{label}</label>
                    <Input
                      type={inputType}
                      value={value}
                      onChange={(e) =>
                        handleChange(field.name, inputType === "number" ? Number(e.target.value) : e.target.value)
                      }
                      disabled={isPrimary && mode === "edit"}
                      className="bg-gray-50 border-gray-200 rounded-xl h-12 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100"
                    />
                  </div>
                )
              })}
            </div>

            {saveError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-white rounded-xl px-6"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 rounded-xl px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
