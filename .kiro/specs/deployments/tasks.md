# Implementation Tasks - Download Generated Portal Feature

## Overview
Add ability for users to download their generated admin portal as a complete, working React project ZIP file.

---

## Tasks

- [x] 1. Install JSZip dependency
  - Install jszip and @types/jszip packages
  - Verify TypeScript imports work
  - _Requirements: FR2, FR3_

- [x] 2. Create project template infrastructure
  - [x] 2.1 Create templates directory structure
    - Create `frontend/src/services/templates/` directory
    - Create subdirectories for config, components, ui
    - _Requirements: FR2_

  - [x] 2.2 Create configuration file templates
    - Create template for package.json with all dependencies
    - Create template for vite.config.ts
    - Create template for tailwind.config.js
    - Create template for postcss.config.js
    - Create template for tsconfig.json and tsconfig.node.json
    - Create template for .gitignore
    - Create template for .env.example
    - _Requirements: FR2_

  - [x] 2.3 Create base project templates
    - Create template for README.md with setup instructions
    - Create template for index.css with Tailwind imports
    - Create template for lib/utils.ts (cn function)
    - Create template for types/index.ts (ResourceSchema interface)
    - _Requirements: FR2_

- [x] 3. Create UI component templates
  - [x] 3.1 Create shadcn/ui component templates
    - Create template for components/ui/button.tsx
    - Create template for components/ui/card.tsx
    - Create template for components/ui/input.tsx
    - Create template for components/ui/table.tsx
    - Create template for components/ui/badge.tsx
    - Create template for components/ui/dialog.tsx
    - Create template for components/ui/select.tsx
    - Ensure all components are self-contained
    - _Requirements: FR2_

- [x] 4. Create portal component templates
  - [x] 4.1 Create main app templates
    - Create template for main.tsx
    - Create template for App.css
    - Create template for App.tsx with dynamic routing
    - Generate routes based on ResourceSchema[]
    - _Requirements: FR2, US1_

  - [x] 4.2 Create portal component templates
    - Create template for components/Sidebar.tsx
    - Create template for components/Dashboard.tsx
    - Create template for components/ResourceList.tsx
    - Create template for components/ResourceDetail.tsx
    - Create template for components/ResourceForm.tsx
    - _Requirements: FR2, US1_

  - [x] 4.3 Create service and config templates
    - Create template for services/api.ts with baseUrl injection
    - Create template for config/resources.ts with schemas injection
    - Add placeholder replacement logic ({{BASE_URL}}, {{SCHEMAS}})
    - _Requirements: FR2, US1_

- [x] 5. Create ProjectGenerator service
  - [x] 5.1 Implement core ProjectGenerator class
    - Create `frontend/src/services/ProjectGenerator.ts`
    - Implement generate() method signature
    - Add error handling structure
    - _Requirements: FR2, FR3_

  - [x] 5.2 Implement template assembly methods
    - Implement createPackageJson()
    - Implement createViteConfig()
    - Implement createTailwindConfig()
    - Implement createAppTsx(schemas)
    - Implement createApiService(baseUrl)
    - Implement createResourcesConfig(schemas)
    - Implement createReadme()
    - _Requirements: FR2_

  - [x] 5.3 Implement ZIP generation
    - Use JSZip to create ZIP structure
    - Add all template files to ZIP
    - Inject user's schemas and baseUrl
    - Generate blob for download
    - _Requirements: FR3_

- [x] 6. Add download UI to PortalPage
  - [x] 6.1 Add download button to header
    - Add "Download Project" button with Download icon
    - Position button in PortalPage header
    - Add loading state (spinner)
    - _Requirements: FR1_

  - [x] 6.2 Implement download handler
    - Create handleDownload() function
    - Retrieve schemas from localStorage
    - Retrieve baseUrl from localStorage (or use default)
    - Call ProjectGenerator.generate()
    - Trigger browser download with timestamp filename
    - _Requirements: FR3, US1_

  - [x] 6.3 Add user feedback
    - Add success toast after download starts
    - Add error toast if generation fails
    - Show loading spinner during generation
    - _Requirements: FR3_

- [x] 7. Testing and validation
  - [x] 7.1 Test download functionality
    - Test download with REST API schemas
    - Test download with SOAP API schemas
    - Test download with multiple resources
    - Test download with various field types
    - _Requirements: US1_

  - [x] 7.2 Test generated project
    - Extract ZIP and run `npm install`
    - Run `npm run dev` and verify it starts
    - Run `npm run build` and verify it compiles
    - Verify all routes work correctly
    - Verify API service is configured correctly
    - Check for TypeScript errors
    - _Requirements: US1_

  - [x] 7.3 Verify documentation
    - Ensure README has accurate setup instructions
    - Verify .env.example has correct variables
    - Check that all imports resolve
    - Verify Tailwind styles work
    - _Requirements: US1_

- [x] 8. Final polish and edge cases
  - Handle empty schemas gracefully
  - Handle missing baseUrl (use placeholder)
  - Ensure ZIP filename is valid across OS
  - Test download on different browsers
  - Verify file size is reasonable (< 5MB)
  - _Requirements: FR3_

---

## Notes

- All templates should be TypeScript string templates or functions
- Use template literals for variable injection
- Keep generated project minimal but functional
- Ensure generated project matches current portal functionality
- Generated project should work standalone without backend
- Consider adding mock data for demo purposes in generated project

## Dependencies

- jszip: ^3.10.1
- @types/jszip: ^3.4.1

## Success Criteria

✅ User can download complete React project as ZIP
✅ Downloaded project runs with `npm install && npm run dev`
✅ Downloaded project displays user's resources correctly
✅ All TypeScript types resolve correctly
✅ Tailwind styles work in generated project
✅ README provides clear setup instructions
