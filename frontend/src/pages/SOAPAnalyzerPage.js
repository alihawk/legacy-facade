"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skull, Upload, FileCode, Globe, ChevronRight, Sparkles, Code2, ArrowLeft, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SpookyBackground from "@/components/SpookyBackground";
import SpookyLoader from "@/components/SpookyLoader";
import axios from "axios";
export default function SOAPAnalyzerPage() {
    const [activeTab, setActiveTab] = useState("wsdl");
    // WSDL spec state
    const [wsdlContent, setWsdlContent] = useState("");
    const [wsdlUrl, setWsdlUrl] = useState("");
    const [wsdlFileName, setWsdlFileName] = useState("");
    // XML sample state + connection info
    const [xmlSample, setXmlSample] = useState("");
    const [xmlBaseUrl, setXmlBaseUrl] = useState("");
    const [xmlSoapAction, setXmlSoapAction] = useState("");
    const [xmlOperationName, setXmlOperationName] = useState("");
    // SOAP Endpoint state
    const [soapBaseUrl, setSoapBaseUrl] = useState("");
    const [soapAction, setSoapAction] = useState("");
    const [soapAuthType, setSoapAuthType] = useState("none");
    const [soapUsername, setSoapUsername] = useState("");
    const [soapPassword, setSoapPassword] = useState("");
    const [wsseToken, setWsseToken] = useState("");
    // Common state
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [resources, setResources] = useState([]);
    const [analyzed, setAnalyzed] = useState(false);
    // Review/Customization flow state - MATCHING AnalyzerPage
    const [currentStep, setCurrentStep] = useState('results');
    const [reviewedResources, setReviewedResources] = useState([]);
    const [detectedBaseUrl, setDetectedBaseUrl] = useState("");
    const [uiCustomization, setUiCustomization] = useState({
        dashboard: { statsCards: true, barChart: true, recentActivity: true },
        listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true },
        forms: { smartInputs: true },
        theme: { mode: 'auto', accentColor: 'purple' }
    });
    const navigate = useNavigate();
    const buildFallbackResources = () => {
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
        ];
    };
    const handleAnalyzeWSDL = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.post("http://localhost:8000/api/analyze", {
                mode: "wsdl",
                wsdlContent: wsdlContent,
            });
            const backendResources = response.data.resources;
            setResources(backendResources);
            // Capture baseUrl from response if available
            if (response.data.baseUrl) {
                setDetectedBaseUrl(response.data.baseUrl);
            }
            setAnalyzed(true);
        }
        catch (err) {
            console.warn("Backend analyze (wsdl) failed, using fallback resources.", err);
            setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.");
            const fallback = buildFallbackResources();
            setResources(fallback);
            setAnalyzed(true);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAnalyzeWSDLUrl = async () => {
        if (!wsdlUrl.trim()) {
            setError("Please enter a WSDL URL.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await axios.post("http://localhost:8000/api/analyze", {
                mode: "wsdl_url",
                wsdlUrl: wsdlUrl.trim(),
            });
            const backendResources = response.data.resources;
            setResources(backendResources);
            // Capture baseUrl from response if available
            if (response.data.baseUrl) {
                setDetectedBaseUrl(response.data.baseUrl);
            }
            setAnalyzed(true);
        }
        catch (err) {
            console.warn("Backend analyze (wsdl_url) failed, using fallback resources.", err);
            setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.");
            const fallback = buildFallbackResources();
            setResources(fallback);
            setAnalyzed(true);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAnalyzeXmlSample = async () => {
        if (!xmlSample.trim()) {
            setError("Please paste an XML sample response.");
            return;
        }
        if (!xmlOperationName.trim()) {
            setError("Please provide an operation name for the XML sample.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await axios.post("http://localhost:8000/api/analyze", {
                mode: "soap_xml_sample",
                sampleXml: xmlSample,
                baseUrl: xmlBaseUrl.trim() || undefined,
                soapAction: xmlSoapAction.trim() || undefined,
                operationName: xmlOperationName.trim(),
            });
            const backendResources = response.data.resources;
            setResources(backendResources);
            // Use provided baseUrl or captured from response
            if (response.data.baseUrl) {
                setDetectedBaseUrl(response.data.baseUrl);
            }
            else if (xmlBaseUrl.trim()) {
                setDetectedBaseUrl(xmlBaseUrl.trim());
            }
            setAnalyzed(true);
        }
        catch (err) {
            console.warn("Backend analyze (soap_xml_sample) failed, using fallback resources.", err);
            setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.");
            const fallback = buildFallbackResources();
            setResources(fallback);
            setAnalyzed(true);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAnalyzeSoapEndpoint = async () => {
        if (!soapBaseUrl || !soapAction) {
            setError("Please provide both SOAP endpoint URL and SOAPAction.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await axios.post("http://localhost:8000/api/analyze", {
                mode: "soap_endpoint",
                baseUrl: soapBaseUrl,
                soapAction: soapAction,
                authType: soapAuthType,
                username: soapUsername || undefined,
                password: soapPassword || undefined,
                wsseToken: wsseToken || undefined,
            });
            const backendResources = response.data.resources;
            setResources(backendResources);
            // Use provided baseUrl or captured from response
            if (response.data.baseUrl) {
                setDetectedBaseUrl(response.data.baseUrl);
            }
            else if (soapBaseUrl) {
                setDetectedBaseUrl(soapBaseUrl);
            }
            setAnalyzed(true);
        }
        catch (err) {
            console.warn("Backend analyze (soap_endpoint) failed, using fallback resources.", err);
            setError(err?.response?.data?.detail || "Backend not reachable. Using local demo resources.");
            const fallback = buildFallbackResources();
            setResources(fallback);
            setAnalyzed(true);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAnalyze = () => {
        if (activeTab === "wsdl") {
            if (wsdlContent.trim()) {
                handleAnalyzeWSDL();
                return;
            }
            if (wsdlUrl.trim()) {
                handleAnalyzeWSDLUrl();
                return;
            }
            setError("Please paste a WSDL spec, upload a file, or enter a WSDL URL.");
            return;
        }
        if (activeTab === "endpoint") {
            handleAnalyzeSoapEndpoint();
            return;
        }
        // xml sample
        handleAnalyzeXmlSample();
    };
    const handleWsdlFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setWsdlFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result || "");
            setWsdlContent(text);
            setWsdlUrl("");
        };
        reader.readAsText(file);
    };
    const handleGenerate = async () => {
        setGenerating(true);
        // Use REVIEWED resources if available, otherwise use detected resources
        const rawSchema = reviewedResources.length > 0 ? reviewedResources : resources;
        // Normalize operations to array format for consistency
        const schemaToUse = rawSchema.map((resource) => ({
            ...resource,
            // Convert operations object {list: true, detail: true} to array ["list", "detail"]
            operations: Array.isArray(resource.operations)
                ? resource.operations
                : Object.entries(resource.operations || {})
                    .filter(([_, enabled]) => enabled)
                    .map(([op]) => op)
        }));
        // Store schema with baseUrl and apiType for proxy configuration
        localStorage.setItem("app-schema", JSON.stringify({
            resources: schemaToUse,
            baseUrl: detectedBaseUrl || undefined,
            apiType: 'soap'
        }));
        // Save UI customization settings
        localStorage.setItem("portal-customization", JSON.stringify(uiCustomization));
        // CRITICAL: Save proxy configuration so the proxy can forward to real SOAP API
        if (detectedBaseUrl) {
            try {
                const proxyConfig = {
                    baseUrl: detectedBaseUrl,
                    apiType: 'soap',
                    auth: { mode: 'none' },
                    soapNamespace: 'http://example.com/service', // Default namespace
                    resources: schemaToUse.map((resource) => ({
                        name: resource.name.toLowerCase(),
                        endpoint: resource.endpoint,
                        operations: buildSoapProxyOperations(resource),
                        responsePath: 'Data',
                        fieldMappings: []
                    }))
                };
                await axios.post("http://localhost:8000/api/proxy/config", proxyConfig);
                console.log("✓ SOAP Proxy configuration saved");
            }
            catch (err) {
                console.warn("Could not save proxy config:", err);
                // Continue anyway - portal will use mock data
            }
        }
        // Navigate directly to portal with necromancer animation
        setTimeout(() => {
            navigate("/portal");
        }, 4500);
    };
    // Helper to build SOAP proxy operations from resource schema
    const buildSoapProxyOperations = (resource) => {
        const ops = {};
        const operations = Array.isArray(resource.operations)
            ? resource.operations
            : Object.keys(resource.operations || {}).filter(k => resource.operations[k]);
        const pascalName = resource.name.charAt(0).toUpperCase() + resource.name.slice(1);
        operations.forEach((op) => {
            switch (op) {
                case 'list':
                    ops.list = { soap: { operationName: `Get${pascalName}`, soapAction: `Get${pascalName}`, responseElement: `Get${pascalName}Response` } };
                    break;
                case 'detail':
                    ops.detail = { soap: { operationName: `Get${pascalName}ById`, soapAction: `Get${pascalName}ById`, responseElement: `Get${pascalName}ByIdResponse` } };
                    break;
                case 'create':
                    ops.create = { soap: { operationName: `Create${pascalName}`, soapAction: `Create${pascalName}`, responseElement: `Create${pascalName}Response` } };
                    break;
                case 'update':
                    ops.update = { soap: { operationName: `Update${pascalName}`, soapAction: `Update${pascalName}`, responseElement: `Update${pascalName}Response` } };
                    break;
                case 'delete':
                    ops.delete = { soap: { operationName: `Delete${pascalName}`, soapAction: `Delete${pascalName}`, responseElement: `Delete${pascalName}Response` } };
                    break;
            }
        });
        return ops;
    };
    // Load Example WSDL - Customer Service
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
          <xsd:element name="first_name" type="xsd:string"/>
          <xsd:element name="last_name" type="xsd:string"/>
          <xsd:element name="email" type="xsd:string"/>
          <xsd:element name="phone" type="xsd:string"/>
          <xsd:element name="company" type="xsd:string"/>
          <xsd:element name="status" type="xsd:string"/>
          <xsd:element name="created_at" type="xsd:date"/>
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
      <soap:address location="http://localhost:8000/mock/customers"/>
    </port>
  </service>
</definitions>`;
        setWsdlContent(exampleWsdl);
        setWsdlUrl("");
        setWsdlFileName("");
    };
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
          <xsd:element name="total_amount" type="xsd:decimal"/>
          <xsd:element name="status" type="xsd:string"/>
          <xsd:element name="shipping_address" type="xsd:string"/>
          <xsd:element name="items_count" type="xsd:int"/>
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
      <soap:address location="http://localhost:8000/mock/orders"/>
    </port>
  </service>
</definitions>`;
        setWsdlContent(ordersWsdl);
        setWsdlUrl("");
        setWsdlFileName("");
    };
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
          <xsd:element name="account_id" type="xsd:string"/>
          <xsd:element name="account_holder" type="xsd:string"/>
          <xsd:element name="account_type" type="xsd:string"/>
          <xsd:element name="balance" type="xsd:decimal"/>
          <xsd:element name="currency" type="xsd:string"/>
          <xsd:element name="status" type="xsd:string"/>
          <xsd:element name="opened_date" type="xsd:date"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <message name="GetAccountsRequest"/>
  <message name="GetAccountsResponse">
    <part name="accounts" element="tns:Account"/>
  </message>
  <message name="GetAccountRequest">
    <part name="account_id" type="xsd:string"/>
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
      <soap:address location="http://localhost:8000/mock/accounts"/>
    </port>
  </service>
</definitions>`;
        setWsdlContent(bankingWsdl);
        setWsdlUrl("");
        setWsdlFileName("");
    };
    // SOAP Endpoint examples - using mock data endpoints
    const loadCustomerEndpointExample = () => {
        setSoapBaseUrl("http://localhost:8000/mock/soap/customers");
        setSoapAction("http://example.com/GetCustomers");
        setSoapAuthType("none");
        setSoapUsername("");
        setSoapPassword("");
    };
    const loadOrderEndpointExample = () => {
        setSoapBaseUrl("http://localhost:8000/mock/soap/orders");
        setSoapAction("http://example.com/GetOrders");
        setSoapAuthType("none");
        setSoapUsername("");
        setSoapPassword("");
    };
    const loadBankingEndpointExample = () => {
        setSoapBaseUrl("http://localhost:8000/mock/soap/accounts");
        setSoapAction("http://example.com/GetAccounts");
        setSoapAuthType("wsse");
        setSoapUsername("bank_user");
        setSoapPassword("");
    };
    // XML Sample examples
    const loadCustomerXmlExample = () => {
        const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCustomersResponse xmlns="http://example.com/customerservice">
      <customers>
        <Customer>
          <customer_id>1001</customer_id>
          <first_name>John</first_name>
          <last_name>Smith</last_name>
          <email>john.smith@email.com</email>
          <phone>+1-555-0101</phone>
          <company>Acme Corp</company>
          <status>active</status>
          <created_at>2022-03-15</created_at>
        </Customer>
        <Customer>
          <customer_id>1002</customer_id>
          <first_name>Maria</first_name>
          <last_name>Garcia</last_name>
          <email>maria.garcia@email.com</email>
          <phone>+1-555-0102</phone>
          <company>TechStart Inc</company>
          <status>active</status>
          <created_at>2022-05-20</created_at>
        </Customer>
      </customers>
    </GetCustomersResponse>
  </soap:Body>
</soap:Envelope>`;
        setXmlSample(exampleXml);
        setXmlBaseUrl("http://localhost:8000/mock/customers");
        setXmlSoapAction("http://example.com/GetCustomers");
        setXmlOperationName("GetCustomers");
    };
    const loadOrderXmlExample = () => {
        const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetOrdersResponse xmlns="http://example.com/orderservice">
      <orders>
        <Order>
          <order_id>5001</order_id>
          <customer_id>1001</customer_id>
          <order_date>2024-01-10</order_date>
          <total_amount>1549.98</total_amount>
          <status>delivered</status>
          <shipping_address>123 Main St, New York, NY 10001</shipping_address>
          <items_count>3</items_count>
        </Order>
        <Order>
          <order_id>5002</order_id>
          <customer_id>1002</customer_id>
          <order_date>2024-01-12</order_date>
          <total_amount>299.99</total_amount>
          <status>shipped</status>
          <shipping_address>456 Oak Ave, Los Angeles, CA 90001</shipping_address>
          <items_count>1</items_count>
        </Order>
      </orders>
    </GetOrdersResponse>
  </soap:Body>
</soap:Envelope>`;
        setXmlSample(exampleXml);
        setXmlBaseUrl("http://localhost:8000/mock/orders");
        setXmlSoapAction("http://example.com/GetOrders");
        setXmlOperationName("GetOrders");
    };
    const loadBankingXmlExample = () => {
        const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAccountsResponse xmlns="http://example.com/bankingservice">
      <accounts>
        <Account>
          <account_id>ACC-001</account_id>
          <account_holder>John Smith</account_holder>
          <account_type>checking</account_type>
          <balance>15420.50</balance>
          <currency>USD</currency>
          <status>active</status>
          <opened_date>2020-01-15</opened_date>
        </Account>
        <Account>
          <account_id>ACC-002</account_id>
          <account_holder>Maria Garcia</account_holder>
          <account_type>savings</account_type>
          <balance>52340.75</balance>
          <currency>USD</currency>
          <status>active</status>
          <opened_date>2019-06-20</opened_date>
        </Account>
      </accounts>
    </GetAccountsResponse>
  </soap:Body>
</soap:Envelope>`;
        setXmlSample(exampleXml);
        setXmlBaseUrl("http://localhost:8000/mock/accounts");
        setXmlSoapAction("http://example.com/GetAccounts");
        setXmlOperationName("GetAccounts");
    };
    const canAnalyze = activeTab === "wsdl"
        ? Boolean(wsdlContent.trim() || wsdlUrl.trim())
        : activeTab === "endpoint"
            ? Boolean(soapBaseUrl.trim() && soapAction.trim())
            : Boolean(xmlSample.trim() && xmlOperationName.trim());
    // Show loading screens
    if (loading) {
        return _jsx(SpookyLoader, { message: "Decoding your ancient SOAP service...", variant: "analyze" });
    }
    if (generating) {
        return _jsx(SpookyLoader, { message: "Generating your resurrection portal...", variant: "generate" });
    }
    return (_jsxs("div", { className: "min-h-screen relative", children: [_jsx(SpookyBackground, {}), _jsxs("div", { className: "container mx-auto px-4 py-12 max-w-5xl relative z-10", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate("/"), className: "mb-6 text-gray-400 hover:text-white hover:bg-slate-800/50", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to API Selection"] }), _jsxs("div", { className: "text-center mb-10", children: [_jsxs("div", { className: "flex items-center justify-center gap-4 mb-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-30 animate-pulse" }), _jsxs("svg", { viewBox: "0 0 80 100", className: "w-20 h-24 relative z-10 ghost-float", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "soapSkullGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#f0f0f0" }), _jsx("stop", { offset: "100%", stopColor: "#a0a0a0" })] }) }), _jsx("ellipse", { cx: "40", cy: "38", rx: "32", ry: "35", fill: "url(#soapSkullGradient)" }), _jsx("ellipse", { cx: "27", cy: "35", rx: "9", ry: "11", fill: "#0a0a0a" }), _jsx("ellipse", { cx: "53", cy: "35", rx: "9", ry: "11", fill: "#0a0a0a" }), _jsx("ellipse", { cx: "27", cy: "35", rx: "5", ry: "6", fill: "#a855f7", className: "animate-pulse" }), _jsx("ellipse", { cx: "53", cy: "35", rx: "5", ry: "6", fill: "#a855f7", className: "animate-pulse" }), _jsx("path", { d: "M36 48 L40 60 L44 48", fill: "#1a1a1a" }), _jsx("rect", { x: "26", y: "68", width: "6", height: "10", rx: "1", fill: "#d0d0d0" }), _jsx("rect", { x: "34", y: "68", width: "6", height: "12", rx: "1", fill: "#d0d0d0" }), _jsx("rect", { x: "42", y: "68", width: "6", height: "12", rx: "1", fill: "#d0d0d0" }), _jsx("rect", { x: "50", y: "68", width: "6", height: "10", rx: "1", fill: "#d0d0d0" })] })] }), _jsxs("div", { children: [_jsxs("h1", { className: "text-5xl md:text-6xl font-bold", children: [_jsx("span", { className: "bg-clip-text text-transparent", style: { backgroundImage: "linear-gradient(135deg, #a855f7 0%, #c084fc 50%, #a855f7 100%)" }, children: "SOAP API" }), " ", _jsx("span", { className: "bg-clip-text text-transparent", style: { backgroundImage: "linear-gradient(135deg, #22c55e 0%, #f97316 100%)" }, children: "Reviver" })] }), _jsxs("div", { className: "flex items-center justify-center gap-2 mt-2", children: [_jsx(FileCode, { className: "w-5 h-5 text-purple-400" }), _jsx("span", { className: "text-purple-400 font-medium", children: "Enterprise XML Services" })] })] })] }), _jsxs("p", { className: "text-xl text-gray-300 max-w-2xl mx-auto", children: ["Resurrect your legacy SOAP services with modern UIs.", _jsx("span", { className: "text-purple-400", children: " WSDL to React in seconds." })] })] }), !analyzed ? (
                    // UPLOAD INTERFACE
                    _jsxs(Card, { className: "bg-slate-900/90 backdrop-blur-sm border-purple-500/30 shadow-2xl spooky-card", children: [_jsx(CardHeader, { className: "border-b border-slate-800", children: _jsxs(CardTitle, { className: "text-2xl text-white flex items-center gap-3", children: [_jsx(Sparkles, { className: "w-6 h-6 text-purple-500 animate-pulse" }), "Step 1: Connect Your SOAP Service"] }) }), _jsxs(CardContent, { className: "pt-6 space-y-6", children: [_jsxs("div", { className: "flex gap-2 p-1 bg-slate-950/80 rounded-lg border border-slate-800", children: [_jsxs("button", { onClick: () => {
                                                    setActiveTab("wsdl");
                                                    setError("");
                                                }, className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === "wsdl"
                                                    ? "bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-400 border border-purple-500/50 shadow-lg shadow-purple-500/20"
                                                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"}`, children: [_jsx(FileCode, { className: "w-5 h-5" }), "Use WSDL"] }), _jsxs("button", { onClick: () => {
                                                    setActiveTab("endpoint");
                                                    setError("");
                                                }, className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === "endpoint"
                                                    ? "bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/20"
                                                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"}`, children: [_jsx(Globe, { className: "w-5 h-5" }), "Use SOAP Endpoint"] }), _jsxs("button", { onClick: () => {
                                                    setActiveTab("xml");
                                                    setError("");
                                                }, className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === "xml"
                                                    ? "bg-gradient-to-r from-cyan-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                                                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"}`, children: [_jsx(Code2, { className: "w-5 h-5" }), "Use XML Sample"] })] }), activeTab === "wsdl" && (_jsxs("div", { className: "space-y-4 animate-emerge", children: [_jsx(Textarea, { value: wsdlContent, onChange: (e) => setWsdlContent(e.target.value), placeholder: '<?xml version="1.0"?><definitions xmlns="http://schemas.xmlsoap.org/wsdl/">...</definitions>', className: "min-h-[260px] font-mono text-sm bg-slate-950/80 text-purple-400 border-purple-500/30 focus:border-purple-500 placeholder:text-gray-600" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "Upload WSDL file" }), _jsx("div", { className: "flex items-center gap-3", children: _jsx(Input, { type: "file", accept: ".wsdl,.xml", onChange: handleWsdlFileChange, className: "bg-slate-950/80 border-purple-500/30 text-purple-400 file:bg-gradient-to-r file:from-purple-600 file:to-violet-600 file:border-0 file:text-sm file:font-medium file:text-white file:px-4 file:py-2 file:mr-3 file:rounded-lg file:cursor-pointer file:hover:from-purple-700 file:hover:to-violet-700 file:transition-all file:shadow-lg file:shadow-purple-500/20 file:flex file:items-center file:justify-center cursor-pointer" }) }), wsdlFileName && _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Loaded file: ", wsdlFileName] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "WSDL URL" }), _jsx(Input, { value: wsdlUrl, onChange: (e) => setWsdlUrl(e.target.value), placeholder: "https://api.company.com/Service.svc?wsdl", className: "bg-slate-950/80 border-purple-500/30 text-purple-400 focus:border-purple-500 placeholder:text-gray-600" }), _jsxs("p", { className: "text-xs text-gray-500", children: ["URL ending in ", _jsx("span", { className: "font-mono text-gray-300", children: "?wsdl" }), " or", " ", _jsx("span", { className: "font-mono text-gray-300", children: "?singleWsdl" })] })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs(Button, { variant: "outline", onClick: loadWsdlExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Customer Service"] }), _jsxs(Button, { variant: "outline", onClick: loadOrdersWsdlExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Order Service"] }), _jsxs(Button, { variant: "outline", onClick: loadBankingWsdlExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Banking Service"] })] }), _jsxs("div", { className: "text-sm text-gray-500 font-mono", children: [wsdlContent.length, " characters"] })] })] })), activeTab === "endpoint" && (_jsxs("div", { className: "space-y-4 animate-emerge", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "SOAP Endpoint URL" }), _jsx(Input, { value: soapBaseUrl, onChange: (e) => setSoapBaseUrl(e.target.value), placeholder: "https://api.example.com/Service.svc", className: "bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "SOAPAction Header" }), _jsx(Input, { value: soapAction, onChange: (e) => setSoapAction(e.target.value), placeholder: "http://example.com/GetCustomers", className: "bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "Authentication" }), _jsxs(Select, { value: soapAuthType, onValueChange: (v) => setSoapAuthType(v), children: [_jsx(SelectTrigger, { className: "bg-slate-950/80 border-amber-500/30 text-white max-w-xs", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { className: "bg-slate-900 border-slate-700", children: [_jsx(SelectItem, { value: "none", children: "No Authentication" }), _jsx(SelectItem, { value: "wsse", children: "WS-Security (WSSE)" }), _jsx(SelectItem, { value: "basic", children: "Basic Auth" })] })] })] }), (soapAuthType === "wsse" || soapAuthType === "basic") && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "Username" }), _jsx(Input, { value: soapUsername, onChange: (e) => setSoapUsername(e.target.value), placeholder: "service_user", className: "bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "Password" }), _jsx(Input, { type: "password", value: soapPassword, onChange: (e) => setSoapPassword(e.target.value), placeholder: "Enter password", className: "bg-slate-950/80 border-amber-500/30 text-amber-400 focus:border-amber-500 placeholder:text-gray-600" })] })] })), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs(Button, { variant: "outline", onClick: loadCustomerEndpointExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-purple-500/50 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Customer Service"] }), _jsxs(Button, { variant: "outline", onClick: loadOrderEndpointExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Order Service"] }), _jsxs(Button, { variant: "outline", onClick: loadBankingEndpointExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Banking Service"] })] })] })), activeTab === "xml" && (_jsxs("div", { className: "space-y-4 animate-emerge", children: [_jsx(Textarea, { value: xmlSample, onChange: (e) => setXmlSample(e.target.value), placeholder: '<?xml version="1.0"?><soap:Envelope>...</soap:Envelope>', className: "min-h-[220px] font-mono text-sm bg-slate-950/80 text-cyan-300 border-cyan-500/30 focus:border-cyan-500 placeholder:text-gray-600" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "Base URL (optional)" }), _jsx(Input, { value: xmlBaseUrl, onChange: (e) => setXmlBaseUrl(e.target.value), placeholder: "https://api.example.com", className: "bg-slate-950/80 border-cyan-500/30 text-cyan-300 focus:border-cyan-500 placeholder:text-gray-600" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "SOAPAction (optional)" }), _jsx(Input, { value: xmlSoapAction, onChange: (e) => setXmlSoapAction(e.target.value), placeholder: "http://example.com/Action", className: "bg-slate-950/80 border-cyan-500/30 text-cyan-300 focus:border-cyan-500 placeholder:text-gray-600" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-300", children: "Operation Name" }), _jsx(Input, { value: xmlOperationName, onChange: (e) => setXmlOperationName(e.target.value), placeholder: "GetCustomers", className: "bg-slate-950/80 border-cyan-500/30 text-cyan-300 focus:border-cyan-500 placeholder:text-gray-600" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs(Button, { variant: "outline", onClick: loadCustomerXmlExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Customer Service"] }), _jsxs(Button, { variant: "outline", onClick: loadOrderXmlExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Order Service"] }), _jsxs(Button, { variant: "outline", onClick: loadBankingXmlExample, className: "border-slate-700 text-gray-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 bg-transparent", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Banking Service"] })] }), _jsxs("div", { className: "text-sm text-gray-500 font-mono", children: [xmlSample.length, " characters"] })] }), _jsx("p", { className: "text-xs text-gray-500", children: "Paste a SOAP response envelope. The analyzer will extract fields from the response body." })] })), error && (_jsxs("div", { className: "p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 flex items-start gap-3", children: [_jsx(Skull, { className: "w-5 h-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("strong", { children: "Error:" }), " ", error] })] })), _jsxs(Button, { onClick: handleAnalyze, disabled: !canAnalyze, className: "w-full text-white text-lg py-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Skull, { className: "mr-2 w-5 h-5" }), "Analyze & Resurrect", _jsx(ChevronRight, { className: "ml-2 w-5 h-5" })] })] })] })) : (
                    // RESULTS INTERFACE - WITH FULL REVIEW/CUSTOMIZE FLOW
                    _jsxs(Card, { className: "bg-slate-900/90 backdrop-blur-sm border-purple-500/30 shadow-2xl spooky-card", children: [_jsx(CardHeader, { className: "border-b border-slate-800", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center", children: _jsx(Sparkles, { className: "w-5 h-5 text-purple-400" }) }), _jsxs("div", { children: [_jsxs(CardTitle, { className: "text-2xl text-white", children: ["Found ", resources.length, " Resource", resources.length !== 1 ? "s" : ""] }), _jsx("p", { className: "text-gray-400 mt-1", children: "Your SOAP service has been analyzed and is ready for resurrection" })] })] }) }), _jsxs(CardContent, { className: "pt-6 space-y-4", children: [currentStep === 'results' && resources.map((resource) => (_jsx("div", { className: "p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold text-purple-400 mb-2 flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-purple-500 animate-pulse" }), resource.displayName] }), _jsxs("p", { className: "text-sm text-gray-400 mb-3", children: [resource.fields.length, " fields | ", Array.isArray(resource.operations) ? resource.operations.length : Object.keys(resource.operations || {}).length, " operations"] }), _jsx("div", { className: "flex gap-2 flex-wrap", children: (Array.isArray(resource.operations) ? resource.operations : Object.keys(resource.operations || {})).map((op) => (_jsx("span", { className: "text-xs px-3 py-1 bg-slate-800 text-gray-300 rounded-full border border-slate-700 hover:border-purple-500/50 transition-colors", children: op }, op))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "text-sm font-medium text-gray-400 flex items-center gap-2", children: [_jsx(Braces, { className: "w-4 h-4 text-purple-400" }), "Fields"] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: resource.fields.map((field) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800 rounded hover:border-purple-500/30 transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("code", { className: "text-xs font-mono text-purple-300 truncate", children: field.name }), field.name === resource.primaryKey && (_jsx("span", { className: "text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30 font-semibold", children: "PK" }))] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsx("span", { className: "text-[10px] px-2 py-0.5 bg-slate-800 text-gray-400 rounded font-mono", children: field.type }), _jsx(ChevronRight, { className: "w-3 h-3 text-gray-600 group-hover:text-purple-400 transition-colors" }), _jsx("span", { className: "text-xs text-gray-300 group-hover:text-white transition-colors", children: field.displayName })] })] }, field.name))) })] })] }) }, resource.name))), currentStep === 'review' && (_jsxs("div", { className: "space-y-6 animate-emerge", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h3", { className: "text-2xl font-bold text-purple-400 mb-2", children: "Step 2: Review Schema" }), _jsx("p", { className: "text-gray-400", children: "Edit operations, fields, and types" })] }), reviewedResources.map((resource, idx) => (_jsxs("div", { className: "p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg", children: [_jsx("h4", { className: "text-lg font-semibold text-purple-400 mb-4", children: resource.displayName }), _jsxs("div", { className: "mb-4", children: [_jsx("h5", { className: "text-sm font-medium text-gray-300 mb-2", children: "Operations" }), _jsx("p", { className: "text-xs text-gray-500 mb-2", children: "\uD83D\uDCA1 Tip: \"Detail\" is read-only. Selecting only \"Detail\" will disable create/update/delete operations." }), _jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(resource.operations).map(([op, enabled]) => {
                                                                    const isReadOnlyMode = resource.operations.detail && !resource.operations.create && !resource.operations.update && !resource.operations.delete;
                                                                    const shouldDisable = isReadOnlyMode && (op === 'create' || op === 'update' || op === 'delete');
                                                                    return (_jsxs("label", { className: `flex items-center gap-2 ${shouldDisable ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-pointer'}`, title: shouldDisable ? 'Disabled in read-only mode (Detail only)' : '', children: [_jsx("input", { type: "checkbox", checked: Boolean(enabled), disabled: shouldDisable, onChange: (e) => {
                                                                                    const updated = [...reviewedResources];
                                                                                    updated[idx].operations[op] = e.target.checked;
                                                                                    if (op === 'detail' && !e.target.checked) {
                                                                                        updated[idx].operations.list = true;
                                                                                    }
                                                                                    setReviewedResources(updated);
                                                                                }, className: "w-4 h-4" }), _jsx("span", { className: "capitalize", children: op })] }, op));
                                                                }) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-300 mb-2", children: "Fields" }), _jsx("div", { className: "space-y-2", children: resource.fields.map((field, fieldIdx) => (_jsxs("div", { className: "flex items-center gap-4 p-2 bg-slate-800/50 rounded", children: [_jsx("input", { type: "checkbox", checked: field.isVisible, onChange: (e) => {
                                                                                const updated = [...reviewedResources];
                                                                                updated[idx].fields[fieldIdx].isVisible = e.target.checked;
                                                                                setReviewedResources(updated);
                                                                            }, className: "w-4 h-4" }), _jsx("span", { className: "text-gray-300 min-w-[120px]", children: field.displayName }), _jsxs("select", { value: field.type, onChange: (e) => {
                                                                                const updated = [...reviewedResources];
                                                                                updated[idx].fields[fieldIdx].type = e.target.value;
                                                                                setReviewedResources(updated);
                                                                            }, className: "bg-slate-700 text-gray-300 px-2 py-1 rounded text-sm", children: [_jsx("option", { value: "string", children: "String" }), _jsx("option", { value: "number", children: "Number" }), _jsx("option", { value: "boolean", children: "Boolean" }), _jsx("option", { value: "date", children: "Date" }), _jsx("option", { value: "email", children: "Email" }), _jsx("option", { value: "url", children: "URL" })] }), _jsxs("label", { className: "flex items-center gap-1 text-xs text-gray-400", children: [_jsx("input", { type: "radio", name: `primary-${idx}`, checked: field.isPrimaryKey, onChange: () => {
                                                                                        const updated = [...reviewedResources];
                                                                                        updated[idx].fields.forEach((f, i) => {
                                                                                            f.isPrimaryKey = i === fieldIdx;
                                                                                        });
                                                                                        setReviewedResources(updated);
                                                                                    }, className: "w-3 h-3" }), "Primary Key"] })] }, fieldIdx))) })] })] }, idx)))] })), currentStep === 'customize' && (_jsxs("div", { className: "space-y-6 animate-emerge", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h3", { className: "text-2xl font-bold text-purple-400 mb-2", children: "Step 3: Customize Your Portal" }), _jsx("p", { className: "text-gray-400", children: "Choose features, theme, and colors" })] }), _jsxs("div", { className: "p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg", children: [_jsx("h4", { className: "text-lg font-semibold text-purple-400 mb-3", children: "\uD83D\uDCCA Dashboard Features" }), _jsx("div", { className: "space-y-2", children: Object.entries(uiCustomization.dashboard).map(([key, enabled]) => (_jsxs("label", { className: "flex items-center gap-3 text-gray-300 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: enabled, onChange: (e) => setUiCustomization({
                                                                        ...uiCustomization,
                                                                        dashboard: { ...uiCustomization.dashboard, [key]: e.target.checked }
                                                                    }), className: "w-4 h-4" }), _jsx("span", { className: "capitalize", children: key.replace(/([A-Z])/g, ' $1').trim() })] }, key))) })] }), _jsxs("div", { className: "p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg", children: [_jsx("h4", { className: "text-lg font-semibold text-purple-400 mb-3", children: "\uD83D\uDCCB List View Features" }), _jsx("div", { className: "space-y-2", children: Object.entries(uiCustomization.listView).map(([key, enabled]) => (_jsxs("label", { className: "flex items-center gap-3 text-gray-300 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: enabled, onChange: (e) => setUiCustomization({
                                                                        ...uiCustomization,
                                                                        listView: { ...uiCustomization.listView, [key]: e.target.checked }
                                                                    }), className: "w-4 h-4" }), _jsx("span", { className: "capitalize", children: key.replace(/([A-Z])/g, ' $1').trim() })] }, key))) })] }), _jsxs("div", { className: "p-5 bg-slate-950/80 border border-purple-500/20 rounded-lg", children: [_jsx("h4", { className: "text-lg font-semibold text-purple-400 mb-3", children: "\uD83C\uDFA8 Theme" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-300 mb-2 block", children: "Mode" }), _jsx("div", { className: "flex gap-2", children: ['light', 'auto', 'dark'].map((mode) => (_jsxs("button", { onClick: () => setUiCustomization({
                                                                                ...uiCustomization,
                                                                                theme: { ...uiCustomization.theme, mode }
                                                                            }), className: `flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uiCustomization.theme.mode === mode
                                                                                ? 'bg-purple-600 text-white'
                                                                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`, children: [mode === 'light' && '☀️ Light', mode === 'auto' && '🌗 Auto', mode === 'dark' && '💀 Spooky/Dark'] }, mode))) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-300 mb-2 block", children: "Accent Color" }), _jsx("div", { className: "flex gap-3", children: ['blue', 'green', 'purple', 'orange'].map((color) => (_jsx("button", { onClick: () => setUiCustomization({
                                                                                ...uiCustomization,
                                                                                theme: { ...uiCustomization.theme, accentColor: color }
                                                                            }), className: `w-10 h-10 rounded-full transition-transform ${color === 'blue' ? 'bg-blue-500' :
                                                                                color === 'green' ? 'bg-green-500' :
                                                                                    color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'} ${uiCustomization.theme.accentColor === color
                                                                                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                                                                : 'hover:scale-105'}`, title: color }, color))) })] })] })] })] })), currentStep === 'results' && (_jsxs(Button, { onClick: () => {
                                            // Initialize reviewed resources from detected resources
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
                                            }));
                                            setReviewedResources(initialReviewed);
                                            setCurrentStep('review');
                                        }, className: "w-full text-white text-lg py-6 mt-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600", children: ["Next: Review Schema", _jsx(ChevronRight, { className: "ml-2 w-5 h-5" })] })), currentStep === 'review' && (_jsxs("div", { className: "flex gap-4 mt-6", children: [_jsx(Button, { variant: "outline", onClick: () => setCurrentStep('results'), className: "flex-1 text-gray-300 border-slate-700 hover:bg-slate-800", children: "\u2190 Back" }), _jsx(Button, { onClick: () => setCurrentStep('customize'), className: "flex-1 text-white text-lg bg-purple-600 hover:bg-purple-700", children: "Next: Customize \u2192" })] })), currentStep === 'customize' && (_jsxs("div", { className: "flex gap-4 mt-6", children: [_jsx(Button, { variant: "outline", onClick: () => setCurrentStep('review'), className: "flex-1 text-gray-300 border-slate-700 hover:bg-slate-800", children: "\u2190 Back" }), _jsxs(Button, { onClick: handleGenerate, className: "flex-1 text-white text-lg py-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600", children: [_jsx(Skull, { className: "mr-2 w-5 h-5" }), "Generate Portal \uD83D\uDE80"] })] })), _jsx(Button, { variant: "ghost", onClick: () => {
                                            setAnalyzed(false);
                                            setResources([]);
                                            setCurrentStep('results');
                                            setReviewedResources([]);
                                            setWsdlContent("");
                                            setWsdlUrl("");
                                            setWsdlFileName("");
                                            setSoapBaseUrl("");
                                            setSoapAction("");
                                            setSoapAuthType("none");
                                            setSoapUsername("");
                                            setSoapPassword("");
                                            setWsseToken("");
                                            setXmlSample("");
                                            setXmlBaseUrl("");
                                            setXmlSoapAction("");
                                            setXmlOperationName("");
                                            setError("");
                                        }, className: "w-full text-gray-400 hover:text-white hover:bg-slate-800/50", children: "\u2190 Start Over" })] })] }))] })] }));
}
