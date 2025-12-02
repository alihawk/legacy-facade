# Visual Implementation Guide

## Where Each Change Goes in AnalyzerPage.tsx

```typescript
"use client"

import { useState, ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Skull, Upload, FileJson, Globe, ChevronRight, Sparkles, Braces } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SpookyBackground from "@/components/SpookyBackground"
import SpookyLoader from "@/components/SpookyLoader"
import { useSchemaContext } from "../context/SchemaContext"
// ⬇️ ADD THIS LINE (Section 1)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import axios from "axios"

// ... interfaces ...

export default function AnalyzerPage() {
  // ... existing state ...
  
  const [analyzed, setAnalyzed] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  
  // ⬇️ REPLACE OLD STATE WITH THIS (Section 2)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [reviewedResources, setReviewedResources] = useState<any[]>([])
  const [uiCustomization, setUiCustomization] = useState({
    dashboard: { statsCards: true, barChart: true, recentActivity: true },
    listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true },
    forms: { smartInputs: true },
    theme: { mode: 'auto' as 'light' | 'dark' | 'auto', accentColor: 'blue' as 'blue' | 'green' | 'purple' | 'orange' }
  })

  // ... all handler functions stay the same ...

  return (
    <div className="min-h-screen relative">
      <SpookyBackground />

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Header */}
        {/* ... */}

        {!analyzed ? (
          // UPLOAD INTERFACE - stays the same
          <Card>...</Card>
        ) : (
          // RESULTS INTERFACE
          <Card>
            <CardHeader>...</CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {/* ⬇️ KEEP ONLY THIS - Resource cards display */}
              {resources.map((resource) => (
                <div key={resource.name}>
                  {/* Resource card content */}
                </div>
              ))}

              {/* ❌ DELETE ALL reviewStep === 'review' sections */}
              {/* ❌ DELETE ALL reviewStep === 'customize' sections */}

              {/* Clean Names Button - stays */}
              <div className="pt-4 border-t border-slate-800">
                <Button onClick={handleCleanNames}>...</Button>
              </div>

              {/* ⬇️ REPLACE ALL STEP NAVIGATION WITH THIS (Section 4) */}
              <Button 
                onClick={() => {
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

              {/* Start Over Button */}
              <Button
                variant="ghost"
                onClick={() => {
                  setAnalyzed(false)
                  setResources([])
                  // ⬇️ UPDATE THESE LINES (Section 5)
                  setShowReviewModal(false)
                  setShowCustomizeModal(false)
                  // ... rest of reset logic ...
                }}
              >
                ← Start Over
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ⬇️ ADD BOTH MODALS HERE (Section 6) - Before closing </div> */}
      
      {/* Review Schema Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        {/* ... full modal code from MODAL_CODE_READY_TO_USE.tsx ... */}
      </Dialog>

      {/* Customize Portal Modal */}
      <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
        {/* ... full modal code from MODAL_CODE_READY_TO_USE.tsx ... */}
      </Dialog>

    </div>  {/* ⬅️ This is the closing div */}
  )
}
```

## Summary of Changes

| Location | Action | What |
|----------|--------|------|
| Line ~14 | ADD | Dialog imports |
| Lines ~68-76 | REPLACE | State variables (remove reviewStep, add modals) |
| Lines ~950-1050 | DELETE | All inline review/customize sections |
| Line ~1050 | REPLACE | Step navigation buttons with single modal button |
| Line ~1080 | UPDATE | Start over button reset logic |
| End of component | ADD | Two complete modal components |

## File Size Impact

- **Before:** ~1112 lines
- **After:** ~1300 lines (adds ~200 lines for modals)
- **Net Change:** Cleaner structure despite more lines

## Verification Checklist

After applying changes:
- [ ] File compiles without errors
- [ ] No TypeScript errors
- [ ] "Next: Review Schema" button appears after analysis
- [ ] Review modal opens with operations and fields
- [ ] Customize modal opens with all feature toggles
- [ ] Generate button stores data and navigates to portal
- [ ] Start over resets everything including modals

## Common Issues

### Issue: Dialog not found
**Solution:** Ensure `frontend/src/components/ui/dialog.tsx` exists

### Issue: TypeScript errors on state
**Solution:** The `any[]` type for reviewedResources is intentional for flexibility

### Issue: Modals don't open
**Solution:** Check that Dialog component is imported correctly

## Next: Apply to SOAP Analyzer

After AnalyzerPage works, apply identical changes to SOAPAnalyzerPage.tsx:
- Same structure
- Same logic
- Just change colors: `green` → `purple`
- Change titles: "Review Schema" → "Review SOAP Schema"
