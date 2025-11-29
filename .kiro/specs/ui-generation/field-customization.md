# Spec: Resource Field Settings

## Purpose
Allow users to customize how resources display without code changes.

## Route
`/portal/:resource/settings`

## Component
`ResourceSettings.tsx`

## UI Design
```
┌─────────────────────────────────────────────┐
│  ← Back to Users                            │
├─────────────────────────────────────────────┤
│  ⚙️ Display Settings for Users              │
│                                              │
│  Field Name       Display Label   Show in L│
│  ─────────────────────────────────────────  │
│  user_id          [User ID       ] ☑       │
│  full_name        [Full Name     ] ☑       │
│  email_address    [Email Address ] ☑       │
│  dept_code        [Department    ] ☐       │
│  is_active        [Active Status ] ☑       │
│  hire_date        [Hire Date     ] ☐       │
│                                              │
│  Primary Display Field: [full_name ▾]      │
│                                              │
│  [Reset to Defaults]  [Save Settings]      │
└─────────────────────────────────────────────┘
```

## Data Structure
```typescript
interface ResourceUIConfig {
  resourceName: string;
  fieldSettings: {
    [fieldName: string]: {
      displayLabel: string;
      visibleInList: boolean;
    };
  };
  primaryDisplayField: string;
}

// Stored in localStorage
const key = `ui-config-${resource.name}`;
localStorage.setItem(key, JSON.stringify(config));
```

## Features

### 1. Field Visibility Toggle
- Checkbox to show/hide in list view
- Minimum 2 fields must be visible (enforce validation)

### 2. Custom Display Labels
- Text input to override default labels
- Updates immediately in list/detail/form views

### 3. Primary Display Field
- Dropdown to select which field shows in cards/titles
- Default: first non-ID string field

### 4. Reset to Defaults
- Button to clear all customizations
- Restores original field names and visibility

## Integration with ResourceList
```typescript
// In ResourceList.tsx
const getUIConfig = (): ResourceUIConfig | null => {
  const stored = localStorage.getItem(`ui-config-${resource.name}`);
  return stored ? JSON.parse(stored) : null;
};

const uiConfig = getUIConfig();

// Apply to visible fields
const visibleFields = resource.fields.filter(f => {
  if (!uiConfig) return defaultVisibility(f);
  return uiConfig.fieldSettings[f.name]?.visibleInList ?? true;
});

// Apply to display labels
const getDisplayLabel = (field: ResourceField): string => {
  return uiConfig?.fieldSettings[field.name]?.displayLabel || field.displayName;
};
```

## Implementation Steps
1. Create `ResourceSettings.tsx` component
2. Add route in `PortalPage.tsx`
3. Add "Settings" button in ResourceList header
4. Update ResourceList to read `ui-config-${resourceName}` from localStorage
5. Update ResourceDetail to use custom labels
6. Update ResourceForm to use custom labels

## Styling
- **Theme:** Modern light
- **Form Controls:** shadcn Input, Checkbox, Select
- **Layout:** Two-column grid for larger screens

## Testing
- Hide a field → verify it disappears from list
- Rename a field → verify new label shows everywhere
- Change primary field → verify card displays use it
- Reset → verify everything reverts