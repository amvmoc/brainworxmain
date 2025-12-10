# Modal Architecture Documentation

## Critical Rules for Modal Implementation

### Rule 1: Modal Placement
**ALL modals MUST be placed OUTSIDE view conditional blocks**

```tsx
// ❌ WRONG - Modal inside conditional view
{currentView === 'tests' ? (
  <TestsView />
  {selectedReport && <ReportModal />}  // This won't work from other views!
) : (
  <OtherView />
)}

// ✅ CORRECT - Modal outside all conditionals
{currentView === 'tests' ? (
  <TestsView />
) : (
  <OtherView />
)}

{selectedReport && <ReportModal />}  // Works from any view!
```

### Rule 2: Z-Index Hierarchy

Maintain this z-index hierarchy across all components:

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base Content | 0-40 | Dashboard content, cards, tables |
| Standard Modals | 50 | selectedResponse, showClientReport |
| Report Modals | 100-110 | viewingTestReport (Coach/Self Assessment) |
| Profile Modals | 200 | CustomerProfileModal (highest priority) |

**Why this matters:**
- Lower z-index modals can be covered by higher ones
- Profile modal needs highest z-index as it can open from Calendar view
- Report modals need mid-high z-index as they display detailed content

### Rule 3: Component Structure

The FranchiseDashboard follows this structure:

```
FranchiseDashboard
├── Navigation (tabs)
├── View Conditionals
│   ├── Dashboard View
│   ├── Tests View
│   ├── Calendar View
│   └── Invoices View
├── GLOBAL MODALS SECTION ← ALL MODALS GO HERE
│   ├── selectedResponse modal
│   ├── showClientReport modal
│   └── viewingTestReport modal
└── Closing tags
```

## Current Modal Inventory

### 1. Customer Details Preview Modal
- **State:** `selectedResponse`
- **Z-Index:** 50
- **Trigger:** Clicking prospect in Dashboard view
- **File:** FranchiseDashboard.tsx (line ~510)

### 2. Full Client Report Modal
- **State:** `showClientReport`
- **Z-Index:** 50
- **Trigger:** "View Full Client Report" button
- **File:** FranchiseDashboard.tsx (line ~637)

### 3. Test Report Viewer Modal
- **State:** `viewingTestReport`
- **Z-Index:** 100-110
- **Trigger:** "View Report" button in Tests tab
- **File:** FranchiseDashboard.tsx (line ~656)
- **Special:** Conditionally renders CoachReport or SelfAssessmentReport

### 4. Customer Profile Modal
- **Component:** `CustomerProfileModal`
- **Z-Index:** 200 (highest)
- **Trigger:** Clicking customer name in Calendar bookings
- **File:** CustomerProfileModal.tsx (line ~156)
- **Special:** Must be highest z-index as it opens from Calendar view

## Common Mistakes to Avoid

### ❌ Mistake 1: Putting Modal Inside Conditional
```tsx
// This breaks when viewing from other tabs
{currentView === 'tests' && (
  <>
    <TestsList />
    {viewingReport && <ReportModal />}
  </>
)}
```

### ❌ Mistake 2: Incorrect Z-Index
```tsx
// CustomerProfileModal would be hidden by other modals
<div className="... z-50">  // TOO LOW!
```

### ❌ Mistake 3: Forgetting Close Button
```tsx
// User gets trapped in modal
<Modal>
  <Content />
  {/* Missing: close button or click-outside handler */}
</Modal>
```

## Testing Checklist

When modifying modals, verify:

- [ ] Modal opens from the correct trigger
- [ ] Modal displays on top of all other content
- [ ] Modal can be closed (button + click outside if applicable)
- [ ] Modal works from ALL tabs/views (not just one)
- [ ] Modal content is fully visible and scrollable if needed
- [ ] No console errors when opening/closing
- [ ] State is properly reset when closing

## Adding a New Modal

Follow these steps:

1. **Add state variable** at component top:
   ```tsx
   const [showNewModal, setShowNewModal] = useState(false);
   ```

2. **Determine z-index** based on hierarchy:
   - Content modal: z-50
   - Report/detailed view: z-100
   - Overlay on calendar: z-200

3. **Add modal JSX** in GLOBAL MODALS section:
   ```tsx
   {/* Modal: Description of what it does */}
   {showNewModal && (
     <div className="fixed inset-0 bg-black/50 z-[XX] flex items-center justify-center">
       {/* Modal content */}
     </div>
   )}
   ```

4. **Add close handler**:
   ```tsx
   onClick={() => setShowNewModal(false)}
   ```

5. **Test from all tabs** to ensure it works everywhere

## Maintenance Notes

- Last updated: 2024-12-10
- Current modal count: 4
- All modals: Working correctly
- Known issues: None

## Questions?

If you're unsure about modal implementation:
1. Check this document first
2. Look at existing modal examples in FranchiseDashboard.tsx
3. Follow the z-index hierarchy strictly
4. Always place modals outside view conditionals
