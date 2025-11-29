# Spec: Portal UI Generator

## Purpose
Render dynamic CRUD interfaces from `ResourceSchema[]` at runtime (no code generation).

## Architecture
**Generic Components + Schema = Working Portal**

## Core Components

### 1. ResourceList
- **Input:** `resource: ResourceSchema`
- **Output:** Paginated table with search
- **Features:**
  - Shows first 5 fields as columns
  - Search across all text fields
  - Pagination (10/20/50/100 per page)
  - Click row → navigate to detail

### 2. ResourceDetail
- **Input:** `resource: ResourceSchema`, `id: string`
- **Output:** Card with all fields formatted
- **Formatting:**
  - Date → `toLocaleDateString()`
  - Boolean → Badge (Active/Inactive)
  - Email → `mailto:` link
  - Number → formatted with commas

### 3. ResourceForm
- **Input:** `resource: ResourceSchema`, `mode: 'create' | 'edit'`, `id?: string`
- **Output:** Dynamic form with validation
- **Field Rendering:**
  - `string` → Text input
  - `email` → Email input with validation
  - `number` → Number input
  - `boolean` → Select (Yes/No)
  - `date` → Date picker

### 4. PortalPage (Container)
- **Manages:** Routing, sidebar, content area
- **Routes:**
  - `/portal` → Dashboard
  - `/portal/:resource` → ResourceList
  - `/portal/:resource/:id` → ResourceDetail
  - `/portal/:resource/new` → ResourceForm (create)

## Data Flow
```
localStorage.getItem('app-schema')
  → { resources: ResourceSchema[] }
  → Pass to components
  → Components fetch data from /proxy/:resource
```

## Styling Requirements
- **Theme:** Modern light UI (NOT spooky)
- **Colors:** Blue primary, gray neutrals
- **Components:** shadcn/ui defaults
- **Layout:** Responsive, mobile-friendly

## Implementation Notes
- All components are **generic** - work with any ResourceSchema
- No code generation - pure runtime rendering
- Fallback to mock data if backend unavailable