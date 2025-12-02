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
import { FieldRenderer } from "./FieldRenderer"

interface ResourceFormProps {
  resource: any
  mode: "create" | "edit"
  id?: string
  onSuccess: () => void
  onCancel: () => void
  isSpooky?: boolean
}

export default function ResourceForm({ resource, mode, id, onSuccess, onCancel, isSpooky = false }: ResourceFormProps) {
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
        className={`rounded-xl shadow-sm ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
        onClick={() =>
          mode === "create" ? navigate(`/portal/${resource.name}`) : navigate(`/portal/${resource.name}/${id}`)
        }
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className={`border-0 shadow-xl rounded-2xl overflow-hidden ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`}>
        <CardHeader className={`border-b ${isSpooky ? 'border-cyan-500/20 bg-slate-800' : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isSpooky ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-50'}`}>
              <Sparkles className={`w-6 h-6 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <CardTitle className={`text-2xl ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'}`}>
                {isSpooky ? '💀 ' : ''}{titlePrefix} {resource.displayName.slice(0, -1)}
              </CardTitle>
              {loadError && <p className={`text-sm mt-2 ${isSpooky ? 'text-amber-400' : 'text-amber-600'}`}>{loadError}</p>}
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
                const isLongText = field.type === "text" || (typeof value === 'string' && value.length > 100)

                return (
                  <div 
                    key={field.name} 
                    className={`space-y-2 ${isLongText ? 'md:col-span-2' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <label className={`text-sm font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-700'}`}>{label}</label>
                    <div className={isPrimary && mode === "edit" ? "opacity-50 pointer-events-none" : ""}>
                      <FieldRenderer
                        value={value}
                        type={field.type}
                        mode="form"
                        onChange={(newValue) => handleChange(field.name, newValue)}
                        name={field.name}
                        isSpooky={isSpooky}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {saveError && (
              <div className={`p-4 rounded-xl border text-sm ${isSpooky ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                {saveError}
              </div>
            )}

            <div className={`flex justify-end gap-3 pt-6 border-t ${isSpooky ? 'border-cyan-500/20' : 'border-gray-100'}`}>
              <Button
                type="button"
                variant="outline"
                className={`rounded-xl px-6 ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={`text-white shadow-lg rounded-xl px-6 ${isSpooky ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/25' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'}`}
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
