# Feature: Schema Review & UI Customization

## Overview

Add an intermediate "Review & Customize" step between API analysis and portal generation. This allows users to:

1. **Review detected schema** - Verify/edit resources, fields, and field types
2. **Configure operations** - Enable/disable CRUD operations per resource
3. **Customize UI features** - Choose which enhanced features to include
4. **Then generate** - Create portal with their exact preferences

This transforms the app from "magic black box" to "intelligent assistant with user control."

## User Flow

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐     ┌──────────────┐
│   Analyze    │ --> │  Review Schema   │ --> │  Customize UI  │ --> │   Generate   │
│     API      │     │   & Operations   │     │    Features    │     │    Portal    │
└──────────────┘     └──────────────────┘     └────────────────┘     └──────────────┘
     (existing)            (NEW)                   (NEW)               (existing)
```

## Goals

1. **User Control** - Users confirm/edit what was detected before generation
2. **Accuracy** - Fix wrong guesses from endpoint/sample analysis modes
3. **Flexibility** - Different APIs need different UI features
4. **Demo Impact** - Shows judges the app is thoughtful, not just a template generator

---

## Feature 1: Schema Review Step

### User Story
As a user who just analyzed an API, I want to review and edit the detected schema before generating the portal, so that I can fix any incorrect detections.

### UI Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📋 Review Detected Schema                                      Step 1 of 2 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  We analyzed your API and detected the following. Review and adjust as      │
│  needed before generating your portal.                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📦 Resource: Users                                          [Edit] │    │
│  │  Endpoint: https://api.example.com/users                            │    │
│  │                                                                      │    │
│  │  Operations:                                                         │    │
│  │  ☑️ List (GET /users)           ☑️ View Details (GET /users/{id})   │    │
│  │  ☑️ Create (POST /users)        ☐ Update (PUT /users/{id})          │    │
│  │  ☐ Delete (DELETE /users/{id})                                      │    │
│  │                                                                      │    │
│  │  Fields:                                                             │    │
│  │  ┌──────────────┬──────────┬────────────┬─────────┐                 │    │
│  │  │ Field Name   │ Type     │ Primary Key│ Visible │                 │    │
│  │  ├──────────────┼──────────┼────────────┼─────────┤                 │    │
│  │  │ id           │ number ▼ │ ● Yes      │ ☑️      │                 │    │
│  │  │ name         │ string ▼ │ ○ No       │ ☑️      │                 │    │
│  │  │ email        │ email  ▼ │ ○ No       │ ☑️      │                 │    │
│  │  │ created_at   │ date   ▼ │ ○ No       │ ☑️      │                 │    │
│  │  │ is_active    │ boolean▼ │ ○ No       │ ☑️      │                 │    │
│  │  │ internal_id  │ string ▼ │ ○ No       │ ☐       │  ← Hide field  │    │
│  │  └──────────────┴──────────┴────────────┴─────────┘                 │    │
│  │                                                    [+ Add Field]     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📦 Resource: Orders                                         [Edit] │    │
│  │  Endpoint: https://api.example.com/orders                           │    │
│  │  ... (similar structure)                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [+ Add Resource]                                                           │
│                                                                              │
│                                          [Back to Analysis]  [Next Step →]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Requirements

#### 1.1 Resource List Display
- Show all detected resources in expandable cards
- Display endpoint URL for each resource
- Show detection confidence indicator (high/medium/low based on analysis mode)

#### 1.2 Operations Toggle
- Checkbox for each operation: list, detail, create, update, delete
- Pre-checked based on analyzer detection
- User can enable/disable any operation
- Tooltip explaining what each operation does

#### 1.3 Fields Editor
- Table showing all detected fields
- Columns: Field Name, Type (dropdown), Primary Key (radio), Visible (checkbox)
- Type dropdown options: string, number, boolean, date, datetime, email, url, currency
- Only one field can be primary key per resource
- Hidden fields won't appear in generated UI but still work in API

#### 1.4 Add/Remove Capabilities
- "Add Field" button to manually add fields
- "Add Resource" button to add resources not detected
- Delete button (trash icon) on each resource/field to remove
- Edit resource name/endpoint

### Data Model

```typescript
interface ReviewedResource {
  name: string;
  displayName: string;
  endpoint: string;
  primaryKey: string;
  operations: {
    list: boolean;
    detail: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  fields: ReviewedField[];
}

interface ReviewedField {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'currency';
  isPrimaryKey: boolean;
  isVisible: boolean;
  isRequired: boolean;
}
```

---

## Feature 2: UI Customization Step

### User Story
As a user generating a portal, I want to choose which UI features to include, so that I get exactly the portal I need.

### UI Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎨 Customize Your Portal                                       Step 2 of 2 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Choose which features to include in your generated admin portal.           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📊 Dashboard Features                                               │    │
│  │                                                                      │    │
│  │  ☑️ Stats Cards                                                     │    │
│  │     Show count cards for each resource on dashboard                 │    │
│  │                                                                      │    │
│  │  ☑️ Bar Chart                                                       │    │
│  │     Visual chart comparing record counts across resources           │    │
│  │                                                                      │    │
│  │  ☑️ Recent Activity                                                 │    │
│  │     Show recently added/modified items                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📋 List View Features                                               │    │
│  │                                                                      │    │
│  │  ☑️ Bulk Selection                                                  │    │
│  │     Checkboxes to select multiple items                             │    │
│  │                                                                      │    │
│  │  ☑️ Bulk Delete                                                     │    │
│  │     Delete multiple selected items at once                          │    │
│  │                                                                      │    │
│  │  ☑️ CSV Export                                                      │    │
│  │     Export selected or all items to CSV file                        │    │
│  │                                                                      │    │
│  │  ☑️ Smart Field Rendering                                           │    │
│  │     Render emails as links, dates formatted, booleans as icons      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📝 Form Features                                                    │    │
│  │                                                                      │    │
│  │  ☑️ Smart Inputs                                                    │    │
│  │     Date pickers, toggle switches, proper input types               │    │
│  │                                                                      │    │
│  │  ☐ Field Validation                                                 │    │
│  │     Client-side validation for required fields (coming soon)        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🎨 Theme                                                            │    │
│  │                                                                      │    │
│  │  ○ Light Mode    ● Auto (System)    ○ Dark Mode                     │    │
│  │                                                                      │    │
│  │  Accent Color:  🔵 Blue  ○ Green  ○ Purple  ○ Orange               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📤 Output Options                                                   │    │
│  │                                                                      │    │
│  │  What would you like to do?                                         │    │
│  │                                                                      │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │    │
│  │  │  👁️ Preview     │ │  📥 Download    │ │  🚀 Deploy      │        │    │
│  │  │  Live Preview   │ │  ZIP Project    │ │  to Vercel      │        │    │
│  │  │  in Browser     │ │  for Local Dev  │ │  (1-click)      │        │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                                    [← Back]  [Generate! 🚀] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Requirements

#### 2.1 Feature Toggles
Group features into categories with checkboxes:

**Dashboard Features:**
- Stats Cards (default: on)
- Bar Chart (default: on)
- Recent Activity (default: on)

**List View Features:**
- Bulk Selection (default: on)
- Bulk Delete (default: on)
- CSV Export (default: on)
- Smart Field Rendering (default: on)

**Form Features:**
- Smart Inputs (default: on)
- Field Validation (default: off, mark as "coming soon")

#### 2.2 Theme Selection
- Light/Dark/Auto toggle
- Accent color picker (Blue, Green, Purple, Orange)
- Preview swatch showing selected colors

#### 2.3 Output Options
- **Preview** - Generate and show in current app (existing behavior)
- **Download** - Generate ZIP file for local development
- **Deploy** - Deploy to Vercel (existing behavior)
- User can select multiple (e.g., Preview + Download)

### Data Model

```typescript
interface UICustomization {
  dashboard: {
    statsCards: boolean;
    barChart: boolean;
    recentActivity: boolean;
  };
  listView: {
    bulkSelection: boolean;
    bulkDelete: boolean;
    csvExport: boolean;
    smartFieldRendering: boolean;
  };
  forms: {
    smartInputs: boolean;
    fieldValidation: boolean;
  };
  theme: {
    mode: 'light' | 'dark' | 'auto';
    accentColor: 'blue' | 'green' | 'purple' | 'orange';
  };
  output: {
    preview: boolean;
    download: boolean;
    deploy: boolean;
  };
}
```

---

## Feature 3: State Management

### Requirements

#### 3.1 Persist Review State
- Store reviewed schema in component state during flow
- Pass to generator when user clicks "Generate"
- Clear state when user starts new analysis

#### 3.2 Schema Context
Create a React context to hold the reviewed schema:

```typescript
interface SchemaContextType {
  // Raw detected schema (from analyzer)
  detectedSchema: ResourceSchema[] | null;
  
  // User-reviewed schema (after review step)
  reviewedSchema: ReviewedResource[] | null;
  
  // UI customization preferences
  uiCustomization: UICustomization;
  
  // Actions
  setDetectedSchema: (schema: ResourceSchema[]) => void;
  setReviewedSchema: (schema: ReviewedResource[]) => void;
  setUICustomization: (config: UICustomization) => void;
  resetSchema: () => void;
}
```

#### 3.3 Flow Control
- After analysis completes → Navigate to Review step
- After Review step → Navigate to Customize step
- After Customize step → Generate based on selected output options

---

## Feature 4: Generator Updates

### Requirements

#### 4.1 Use Reviewed Schema
Update all generators to use `reviewedSchema` instead of `detectedSchema`:

- `ProjectGenerator.ts` - Download ZIP
- `vercel_frontend_generator.py` - Vercel deployment
- Portal preview - Live preview

#### 4.2 Respect UI Customization
Conditionally include features based on `uiCustomization`:

```typescript
// In ProjectGenerator
if (uiCustomization.dashboard.statsCards) {
  files['src/components/StatsCard.tsx'] = statsCardTemplate();
}

if (uiCustomization.listView.bulkSelection) {
  files['src/components/BulkActionsBar.tsx'] = bulkActionsBarTemplate();
}

// In Dashboard template
const Dashboard = () => {
  return (
    <div>
      {config.dashboard.statsCards && <StatsCards resources={resources} />}
      {config.dashboard.barChart && <BarChart data={chartData} />}
      {config.dashboard.recentActivity && <RecentActivity items={items} />}
    </div>
  );
};
```

#### 4.3 Theme Application
Apply selected theme to generated project:

```typescript
// tailwind.config.js in generated project
module.exports = {
  darkMode: uiCustomization.theme.mode === 'auto' ? 'media' : 'class',
  theme: {
    extend: {
      colors: {
        primary: colors[uiCustomization.theme.accentColor],
      },
    },
  },
};
```

---

## Technical Implementation

### New Components

```
frontend/src/components/
├── SchemaReview/
│   ├── SchemaReviewStep.tsx      # Main review step container
│   ├── ResourceCard.tsx          # Expandable resource card
│   ├── OperationsToggle.tsx      # CRUD operations checkboxes
│   ├── FieldsEditor.tsx          # Fields table with editing
│   ├── FieldTypeDropdown.tsx     # Type selection dropdown
│   └── AddResourceModal.tsx      # Modal for adding new resource
├── UICustomization/
│   ├── UICustomizationStep.tsx   # Main customization step container
│   ├── FeatureToggleGroup.tsx    # Group of feature checkboxes
│   ├── ThemeSelector.tsx         # Theme mode and color picker
│   └── OutputOptions.tsx         # Preview/Download/Deploy selection
└── context/
    └── SchemaContext.tsx         # React context for schema state
```

### Route Changes

```tsx
// Current routes
/analyze → Analysis page
/portal → Generated portal preview

// New routes
/analyze → Analysis page
/review → Schema Review step (NEW)
/customize → UI Customization step (NEW)
/portal → Generated portal preview
```

### Navigation Flow

```tsx
// After analysis completes
const handleAnalysisComplete = (schema: ResourceSchema[]) => {
  setDetectedSchema(schema);
  navigate('/review');
};

// After review completes
const handleReviewComplete = (reviewed: ReviewedResource[]) => {
  setReviewedSchema(reviewed);
  navigate('/customize');
};

// After customization completes
const handleCustomizeComplete = (config: UICustomization) => {
  setUICustomization(config);
  
  if (config.output.preview) {
    generatePortal(reviewedSchema, config);
    navigate('/portal');
  }
  if (config.output.download) {
    downloadProject(reviewedSchema, config);
  }
  if (config.output.deploy) {
    deployToVercel(reviewedSchema, config);
  }
};
```

---

## Success Metrics

After implementation:

1. ✅ User can edit detected operations (add/remove CRUD)
2. ✅ User can change field types (string → email, etc.)
3. ✅ User can hide fields from generated UI
4. ✅ User can add missing fields/resources
5. ✅ User can choose which dashboard features to include
6. ✅ User can choose which list features to include
7. ✅ User can select theme/colors
8. ✅ Generated portal respects all customizations
9. ✅ Downloaded project respects all customizations
10. ✅ Vercel deployment respects all customizations

---

## Out of Scope

- Drag-and-drop field reordering
- Custom field validation rules
- Custom CSS injection
- Multiple theme presets
- Save/load configuration profiles

These could be Phase 2 enhancements.

---

## Demo Impact

This feature significantly improves demo impressions:

| Before | After |
|--------|-------|
| "It just generates the same thing every time" | "Users have full control over what gets generated" |
| "What if it detects wrong?" | "Users can fix any mistakes in the review step" |
| "One-size-fits-all output" | "Customizable UI features and themes" |
| "Black box magic" | "Transparent, user-controlled generation" |

**Judge impression:** "This team thought about real-world usage and edge cases, not just the happy path."