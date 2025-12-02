# SOAP API Implementation Overview

## 🎯 Purpose

Your Legacy UX Reviver now supports **both REST and SOAP APIs**, allowing you to resurrect UIs for old enterprise tools that use either protocol. This is particularly valuable for:
- Banking systems
- Healthcare applications
- ERP systems (SAP, Oracle)
- Government services
- Legacy enterprise applications

---

## 📁 Architecture Overview

### Frontend (React + TypeScript)

```
frontend/src/
├── pages/
│   ├── LandingPage.tsx          # API type selection (REST vs SOAP)
│   ├── AnalyzerPage.tsx         # REST API analyzer
│   ├── SOAPAnalyzerPage.tsx     # SOAP API analyzer ⭐
│   └── PortalPage.tsx           # Generated portal (works for both)
└── App.tsx                       # Routing logic
```

### Backend (Python + FastAPI)

```
backend/app/
├── api/
│   └── analyze.py               # Unified endpoint for REST & SOAP
├── models/
│   └── request_models.py        # Supports 8 modes (4 REST + 4 SOAP)
└── services/
    ├── openapi_analyzer.py      # REST: OpenAPI/Swagger
    ├── endpoint_analyzer.py     # REST: Live endpoints
    ├── json_analyzer.py         # REST: JSON samples
    ├── wsdl_analyzer.py         # SOAP: WSDL parsing ⭐
    ├── soap_xml_analyzer.py     # SOAP: XML sample analysis ⭐
    └── soap_endpoint_analyzer.py # SOAP: Live SOAP calls ⭐
```

---

## 🔄 User Flow

### 1. Landing Page
- User sees two options: **REST API** or **SOAP API**
- Each card shows supported input types
- Click navigates to appropriate analyzer

### 2. SOAP Analyzer Page (3 Tabs)

#### Tab 1: Use WSDL
- **Paste WSDL**: Direct XML input
- **Upload File**: .wsdl or .xml file
- **WSDL URL**: Fetch from endpoint (e.g., `?wsdl`)
- **Example Buttons**: Customer Service, Order Service, Banking Service

#### Tab 2: Use SOAP Endpoint
- **Endpoint URL**: SOAP service URL
- **SOAPAction**: Required header value
- **Authentication**: None, WS-Security (WSSE), or Basic Auth
- **Credentials**: Username/password fields

#### Tab 3: Use XML Sample
- **XML Response**: Paste SOAP envelope
- **Operation Name**: Required (e.g., "GetCustomers")
- **Base URL**: Optional
- **SOAPAction**: Optional

### 3. Analysis & Portal Generation
- Backend analyzes SOAP service
- Extracts resources, fields, operations
- Returns normalized `ResourceSchema[]`
- Same portal generation as REST APIs

---

## 🔧 Backend Implementation Details

### 1. WSDL Analyzer (`wsdl_analyzer.py`)

**What it does:**
- Parses WSDL 1.1 XML documents
- Extracts complex types (data structures)
- Maps XSD types to internal types
- Infers CRUD operations from operation names
- Detects primary keys

**Key Features:**
```python
# XSD Type Mapping
"string" → "string"
"int" → "number"
"dateTime" → "datetime"
"boolean" → "boolean"
"anyURI" → "url"
# ... 30+ type mappings

# Operation Inference
"GetCustomers" → "list"
"GetCustomer" → "detail"
"CreateCustomer" → "create"
"UpdateCustomer" → "update"
"DeleteCustomer" → "delete"
```

**Example WSDL Input:**
```xml
<complexType name="Customer">
  <sequence>
    <element name="customer_id" type="xsd:int"/>
    <element name="company_name" type="xsd:string"/>
    <element name="contact_email" type="xsd:string"/>
  </sequence>
</complexType>
```

**Output:**
```json
{
  "name": "customers",
  "displayName": "Customers",
  "primaryKey": "customer_id",
  "fields": [
    {"name": "customer_id", "type": "number", "displayName": "Customer ID"},
    {"name": "company_name", "type": "string", "displayName": "Company Name"},
    {"name": "contact_email", "type": "email", "displayName": "Contact Email"}
  ],
  "operations": ["list", "detail", "create", "update"]
}
```

### 2. SOAP XML Analyzer (`soap_xml_analyzer.py`)

**What it does:**
- Parses SOAP envelope responses
- Extracts data from `<soap:Body>`
- Infers field types from actual values
- Handles nested XML structures
- Detects arrays of records

**Strategies:**
1. **Array Detection**: Finds repeated elements with same tag
2. **Response Unwrapping**: Looks for `*Response` or `*Result` elements
3. **Multi-field Detection**: Finds elements with 3+ child fields

**Example XML Input:**
```xml
<soap:Envelope>
  <soap:Body>
    <GetCustomersResponse>
      <customers>
        <Customer>
          <customer_id>1001</customer_id>
          <company_name>Acme Corp</company_name>
          <contact_email>john@acme.com</contact_email>
        </Customer>
      </customers>
    </GetCustomersResponse>
  </soap:Body>
</soap:Envelope>
```

**Output:** Same normalized `ResourceSchema` format

### 3. SOAP Endpoint Analyzer (`soap_endpoint_analyzer.py`)

**What it does:**
- Makes live SOAP requests
- Supports WS-Security (WSSE) authentication
- Supports Basic authentication
- Builds SOAP envelopes automatically
- Handles SOAP faults gracefully

**Authentication Support:**

**WS-Security (WSSE):**
```xml
<wsse:Security>
  <wsse:UsernameToken>
    <wsse:Username>user</wsse:Username>
    <wsse:Password>pass</wsse:Password>
    <wsse:Nonce>...</wsse:Nonce>
    <wsu:Created>2024-11-22T10:30:00Z</wsu:Created>
  </wsse:UsernameToken>
</wsse:Security>
```

**Basic Auth:**
```
Authorization: Basic base64(username:password)
```

**SOAP Request Template:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <!-- Auth headers here -->
  </soap:Header>
  <soap:Body>
    <GetCustomers xmlns="http://example.com/service">
    </GetCustomers>
  </soap:Body>
</soap:Envelope>
```

---

## 🎨 Frontend Implementation Details

### SOAPAnalyzerPage.tsx

**State Management:**
```typescript
// WSDL Tab
const [wsdlContent, setWsdlContent] = useState("")
const [wsdlUrl, setWsdlUrl] = useState("")
const [wsdlFileName, setWsdlFileName] = useState("")

// Endpoint Tab
const [soapBaseUrl, setSoapBaseUrl] = useState("")
const [soapAction, setSoapAction] = useState("")
const [soapAuthType, setSoapAuthType] = useState<"none" | "wsse" | "basic">("none")
const [soapUsername, setSoapUsername] = useState("")
const [soapPassword, setSoapPassword] = useState("")

// XML Sample Tab
const [xmlSample, setXmlSample] = useState("")
const [xmlOperationName, setXmlOperationName] = useState("")
```

**API Calls:**
```typescript
// Mode: wsdl
await axios.post("http://localhost:8000/api/analyze", {
  mode: "wsdl",
  wsdlContent: wsdlContent
})

// Mode: wsdl_url
await axios.post("http://localhost:8000/api/analyze", {
  mode: "wsdl_url",
  wsdlUrl: wsdlUrl
})

// Mode: soap_endpoint
await axios.post("http://localhost:8000/api/analyze", {
  mode: "soap_endpoint",
  baseUrl: soapBaseUrl,
  soapAction: soapAction,
  authType: soapAuthType,
  username: soapUsername,
  password: soapPassword
})

// Mode: soap_xml_sample
await axios.post("http://localhost:8000/api/analyze", {
  mode: "soap_xml_sample",
  sampleXml: xmlSample,
  operationName: xmlOperationName,
  baseUrl: xmlBaseUrl,
  soapAction: xmlSoapAction
})
```

**UI Features:**
- 🎨 Purple theme (vs green for REST)
- 📁 File upload for WSDL
- 🔗 URL fetching for WSDL
- 🔐 Authentication forms (WSSE, Basic)
- 📝 Example data loaders
- ⚡ Real-time validation
- 🎃 Spooky Halloween aesthetic

---

## 🔀 Unified Backend Endpoint

### `/api/analyze` - 8 Modes Total

**REST Modes (4):**
1. `openapi` - Parse OpenAPI/Swagger spec
2. `openapi_url` - Fetch OpenAPI from URL
3. `endpoint` - Introspect live REST endpoint
4. `json_sample` - Infer from JSON sample

**SOAP Modes (4):**
5. `wsdl` - Parse WSDL document
6. `wsdl_url` - Fetch WSDL from URL
7. `soap_endpoint` - Call live SOAP endpoint
8. `soap_xml_sample` - Infer from XML sample

**Request Model:**
```python
class AnalyzeRequest(BaseModel):
    mode: Literal[
        "openapi", "openapi_url", "endpoint", "json_sample",
        "wsdl", "wsdl_url", "soap_endpoint", "soap_xml_sample"
    ]
    
    # REST fields
    specJson: dict | str | None = None
    specUrl: HttpUrl | str | None = None
    baseUrl: str | None = None
    endpointPath: str | None = None
    method: str | None = None
    authType: str | None = None
    authValue: str | None = None
    sampleJson: dict | list | None = None
    
    # SOAP fields
    wsdlContent: str | None = None
    wsdlUrl: HttpUrl | str | None = None
    soapAction: str | None = None
    username: str | None = None
    password: str | None = None
    wsseToken: str | None = None
    sampleXml: str | None = None
    operationName: str | None = None
```

**Response Format (Same for Both):**
```json
{
  "resources": [
    {
      "name": "customers",
      "displayName": "Customers",
      "endpoint": "/CustomerService.svc",
      "primaryKey": "customer_id",
      "fields": [...],
      "operations": ["list", "detail", "create", "update"]
    }
  ]
}
```

---

## 🧪 Testing

### Backend Tests
```
backend/tests/
├── test_wsdl_analyzer.py           # WSDL parsing tests
├── test_soap_xml_analyzer.py       # XML analysis tests
└── test_soap_endpoint_analyzer.py  # (if exists)
```

### Example WSDL Services
1. **Customer Service** - Basic CRUD operations
2. **Order Service** - E-commerce operations
3. **Banking Service** - Financial account operations

---

## 🎯 Key Advantages

### 1. Unified Portal
- Same portal works for REST and SOAP
- No code changes needed
- Consistent UX regardless of API type

### 2. Smart Type Inference
- XSD types → Internal types (WSDL)
- Value-based inference (XML samples)
- Email, URL, date detection

### 3. Operation Mapping
- Intelligent CRUD detection
- Operation name parsing
- Fallback to safe defaults

### 4. Authentication Support
- WS-Security (WSSE) with nonce/timestamp
- Basic Auth
- No auth (for testing)

### 5. Flexible Input
- WSDL files (most complete)
- WSDL URLs (convenient)
- Live endpoints (real-time)
- XML samples (quick testing)

---

## 🚀 Usage Examples

### Example 1: Banking WSDL
```xml
<definitions name="BankingService">
  <types>
    <complexType name="Account">
      <element name="account_number" type="xsd:string"/>
      <element name="balance" type="xsd:decimal"/>
      <element name="is_active" type="xsd:boolean"/>
    </complexType>
  </types>
  <portType name="BankingServicePortType">
    <operation name="GetAccounts">...</operation>
    <operation name="GetAccount">...</operation>
  </portType>
</definitions>
```

**Result:** Portal with accounts list, detail views, proper types

### Example 2: Live SOAP Endpoint
```
URL: https://api.bank.com/AccountService.svc
SOAPAction: http://bank.com/GetAccounts
Auth: WS-Security
Username: service_user
Password: ********
```

**Result:** Makes live call, analyzes response, generates portal

### Example 3: XML Sample
```xml
<soap:Envelope>
  <soap:Body>
    <GetOrdersResponse>
      <orders>
        <Order>
          <order_id>12345</order_id>
          <total_amount>299.99</total_amount>
          <order_date>2024-11-22</order_date>
        </Order>
      </orders>
    </GetOrdersResponse>
  </soap:Body>
</soap:Envelope>
```

**Result:** Infers order schema, generates portal

---

## 🔄 Integration with Download Feature

The download project feature works seamlessly with SOAP-analyzed APIs:

1. User analyzes SOAP API → Gets `ResourceSchema[]`
2. Schemas stored in localStorage (`app-schema`)
3. User clicks "Download Project" in portal
4. ProjectGenerator creates ZIP with schemas embedded
5. Generated portal works with SOAP backend (via proxy)

**No special handling needed** - SOAP and REST schemas are normalized to the same format!

---

## 📊 Comparison: REST vs SOAP

| Feature | REST API | SOAP API |
|---------|----------|----------|
| **Input Formats** | OpenAPI, JSON, Endpoint | WSDL, XML, Endpoint |
| **Protocol** | HTTP/JSON | HTTP/XML |
| **Theme Color** | Green | Purple |
| **Auth Support** | Bearer, API Key, Basic | WSSE, Basic |
| **Type Source** | OpenAPI schema | XSD types |
| **Common In** | Modern APIs | Enterprise/Legacy |
| **Portal Output** | ✅ Same | ✅ Same |

---

## 🎓 Technical Highlights

### 1. XML Parsing
- Uses Python's `xml.etree.ElementTree`
- Namespace-aware parsing
- Handles SOAP 1.1 and 1.2

### 2. Type Mapping
- 30+ XSD types mapped
- Smart defaults for unknown types
- Value-based inference for samples

### 3. Operation Detection
- Pattern matching on operation names
- CRUD verb detection
- Fallback to safe defaults

### 4. Security
- WS-Security with nonce/timestamp
- Basic Auth with base64 encoding
- Credentials never persisted

### 5. Error Handling
- SOAP Fault parsing
- Graceful fallbacks
- User-friendly error messages

---

## 🎉 Summary

Your implementation successfully extends the Legacy UX Reviver to support **both REST and SOAP APIs**, making it a comprehensive solution for modernizing any legacy API, regardless of protocol. The unified architecture ensures that once an API is analyzed (REST or SOAP), the same beautiful portal is generated, providing a consistent user experience.

**Key Achievement:** You can now resurrect UIs for:
- ✅ Modern REST APIs (OpenAPI, JSON)
- ✅ Legacy SOAP APIs (WSDL, XML)
- ✅ Banking systems
- ✅ Healthcare applications
- ✅ ERP systems
- ✅ Government services
- ✅ Any enterprise XML service

This makes your tool incredibly valuable for enterprises with mixed API landscapes!
