"use client"

import { useState, ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Skull, Upload, FileJson, Globe, ChevronRight, Sparkles, Braces, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SpookyBackground from "@/components/SpookyBackground"
import SpookyLoader from "@/components/SpookyLoader"
import axios from "axios"

interface ResourceField {
  name: string
  type: string
  displayName: string
}

interface ResourceSchema {
  name: string
  displayName: string
  endpoint: string
  primaryKey: string
  fields: ResourceField[]
  operations: string[]
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type AuthType = "none" | "bearer" | "api-key" | "basic"
type AnalyzerTab = "openapi" | "endpoint" | "json"

export default function AnalyzerPage() {
  const [activeTab, setActiveTab] = useState<AnalyzerTab>("openapi")

  // OpenAPI spec state
  const [specJson, setSpecJson] = useState("")
  const [specUrl, setSpecUrl] = useState("")
  const [specFileName, setSpecFileName] = useState("")

  // JSON sample state + minimal connection info
  const [jsonSample, setJsonSample] = useState("")
  const [jsonBaseUrl, setJsonBaseUrl] = useState("")
  const [jsonEndpointPath, setJsonEndpointPath] = useState("")
  const [jsonHttpMethod, setJsonHttpMethod] = useState<HttpMethod>("GET")

  // Endpoint URL state
  const [baseUrl, setBaseUrl] = useState("")
  const [endpointPath, setEndpointPath] = useState("")
  const [httpMethod, setHttpMethod] = useState<HttpMethod>("GET")
  const [authType, setAuthType] = useState<AuthType>("none")
  const [authValue, setAuthValue] = useState("")
  const [customHeaders, setCustomHeaders] = useState("")

  // Common state
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [resources, setResources] = useState<ResourceSchema[]>([])
  const [analyzed, setAnalyzed] = useState(false)
  const [cleaning, setCleaning] = useState(false)

  // INLINE STEP STATE (not modals!)
  const [currentStep, setCurrentStep] = useState<'results' | 'review' | 'customize'>('results')
  const [reviewedResources, setReviewedResources] = useState<any[]>([])
  const [detectedBaseUrl, setDetectedBaseUrl] = useState<string>("")
  const [uiCustomization, setUiCustomization] = useState({
    dashboard: { statsCards: true, barChart: true, recentActivity: true },
    listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true },
    forms: { smartInputs: true },
    theme: { mode: 'auto' as 'light' | 'dark' | 'auto', accentColor: 'blue' as 'blue' | 'green' | 'purple' | 'orange' }
  })

  const navigate = useNavigate()

  const buildFallbackResources = (): ResourceSchema[] => {
    return [
      {
        name: "users",
        displayName: "Users",
        endpoint: "/api/v1/GetAllUsers",
        primaryKey: "user_id",
        fields: [
          { name: "user_id", type: "number", displayName: "User ID" },
          { name: "full_name", type: "string", displayName: "Full Name" },
          { name: "email_address", type: "email", displayName: "Email" },
          { name: "dept_code", type: "string", displayName: "Department" },
          { name: "is_active", type: "boolean", displayName: "Active" },
          { name: "hire_date", type: "date", displayName: "Hire Date" },
        ],
        operations: ["list", "detail", "create", "update"],
      },
    ]
  }

  const handleAnalyzeOpenAPI = async () => {
    setLoading(true)
    setError("")

    // Try to parse as JSON; if it fails, send raw string (e.g. YAML) to backend
    let spec: unknown = specJson
    try {
      spec = JSON.parse(specJson)
    } catch {
      // leave spec as raw string; backend can parse YAML or return a clear error
    }

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "openapi",
        specJson: spec,
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      // Capture baseUrl from response if available
      if (response.data.baseUrl) {
        setDetectedBaseUrl(response.data.baseUrl)
      }
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (openapi) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeOpenAPIUrl = async () => {
    if (!specUrl.trim()) {
      setError("Please enter an OpenAPI / Swagger URL.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "openapi_url",
        specUrl: specUrl.trim(),
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      // Capture baseUrl from response if available
      if (response.data.baseUrl) {
        setDetectedBaseUrl(response.data.baseUrl)
      }
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (openapi_url) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeJsonSample = async () => {
    if (!jsonSample.trim()) {
      setError("Please paste a JSON sample response.")
      return
    }

    if (!jsonEndpointPath.trim()) {
      setError("Please provide an endpoint path for the JSON sample.")
      return
    }

    let sample: unknown
    try {
      sample = JSON.parse(jsonSample)
    } catch {
      setError("Invalid JSON sample. Please check the format.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "json_sample",
        sampleJson: sample,
        baseUrl: jsonBaseUrl.trim() || undefined,
        endpointPath: jsonEndpointPath.trim(),
        method: jsonHttpMethod,
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      // Use provided baseUrl or captured from response
      if (response.data.baseUrl) {
        setDetectedBaseUrl(response.data.baseUrl)
      } else if (jsonBaseUrl.trim()) {
        setDetectedBaseUrl(jsonBaseUrl.trim())
      }
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (json_sample) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeEndpoint = async () => {
    if (!baseUrl || !endpointPath) {
      setError("Please provide both base URL and endpoint path.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "endpoint",
        baseUrl,
        endpointPath,
        method: httpMethod,
        authType,
        authValue: authValue || undefined,
        customHeaders: customHeaders || undefined,
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      // Use provided baseUrl or captured from response
      if (response.data.baseUrl) {
        setDetectedBaseUrl(response.data.baseUrl)
      } else if (baseUrl) {
        setDetectedBaseUrl(baseUrl)
      }
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (endpoint) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = () => {
    if (activeTab === "openapi") {
      if (specJson.trim()) {
        handleAnalyzeOpenAPI()
        return
      }
      if (specUrl.trim()) {
        handleAnalyzeOpenAPIUrl()
        return
      }
      setError("Please paste an OpenAPI spec, upload a file, or enter a spec URL.")
      return
    }

    if (activeTab === "endpoint") {
      handleAnalyzeEndpoint()
      return
    }

    // json sample
    handleAnalyzeJsonSample()
  }

  const handleSpecFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSpecFileName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      setSpecJson(text)
      // clear URL if user uploads a file
      setSpecUrl("")
    }
    reader.readAsText(file)
  }

  const handleCleanNames = async () => {
    setCleaning(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/clean-names", {
        resources,
      })
      const cleanedResources = response.data.resources as ResourceSchema[]
      setResources(cleanedResources)
    } catch (err: any) {
      console.error("Failed to clean field names:", err)
      setError(
        err?.response?.data?.detail ||
          "Failed to clean field names. LLM service may be unavailable."
      )
    } finally {
      setCleaning(false)
    }
  }

  const handleGenerate = () => {
    setGenerating(true)
    
    // Use REVIEWED resources if available, otherwise use detected resources
    const rawSchema = reviewedResources.length > 0 ? reviewedResources : resources
    
    // Normalize operations to array format for consistency
    const schemaToUse = rawSchema.map((resource: any) => ({
      ...resource,
      // Convert operations object {list: true, detail: true} to array ["list", "detail"]
      operations: Array.isArray(resource.operations) 
        ? resource.operations 
        : Object.entries(resource.operations || {})
            .filter(([_, enabled]) => enabled)
            .map(([op]) => op)
    }))
    
    // Store schema with baseUrl for proxy configuration
    localStorage.setItem("app-schema", JSON.stringify({ 
      resources: schemaToUse,
      baseUrl: detectedBaseUrl || undefined
    }))
    
    // Save UI customization settings
    localStorage.setItem("portal-customization", JSON.stringify(uiCustomization))

    // Simulate portal generation with longer delay for the necromancer animation
    setTimeout(() => {
      navigate("/portal")
    }, 4500)
  }

  const loadExample = () => {
    const exampleSpec = {
      openapi: "3.0.0",
      info: { title: "Legacy HR API", version: "1.0.0" },
      paths: {
        "/api/v1/GetAllUsers": {
          get: {
            responses: {
              "200": {
                description: "List of users",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        Data: {
                          type: "object",
                          properties: {
                            Users: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  user_id: { type: "integer" },
                                  full_name: { type: "string" },
                                  email_address: { type: "string" },
                                  dept_code: { type: "string" },
                                  is_active: { type: "integer" },
                                  hire_date: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
    setSpecJson(JSON.stringify(exampleSpec, null, 2))
    setSpecUrl("")
    setSpecFileName("")
  }

  const loadActivityExample = () => {
    const activitySpec = {
      openapi: "3.0.0",
      info: { title: "Activity Log API", version: "1.0.0" },
      paths: {
        "/api/v1/activity": {
          get: {
            responses: {
              "200": {
                description: "List of activity logs",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        Data: {
                          type: "object",
                          properties: {
                            Activity: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  activity_id: { type: "integer" },
                                  timestamp: { type: "string" },
                                  action: { type: "string" },
                                  user: { type: "string" },
                                  resource_id: { type: "integer" },
                                  details: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
    setSpecJson(JSON.stringify(activitySpec, null, 2))
    setSpecUrl("")
    setSpecFileName("")
  }

  const loadProductsExample = () => {
    const productsSpec = {
      openapi: "3.0.0",
      info: { title: "Product Catalog API", version: "1.0.0" },
      paths: {
        "/api/v1/products": {
          get: {
            responses: {
              "200": {
                description: "List of products",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        Data: {
                          type: "object",
                          properties: {
                            Products: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  product_id: { type: "integer" },
                                  sku_code: { type: "string" },
                                  product_name: { type: "string" },
                                  category_id: { type: "integer" },
                                  unit_price: { type: "number" },
                                  stock_quantity: { type: "integer" },
                                  is_available: { type: "boolean" },
                                  created_date: { type: "string" },
                                  last_updated: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
    setSpecJson(JSON.stringify(productsSpec, null, 2))
    setSpecUrl("")
    setSpecFileName("")
  }

  // Endpoint examples using mock data
  const loadHREndpointExample = () => {
    setBaseUrl("http://localhost:8000")
    setEndpointPath("/mock/users")
    setHttpMethod("GET")
    setAuthType("none")
    setAuthValue("")
  }

  const loadActivityEndpointExample = () => {
    setBaseUrl("http://localhost:8000")
    setEndpointPath("/mock/activity")
    setHttpMethod("GET")
    setAuthType("none")
    setAuthValue("")
  }

  const loadProductsEndpointExample = () => {
    setBaseUrl("http://localhost:8000")
    setEndpointPath("/mock/products")
    setHttpMethod("GET")
    setAuthType("none")
    setAuthValue("")
  }

  // JSON sample examples with meaningful data
  const loadHRJsonExample = () => {
    const exampleSample = {
      data: [
        { user_id: 1, full_name: "Sarah Johnson", email_address: "sarah.johnson@company.com", dept_code: "HR", is_active: true, hire_date: "2019-03-15" },
        { user_id: 2, full_name: "Michael Chen", email_address: "michael.chen@company.com", dept_code: "ENG", is_active: true, hire_date: "2020-06-22" },
        { user_id: 3, full_name: "Emily Rodriguez", email_address: "emily.rodriguez@company.com", dept_code: "SALES", is_active: true, hire_date: "2018-11-08" },
      ],
    }
    setJsonSample(JSON.stringify(exampleSample, null, 2))
    setJsonBaseUrl("http://localhost:8000")
    setJsonEndpointPath("/mock/users")
    setJsonHttpMethod("GET")
  }

  const loadActivityJsonExample = () => {
    const exampleSample = {
      data: [
        { activity_id: 1, timestamp: "2024-01-15T09:30:00Z", action: "User Login", user: "sarah.johnson@company.com", resource_id: 1, details: "Successful login from Chrome browser" },
        { activity_id: 2, timestamp: "2024-01-15T10:15:00Z", action: "Record Created", user: "michael.chen@company.com", resource_id: 45, details: "Created new employee record" },
        { activity_id: 3, timestamp: "2024-01-15T11:00:00Z", action: "Record Updated", user: "emily.rodriguez@company.com", resource_id: 23, details: "Updated contact information" },
      ],
    }
    setJsonSample(JSON.stringify(exampleSample, null, 2))
    setJsonBaseUrl("http://localhost:8000")
    setJsonEndpointPath("/mock/activity")
    setJsonHttpMethod("GET")
  }

  const loadProductsJsonExample = () => {
    const exampleSample = {
      data: [
        { product_id: 1, sku_code: "LAPTOP-001", product_name: "ProBook 15 Laptop", category_id: 1, unit_price: 1299.99, stock_quantity: 45, is_available: true, created_date: "2023-06-15" },
        { product_id: 2, sku_code: "MOUSE-002", product_name: "Wireless Ergonomic Mouse", category_id: 2, unit_price: 49.99, stock_quantity: 230, is_available: true, created_date: "2023-07-20" },
        { product_id: 3, sku_code: "MONITOR-003", product_name: "UltraWide 34\" Monitor", category_id: 1, unit_price: 599.99, stock_quantity: 28, is_available: true, created_date: "2023-08-05" },
      ],
    }
    setJsonSample(JSON.stringify(exampleSample, null, 2))
    setJsonBaseUrl("http://localhost:8000")
    setJsonEndpointPath("/mock/products")
    setJsonHttpMethod("GET")
  }

  const canAnalyze =
    activeTab === "openapi"
      ? Boolean(specJson.trim() || specUrl.trim())
      : activeTab === "endpoint"
        ? Boolean(baseUrl.trim() && endpointPath.trim())
        : Boolean(jsonSample.trim() && jsonEndpointPath.trim())

  // Show loading screens
  if (loading) {
    return <SpookyLoader message="Analyzing your ancient API..." variant="analyze" />
  }

  if (generating) {
    return <SpookyLoader message="Generating your resurrection portal..." variant="generate" />
  }

  return (
    <div className="min-h-screen relative">
      <SpookyBackground />

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Animated skull logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <svg viewBox="0 0 80 100" className="w-20 h-24 relative z-10 ghost-float">
                <defs>
                  <linearGradient id="headerSkullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f0f0f0" />
                    <stop offset="100%" stopColor="#a0a0a0" />
                  </linearGradient>
                </defs>
                <ellipse cx="40" cy="38" rx="32" ry="35" fill="url(#headerSkullGradient)" />
                <ellipse cx="27" cy="35" rx="9" ry="11" fill="#0a0a0a" />
                <ellipse cx="53" cy="35" rx="9" ry="11" fill="#0a0a0a" />
                <ellipse cx="27" cy="35" rx="5" ry="6" fill="#22c55e" className="animate-pulse" />
                <ellipse cx="53" cy="35" rx="5" ry="6" fill="#22c55e" className="animate-pulse" />
                <path d="M36 48 L40 60 L44 48" fill="#1a1a1a" />
                <rect x="26" y="68" width="6" height="10" rx="1" fill="#d0d0d0" />
                <rect x="34" y="68" width="6" height="12" rx="1" fill="#d0d0d0" />
                <rect x="42" y="68" width="6" height="12" rx="1" fill="#d0d0d0" />
                <rect x="50" y="68" width="6" height="10" rx="1" fill="#d0d0d0" />
              </svg>
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-bold">
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)" }}
                >
                  REST API
                </span>{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #a855f7 0%, #f97316 100%)" }}
                >
                  Reviver
                </span>
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <FileJson className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium">OpenAPI & REST Services</span>
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Resurrect your dead APIs with modern, beautiful UIs.
            <span className="text-cyan-400"> No backend changes required.</span>
          </p>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-gray-400 hover:text-white hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to API Selection
        </Button>

        {!analyzed ? (
          // UPLOAD INTERFACE
          <Card className="bg-slate-900/90 backdrop-blur-sm border-cyan-500/30 shadow-2xl spooky-card">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-cyan-500 animate-pulse" />
                Step 1: Connect Your API
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Custom Tabs - Now with 3 tabs */}
              <div className="flex gap-2 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab("openapi")
                    setError("")
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === "openapi"
                      ? "bg-gradient-to-r from-cyan-600/30 to-green-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"
                  }`}
                >
                  <FileJson className="w-5 h-5" />
                  Use OpenAPI Spec
                </button>
                <button
                  onClick={() => {
                    setActiveTab("endpoint")
                    setError("")
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === "endpoint"
                      ? "bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-400 border border-purple-500/50 shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  Use Endpoint URL
                </button>
                <button
                  onClick={() => {
                    setActiveTab("json")
                    setError("")
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === "json"
                      ? "bg-gradient-to-r from-teal-600/30 to-emerald-500/20 text-teal-300 border border-teal-500/50 shadow-lg shadow-emerald-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Braces className="w-5 h-5" />
                  Use JSON Sample
                </button>
              </div>

              {/* OpenAPI Tab Content */}
              {activeTab === "openapi" && (
                <div className="space-y-4 animate-emerge">
                  <Textarea
                    value={specJson}
                    onChange={(e) => setSpecJson(e.target.value)}
                    placeholder='{"openapi": "3.0.0", "paths": {...}}'
                    className="min-h-[260px] font-mono text-sm bg-slate-950/80 text-cyan-400 border-cyan-500/30 focus:border-cyan-500 placeholder:text-gray-600 spooky-input"
                  />

                  {/* File upload + URL row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Upload OpenAPI file</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept=".json,.yaml,.yml"
                          onChange={handleSpecFileChange}
                          className="bg-slate-950/80 border-cyan-500/30 text-cyan-400 file:bg-gradient-to-r file:from-cyan-600 file:to-teal-600 file:border-0 file:text-sm file:font-medium file:text-white file:px-4 file:py-2 file:mr-3 file:rounded-lg file:cursor-pointer file:hover:from-cyan-700 file:hover:to-teal-700 file:transition-all file:shadow-lg file:shadow-cyan-500/20 file:flex file:items-center file:justify-center cursor-pointer"
                        />
                      </div>
                      {specFileName && <p className="text-xs text-gray-500 mt-1">Loaded file: {specFileName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">OpenAPI / Swagger URL</label>
                      <Input
                        value={specUrl}
                        onChange={(e) => setSpecUrl(e.target.value)}
                        placeholder="https://api.company.com/swagger.json"
                        className="bg-slate-950/80 border-cyan-500/30 text-cyan-400 focus:border-cyan-500 placeholder:text-gray-600"
                      />
                      <p className="text-xs text-gray-500">
                        Paste a docs URL like <span className="font-mono text-gray-300">/swagger.json</span> or{" "}
                        <span className="font-mono text-gray-300">/v3/api-docs</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={loadExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        HR Example
                      </Button>
                      <Button
                        variant="outline"
                        onClick={loadActivityExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Activity Log
                      </Button>
                      <Button
                        variant="outline"
                        onClick={loadProductsExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-violet-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Products
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500 font-mono">{specJson.length} characters</div>
                  </div>
                </div>
              )}

              {/* Endpoint Tab Content */}
              {activeTab === "endpoint" && (
                <div className="space-y-4 animate-emerge">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Base URL</label>
                      <Input
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://api.example.com"
                        className="bg-slate-950/80 border-purple-500/30 text-purple-400 focus:border-purple-500 placeholder:text-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Endpoint Path</label>
                      <Input
                        value={endpointPath}
                        onChange={(e) => setEndpointPath(e.target.value)}
                        placeholder="/api/v1/users"
                        className="bg-slate-950/80 border-purple-500/30 text-purple-400 focus:border-purple-500 placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">HTTP Method</label>
                      <Select value={httpMethod} onValueChange={(v) => setHttpMethod(v as HttpMethod)}>
                        <SelectTrigger className="bg-slate-950/80 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Authentication</label>
                      <Select value={authType} onValueChange={(v) => setAuthType(v as AuthType)}>
                        <SelectTrigger className="bg-slate-950/80 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="none">No Auth</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="api-key">API Key</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {authType !== "none" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        {authType === "bearer"
                          ? "Bearer Token"
                          : authType === "api-key"
                            ? "API Key"
                            : "Credentials (user:pass)"}
                      </label>
                      <Input
                        value={authValue}
                        onChange={(e) => setAuthValue(e.target.value)}
                        type="password"
                        placeholder={
                          authType === "bearer"
                            ? "Enter your token"
                            : authType === "api-key"
                              ? "Enter your API key"
                              : "username:password"
                        }
                        className="bg-slate-950/80 border-purple-500/30 text-purple-400 focus:border-purple-500 placeholder:text-gray-600"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Custom Headers (JSON)</label>
                    <Textarea
                      value={customHeaders}
                      onChange={(e) => setCustomHeaders(e.target.value)}
                      placeholder='{"X-Custom-Header": "value"}'
                      className="min-h-[80px] font-mono text-sm bg-slate-950/80 text-purple-400 border-purple-500/30 focus:border-purple-500 placeholder:text-gray-600"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={loadHREndpointExample}
                      className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 bg-transparent"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      HR Example
                    </Button>
                    <Button
                      variant="outline"
                      onClick={loadActivityEndpointExample}
                      className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 bg-transparent"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Activity Log
                    </Button>
                    <Button
                      variant="outline"
                      onClick={loadProductsEndpointExample}
                      className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-violet-500/50 bg-transparent"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Products
                    </Button>
                  </div>
                </div>
              )}

              {/* JSON Sample Tab Content */}
              {activeTab === "json" && (
                <div className="space-y-4 animate-emerge">
                  <Textarea
                    value={jsonSample}
                    onChange={(e) => setJsonSample(e.target.value)}
                    placeholder='{"Data": {"Users": [ { "user_id": 1, ... } ] }}'
                    className="min-h-[220px] font-mono text-sm bg-slate-950/80 text-teal-300 border-teal-500/30 focus:border-teal-500 placeholder:text-gray-600"
                  />

                  {/* Minimal connection info for JSON sample */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Base URL (optional)</label>
                      <Input
                        value={jsonBaseUrl}
                        onChange={(e) => setJsonBaseUrl(e.target.value)}
                        placeholder="https://api.example.com"
                        className="bg-slate-950/80 border-teal-500/30 text-teal-300 focus:border-teal-500 placeholder:text-gray-600"
                      />
                      <p className="text-xs text-gray-500">Leave empty if this is just a mock / design preview.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Endpoint Path</label>
                      <Input
                        value={jsonEndpointPath}
                        onChange={(e) => setJsonEndpointPath(e.target.value)}
                        placeholder="/api/v1/GetAllUsers"
                        className="bg-slate-950/80 border-teal-500/30 text-teal-300 focus:border-teal-500 placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <label className="text-sm font-medium text-gray-300">HTTP Method</label>
                    <Select value={jsonHttpMethod} onValueChange={(v) => setJsonHttpMethod(v as HttpMethod)}>
                      <SelectTrigger className="bg-slate-950/80 border-teal-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={loadHRJsonExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        HR Example
                      </Button>
                      <Button
                        variant="outline"
                        onClick={loadActivityJsonExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Activity Log
                      </Button>
                      <Button
                        variant="outline"
                        onClick={loadProductsJsonExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-violet-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Products
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500 font-mono">{jsonSample.length} characters</div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Paste any representative JSON response. The analyzer will infer fields and wire it to the given
                    endpoint.
                  </p>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 flex items-start gap-3">
                  <Skull className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full text-white text-lg py-6 necro-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Skull className="mr-2 w-5 h-5" />
                Analyze & Resurrect
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          // RESULTS INTERFACE
          <Card className="bg-slate-900/90 backdrop-blur-sm border-cyan-500/30 shadow-2xl spooky-card">
            <CardHeader className="border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">
                    Found {resources.length} Resource{resources.length !== 1 ? "s" : ""}
                  </CardTitle>
                  <p className="text-gray-400 mt-1">Your API has been analyzed and is ready for resurrection</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* STEP 1: Results - Show detected resources */}
              {currentStep === 'results' && resources.map((resource) => (
                <div
                  key={resource.name}
                  className="p-5 bg-slate-950/80 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        {resource.displayName}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {resource.fields.length} fields | {Array.isArray(resource.operations) ? resource.operations.length : Object.keys(resource.operations || {}).length} operations
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {(Array.isArray(resource.operations) ? resource.operations : Object.keys(resource.operations || {})).map((op) => (
                          <span
                            key={op}
                            className="text-xs px-3 py-1 bg-slate-800 text-gray-300 rounded-full border border-slate-700 hover:border-cyan-500/50 transition-colors"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Field Names Display */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Braces className="w-4 h-4 text-purple-400" />
                        Fields
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {resource.fields.map((field) => (
                          <div
                            key={field.name}
                            className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800 rounded hover:border-purple-500/30 transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <code className="text-xs font-mono text-purple-300 truncate">
                                {field.name}
                              </code>
                              {field.name === resource.primaryKey && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 font-semibold">
                                  PK
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-gray-400 rounded font-mono">
                                {field.type}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-purple-400 transition-colors" />
                              <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                                {field.displayName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* STEP 2: Review Schema - INLINE */}
              {currentStep === 'review' && (
                <div className="space-y-6 animate-emerge">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">Step 2: Review Schema</h3>
                    <p className="text-gray-400">Edit operations, fields, and types</p>
                  </div>
                  
                  {reviewedResources.map((resource, idx) => (
                    <div key={idx} className="p-5 bg-slate-950/80 border border-cyan-500/20 rounded-lg">
                      <h4 className="text-lg font-semibold text-cyan-400 mb-4">{resource.displayName}</h4>
                      
                      {/* Operations Toggles */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Operations</h5>
                        <p className="text-xs text-gray-500 mb-2">
                          💡 Tip: "Detail" is read-only. Selecting only "Detail" will disable create/update/delete operations.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(resource.operations).map(([op, enabled]) => {
                            // Check if only "detail" and "list" are enabled (read-only mode)
                            const isReadOnlyMode = resource.operations.detail && !resource.operations.create && !resource.operations.update && !resource.operations.delete
                            // Disable create/update/delete if user is trying to make it read-only
                            const shouldDisable = isReadOnlyMode && (op === 'create' || op === 'update' || op === 'delete')
                            
                            return (
                              <label 
                                key={op} 
                                className={`flex items-center gap-2 ${shouldDisable ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-pointer'}`}
                                title={shouldDisable ? 'Disabled in read-only mode (Detail only)' : ''}
                              >
                                <input
                                  type="checkbox"
                                  checked={Boolean(enabled)}
                                  disabled={shouldDisable}
                                  onChange={(e) => {
                                    const updated = [...reviewedResources]
                                    updated[idx].operations[op] = e.target.checked
                                    
                                    // If unchecking detail, auto-enable at least list
                                    if (op === 'detail' && !e.target.checked) {
                                      updated[idx].operations.list = true
                                    }
                                    
                                    setReviewedResources(updated)
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="capitalize">{op}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Fields Editor */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Fields</h5>
                        <div className="space-y-2">
                          {resource.fields.map((field: any, fieldIdx: number) => (
                            <div key={fieldIdx} className="flex items-center gap-4 p-2 bg-slate-800/50 rounded">
                              <input
                                type="checkbox"
                                checked={field.isVisible}
                                onChange={(e) => {
                                  const updated = [...reviewedResources]
                                  updated[idx].fields[fieldIdx].isVisible = e.target.checked
                                  setReviewedResources(updated)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-gray-300 min-w-[120px]">{field.displayName}</span>
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const updated = [...reviewedResources]
                                  updated[idx].fields[fieldIdx].type = e.target.value
                                  setReviewedResources(updated)
                                }}
                                className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-sm"
                              >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="date">Date</option>
                                <option value="email">Email</option>
                                <option value="url">URL</option>
                              </select>
                              <label className="flex items-center gap-1 text-xs text-gray-400">
                                <input
                                  type="radio"
                                  name={`primary-${idx}`}
                                  checked={field.isPrimaryKey}
                                  onChange={() => {
                                    const updated = [...reviewedResources]
                                    updated[idx].fields.forEach((f: any, i: number) => {
                                      f.isPrimaryKey = i === fieldIdx
                                    })
                                    setReviewedResources(updated)
                                  }}
                                  className="w-3 h-3"
                                />
                                Primary Key
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Customize Portal - INLINE */}
              {currentStep === 'customize' && (
                <div className="space-y-6 animate-emerge">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-purple-400 mb-2">Step 3: Customize Your Portal</h3>
                    <p className="text-gray-400">Choose features, theme, and colors</p>
                  </div>
                  
                  {/* Dashboard Features */}
                  <div className="p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">📊 Dashboard Features</h4>
                    <div className="space-y-2">
                      {Object.entries(uiCustomization.dashboard).map(([key, enabled]) => (
                        <label key={key} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setUiCustomization({
                              ...uiCustomization,
                              dashboard: { ...uiCustomization.dashboard, [key]: e.target.checked }
                            })}
                            className="w-4 h-4"
                          />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* List View Features */}
                  <div className="p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">📋 List View Features</h4>
                    <div className="space-y-2">
                      {Object.entries(uiCustomization.listView).map(([key, enabled]) => (
                        <label key={key} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setUiCustomization({
                              ...uiCustomization,
                              listView: { ...uiCustomization.listView, [key]: e.target.checked }
                            })}
                            className="w-4 h-4"
                          />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">🎨 Theme</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">Mode</label>
                        <div className="flex gap-2">
                          {(['light', 'auto', 'dark'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setUiCustomization({
                                ...uiCustomization,
                                theme: { ...uiCustomization.theme, mode }
                              })}
                              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                uiCustomization.theme.mode === mode
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                              }`}
                            >
                              {mode === 'light' && '☀️ Light'}
                              {mode === 'auto' && '🌗 Auto'}
                              {mode === 'dark' && '💀 Spooky/Dark'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">Accent Color</label>
                        <div className="flex gap-3">
                          {(['blue', 'green', 'purple', 'orange'] as const).map((color) => (
                            <button
                              key={color}
                              onClick={() => setUiCustomization({
                                ...uiCustomization,
                                theme: { ...uiCustomization.theme, accentColor: color }
                              })}
                              className={`w-10 h-10 rounded-full bg-${color}-500 transition-transform ${
                                uiCustomization.theme.accentColor === color
                                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                  : 'hover:scale-105'
                              }`}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Names Button - Only on results step */}
              {currentStep === 'results' && (
              <div className="pt-4 border-t border-slate-800">
                <Button
                  onClick={handleCleanNames}
                  disabled={cleaning}
                  variant="outline"
                  className="w-full text-purple-400 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-300 py-5"
                >
                  <Sparkles className={`mr-2 w-5 h-5 ${cleaning ? "animate-spin" : ""}`} />
                  {cleaning ? "Cleaning Field Names..." : "✨ Clean Field Names with AI"}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Use AI to intelligently clean technical field names (removes prefixes, expands abbreviations)
                </p>
              </div>
              )}

              {/* NAVIGATION BUTTONS */}
              {currentStep === 'results' && (
                <Button 
                  onClick={() => {
                    // Initialize reviewed resources from detected resources
                    // Default to read-only mode (list + detail only) for safety
                    const initialReviewed = resources.map(resource => ({
                      ...resource,
                      operations: {
                        list: true,
                        detail: true,
                        create: false,
                        update: false,
                        delete: false
                      },
                      fields: resource.fields.map(field => ({
                        ...field,
                        isVisible: true,
                        isPrimaryKey: field.name === 'id' || field.name.toLowerCase().includes('id')
                      }))
                    }))
                    setReviewedResources(initialReviewed)
                    setCurrentStep('review')
                  }} 
                  className="w-full text-white text-lg py-6 mt-6 portal-button"
                >
                  Next: Review Schema
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              )}

              {currentStep === 'review' && (
                <div className="flex gap-4 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep('results')}
                    className="flex-1 text-gray-300 border-slate-700 hover:bg-slate-800"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('customize')}
                    className="flex-1 text-white text-lg bg-cyan-600 hover:bg-cyan-700"
                  >
                    Next: Customize →
                  </Button>
                </div>
              )}

              {currentStep === 'customize' && (
                <div className="flex gap-4 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep('review')}
                    className="flex-1 text-gray-300 border-slate-700 hover:bg-slate-800"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={handleGenerate}
                    className="flex-1 text-white text-lg py-6 bg-purple-600 hover:bg-purple-700"
                  >
                    <Skull className="mr-2 w-5 h-5" />
                    Generate Portal 🚀
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  setAnalyzed(false)
                  setResources([])
                  setSpecJson("")
                  setSpecUrl("")
                  setSpecFileName("")
                  setBaseUrl("")
                  setEndpointPath("")
                  setAuthType("none")
                  setAuthValue("")
                  setCustomHeaders("")
                  setJsonSample("")
                  setJsonBaseUrl("")
                  setJsonEndpointPath("")
                  setJsonHttpMethod("GET")
                  setError("")
                }}
                className="w-full text-gray-400 hover:text-white hover:bg-slate-800/50"
              >
                ← Start Over
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
