"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Eye, Plus, ChevronLeft, ChevronRight, Filter, Sparkles, ArrowUpDown, ArrowUp, ArrowDown, History, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import { LoadingSpinner, EmptyState } from "./LoadingState"
import { getUIConfig } from "./ResourceSettings"
import { BulkActionsBar } from "./BulkActionsBar"
import { ConfirmDialog } from "./ConfirmDialog"
import { exportToCSV } from "@/utils/csvExport"
import { FieldRenderer } from "./FieldRenderer"

interface ResourceListProps {
  resource: any
  isSpooky?: boolean
  customization?: any
}

export default function ResourceList({ resource, isSpooky = false, customization: propCustomization }: ResourceListProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  // Use prop customization or read from localStorage
  const customization = propCustomization || (() => {
    try {
      const stored = localStorage.getItem("portal-customization")
      return stored ? JSON.parse(stored) : {
        listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true }
      }
    } catch {
      return { listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true } }
    }
  })()

  useEffect(() => {
    fetchData()
  }, [resource])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:8000/proxy/${resource.name}`)
      setData(response.data.data || [])
    } catch (error) {
      console.error("Failed to fetch:", error)
      setData(generateMockData())
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    return Array.from({ length: 50 }, (_, i) => {
      const mockItem: any = {}
      mockItem[resource.primaryKey] = i + 1
      resource.fields.forEach((field: any) => {
        if (field.name === resource.primaryKey) return
        switch (field.type) {
          case "string":
            mockItem[field.name] = `Sample ${field.displayName} ${i + 1}`
            break
          case "email":
            mockItem[field.name] = `user${i + 1}@example.com`
            break
          case "number":
            mockItem[field.name] = Math.floor(Math.random() * 1000)
            break
          case "boolean":
            mockItem[field.name] = Math.random() > 0.5
            break
          case "date":
            mockItem[field.name] = new Date(2024, 0, i + 1).toISOString()
            break
          default:
            mockItem[field.name] = `Value ${i + 1}`
        }
      })
      return mockItem
    })
  }

  // Get UI config from localStorage
  const uiConfig = getUIConfig(resource.name)

  // Apply UI config to visible fields
  const visibleFields = resource.fields
    .filter((f: any) => {
      if (f.name === resource.primaryKey) return false
      if (!uiConfig) return true
      return uiConfig.fieldSettings[f.name]?.visibleInList ?? true
    })
    .slice(0, 5)

  // Helper to get display label
  const getDisplayLabel = (field: any): string => {
    return uiConfig?.fieldSettings[field.name]?.displayLabel || field.displayName
  }

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(fieldName)
      setSortDirection('asc')
    }
  }

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    return visibleFields.some((field: any) => {
      const value = String(item[field.name] || "").toLowerCase()
      return value.includes(searchTerm.toLowerCase())
    })
  })

  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        
        // Handle null/undefined
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1
        
        // Compare values
        let comparison = 0
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          comparison = aVal === bVal ? 0 : aVal ? 1 : -1
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    : filteredData

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage))
  const currentSafePage = Math.min(currentPage, totalPages)
  const startIndex = (currentSafePage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  const handleRowClick = (item: any) => {
    const id = item[resource.primaryKey]
    navigate(`/portal/${resource.name}/${id}`)
  }

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set())
    } else {
      const allIds = new Set(paginatedData.map(item => item[resource.primaryKey]))
      setSelectedIds(allIds)
    }
  }

  const toggleSelectItem = (id: any) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleExport = () => {
    const selectedData = data.filter(item => selectedIds.has(item[resource.primaryKey]))
    const dataToExport = selectedData.length > 0 ? selectedData : paginatedData
    exportToCSV(dataToExport, `${resource.name}-export`, resource.fields)
  }

  const handleBulkDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmBulkDelete = async () => {
    const deleteCount = selectedIds.size
    
    // In a real app, this would call the API for each item
    console.log('Deleting items:', Array.from(selectedIds))
    
    // Simulate deletion
    const newData = data.filter(item => !selectedIds.has(item[resource.primaryKey]))
    setData(newData)
    setSelectedIds(new Set())
    
    // Show success message
    setShowSuccessMessage(`Successfully deleted ${deleteCount} item${deleteCount !== 1 ? 's' : ''}`)
    
    // Auto-hide after 3 seconds
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  if (loading) {
    return <LoadingSpinner message={`Loading ${resource.displayName}...`} />
  }

  return (
    <div className="space-y-6 animate-emerge">
      {/* Header - Enhanced */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isSpooky ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-50'}`}>
                <Sparkles className={`w-5 h-5 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`} />
              </div>
              <h1 className={`text-2xl font-bold ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'}`}>
                {isSpooky ? '💀 ' : ''}{resource.displayName}
              </h1>
            </div>
            <p className={`mt-2 ml-12 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`}>Manage and view all {resource.displayName.toLowerCase()}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/portal/${resource.name}/settings`)}
              className={`rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/portal/${resource.name}/activity`)}
              className={`rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <History className="w-4 h-4 mr-2" />
              Activity Log
            </Button>
            {/* Only show Add button if create operation is enabled */}
            {resource.operations?.create !== false && (
              <Button
                className={`shadow-lg hover:shadow-xl transition-all ${isSpooky ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white`}
                onClick={() => navigate(`/portal/${resource.name}/new`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {resource.displayName.slice(0, -1)}
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar - Show when items are selected */}
        {(customization.listView?.bulkSelection || customization.listView?.bulkDelete || customization.listView?.csvExport) && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onExport={customization.listView?.csvExport ? handleExport : undefined}
            onDelete={customization.listView?.bulkDelete && resource.operations?.delete !== false ? handleBulkDelete : undefined}
            isSpooky={isSpooky}
          />
        )}

        {/* Success Message Toast */}
        {showSuccessMessage && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border animate-emerge ${isSpooky ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{showSuccessMessage}</span>
            <button 
              onClick={() => setShowSuccessMessage(null)}
              className={`ml-auto p-1 rounded-lg transition-colors ${isSpooky ? 'hover:bg-emerald-500/20' : 'hover:bg-emerald-100'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar - Enhanced */}
      <div className={`flex gap-4 p-5 rounded-2xl border-0 shadow-lg ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`}>
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-3.5 w-5 h-5 ${isSpooky ? 'text-cyan-400' : 'text-gray-400'}`} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${resource.displayName.toLowerCase()}...`}
            className={`pl-12 h-12 border-0 rounded-xl transition-all ${isSpooky ? 'bg-slate-800 text-cyan-400 placeholder:text-gray-500 focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/20' : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'}`}
          />
        </div>
        <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
          <SelectTrigger className={`w-40 h-12 border-0 rounded-xl ${isSpooky ? 'bg-slate-800 text-cyan-400' : 'bg-gray-50 text-gray-900'}`}>
            <Filter className={`w-4 h-4 mr-2 ${isSpooky ? 'text-cyan-400' : 'text-gray-400'}`} />
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent className={`rounded-xl ${isSpooky ? 'bg-slate-800 border-cyan-500/30' : 'bg-white'}`}>
            <SelectItem value="10" className={isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : ''}>10 per page</SelectItem>
            <SelectItem value="20" className={isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : ''}>20 per page</SelectItem>
            <SelectItem value="50" className={isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : ''}>50 per page</SelectItem>
            <SelectItem value="100" className={isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : ''}>100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table - Enhanced */}
      <div className={`border-0 rounded-2xl shadow-lg overflow-hidden ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`}>
        <Table>
          <TableHeader>
            <TableRow className={`${isSpooky ? 'bg-slate-800 border-cyan-500/20' : 'bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-100'}`}>
              {/* Only show checkbox column if bulk selection is enabled */}
              {customization.listView?.bulkSelection && (
                <TableHead className="w-12 py-4">
                  <Checkbox
                    checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead 
                className={`font-semibold w-20 py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-indigo-600'}`}
                onClick={() => handleSort(resource.primaryKey)}
              >
                <div className="flex items-center gap-2">
                  ID
                  {sortField === resource.primaryKey ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className={`w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`} />
                    ) : (
                      <ArrowDown className={`w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`} />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </TableHead>
              {visibleFields.map((field: any) => (
                <TableHead 
                  key={field.name} 
                  className={`font-semibold py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-indigo-600'}`}
                  onClick={() => handleSort(field.name)}
                >
                  <div className="flex items-center gap-2">
                    {getDisplayLabel(field)}
                    {sortField === field.name ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className={`w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`} />
                      ) : (
                        <ArrowDown className={`w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`} />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className={`font-semibold text-right w-24 py-4 ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleFields.length + 3} className="text-center py-12">
                  <EmptyState
                    message={
                      searchTerm
                        ? `No ${resource.displayName.toLowerCase()} found matching "${searchTerm}"`
                        : `No ${resource.displayName.toLowerCase()} found`
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => {
                const itemId = item[resource.primaryKey] ?? item.id ?? index
                const isSelected = selectedIds.has(itemId)
                
                return (
                  <TableRow
                    key={`${resource.name}-${itemId}-${index}`}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSpooky 
                        ? `border-cyan-500/20 hover:bg-cyan-500/10 ${isSelected ? 'bg-cyan-500/20' : ''}`
                        : `border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 ${isSelected ? 'bg-indigo-50/30' : ''}`
                    }`}
                    onClick={() => handleRowClick(item)}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    {/* Only show checkbox if bulk selection is enabled */}
                    {customization.listView?.bulkSelection && (
                      <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectItem(itemId)}
                          aria-label={`Select item ${itemId}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono font-semibold py-4">
                      <span className={`${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
                        #{itemId}
                      </span>
                    </TableCell>
                    {visibleFields.map((field: any) => (
                      <TableCell key={field.name} className={`py-4 ${isSpooky ? 'text-gray-300' : 'text-gray-700'}`}>
                        <FieldRenderer
                          value={item[field.name]}
                          type={field.type}
                          mode="list"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-right py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(item)
                        }}
                        className={`rounded-xl ${isSpooky ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20' : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100'}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer - Enhanced */}
      <div className={`flex items-center justify-between border-0 rounded-2xl px-5 py-4 shadow-lg ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`}>
        <div className={`text-sm ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing <span className={`font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>{sortedData.length === 0 ? 0 : startIndex + 1}</span>{" "}
          - <span className={`font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>{Math.min(endIndex, sortedData.length)}</span> of{" "}
          <span className={`font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>{sortedData.length}</span>{" "}
          {resource.displayName.toLowerCase()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentSafePage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`disabled:opacity-30 rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentSafePage <= 3) {
                pageNum = i + 1
              } else if (currentSafePage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentSafePage - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentSafePage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={
                    currentSafePage === pageNum
                      ? isSpooky 
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white border-0 rounded-xl"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl"
                      : isSpooky
                        ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
                  }
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentSafePage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`disabled:opacity-30 rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Selected Items"
        description={`Are you sure you want to delete ${selectedIds.size} item${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmBulkDelete}
        variant="danger"
      />
    </div>
  )
}
