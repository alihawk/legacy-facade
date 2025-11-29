"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Eye, Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { LoadingSpinner, EmptyState } from "./LoadingState"

interface ResourceListProps {
  resource: any
}

export default function ResourceList({ resource }: ResourceListProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
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

  const visibleFields = resource.fields.filter((f: any) => f.name !== resource.primaryKey).slice(0, 5)

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    return visibleFields.some((field: any) => {
      const value = String(item[field.name] || "").toLowerCase()
      return value.includes(searchTerm.toLowerCase())
    })
  })

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const currentSafePage = Math.min(currentPage, totalPages)
  const startIndex = (currentSafePage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resource.displayName}</h1>
          <p className="text-gray-500 mt-1">Manage and view all {resource.displayName.toLowerCase()}</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          onClick={() => navigate(`/portal/${resource.name}/new`)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {resource.displayName.slice(0, -1)}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${resource.displayName.toLowerCase()}...`}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
        <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
          <SelectTrigger className="w-36 bg-gray-50 border-gray-200">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-gray-200">
              <TableHead className="text-gray-600 font-semibold w-20">ID</TableHead>
              {visibleFields.map((field: any) => (
                <TableHead key={field.name} className="text-gray-600 font-semibold">
                  {field.displayName}
                </TableHead>
              ))}
              <TableHead className="text-gray-600 font-semibold text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleFields.length + 2} className="text-center py-8">
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
                  className="border-gray-100 cursor-pointer hover:bg-indigo-50/50 transition"
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell className="text-indigo-600 font-mono font-medium">#{item[resource.primaryKey]}</TableCell>
                  {visibleFields.map((field: any) => (
                    <TableCell key={field.name} className="text-gray-700">
                      {field.type === "boolean" ? (
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            item[field.name] ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {formatValue(item[field.name], field)}
                        </span>
                      ) : (
                        formatValue(item[field.name], field)
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRowClick(item)
                      }}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
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

      {/* Pagination Footer */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{filteredData.length === 0 ? 0 : startIndex + 1}</span> -{" "}
          <span className="font-medium text-gray-900">{Math.min(endIndex, filteredData.length)}</span> of{" "}
          <span className="font-medium text-gray-900">{filteredData.length}</span> {resource.displayName.toLowerCase()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentSafePage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
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
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
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
            className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
