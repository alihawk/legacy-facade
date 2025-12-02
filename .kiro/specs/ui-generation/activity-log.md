# Spec: Resource Activity Log

## Purpose
Add an audit trail view for each resource showing who changed what and when.

## Route
`/portal/:resource/activity`

## Component
`ResourceActivity.tsx`

## UI Design
```
┌─────────────────────────────────────────────┐
│  ← Back to Users          [Export Log]      │
├─────────────────────────────────────────────┤
│  📋 Recent Activity on Users                │
│                                              │
│  Time              Action    User    Details│
│  ─────────────────────────────────────────  │
│  Nov 29, 10:30am   Created   Admin   John D│
│  Nov 29, 10:25am   Updated   Sarah   Email │
│  Nov 29, 10:20am   Deleted   Admin   Jane S│
│                                              │
│  Page 1 of 5                    [< 1 2 3 >] │
└─────────────────────────────────────────────┘
```

## Data Structure
```typescript
interface ActivityEntry {
  timestamp: string;          // ISO date
  action: 'created' | 'updated' | 'deleted';
  user: string;               // Username or email
  resourceId: string | number; // ID of affected record
  details?: string;           // What changed
}
```

## Mock Data Generator
For demo purposes, generate realistic activity:
```typescript
const generateMockActivity = (resource: ResourceSchema): ActivityEntry[] => {
  const actions = ['created', 'updated', 'deleted'];
  const users = ['Admin', 'Sarah', 'John', 'Manager'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    action: actions[Math.floor(Math.random() * actions.length)],
    user: users[Math.floor(Math.random() * users.length)],
    resourceId: Math.floor(Math.random() * 100) + 1,
    details: `Modified ${resource.fields[0].displayName}`
  }));
};
```

## Features
- **Pagination:** 20 entries per page
- **Filtering:** By action type (Created/Updated/Deleted)
- **Search:** Search by user or details
- **Export:** Button to download as CSV (can be placeholder)

## Styling
- **Theme:** Modern light (NOT spooky - this is portal UI)
- **Table:** Same style as ResourceList
- **Icons:** Clock icon for timestamp, User icon for user column

## Implementation Notes
1. Add route in `PortalPage.tsx`:
```typescript
   <Route path="/portal/:resource/activity" element={<ResourceActivity />} />
```

2. Add link in ResourceList header:
```typescript
   <Button variant="outline" onClick={() => navigate(`/portal/${resource.name}/activity`)}>
     <History className="w-4 h-4 mr-2" />
     Activity Log
   </Button>
```

## Testing
- Navigate to activity log from any resource
- Verify pagination works
- Test filtering by action type
- Ensure back button returns to list view