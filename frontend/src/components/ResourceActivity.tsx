import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Download, Clock, User, ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "./LoadingState"

interface ActivityEntry {
  timestamp: string
  action: "created" | "updated" | "deleted"
  user: string
  resourceId: string | number
  details?: string
}

interface ResourceActivityProps {
  resource: any
}

export default function ResourceActivity({ resource }: ResourceActivityProps) {
  const [data, setData] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const itemsPerPage = 20
  const navigate = useNavigate()

  useEffect(() => {
    fetchActivityData()
  }, [resource])

  const fetchActivityData = async () => {
    setLoading(true)
    // In a real app, fetch from API
    // For now, generate mock data
    setTimeout(() => {
      setData(generateMockActivity(resource))
      setLoading(false)
    }, 500)
  }

  const generateMockActivity = (resource: any): ActivityEntry[] => {
    const actions: Array<"created" | "updated" | "deleted"> = ["created", "updated", "deleted"]
    const users = ["Admin", "Sarah Chen", "John Smith", "Manager", "System"]

    return Array.from({ length: 50 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      user: users[Math.floor(Math.random() * users.length)],
      resourceId: Math.floor(Math.random() * 100) + 1,
      details: resource.fields[Math.floor(Math.random() * Math.min(3, resource.fields.length))]?.displayName || "Data",
    }))
  }

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(fieldName)
      setSortDirection("asc")
    }
  }

  const filteredData = data.filter((item) => {
    // Apply action filter
    if (filterAction !== "all" && item.action !== filterAction) return false

    // Apply search
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.user.toLowerCase().includes(searchLower) ||
      item.details?.toLowerCase().includes(searchLower) ||
      String(item.resourceId).includes(searchLower)
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0

    if (sortField === "timestamp") {
      comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    } else if (sortField === "action") {
      comparison = a.action.localeCompare(b.action)
    } else if (sortField === "user") {
      comparison = a.user.localeCompare(b.user)
    } else if (sortField === "resourceId") {
      comparison = Number(a.resourceId) - Number(b.resourceId)
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage))
  const currentSafePage = Math.min(currentPage, totalPages)
  const startIndex = (currentSafePage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterAction])

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getActionBadge = (action: string) => {
    const variants = {
      created: "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200",
      updated: "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200",
      deleted: "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200",
    }
    return variants[action as keyof typeof variants] || variants.updated
  }

  const handleExport = () => {
    // Generate CSV
    const headers = ["Timestamp", "Action", "User", "Resource ID", "Details"]
    const rows = sortedData.map((item) => [
      new Date(item.timestamp).toISOString(),
      item.action,
      item.user,
      item.resourceId,
      item.details || "",
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${resource.name}-activity-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <LoadingSpinner message={`Loading activity log...`} />
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
              <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Activity Log
              </h1>
            </div>
            <p className="text-gray-500 mt-2 ml-12">Recent activity on {resource.displayName.toLowerCase()}</p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all rounded-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4 bg-white p-5 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
        <div className="relative flex-1">
          <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, details, or ID..."
            className="pl-12 h-12 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48 h-12 bg-gray-50 border-0 rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Table */}
      <div className="bg-white border-0 rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-100">
              <TableHead
                className="text-gray-600 font-semibold py-4 cursor-pointer hover:text-amber-600 transition-colors select-none"
                onClick={() => handleSort("timestamp")}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                  {sortField === "timestamp" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-amber-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-600 font-semibold py-4 cursor-pointer hover:text-amber-600 transition-colors select-none"
                onClick={() => handleSort("action")}
              >
                <div className="flex items-center gap-2">
                  Action
                  {sortField === "action" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-amber-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-600 font-semibold py-4 cursor-pointer hover:text-amber-600 transition-colors select-none"
                onClick={() => handleSort("user")}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User
                  {sortField === "user" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-amber-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-600 font-semibold py-4 cursor-pointer hover:text-amber-600 transition-colors select-none"
                onClick={() => handleSort("resourceId")}
              >
                <div className="flex items-center gap-2">
                  Resource ID
                  {sortField === "resourceId" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-amber-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-gray-600 font-semibold py-4">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  {searchTerm || filterAction !== "all"
                    ? "No activity found matching your filters"
                    : "No activity recorded yet"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((entry, index) => (
                <TableRow
                  key={`${entry.timestamp}-${index}`}
                  className="border-gray-100 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/30 transition-all duration-200"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <TableCell className="py-4 text-gray-600 font-medium">{formatTimestamp(entry.timestamp)}</TableCell>
                  <TableCell className="py-4">
                    <Badge className={`${getActionBadge(entry.action)} border capitalize`}>{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="py-4 text-gray-700">{entry.user}</TableCell>
                  <TableCell className="py-4">
                    <span className="font-mono font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      #{entry.resourceId}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-gray-600">{entry.details || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between bg-white border-0 rounded-2xl px-5 py-4 shadow-lg shadow-gray-200/50">
        <div className="text-sm text-gray-500">
          Page <span className="font-semibold text-gray-900">{currentSafePage}</span> of{" "}
          <span className="font-semibold text-gray-900">{totalPages}</span> • Showing{" "}
          <span className="font-semibold text-gray-900">{sortedData.length === 0 ? 0 : startIndex + 1}</span> -{" "}
          <span className="font-semibold text-gray-900">{Math.min(endIndex, sortedData.length)}</span> of{" "}
          <span className="font-semibold text-gray-900">{sortedData.length}</span> entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentSafePage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 rounded-xl"
          >
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
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 rounded-xl"
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
          </Button>
        </div>
      </div>
    </div>
  )
}
