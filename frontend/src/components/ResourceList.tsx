"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Eye, Plus, ChevronLeft, ChevronRight, Filter, Sparkles, ArrowUpDown, ArrowUp, ArrowDown, History, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { LoadingSpinner, EmptyState } from "./LoadingState"
import { getUIConfig } from "./ResourceSettings"

interface ResourceListProps {
  resource: any
}

export default function ResourceList({ resource }: ResourceListProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const navigate = useNavigate()

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

  const formatValue = (value: any, field: any): string => {
    if (value === null || value === undefined) return "-"
    switch (field.type) {
      case "date":
        return new Date(value).toLocaleDateString()
      case "boolean":
        return value ? "Yes" : "No"
      case "number":
        return Number(value).toLocaleString()
      default: {
        const str = String(value)
        return str.length > 50 ? str.substring(0, 50) + "..." : str
      }
    }
  }

  const handleRowClick = (item: any) => {
    const id = item[resource.primaryKey]
    navigate(`/portal/${resource.name}/${id}`)
  }

  if (loading) {
    return <LoadingSpinner message={`Loading ${resource.displayName}...`} />
  }

  return (
    <div className="space-y-6 animate-emerge">
      {/* Header - Enhanced */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {resource.displayName}
            </h1>
          </div>
          <p className="text-gray-500 mt-2 ml-12">Manage and view all {resource.displayName.toLowerCase()}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/portal/${resource.name}/settings`)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/portal/${resource.name}/activity`)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            <History className="w-4 h-4 mr-2" />
            Activity Log
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all"
            onClick={() => navigate(`/portal/${resource.name}/new`)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {resource.displayName.slice(0, -1)}
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar - Enhanced */}
      <div className="flex gap-4 bg-white p-5 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${resource.displayName.toLowerCase()}...`}
            className="pl-12 h-12 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
          <SelectTrigger className="w-40 h-12 bg-gray-50 border-0 rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table - Enhanced */}
      <div className="bg-white border-0 rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-100">
              <TableHead 
                className="text-gray-600 font-semibold w-20 py-4 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                onClick={() => handleSort(resource.primaryKey)}
              >
                <div className="flex items-center gap-2">
                  ID
                  {sortField === resource.primaryKey ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-indigo-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </TableHead>
              {visibleFields.map((field: any) => (
                <TableHead 
                  key={field.name} 
                  className="text-gray-600 font-semibold py-4 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                  onClick={() => handleSort(field.name)}
                >
                  <div className="flex items-center gap-2">
                    {getDisplayLabel(field)}
                    {sortField === field.name ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-gray-600 font-semibold text-right w-24 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleFields.length + 2} className="text-center py-12">
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
              paginatedData.map((item, index) => (
                <TableRow
                  key={item[resource.primaryKey]}
                  className="border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 transition-all duration-200"
                  onClick={() => handleRowClick(item)}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <TableCell className="font-mono font-semibold py-4">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      #{item[resource.primaryKey]}
                    </span>
                  </TableCell>
                  {visibleFields.map((field: any) => (
                    <TableCell key={field.name} className="text-gray-700 py-4">
                      {field.type === "boolean" ? (
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            item[field.name]
                              ? "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {formatValue(item[field.name], field)}
                        </span>
                      ) : (
                        formatValue(item[field.name], field)
                      )}
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
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl"
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

      {/* Pagination Footer - Enhanced */}
      <div className="flex items-center justify-between bg-white border-0 rounded-2xl px-5 py-4 shadow-lg shadow-gray-200/50">
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{sortedData.length === 0 ? 0 : startIndex + 1}</span>{" "}
          - <span className="font-semibold text-gray-900">{Math.min(endIndex, sortedData.length)}</span> of{" "}
          <span className="font-semibold text-gray-900">{sortedData.length}</span>{" "}
          {resource.displayName.toLowerCase()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentSafePage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 rounded-xl"
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
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl"
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
            className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 rounded-xl"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
