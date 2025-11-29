# Spec: Inbox / My Items View

## Purpose
Personal "My Work" dashboard showing items needing attention.

## Route
`/portal/inbox` (global) or `/portal/:resource/inbox` (per-resource)

## Component
`InboxView.tsx`

## UI Design
```
┌─────────────────────────────────────────────┐
│  📥 My Inbox                                │
├─────────────────────────────────────────────┤
│  Showing items requiring your attention     │
│                                              │
│  [All ▾] [Users ▾] [Orders ▾]              │
│                                              │
│  🔴 3 Pending Users                         │
│  ─────────────────────────────────────────  │
│  #1  John Doe       john@ex.com   [Review] │
│  #2  Jane Smith     jane@ex.com   [Review] │
│  #3  Bob Wilson     bob@ex.com    [Review] │
│                                              │
│  🟡 5 Orders Awaiting Approval              │
│  ─────────────────────────────────────────  │
│  #101  $1,299.99    Nov 29       [Approve] │
│  #102  $599.99      Nov 29       [Approve] │
│  ...                                         │
└─────────────────────────────────────────────┘
```

## Filter Logic
```typescript
interface InboxFilter {
  fieldName: string;      // "status", "assigned_to"
  operator: 'equals' | 'contains';
  value: string;          // "Pending", "currentUser"
}

// Example filters per resource
const inboxFilters: Record<string, InboxFilter[]> = {
  users: [
    { fieldName: 'status', operator: 'equals', value: 'Pending' }
  ],
  orders: [
    { fieldName: 'status', operator: 'equals', value: 'Awaiting Approval' }
  ]
};
```

## Features

### 1. Multi-Resource View
- Show items from multiple resources
- Grouped by resource type
- Count badge per resource

### 2. Quick Actions
- Inline action buttons (Review, Approve, etc.)
- Click item → navigate to detail view
- Batch actions (optional)

### 3. Filter Options
- Dropdown to filter by resource type
- Show only assigned to "me" (if user system exists)
- Show only specific status

### 4. Mock "Current User"
For demo, hardcode:
```typescript
const CURRENT_USER = "admin@company.com";

// Filter logic
const isMyItem = (item: any) => {
  return item.assigned_to === CURRENT_USER || 
         item.status === 'Pending' ||
         item.needs_review === true;
};
```

## Implementation

### 1. Component Structure
```typescript
const InboxView = () => {
  const [selectedResource, setSelectedResource] = useState<string | 'all'>('all');
  const schema = getSchemaFromLocalStorage();
  
  // Get inbox items for each resource
  const inboxItems = schema.resources.map(resource => ({
    resource,
    items: getInboxItems(resource, selectedResource)
  })).filter(group => group.items.length > 0);
  
  return (
    <div>
      {/* Filter dropdown */}
      {/* Inbox groups */}
      {inboxItems.map(group => (
        <InboxGroup key={group.resource.name} {...group} />
      ))}
    </div>
  );
};
```

### 2. Routing
Add to sidebar:
```typescript
<Button onClick={() => navigate('/portal/inbox')}>
  <Inbox className="w-5 h-5 mr-2" />
  My Inbox
  {totalInboxCount > 0 && <Badge>{totalInboxCount}</Badge>}
</Button>
```

## Styling
- **Theme:** Modern light
- **Groups:** Cards with resource icon and count
- **Items:** Compact list with quick action buttons
- **Badges:** Red for urgent, yellow for pending

## Testing
- Mock data with various statuses
- Test filtering by resource
- Verify counts are accurate
- Test quick action buttons
```

---

## **PART 3: Exact Kiro Chat Commands**

Now here's **exactly** what to type in Kiro chat for each feature:

### **Feature 1: Enhanced Data Grid**
```
Step 1:
Open spec data-grid-enhancement.md. Implement column sorting in ResourceList.tsx. Add sort state, clickable headers with arrow icons, and sort the data array. Keep existing styling.

Step 2:
Now add the advanced filters section below the search bar. Show dropdowns for boolean and enum fields. Use shadcn Select component. Match the existing dark theme.

Step 3:
Enhance the pagination footer to show "Page X of Y" along with the existing "Showing 1-20 of 156" text.
```

### **Feature 2: Activity Log**
```
Step 1:
Open spec activity-log.md. Create ResourceActivity.tsx component with a table showing timestamp, action, user, and details columns. Generate mock data for now.

Step 2:
Add the /portal/:resource/activity route to PortalPage.tsx and add an "Activity Log" button to ResourceList header.

Step 3:
Add filtering by action type (Created/Updated/Deleted) using tabs or a dropdown. Match the modern light theme like other portal screens.
```

### **Feature 3: Field Settings**
```
Step 1:
Open spec field-customization.md. Create ResourceSettings.tsx with a table showing all fields, display label inputs, and visibility checkboxes.

Step 2:
Add localStorage save/load logic for the UI config. When settings change, save to localStorage with key "ui-config-{resourceName}".

Step 3:
Update ResourceList.tsx to read the UI config and apply custom labels and visibility. Import the getUIConfig function.
```

### **Feature 4: Inbox View**
```
Step 1:
Open spec inbox-view.md. Create InboxView.tsx that groups items by resource, showing only items with status="Pending" or needs_review=true.

Step 2:
Add /portal/inbox route and add an "Inbox" link to the sidebar with a badge showing total count.

Step 3:
Add quick action buttons (Review, Approve) to each inbox item that navigate to the detail view.