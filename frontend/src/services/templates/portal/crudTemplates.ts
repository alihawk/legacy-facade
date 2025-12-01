/**
 * CRUD component templates (ResourceList, ResourceDetail, ResourceForm)
 * Simplified versions for generated projects
 */

export const resourceListTemplate = (): string => {
  return `import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Eye, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiService } from "@/services/api"
import type { ResourceSchema } from "@/types"

interface ResourceListProps {
  resource: ResourceSchema
}

export default function ResourceList({ resource }: ResourceListProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [resource])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await apiService.getAll(resource.name)
      setData(result)
    } catch (error) {
      console.error("Failed to fetch:", error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const visibleFields = resource.fields.filter((f) => f.name !== resource.primaryKey).slice(0, 5)

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    return visibleFields.some((field) => {
      const value = String(item[field.name] || "").toLowerCase()
      return value.includes(searchTerm.toLowerCase())
    })
  })

  const formatValue = (value: any, field: any): string => {
    if (value === null || value === undefined) return "-"
    switch (field.type) {
      case "date":
        return new Date(value).toLocaleDateString()
      case "boolean":
        return value ? "Yes" : "No"
      case "number":
        return Number(value).toLocaleString()
      default:
        const str = String(value)
        return str.length > 50 ? str.substring(0, 50) + "..." : str
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{resource.displayName}</h1>
        <Button onClick={() => navigate(\`/\${resource.name}/new\`)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add {resource.displayName.slice(0, -1)}
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={\`Search \${resource.displayName.toLowerCase()}...\`}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              {visibleFields.map((field) => (
                <TableHead key={field.name}>{field.displayName}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleFields.length + 2} className="text-center py-8 text-gray-500">
                  No {resource.displayName.toLowerCase()} found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow
                  key={item[resource.primaryKey]}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(\`/\${resource.name}/\${item[resource.primaryKey]}\`)}
                >
                  <TableCell className="font-mono">#{item[resource.primaryKey]}</TableCell>
                  {visibleFields.map((field) => (
                    <TableCell key={field.name}>{formatValue(item[field.name], field)}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(\`/\${resource.name}/\${item[resource.primaryKey]}\`)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}`
}

export const resourceDetailTemplate = (): string => {
  return `import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services/api"
import type { ResourceSchema } from "@/types"

interface ResourceDetailProps {
  resource: ResourceSchema
  id: string
  onEdit: () => void
}

export default function ResourceDetail({ resource, id, onEdit }: ResourceDetailProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await apiService.getOne(resource.name, id)
      setData(result)
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(\`Are you sure you want to delete this \${resource.displayName.slice(0, -1).toLowerCase()}?\`)) {
      return
    }
    try {
      await apiService.delete(resource.name, id)
      navigate(\`/\${resource.name}\`)
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Failed to delete")
    }
  }

  const formatValue = (value: any, field: any): string => {
    if (value === null || value === undefined) return "-"
    switch (field.type) {
      case "date":
        return new Date(value).toLocaleString()
      case "boolean":
        return value ? "Yes" : "No"
      case "number":
        return Number(value).toLocaleString()
      default:
        return String(value)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!data) {
    return <div className="text-center py-8 text-gray-500">Not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(\`/\${resource.name}\`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {resource.displayName.slice(0, -1)} #{id}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resource.fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-gray-500">{field.displayName}</label>
                <div className="mt-1 text-gray-900">{formatValue(data[field.name], field)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}`
}

export const resourceFormTemplate = (): string => {
  return `import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services/api"
import type { ResourceSchema } from "@/types"

interface ResourceFormProps {
  resource: ResourceSchema
  mode: "create" | "edit"
  id?: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ResourceForm({ resource, mode, id, onSuccess, onCancel }: ResourceFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(mode === "edit")

  useEffect(() => {
    if (mode === "edit" && id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    setInitialLoading(true)
    try {
      const result = await apiService.getOne(resource.name, id!)
      setFormData(result)
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === "create") {
        await apiService.create(resource.name, formData)
      } else {
        await apiService.update(resource.name, id!, formData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save:", error)
      alert("Failed to save")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }))
  }

  if (initialLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const editableFields = resource.fields.filter((f) => f.name !== resource.primaryKey)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Create" : "Edit"} {resource.displayName.slice(0, -1)}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "New" : "Edit"} {resource.displayName.slice(0, -1)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editableFields.map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    {field.displayName}
                  </label>
                  {field.type === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={formData[field.name] || false}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="h-4 w-4"
                    />
                  ) : field.type === "number" ? (
                    <Input
                      type="number"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, Number(e.target.value))}
                    />
                  ) : field.type === "date" ? (
                    <Input
                      type="date"
                      value={formData[field.name] ? new Date(formData[field.name]).toISOString().split('T')[0] : ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}`
}
