import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Settings, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ResourceUIConfig {
  resourceName: string
  fieldSettings: {
    [fieldName: string]: {
      displayLabel: string
      visibleInList: boolean
    }
  }
  primaryDisplayField: string
}

interface ResourceSettingsProps {
  resource: any
}

export default function ResourceSettings({ resource }: ResourceSettingsProps) {
  const [config, setConfig] = useState<ResourceUIConfig>(() => {
    const stored = localStorage.getItem(`ui-config-${resource.name}`)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with defaults
    const defaultConfig: ResourceUIConfig = {
      resourceName: resource.name,
      fieldSettings: {},
      primaryDisplayField: resource.fields.find((f: any) => f.type === "string" && f.name !== resource.primaryKey)
        ?.name || resource.fields[0]?.name,
    }
    resource.fields.forEach((field: any) => {
      defaultConfig.fieldSettings[field.name] = {
        displayLabel: field.displayName,
        visibleInList: field.name !== resource.primaryKey,
      }
    })
    return defaultConfig
  })

  const navigate = useNavigate()

  const handleLabelChange = (fieldName: string, newLabel: string) => {
    setConfig((prev) => ({
      ...prev,
      fieldSettings: {
        ...prev.fieldSettings,
        [fieldName]: {
          ...prev.fieldSettings[fieldName],
          displayLabel: newLabel,
        },
      },
    }))
  }

  const handleVisibilityToggle = (fieldName: string) => {
    // Count currently visible fields
    const visibleCount = Object.values(config.fieldSettings).filter((s) => s.visibleInList).length
    const currentlyVisible = config.fieldSettings[fieldName]?.visibleInList

    // Prevent hiding if only 2 fields are visible
    if (currentlyVisible && visibleCount <= 2) {
      alert("At least 2 fields must be visible in the list view")
      return
    }

    setConfig((prev) => ({
      ...prev,
      fieldSettings: {
        ...prev.fieldSettings,
        [fieldName]: {
          ...prev.fieldSettings[fieldName],
          visibleInList: !currentlyVisible,
        },
      },
    }))
  }

  const handlePrimaryFieldChange = (fieldName: string) => {
    setConfig((prev) => ({
      ...prev,
      primaryDisplayField: fieldName,
    }))
  }

  const handleSave = () => {
    localStorage.setItem(`ui-config-${resource.name}`, JSON.stringify(config))
    alert("Settings saved successfully!")
  }

  const handleReset = () => {
    if (!confirm("Reset all customizations to defaults?")) return

    localStorage.removeItem(`ui-config-${resource.name}`)

    // Reset to defaults
    const defaultConfig: ResourceUIConfig = {
      resourceName: resource.name,
      fieldSettings: {},
      primaryDisplayField: resource.fields.find((f: any) => f.type === "string" && f.name !== resource.primaryKey)
        ?.name || resource.fields[0]?.name,
    }
    resource.fields.forEach((field: any) => {
      defaultConfig.fieldSettings[field.name] = {
        displayLabel: field.displayName,
        visibleInList: field.name !== resource.primaryKey,
      }
    })
    setConfig(defaultConfig)
  }

  return (
    <div className="space-y-6 animate-emerge">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/portal/${resource.name}`)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {resource.displayName}
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-50 rounded-xl">
                <Settings className="w-5 h-5 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Display Settings
              </h1>
            </div>
            <p className="text-gray-500 mt-2 ml-12">Customize how {resource.displayName.toLowerCase()} are displayed</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white border-0 rounded-2xl shadow-lg shadow-gray-200/50 p-6 space-y-6">
        {/* Field Settings Table */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Visibility & Labels</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-100">
                  <TableHead className="text-gray-600 font-semibold py-4 w-1/3">Field Name</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4 w-1/2">Display Label</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4 text-center w-32">Show in List</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resource.fields.map((field: any) => (
                  <TableRow key={field.name} className="border-gray-100">
                    <TableCell className="py-4">
                      <span className="font-mono text-sm text-gray-600">{field.name}</span>
                      <span className="ml-2 text-xs text-gray-400">({field.type})</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Input
                        value={config.fieldSettings[field.name]?.displayLabel || field.displayName}
                        onChange={(e) => handleLabelChange(field.name, e.target.value)}
                        className="h-10 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20"
                      />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <input
                        type="checkbox"
                        checked={config.fieldSettings[field.name]?.visibleInList ?? true}
                        onChange={() => handleVisibilityToggle(field.name)}
                        className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-500 mt-2">* At least 2 fields must be visible in the list view</p>
        </div>

        {/* Primary Display Field */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Display Field</h2>
          <p className="text-sm text-gray-600 mb-3">
            Select which field to use as the main identifier in cards and summaries
          </p>
          <Select value={config.primaryDisplayField} onValueChange={handlePrimaryFieldChange}>
            <SelectTrigger className="w-full max-w-md h-12 bg-gray-50 border-gray-200 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {resource.fields.map((field: any) => (
                <SelectItem key={field.name} value={field.name}>
                  {config.fieldSettings[field.name]?.displayLabel || field.displayName} ({field.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

// Utility function to get UI config (export for use in other components)
export function getUIConfig(resourceName: string): ResourceUIConfig | null {
  const stored = localStorage.getItem(`ui-config-${resourceName}`)
  return stored ? JSON.parse(stored) : null
}
