"use client"

import { useEffect, useState, type FormEvent } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"

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
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
        onClick={() =>
          mode === "create" ? navigate(`/portal/${resource.name}`) : navigate(`/portal/${resource.name}/${id}`)
        }
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-2xl text-gray-900">
            {titlePrefix} {resource.displayName.slice(0, -1)}
          </CardTitle>
          {loadError && <p className="text-sm text-amber-600 mt-2">{loadError}</p>}
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resource.fields.map((field: any) => {
                const isPrimary = field.name === resource.primaryKey
                const value = formData[field.name] ?? ""

                if (mode === "create" && isPrimary) {
                  return null
                }

                const label = field.displayName

                if (field.type === "boolean") {
                  return (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <Select
                        value={value ? "true" : "false"}
                        onValueChange={(v) => handleChange(field.name, v === "true")}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }

                if (field.type === "text") {
                  return (
                    <div key={field.name} className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <Textarea
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="bg-white border-gray-200 focus:border-indigo-500"
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
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <Input
                      type={inputType}
                      value={value}
                      onChange={(e) =>
                        handleChange(field.name, inputType === "number" ? Number(e.target.value) : e.target.value)
                      }
                      disabled={isPrimary && mode === "edit"}
                      className="bg-white border-gray-200 focus:border-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                )
              })}
            </div>

            {saveError && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
