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
  isSpooky?: boolean
}

export default function ResourceSettings({ resource, isSpooky = false }: ResourceSettingsProps) {
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
            className={`rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {resource.displayName}
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isSpooky ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-violet-100 to-purple-50'}`}>
                <Settings className={`w-5 h-5 ${isSpooky ? 'text-cyan-400' : 'text-violet-600'}`} />
              </div>
              <h1 className={`text-2xl font-bold ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'}`}>
                {isSpooky ? '💀 ' : ''}Display Settings
              </h1>
            </div>
            <p className={`mt-2 ml-12 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`}>Customize how {resource.displayName.toLowerCase()} are displayed</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className={`border-0 rounded-2xl shadow-lg p-6 space-y-6 ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`}>
        {/* Field Settings Table */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>Field Visibility & Labels</h2>
          <div className={`border rounded-xl overflow-hidden ${isSpooky ? 'border-cyan-500/30' : 'border-gray-200'}`}>
            <Table>
              <TableHeader>
                <TableRow className={`${isSpooky ? 'bg-slate-800 border-cyan-500/20' : 'bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-100'}`}>
                  <TableHead className={`font-semibold py-4 w-1/3 ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`}>Field Name</TableHead>
                  <TableHead className={`font-semibold py-4 w-1/2 ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`}>Display Label</TableHead>
                  <TableHead className={`font-semibold py-4 text-center w-32 ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`}>Show in List</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resource.fields.map((field: any) => (
                  <TableRow key={field.name} className={`${isSpooky ? 'border-cyan-500/20' : 'border-gray-100'}`}>
                    <TableCell className="py-4">
                      <span className={`font-mono text-sm ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`}>{field.name}</span>
                      <span className={`ml-2 text-xs ${isSpooky ? 'text-gray-500' : 'text-gray-400'}`}>({field.type})</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Input
                        value={config.fieldSettings[field.name]?.displayLabel || field.displayName}
                        onChange={(e) => handleLabelChange(field.name, e.target.value)}
                        className={`h-10 rounded-lg focus:ring-2 ${isSpooky ? 'bg-slate-800 border-cyan-500/30 text-cyan-400 focus:ring-cyan-500/20' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-violet-500/20'}`}
                      />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <input
                        type="checkbox"
                        checked={config.fieldSettings[field.name]?.visibleInList ?? true}
                        onChange={() => handleVisibilityToggle(field.name)}
                        className={`w-5 h-5 rounded cursor-pointer ${isSpooky ? 'border-cyan-500/30 text-green-600 focus:ring-cyan-500' : 'border-gray-300 text-violet-600 focus:ring-violet-500'}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className={`text-xs mt-2 ${isSpooky ? 'text-gray-500' : 'text-gray-500'}`}>* At least 2 fields must be visible in the list view</p>
        </div>

        {/* Primary Display Field */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>Primary Display Field</h2>
          <p className={`text-sm mb-3 ${isSpooky ? 'text-gray-400' : 'text-gray-600'}`}>
            Select which field to use as the main identifier in cards and summaries
          </p>
          <Select value={config.primaryDisplayField} onValueChange={handlePrimaryFieldChange}>
            <SelectTrigger className={`w-full max-w-md h-12 rounded-xl ${isSpooky ? 'bg-slate-800 border-cyan-500/30 text-cyan-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
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
        <div className={`flex gap-3 pt-4 border-t ${isSpooky ? 'border-cyan-500/20' : 'border-gray-200'}`}>
          <Button
            onClick={handleReset}
            variant="outline"
            className={`rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            className={`text-white shadow-lg hover:shadow-xl transition-all rounded-xl ${isSpooky ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/25' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/25'}`}
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
