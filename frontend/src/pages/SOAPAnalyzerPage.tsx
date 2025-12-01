"use client"

import { useState, ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Skull, Upload, FileCode, Globe, ChevronRight, Sparkles, Code2, ArrowLeft } from "lucide-react"
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

type SoapAuthType = "none" | "wsse" | "basic"
type SoapAnalyzerTab = "wsdl" | "endpoint" | "xml"

export default function SOAPAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<SoapAnalyzerTab>("wsdl")

  // WSDL spec state
  const [wsdlContent, setWsdlContent] = useState("")
  const [wsdlUrl, setWsdlUrl] = useState("")
  const [wsdlFileName, setWsdlFileName] = useState("")

  // XML sample state + connection info
  const [xmlSample, setXmlSample] = useState("")
  const [xmlBaseUrl, setXmlBaseUrl] = useState("")
  const [xmlSoapAction, setXmlSoapAction] = useState("")
  const [xmlOperationName, setXmlOperationName] = useState("")

  // SOAP Endpoint state
  const [soapBaseUrl, setSoapBaseUrl] = useState("")
  const [soapAction, setSoapAction] = useState("")
  const [soapAuthType, setSoapAuthType] = useState<SoapAuthType>("none")
  const [soapUsername, setSoapUsername] = useState("")
  const [soapPassword, setSoapPassword] = useState("")
  const [wsseToken, setWsseToken] = useState("")

  // Common state
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [resources, setResources] = useState<ResourceSchema[]>([])
  const [analyzed, setAnalyzed] = useState(false)

  const navigate = useNavigate()

  const buildFallbackResources = (): ResourceSchema[] => {
    return [
      {
        name: "customers",
        displayName: "Customers",
        endpoint: "/CustomerService.svc",
        primaryKey: "customer_id",
        fields: [
          { name: "customer_id", type: "number", displayName: "Customer ID" },
          { name: "company_name", type: "string", displayName: "Company Name" },
          { name: "contact_name", type: "string", displayName: "Contact Name" },
          { name: "contact_email", type: "email", displayName: "Contact Email" },
          { name: "phone_number", type: "string", displayName: "Phone Number" },
          { name: "account_status", type: "string", displayName: "Account Status" },
          { name: "created_date", type: "date", displayName: "Created Date" },
        ],
        operations: ["list", "detail", "create", "update"],
      },
    ]
  }

  const handleAnalyzeWSDL = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "wsdl",
        wsdlContent: wsdlContent,
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (wsdl) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeWSDLUrl = async () => {
    if (!wsdlUrl.trim()) {
      setError("Please enter a WSDL URL.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "wsdl_url",
        wsdlUrl: wsdlUrl.trim(),
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (wsdl_url) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeXmlSample = async () => {
    if (!xmlSample.trim()) {
      setError("Please paste an XML sample response.")
      return
    }

    if (!xmlOperationName.trim()) {
      setError("Please provide an operation name for the XML sample.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "soap_xml_sample",
        sampleXml: xmlSample,
        baseUrl: xmlBaseUrl.trim() || undefined,
        soapAction: xmlSoapAction.trim() || undefined,
        operationName: xmlOperationName.trim(),
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (soap_xml_sample) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeSoapEndpoint = async () => {
    if (!soapBaseUrl || !soapAction) {
      setError("Please provide both SOAP endpoint URL and SOAPAction.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:8000/api/analyze", {
        mode: "soap_endpoint",
        baseUrl: soapBaseUrl,
        soapAction: soapAction,
        authType: soapAuthType,
        username: soapUsername || undefined,
        password: soapPassword || undefined,
        wsseToken: wsseToken || undefined,
      })
      const backendResources = response.data.resources as ResourceSchema[]
      setResources(backendResources)
      setAnalyzed(true)
    } catch (err: any) {
      console.warn("Backend analyze (soap_endpoint) failed, using fallback resources.", err)
      setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.")
      const fallback = buildFallbackResources()
      setResources(fallback)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = () => {
    if (activeTab === "wsdl") {
      if (wsdlContent.trim()) {
        handleAnalyzeWSDL()
        return
      }
      if (wsdlUrl.trim()) {
        handleAnalyzeWSDLUrl()
        return
      }
      setError("Please paste a WSDL spec, upload a file, or enter a WSDL URL.")
      return
    }

    if (activeTab === "endpoint") {
      handleAnalyzeSoapEndpoint()
      return
    }

    // xml sample
    handleAnalyzeXmlSample()
  }

  const handleWsdlFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setWsdlFileName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      setWsdlContent(text)
      setWsdlUrl("")
    }
    reader.readAsText(file)
  }

  const handleGenerate = () => {
    setGenerating(true)
    localStorage.setItem("app-schema", JSON.stringify({ resources }))

    setTimeout(() => {
      navigate("/portal")
    }, 4500)
  }

  // Load Example WSDL (simplified for demo)
  const loadWsdlExample = () => {
    const exampleWsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://example.com/customerservice"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             name="CustomerService"
             targetNamespace="http://example.com/customerservice">

  <types>
    <xsd:schema targetNamespace="http://example.com/customerservice">
      <xsd:complexType name="Customer">
        <xsd:sequence>
          <xsd:element name="customer_id" type="xsd:int"/>
          <xsd:element name="company_name" type="xsd:string"/>
          <xsd:element name="contact_name" type="xsd:string"/>
          <xsd:element name="contact_email" type="xsd:string"/>
          <xsd:element name="phone_number" type="xsd:string"/>
          <xsd:element name="account_status" type="xsd:string"/>
          <xsd:element name="created_date" type="xsd:date"/>
        </xsd:sequence>
      </xsd:complexType>
      <xsd:complexType name="GetCustomersResponse">
        <xsd:sequence>
          <xsd:element name="customers" type="tns:Customer" maxOccurs="unbounded"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <message name="GetCustomersRequest"/>
  <message name="GetCustomersResponse">
    <part name="parameters" element="tns:GetCustomersResponse"/>
  </message>
  <message name="GetCustomerRequest">
    <part name="customer_id" type="xsd:int"/>
  </message>
  <message name="GetCustomerResponse">
    <part name="customer" element="tns:Customer"/>
  </message>
  <message name="CreateCustomerRequest">
    <part name="customer" element="tns:Customer"/>
  </message>
  <message name="CreateCustomerResponse">
    <part name="customer_id" type="xsd:int"/>
  </message>
  <message name="UpdateCustomerRequest">
    <part name="customer" element="tns:Customer"/>
  </message>
  <message name="UpdateCustomerResponse">
    <part name="success" type="xsd:boolean"/>
  </message>

  <portType name="CustomerServicePortType">
    <operation name="GetCustomers">
      <input message="tns:GetCustomersRequest"/>
      <output message="tns:GetCustomersResponse"/>
    </operation>
    <operation name="GetCustomer">
      <input message="tns:GetCustomerRequest"/>
      <output message="tns:GetCustomerResponse"/>
    </operation>
    <operation name="CreateCustomer">
      <input message="tns:CreateCustomerRequest"/>
      <output message="tns:CreateCustomerResponse"/>
    </operation>
    <operation name="UpdateCustomer">
      <input message="tns:UpdateCustomerRequest"/>
      <output message="tns:UpdateCustomerResponse"/>
    </operation>
  </portType>

  <binding name="CustomerServiceBinding" type="tns:CustomerServicePortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetCustomers">
      <soap:operation soapAction="http://example.com/GetCustomers"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="GetCustomer">
      <soap:operation soapAction="http://example.com/GetCustomer"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="CreateCustomer">
      <soap:operation soapAction="http://example.com/CreateCustomer"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="UpdateCustomer">
      <soap:operation soapAction="http://example.com/UpdateCustomer"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="CustomerService">
    <port name="CustomerServicePort" binding="tns:CustomerServiceBinding">
      <soap:address location="http://example.com/CustomerService.svc"/>
    </port>
  </service>
</definitions>`
    setWsdlContent(exampleWsdl)
    setWsdlUrl("")
    setWsdlFileName("")
  }

  const loadOrdersWsdlExample = () => {
    const ordersWsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://example.com/orderservice"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             name="OrderService"
             targetNamespace="http://example.com/orderservice">

  <types>
    <xsd:schema targetNamespace="http://example.com/orderservice">
      <xsd:complexType name="Order">
        <xsd:sequence>
          <xsd:element name="order_id" type="xsd:int"/>
          <xsd:element name="customer_id" type="xsd:int"/>
          <xsd:element name="order_date" type="xsd:dateTime"/>
          <xsd:element name="ship_date" type="xsd:dateTime"/>
          <xsd:element name="status" type="xsd:string"/>
          <xsd:element name="total_amount" type="xsd:decimal"/>
          <xsd:element name="shipping_address" type="xsd:string"/>
          <xsd:element name="is_priority" type="xsd:boolean"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <message name="GetOrdersRequest"/>
  <message name="GetOrdersResponse">
    <part name="orders" element="tns:Order"/>
  </message>
  <message name="GetOrderRequest">
    <part name="order_id" type="xsd:int"/>
  </message>
  <message name="GetOrderResponse">
    <part name="order" element="tns:Order"/>
  </message>
  <message name="CreateOrderRequest">
    <part name="order" element="tns:Order"/>
  </message>
  <message name="CreateOrderResponse">
    <part name="order_id" type="xsd:int"/>
  </message>

  <portType name="OrderServicePortType">
    <operation name="GetOrders">
      <input message="tns:GetOrdersRequest"/>
      <output message="tns:GetOrdersResponse"/>
    </operation>
    <operation name="GetOrder">
      <input message="tns:GetOrderRequest"/>
      <output message="tns:GetOrderResponse"/>
    </operation>
    <operation name="CreateOrder">
      <input message="tns:CreateOrderRequest"/>
      <output message="tns:CreateOrderResponse"/>
    </operation>
  </portType>

  <binding name="OrderServiceBinding" type="tns:OrderServicePortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetOrders">
      <soap:operation soapAction="http://example.com/GetOrders"/>
    </operation>
    <operation name="GetOrder">
      <soap:operation soapAction="http://example.com/GetOrder"/>
    </operation>
    <operation name="CreateOrder">
      <soap:operation soapAction="http://example.com/CreateOrder"/>
    </operation>
  </binding>

  <service name="OrderService">
    <port name="OrderServicePort" binding="tns:OrderServiceBinding">
      <soap:address location="http://example.com/OrderService.svc"/>
    </port>
  </service>
</definitions>`
    setWsdlContent(ordersWsdl)
    setWsdlUrl("")
    setWsdlFileName("")
  }

  const loadBankingWsdlExample = () => {
    const bankingWsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://example.com/bankingservice"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             name="BankingService"
             targetNamespace="http://example.com/bankingservice">

  <types>
    <xsd:schema targetNamespace="http://example.com/bankingservice">
      <xsd:complexType name="Account">
        <xsd:sequence>
          <xsd:element name="account_number" type="xsd:string"/>
          <xsd:element name="account_holder" type="xsd:string"/>
          <xsd:element name="account_type" type="xsd:string"/>
          <xsd:element name="balance" type="xsd:decimal"/>
          <xsd:element name="currency" type="xsd:string"/>
          <xsd:element name="opened_date" type="xsd:date"/>
          <xsd:element name="is_active" type="xsd:boolean"/>
          <xsd:element name="branch_code" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <message name="GetAccountsRequest"/>
  <message name="GetAccountsResponse">
    <part name="accounts" element="tns:Account"/>
  </message>
  <message name="GetAccountRequest">
    <part name="account_number" type="xsd:string"/>
  </message>
  <message name="GetAccountResponse">
    <part name="account" element="tns:Account"/>
  </message>

  <portType name="BankingServicePortType">
    <operation name="GetAccounts">
      <input message="tns:GetAccountsRequest"/>
      <output message="tns:GetAccountsResponse"/>
    </operation>
    <operation name="GetAccount">
      <input message="tns:GetAccountRequest"/>
      <output message="tns:GetAccountResponse"/>
    </operation>
  </portType>

  <binding name="BankingServiceBinding" type="tns:BankingServicePortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetAccounts">
      <soap:operation soapAction="http://example.com/GetAccounts"/>
    </operation>
    <operation name="GetAccount">
      <soap:operation soapAction="http://example.com/GetAccount"/>
    </operation>
  </binding>

  <service name="BankingService">
    <port name="BankingServicePort" binding="tns:BankingServiceBinding">
      <soap:address location="http://example.com/BankingService.svc"/>
    </port>
  </service>
</definitions>`
    setWsdlContent(bankingWsdl)
    setWsdlUrl("")
    setWsdlFileName("")
  }

  const loadSoapEndpointExample = () => {
    setSoapBaseUrl("https://api.example.com/CustomerService.svc")
    setSoapAction("http://example.com/GetCustomers")
    setSoapAuthType("wsse")
    setSoapUsername("service_user")
    setSoapPassword("")
  }

  const loadXmlExample = () => {
    const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCustomersResponse xmlns="http://example.com/customerservice">
      <customers>
        <Customer>
          <customer_id>1001</customer_id>
          <company_name>Acme Corporation</company_name>
          <contact_name>John Smith</contact_name>
          <contact_email>john.smith@acme.com</contact_email>
          <phone_number>+1-555-123-4567</phone_number>
          <account_status>Active</account_status>
          <created_date>2020-03-15</created_date>
        </Customer>
        <Customer>
          <customer_id>1002</customer_id>
          <company_name>GlobalTech Industries</company_name>
          <contact_name>Sarah Johnson</contact_name>
          <contact_email>s.johnson@globaltech.com</contact_email>
          <phone_number>+1-555-987-6543</phone_number>
          <account_status>Active</account_status>
          <created_date>2019-08-22</created_date>
        </Customer>
      </customers>
    </GetCustomersResponse>
  </soap:Body>
</soap:Envelope>`
    setXmlSample(exampleXml)
    setXmlBaseUrl("https://api.example.com/CustomerService.svc")
    setXmlSoapAction("http://example.com/GetCustomers")
    setXmlOperationName("GetCustomers")
  }

  const canAnalyze =
    activeTab === "wsdl"
      ? Boolean(wsdlContent.trim() || wsdlUrl.trim())
      : activeTab === "endpoint"
        ? Boolean(soapBaseUrl.trim() && soapAction.trim())
        : Boolean(xmlSample.trim() && xmlOperationName.trim())

  // Show loading screens
  if (loading) {
    return <SpookyLoader message="Decoding your ancient SOAP service..." variant="analyze" />
  }

  if (generating) {
    return <SpookyLoader message="Generating your resurrection portal..." variant="generate" />
  }

  return (
    <div className="min-h-screen relative">
      <SpookyBackground />

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-gray-400 hover:text-white hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to API Selection
        </Button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Animated skull logo with purple theme */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <svg viewBox="0 0 80 100" className="w-20 h-24 relative z-10 ghost-float">
                <defs>
                  <linearGradient id="soapSkullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f0f0f0" />
                    <stop offset="100%" stopColor="#a0a0a0" />
                  </linearGradient>
                </defs>
                <ellipse cx="40" cy="38" rx="32" ry="35" fill="url(#soapSkullGradient)" />
                <ellipse cx="27" cy="35" rx="9" ry="11" fill="#0a0a0a" />
                <ellipse cx="53" cy="35" rx="9" ry="11" fill="#0a0a0a" />
                <ellipse cx="27" cy="35" rx="5" ry="6" fill="#a855f7" className="animate-pulse" />
                <ellipse cx="53" cy="35" rx="5" ry="6" fill="#a855f7" className="animate-pulse" />
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
                  style={{ backgroundImage: "linear-gradient(135deg, #a855f7 0%, #c084fc 50%, #a855f7 100%)" }}
                >
                  SOAP API
                </span>{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #f97316 100%)" }}
                >
                  Reviver
                </span>
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium">Enterprise XML Services</span>
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Resurrect your legacy SOAP services with modern UIs.
            <span className="text-purple-400"> WSDL to React in seconds.</span>
          </p>
        </div>

        {!analyzed ? (
          // UPLOAD INTERFACE
          <Card className="bg-slate-900/90 backdrop-blur-sm border-purple-500/30 shadow-2xl spooky-card">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                Step 1: Connect Your SOAP Service
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Custom Tabs */}
              <div className="flex gap-2 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab("wsdl")
                    setError("")
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === "wsdl"
                      ? "bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-400 border border-purple-500/50 shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"
                  }`}
                >
                  <FileCode className="w-5 h-5" />
                  Use WSDL
                </button>
                <button
                  onClick={() => {
                    setActiveTab("endpoint")
                    setError("")
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === "endpoint"
                      ? "bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  Use SOAP Endpoint
                </button>
                <button
                  onClick={() => {
                    setActiveTab("xml")
                    setError("")
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === "xml"
                      ? "bg-gradient-to-r from-cyan-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Code2 className="w-5 h-5" />
                  Use XML Sample
                </button>
              </div>

              {/* WSDL Tab Content */}
              {activeTab === "wsdl" && (
                <div className="space-y-4 animate-emerge">
                  <Textarea
                    value={wsdlContent}
                    onChange={(e) => setWsdlContent(e.target.value)}
                    placeholder='<?xml version="1.0"?><definitions xmlns="http://schemas.xmlsoap.org/wsdl/">...</definitions>'
                    className="min-h-[260px] font-mono text-sm bg-slate-950/80 text-purple-400 border-purple-500/30 focus:border-purple-500 placeholder:text-gray-600"
                  />

                  {/* File upload + URL row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Upload WSDL file</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept=".wsdl,.xml"
                          onChange={handleWsdlFileChange}
                          className="bg-slate-950/80 border-purple-500/30 text-purple-400 file:bg-slate-900 file:border-0 file:text-sm file:text-gray-300 file:px-3 file:py-1.5"
                        />
                      </div>
                      {wsdlFileName && <p className="text-xs text-gray-500 mt-1">Loaded file: {wsdlFileName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">WSDL URL</label>
                      <Input
                        value={wsdlUrl}
                        onChange={(e) => setWsdlUrl(e.target.value)}
                        placeholder="https://api.company.com/Service.svc?wsdl"
                        className="bg-slate-950/80 border-purple-500/30 text-purple-400 focus:border-purple-500 placeholder:text-gray-600"
                      />
                      <p className="text-xs text-gray-500">
                        URL ending in <span className="font-mono text-gray-300">?wsdl</span> or{" "}
                        <span className="font-mono text-gray-300">?singleWsdl</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={loadWsdlExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Customer Service
                      </Button>
                      <Button
                        variant="outline"
                        onClick={loadOrdersWsdlExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Order Service
                      </Button>
                      <Button
                        variant="outline"
                        onClick={loadBankingWsdlExample}
                        className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Banking Service
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500 font-mono">{wsdlContent.length} characters</div>
                  </div>
                </div>
              )}

              {/* SOAP Endpoint Tab Content */}
              {activeTab === "endpoint" && (
                <div className="space-y-4 animate-emerge">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">SOAP Endpoint URL</label>
                      <Input
                        value={soapBaseUrl}
                        onChange={(e) => setSoapBaseUrl(e.target.value)}
                        placeholder="https://api.example.com/Service.svc"
                        className="bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">SOAPAction Header</label>
                      <Input
                        value={soapAction}
                        onChange={(e) => setSoapAction(e.target.value)}
                        placeholder="http://example.com/GetCustomers"
                        className="bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Authentication</label>
                    <Select value={soapAuthType} onValueChange={(v) => setSoapAuthType(v as SoapAuthType)}>
                      <SelectTrigger className="bg-slate-950/80 border-amber-500/30 text-white max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="none">No Authentication</SelectItem>
                        <SelectItem value="wsse">WS-Security (WSSE)</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {soapAuthType === "wsse" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <Input
                          value={soapUsername}
                          onChange={(e) => setSoapUsername(e.target.value)}
                          placeholder="service_user"
                          className="bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <Input
                          type="password"
                          value={soapPassword}
                          onChange={(e) => setSoapPassword(e.target.value)}
                          placeholder="Enter password"
                          className="bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                  )}

                  {soapAuthType === "basic" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <Input
                          value={soapUsername}
                          onChange={(e) => setSoapUsername(e.target.value)}
                          placeholder="username"
                          className="bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <Input
                          type="password"
                          value={soapPassword}
                          onChange={(e) => setSoapPassword(e.target.value)}
                          placeholder="password"
                          className="bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={loadSoapEndpointExample}
                    className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 bg-transparent"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Load Example Endpoint
                  </Button>
                </div>
              )}

              {/* XML Sample Tab Content */}
              {activeTab === "xml" && (
                <div className="space-y-4 animate-emerge">
                  <Textarea
                    value={xmlSample}
                    onChange={(e) => setXmlSample(e.target.value)}
                    placeholder='<?xml version="1.0"?><soap:Envelope>...</soap:Envelope>'
                    className="min-h-[220px] font-mono text-sm bg-slate-950/80 text-cyan-300 border-cyan-500/30 focus:border-cyan-500 placeholder:text-gray-600"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Base URL (optional)</label>
                      <Input
                        value={xmlBaseUrl}
                        onChange={(e) => setXmlBaseUrl(e.target.value)}
                        placeholder="https://api.example.com"
                        className="bg-slate-950/80 border-cyan-500/30 text-cyan-300 focus:border-cyan-500 placeholder:text-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">SOAPAction (optional)</label>
                      <Input
                        value={xmlSoapAction}
                        onChange={(e) => setXmlSoapAction(e.target.value)}
                        placeholder="http://example.com/Action"
                        className="bg-slate-950/80 border-cyan-500/30 text-cyan-300 focus:border-cyan-500 placeholder:text-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Operation Name</label>
                      <Input
                        value={xmlOperationName}
                        onChange={(e) => setXmlOperationName(e.target.value)}
                        placeholder="GetCustomers"
                        className="bg-slate-950/80 border-cyan-500/30 text-cyan-300 focus:border-cyan-500 placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={loadXmlExample}
                      className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 bg-transparent"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Load Example Response
                    </Button>
                    <div className="text-sm text-gray-500 font-mono">{xmlSample.length} characters</div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Paste a SOAP response envelope. The analyzer will extract fields from the response body.
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
                className="w-full text-white text-lg py-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Skull className="mr-2 w-5 h-5" />
                Analyze & Resurrect
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          // RESULTS INTERFACE
          <Card className="bg-slate-900/90 backdrop-blur-sm border-purple-500/30 shadow-2xl spooky-card">
            <CardHeader className="border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">
                    Found {resources.length} Resource{resources.length !== 1 ? "s" : ""}
                  </CardTitle>
                  <p className="text-gray-400 mt-1">Your SOAP service has been analyzed and is ready for resurrection</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {resources.map((resource) => (
                <div
                  key={resource.name}
                  className="p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        {resource.displayName}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {resource.fields.length} fields | {resource.operations.length} operations
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {resource.operations.map((op) => (
                          <span
                            key={op}
                            className="text-xs px-3 py-1 bg-slate-800 text-gray-300 rounded-full border border-slate-700 hover:border-purple-500/50 transition-colors"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleGenerate}
                className="w-full text-white text-lg py-6 mt-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
              >
                <Skull className="mr-2 w-5 h-5" />
                Generate Portal
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setAnalyzed(false)
                  setResources([])
                  setWsdlContent("")
                  setWsdlUrl("")
                  setWsdlFileName("")
                  setSoapBaseUrl("")
                  setSoapAction("")
                  setSoapAuthType("none")
                  setSoapUsername("")
                  setSoapPassword("")
                  setWsseToken("")
                  setXmlSample("")
                  setXmlBaseUrl("")
                  setXmlSoapAction("")
                  setXmlOperationName("")
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