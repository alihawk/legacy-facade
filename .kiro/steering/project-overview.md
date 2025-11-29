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