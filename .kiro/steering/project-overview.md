# Legacy UX Reviver - Project Overview

## Hackathon Context
- **Event:** Kiroween 2025
- **Category:** Resurrection (bringing dead UIs back to life)
- **Bonus Categories:** Frankenstein (stitching APIs + UIs), Best Startup Project
- **Theme:** Spooky Halloween aesthetic for analyzer, modern light UI for generated portals

## Problem Statement
Companies have internal tools from 2010 with terrible UIs. Backend APIs work fine, but UX makes employees miserable. Full rewrites cost $100K+ and take months. Productivity suffers because people hate using the tools.

## Solution
Auto-generate modern React frontends from existing legacy APIs with ZERO backend changes. Deploy in days, not months.

## Project Architecture

### Frontend (`frontend/`)
- **Tech Stack:** React + Vite + TypeScript + Tailwind + shadcn/ui
- **Key Pages:**
  - `AnalyzerPage.tsx` - User uploads OpenAPI spec or connects endpoint
  - `PortalPage.tsx` - Main container with sidebar + dynamic content
  - `ResourceList.tsx` - Generic table component for any resource
  - `ResourceDetail.tsx` - Generic detail view for any record
  - `ResourceForm.tsx` - Generic create/edit form
  - `Dashboard.tsx` - Portal home with stats

### Backend (`backend/`)
- **Tech Stack:** Python 3.11 + FastAPI
- **Main Endpoint:** `/api/analyze`
  - Accepts 3 modes: `openapi`, `endpoint`, `json_sample`
  - Returns normalized `ResourceSchema[]`


1. API INTROSPECTION ENGINE  

Analyzes your existing API and understands its structure without needing documentation.

- Connect to legacy API                       
- Discover endpoints, schemas, relationships  
- Generate internal schema representation 

// User provides base URL
Input: "https://legacy-api.company.com/api/v1"

// System does:
1. Find endpoints by trying common patterns:
   - GET /users, /customers, /products, /orders
   - Try plural and singular forms
   
2. Make sample requests to understand:
   - Response structure
   - Field types (string, number, date, boolean)
   - Pagination format
   - Authentication requirements

```
// System looks at actual data to infer types
{ "email": "john@example.com" } → Email field (add validation)
{ "created_at": "2024-11-22T10:30:00Z" } → DateTime (date picker)
{ "status": "active" } → Enum (dropdown if limited values)
{ "description": "Lorem ipsum..." } → Text area (if > 100 chars)
{ "price": 29.99 } → Currency (format with $ symbol)
{ "avatar_url": "https://..." } → Image (show preview)
```
3. Detect relationships:
   - If GET /users/123 returns { "orderId": 456 }
   - System knows users relate to orders

2. UI GENERATION ENGINE    

- Create CRUD screens for each resource        
- Generate forms, tables, filters              
- Apply modern UI patterns                     

3. SMART PROXY LAYER

- Routes frontend calls to legacy backend      
- Attaches headers, cookies, handles login flows
- Backend-to-backend calls, exposes CORS-correct API
- Tracks which endpoints are called (analytics)

### Data Flow
User → AnalyzerPage → /api/analyze → ResourceSchema[] → localStorage → PortalPage → Generated UI

## Key Innovation
**Dynamic UI Generation:** One set of generic React components (List, Detail, Form) adapts to ANY API schema. No code generation needed - pure runtime rendering.

## Kiro Usage
- **Specs:** Define API introspection, UI generation, proxy layer
- **Steering:** Maintain spooky theme, coding standards, component patterns
- **Hooks:** Auto-lint, build checks, component reviews
- **MCP:** One-click Vercel deployment
- **Vibe Coding:** Used Kiro chat to generate initial components, then iterated

## Success Metrics
- Upload API spec → Working portal in < 30 seconds
- Zero backend code changes required
- Works with ANY REST API
- Beautiful before/after transformation