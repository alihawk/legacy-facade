# Comprehensive Fixes TODO

## ✅ COMPLETED
1. ✅ Landing page year: 2024 → 2025
2. ✅ REST API analyzer: Added "Go Back" button
3. ✅ Browser tab: Changed title to "UI Reviver" and added skull favicon

## 🔄 IN PROGRESS

### 4. Dark/Spooky Theme Implementation
**Problem:** Selecting "Dark" theme doesn't apply spooky theme to portal
**Solution:**
- Rename "Dark" to "Spooky/Dark" in customization
- When spooky theme selected, apply:
  - Dark background (`bg-slate-950`)
  - Green accents (`text-green-400`, `border-green-500`)
  - Purple highlights
  - Same styling as analyzer page
- Update PortalPage to read theme and apply classes
- Update Dashboard, Sidebar, and all components to respect theme

### 5. List View Features Integration
**Problem:** Bulk selection, bulk delete, CSV export, smart field rendering don't appear
**Solution:**
- Update ResourceList component to read customization
- Add bulk selection checkboxes when enabled
- Add bulk delete button when enabled
- Add CSV export button when enabled
- Implement smart field rendering (emails as links, dates formatted, etc.)

### 6. Operation Logic Constraints
**Problem:** "Detail" should be read-only, but user can still select create/update/delete
**Solution:**
- In review step, when "Detail" is selected:
  - Auto-disable Create, Update, Delete
  - Show tooltip: "Detail is read-only"
- When Detail-only is selected:
  - Hide "Add New" buttons in portal
  - Hide edit/delete actions
  - Show only view functionality

### 7. Activity Log Tab Conditional
**Problem:** Activity log tab always shows
**Solution:**
- Activity log should only show if:
  - User has enabled "Recent Activity" in dashboard customization
  - OR if there's an actual activity resource in the API
- Update Sidebar to conditionally show activity tab

## Implementation Order
1. Fix operation constraints (prevents bad UX)
2. Implement spooky theme (visual impact)
3. Add list view features (functionality)
4. Make activity log conditional (cleanup)
