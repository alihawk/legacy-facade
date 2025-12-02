# Feature: Download Generated Portal as ZIP

## Problem Statement
After users generate their admin portal UI from legacy APIs, they have no way to take that code with them. The generated UI only lives in the browser session. Users need to be able to download a complete, working React project that they can run locally, customize, and deploy themselves.

## Solution Overview
Add a "Download Project" button to the Portal page that generates and downloads a complete React + Vite + TypeScript project as a ZIP file. The project will be pre-configured with the user's API endpoints and resource schemas, ready to run with `npm install && npm run dev`.

## User Stories

### US1: Download Generated Project
**As a** user who has generated an admin portal
**I want to** download the complete project as a ZIP file
**So that** I can run it locally, customize it, and deploy it myself

**Acceptance Criteria:**
- Download button visible in Portal page header
- Clicking button generates and downloads ZIP file
- ZIP contains complete, working React project
- Project runs successfully after `npm install && npm run dev`
- API endpoints are pre-configured with user's settings
- Resource schemas are embedded in the project

## Functional Requirements

### FR1: Download Button
- Add "Download Project" button in PortalPage header next to existing controls
- Button shows download icon (lucide-react Download icon)
- Button shows loading spinner while generating ZIP

### FR2: Project Generation
- Generate complete React + Vite + TypeScript project structure
- Include only necessary portal components
- Configure API service with user's base URL
- Embed user's ResourceSchema[] in project config
- Include all required dependencies in package.json

### FR3: ZIP Download
- Use JSZip library to create ZIP in browser
- Trigger automatic browser download
- Name file: `admin-portal-{timestamp}.zip`
- Show success toast after download starts

## Technical Design

### Project Structure in ZIP
```
admin-portal/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── select.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ResourceList.tsx
│   │   ├── ResourceDetail.tsx
│   │   └── ResourceForm.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── config/
│   │   └── resources.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── .env.example
├── .gitignore
└── README.md
```

### Dependencies
- Frontend: jszip (for ZIP generation)
- No backend changes required

### Data Flow
1. User clicks "Download Project" button
2. PortalPage retrieves ResourceSchema[] from localStorage
3. PortalPage retrieves baseUrl from localStorage
4. ProjectGenerator.generate(schemas, baseUrl) called
5. ProjectGenerator creates all template files with injected values
6. JSZip packages files into ZIP blob
7. Browser downloads ZIP file
8. Success toast shown

## Component Specifications

### ProjectGenerator Service
**Location:** `frontend/src/services/ProjectGenerator.ts`

**Methods:**
- `generate(schemas: ResourceSchema[], baseUrl: string): Promise<Blob>` - Main entry point
- `createPackageJson(): string` - Generate package.json content
- `createViteConfig(): string` - Generate vite.config.ts content
- `createTailwindConfig(): string` - Generate tailwind.config.js content
- `createAppTsx(schemas: ResourceSchema[]): string` - Generate App.tsx with routes
- `createApiService(baseUrl: string): string` - Generate api.ts with configured baseUrl
- `createResourcesConfig(schemas: ResourceSchema[]): string` - Generate resources.ts config
- `createReadme(): string` - Generate README.md with instructions

### PortalPage Updates
**Location:** `frontend/src/pages/PortalPage.tsx`

**Changes:**
- Add Download button to header
- Add loading state for download
- Add click handler calling ProjectGenerator
- Add success/error toast notifications

## UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Admin Portal                    [Download ⬇] [Settings] │
├─────────────────────────────────────────────────────────────┤
│  │                                                          │
│  │  Dashboard / Resource content here...                    │
│  │                                                          │
└──┴──────────────────────────────────────────────────────────┘
```

## Tasks

### Task 1: Install JSZip Dependency
Install the jszip npm package needed for ZIP file generation.

**Acceptance Criteria:**
- jszip added to package.json dependencies
- Package installed successfully
- Can import JSZip in TypeScript files

**Implementation Notes:**
```bash
cd frontend && npm install jszip && npm install -D @types/jszip
```

---

### Task 2: Create Project Template Files
Create all the template file contents that will be included in the generated ZIP. These are string constants or template functions that output the file contents.

**Acceptance Criteria:**
- Create `frontend/src/services/templates/` directory
- Create template for package.json
- Create template for vite.config.ts
- Create template for tailwind.config.js
- Create template for postcss.config.js
- Create template for tsconfig.json and tsconfig.node.json
- Create template for .gitignore
- Create template for .env.example
- Create template for README.md
- Create template for index.css with Tailwind imports
- Create template for lib/utils.ts (cn function)

**Implementation Notes:**
Templates should be functions that return strings, allowing for variable injection where needed.

---

### Task 3: Create UI Component Templates
Create templates for the shadcn/ui components needed in the generated project.

**Acceptance Criteria:**
- Create template for components/ui/button.tsx
- Create template for components/ui/card.tsx
- Create template for components/ui/input.tsx
- Create template for components/ui/table.tsx
- Create template for components/ui/badge.tsx
- Create template for components/ui/dialog.tsx
- Create template for components/ui/select.tsx
- All components should be self-contained (no external shadcn imports)

**Implementation Notes:**
These are simplified versions of shadcn components that work standalone.

---

### Task 4: Create Portal Component Templates
Create templates for the main portal components that will be customized based on user's schemas.

**Acceptance Criteria:**
- Create template for App.tsx (with routing based on resources)
- Create template for main.tsx
- Create template for App.css
- Create template for components/Sidebar.tsx
- Create template for components/Dashboard.tsx
- Create template for components/ResourceList.tsx
- Create template for components/ResourceDetail.tsx
- Create template for components/ResourceForm.tsx
- Create template for services/api.ts (with baseUrl injection)
- Create template for config/resources.ts (with schemas injection)
- Create template for types/index.ts

**Implementation Notes:**
- App.tsx should generate routes dynamically based on ResourceSchema[]
- api.ts should have {{BASE_URL}} placeholder replaced with actual URL
- resources.ts should export the ResourceSchema[] as a constant

---

### Task 5: Create ProjectGenerator Service
Create the main service that orchestrates template generation and ZIP creation.

**Acceptance Criteria:**
- Create `frontend/src/services/ProjectGenerator.ts`
- Implement generate() method that takes schemas and baseUrl
- Assemble all template files with injected values
- Use JSZip to create ZIP blob
- Return downloadable blob
- Handle errors gracefully

**Implementation Notes:**
```typescript
import JSZip from 'jszip';

export class ProjectGenerator {
  async generate(schemas: ResourceSchema[], baseUrl: string): Promise<Blob> {
    const zip = new JSZip();
    
    // Add all files to zip
    zip.file('package.json', this.createPackageJson());
    zip.file('src/App.tsx', this.createAppTsx(schemas));
    // ... etc
    
    return await zip.generateAsync({ type: 'blob' });
  }
}
```

---

### Task 6: Add Download Button to PortalPage
Update the PortalPage component to include the download functionality.

**Acceptance Criteria:**
- Add "Download Project" button to PortalPage header
- Button uses Download icon from lucide-react
- Button shows loading spinner during generation
- Clicking button triggers ProjectGenerator
- Generated ZIP is downloaded to user's computer
- Success toast shown after download starts
- Error toast shown if generation fails

**Implementation Notes:**
```typescript
const handleDownload = async () => {
  setIsDownloading(true);
  try {
    const generator = new ProjectGenerator();
    const blob = await generator.generate(schemas, baseUrl);
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-portal-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Project downloaded!');
  } catch (error) {
    toast.error('Failed to generate project');
  } finally {
    setIsDownloading(false);
  }
};
```

---

### Task 7: Testing and Polish
Test the complete download flow and fix any issues.

**Acceptance Criteria:**
- Download works for REST API generated schemas
- Download works for SOAP API generated schemas
- Downloaded project runs with `npm install && npm run dev`
- Downloaded project displays correct resources
- Downloaded project can make API calls (if CORS allows)
- No TypeScript errors in downloaded project
- README instructions are accurate

**Implementation Notes:**
- Test with multiple resource schemas
- Test with different field types
- Verify all imports resolve correctly
- Check that Tailwind styles work

---

## Out of Scope
- Vercel deployment (separate feature)
- GitHub integration
- Project customization options before download
- Backend code generation
- Authentication setup in generated project

## Success Metrics
- ZIP downloads in < 3 seconds
- Downloaded project passes `npm run build`
- Users can run project locally without modifications