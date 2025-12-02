# Spec: Enhanced Data Grid for ResourceList

## Goal
Upgrade `ResourceList.tsx` into a powerful data grid with search, sort, filters, and pagination - matching the existing spooky/modern dual-theme system.

## Current State
`ResourceList` already has:
- Basic table rendering
- Simple search
- Pagination (10/20/50/100 per page)
- Click row → navigate to detail

## Enhancements Needed

### 1. Column Sorting
**Requirement:** Click column header to sort

**Implementation:**
```typescript
const [sortField, setSortField] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const handleSort = (fieldName: string) => {
  if (sortField === fieldName) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(fieldName);
    setSortDirection('asc');
  }
};

// In table header
<TableHead onClick={() => handleSort(field.name)} className="cursor-pointer">
  {field.displayName}
  {sortField === field.name && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
</TableHead>
```

### 2. Advanced Filters
**Requirement:** Filter by status, department, or other enum fields

**UI Location:** Below search bar, above table
```typescript
// Add filter state
const [filters, setFilters] = useState<Record<string, string>>({});

// Detect filterable fields (enums, booleans)
const filterableFields = resource.fields.filter(f => 
  f.type === 'boolean' || f.type === 'enum'
);

// Apply filters to data
const filteredData = data.filter(item => {
  // Apply search
  if (searchTerm && !matchesSearch(item)) return false;
  
  // Apply filters
  for (const [field, value] of Object.entries(filters)) {
    if (value !== 'all' && item[field] !== value) return false;
  }
  
  return true;
});
```

### 3. Enhanced Pagination Info
**Current:** "Showing 1-20 of 156"

**Enhanced:** "Page 1 of 8 • Showing 1-20 of 156 results"

### 4. Styling Requirements
- **Theme:** Match existing ResourceList style (dark theme)
- **Components:** Use shadcn Select for filters
- **Icons:** Lucide icons for sort indicators
- **Spacing:** Consistent with existing layout

## Testing
- Test with mock data (50+ records)
- Test all combinations: search + sort + filter
- Test pagination edge cases (empty, 1 page, many pages)

## Files to Modify
- `frontend/src/components/ResourceList.tsx`

## Non-Goals
- Backend filtering (keep client-side for now)
- Advanced filter UI (date ranges, multi-select)
- Export to CSV (future feature)
```

