# AnalyzerPage Modal Implementation Patch

## Changes Required

### 1. Add Dialog Import (Line 14)
```typescript
// ADD THIS LINE AFTER LINE 13:
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
```

### 2. Replace State Variables (Lines 68-76)
```typescript
// REPLACE THIS:
  // Review/Customization flow state
  const [reviewStep, setReviewStep] = useState<'results' | 'review' | 'customize'>('results')
  const [uiConfig, setUiConfig] = useState({
    dashboard: { statsCards: true, barChart: true, recentActivity: true },
    listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true },
    forms: { smartInputs: true },
    theme: { mode: 'auto' as 'light' | 'dark' | 'auto', accentColor: 'blue' as 'blue' | 'green' | 'purple' | 'orange' },
    output: { preview: true, download: false, deploy: false }
  })

// WITH THIS:
  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  // Schema state for review/customization
  const [reviewedResources, setReviewedResources] = useState<any[]>([])
  const [uiCustomization, setUiCustomization] = useState({
    dashboard: { statsCards: true, barChart: true, recentActivity: true },
    listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true },
    forms: { smartInputs: true },
    theme: { mode: 'auto' as 'light' | 'dark' | 'auto', accentColor: 'blue' as 'blue' | 'green' | 'purple' | 'orange' }
  })
```

### 3. Remove Inline Step Content (Lines 950-1050)
Remove all the inline `reviewStep === 'review'` and `reviewStep === 'customize'` sections.

### 4. Replace Navigation Buttons (Around line 1050)
```typescript
// REPLACE ALL THE STEP NAVIGATION BUTTONS WITH:
              <Button 
                onClick={() => {
                  // Initialize reviewed resources from detected resources
                  const initialReviewed = resources.map(resource => ({
                    ...resource,
                    operations: {
                      list: true,
                      detail: true,
                      create: true,
                      update: true,
                      delete: true
                    },
                    fields: resource.fields.map(field => ({
                      ...field,
                      isVisible: true,
                      isPrimaryKey: field.name === 'id' || field.name.toLowerCase().includes('id')
                    }))
                  }))
                  setReviewedResources(initialReviewed)
                  setShowReviewModal(true)
                }} 
                className="w-full text-white text-lg py-6 mt-6 portal-button"
              >
                Next: Review Schema
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
```

### 5. Update Start Over Button
```typescript
// UPDATE setReviewStep('results') TO:
                  setShowReviewModal(false)
                  setShowCustomizeModal(false)
```

### 6. Add Modals Before Closing </div> (End of component)
Add the two modal components with full schema editing and UI customization features.

## Implementation Status
- ❌ Not yet applied to actual file
- ✅ Clear specification ready
- ✅ Context from previous session available

## Recommendation
Due to the complexity and length of the changes, I recommend:
1. Creating a backup of current AnalyzerPage.tsx
2. Applying changes section by section
3. Testing after each major change
4. Then repeating for SOAPAnalyzerPage.tsx
