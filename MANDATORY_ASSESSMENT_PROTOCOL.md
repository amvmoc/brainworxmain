# MANDATORY ASSESSMENT INTEGRATION PROTOCOL

**VERSION:** 2.2
**EFFECTIVE DATE:** December 19, 2025
**STATUS:** MANDATORY - NO EXCEPTIONS

---

## ⚠️ CRITICAL RULE ⚠️

**NO ASSESSMENT IS CONSIDERED "COMPLETE" UNTIL ALL 25 VERIFICATION STEPS PASS.**

If you skip ANY step, the assessment WILL BE BROKEN and users WILL NOT be able to access it.

**MOST COMMON FAILURES:**
1. ❌ Name shows blank → You forgot Step 5.4b (add to isSpecialType)
2. ❌ Shows 0 questions → You forgot Step 5.4b (add to isSpecialType)
3. ❌ Not in coupon dropdown → You forgot Step 6.1 (add to dropdown options)
4. ❌ Coupon redemption fails → Name mismatch between card (Step 5.1) and dropdown (Step 6.1)

---

## 🔑 NAME CONSISTENCY REQUIREMENT

**CRITICAL:** The assessment display name MUST be EXACTLY the same in all 5 integration points:

1. **Step 5.3:** Assessment card `name` field
2. **Step 6.1:** Coupon dropdown option
3. **Step 6.2:** Database ID mapping
4. **Step 5.5:** SelfAssessmentsPage redemption mapping
5. **Step 7.3:** GetStartedOptions type mapping

**Format:** `[Card Name] ([X] Questions)`

**Example:** If card name is `Parent/Caregiver ADHD 7-10 Assessment`, then:
- Dropdown: `Parent/Caregiver ADHD 7-10 Assessment (80 Questions)`
- All mappings: `'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)': 'adhd710'`

**One character difference will break coupon redemption!**

---

## PROTOCOL EXECUTION ORDER

Follow these steps IN ORDER. Do not skip ahead. Do not assume any step is done.

---

## PHASE 1: PLANNING & SPECIFICATION (30 minutes)

### Step 1.1: Create Assessment Specification Document
**File:** `SPEC_[ASSESSMENT_NAME].md`

```markdown
# [Assessment Name] Specification

## Basic Information
- Assessment ID: [unique-id]
- Display Name: [Full Name]
- Target Audience: [age/population]
- Question Count: [number]
- Estimated Duration: [minutes]
- Assessment Type: [single/dual-respondent]
- Database: [table name(s)]

## Question Structure
- Categories: [list]
- Question Format: [Likert/multiple choice/etc]
- Scoring Method: [description]

## Respondent Requirements
- Number of respondents: [1 or 2]
- Respondent types: [parent, teacher, self, etc]

## Report Types
- Individual reports: [yes/no]
- Combined report: [yes/no]
- Key metrics: [list]

## Access Control
- Payment required: [yes/no]
- Coupon support: [yes/no]
- Free access: [yes/no]
```

**Verification:** ✅ Specification document created and reviewed

---

## PHASE 2: DATABASE SETUP (45 minutes)

### Step 2.1: Create Migration File
**Location:** `supabase/migrations/YYYYMMDDHHMMSS_create_[name]_assessment.sql`

**Required sections:**
1. Markdown comment header with full description
2. Table creation with all fields
3. Indexes for performance
4. RLS enable statements
5. Complete RLS policy set

**Mandatory RLS Policies:**
```sql
-- Super admin read all
CREATE POLICY "Super admins can view all [table]"
  ON [table] FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM franchise_owners WHERE id = auth.uid() AND is_super_admin = true));

-- Franchise owner read own
CREATE POLICY "Franchise owners can view own [table]"
  ON [table] FOR SELECT TO authenticated
  USING (franchise_owner_id = auth.uid());

-- Anonymous INSERT (CRITICAL!)
CREATE POLICY "Anonymous users can create [table]"
  ON [table] FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated INSERT
CREATE POLICY "Authenticated users can create [table]"
  ON [table] FOR INSERT TO authenticated
  WITH CHECK (true);

-- Anonymous UPDATE
CREATE POLICY "Anonymous users can update [table]"
  ON [table] FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- Public read via token
CREATE POLICY "Public can view [table] via share token"
  ON [table] FOR SELECT TO anon
  USING (share_token IS NOT NULL);
```

**Verification:** ✅ Migration applied successfully

### Step 2.2: Test RLS Policies
```sql
-- Test as anonymous user
SET ROLE anon;
INSERT INTO [table] (...) VALUES (...);
-- Should succeed

-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM [table];
-- Should see appropriate rows
```

**Verification:** ✅ RLS policies tested and working

---

## PHASE 3: QUESTION DATA & SCORING (60 minutes)

### Step 3.1: Create Questions Data File
**Location:** `src/data/[assessment]Questions.ts`

**Required exports:**
- Question interface
- Questions array
- Categories/patterns object
- Response options
- Scoring functions
- Severity level functions

**Verification:** ✅ Questions file created with all functions

### Step 3.2: Create Assessment Component
**Location:** `src/components/[Assessment]Assessment.tsx`

**Required features:**
- Info collection form
- Question progression
- Progress tracking
- Auto-save functionality
- Previous/next navigation
- Completion handling
- Error handling
- Loading states

**Verification:** ✅ Component created and tested in isolation

---

## PHASE 4: REPORT GENERATION (45 minutes)

### Step 4.1: Create Report Components
**Location:** `src/components/[Assessment]Report.tsx`

**Individual Report Requirements:**
- Assessment details header
- Overall score with severity
- Category breakdown with visuals
- Top concerns highlighted
- Interpretation guide
- Next steps/recommendations
- Disclaimer section

**Verification:** ✅ Report components created

### Step 4.2: Create Comprehensive Report (if dual-respondent)
**Additional Requirements:**
- Side-by-side comparison
- Comparison charts (bar, radar)
- Agreement/discrepancy analysis
- Combined scoring
- Clinical summary

**Verification:** ✅ Comprehensive report created (if applicable)

---

## PHASE 5: SELF-ASSESSMENTS PAGE INTEGRATION (90 minutes)

**THIS IS THE MOST CRITICAL PHASE - DO NOT SKIP ANY SUBSTEP**

### Step 5.1: Import Assessment Component
**File:** `src/components/SelfAssessmentsPage.tsx`

```typescript
import [Assessment]Assessment from './[Assessment]Assessment';
```

**Verification:** ✅ Import added

### Step 5.2: Add State Variables
```typescript
const [selected[Assessment], setSelected[Assessment]] = useState(false);
const [start[Assessment], setStart[Assessment]] = useState(false);
const [[assessment]Data, set[Assessment]Data] = useState<{
  // Define structure
} | null>(null);
```

**Verification:** ✅ State variables added

### Step 5.3: Create Assessment Card Object
**⚠️ CRITICAL: The `name` field value MUST be used EXACTLY in all other integration points!**

```typescript
const [assessment]Card = {
  id: '[assessment-id]',
  name: '[Card Display Name]',  // ← THIS EXACT STRING MUST BE USED IN STEPS 6.1, 6.2, 5.5, 7.3
  description: '[2-3 sentence description]',
  icon: [IconComponent],
  color: 'from-[color1]-500 to-[color2]-500',
  iconColor: 'text-[color]-500',
  borderColor: 'border-[color]-500',
  bgColor: 'bg-[color]-50',
  targetAudience: '[Age Range]',
  questionCount: [number],
  assessmentType: '[Type Label]',
  features: [
    'Feature 1',
    'Feature 2',
    // ... 6-8 features
  ],
  instructions: '[How to complete]',
  disclaimer: '[Legal/medical disclaimer]'
};
```

**Verification:** ✅ Card object created with consistent name

### Step 5.4: Add to assessmentCards Array
```typescript
const assessmentCards = [
  // ... existing cards
  {
    type: '[assessment-id]',
    ...[assessment]Card
  }
];
```

**Verification:** ✅ Card added to array

### Step 5.4b: Add to Rendering Logic Special Types
**CRITICAL: If you skip this, the card will show blank name and 0 questions!**

**File:** `src/components/SelfAssessmentsPage.tsx`

Find the assessmentCards.map section and add your assessment type to the special types check:

```typescript
{assessmentCards.map((card, index) => {
  const isNIPA = card.type === 'nipa';
  const isADHDCaregiver = card.type === 'adhd-caregiver';
  const isADHD710 = card.type === 'adhd710';
  const is[YourAssessment] = card.type === '[assessment-id]';  // ADD THIS LINE
  const isSpecialType = isNIPA || isADHDCaregiver || isADHD710 || is[YourAssessment];  // ADD YOUR CHECK HERE
```

**Why:** The rendering logic uses `isSpecialType` to determine if it should use `card.name` and `card.questionCount`. If your assessment is not in this check, it will display empty name and 0 questions!

**Verification:** ✅ Assessment added to isSpecialType check

### Step 5.5: Add Coupon Redemption Mapping
**⚠️ CRITICAL: Must match dropdown option from Step 6.1 exactly!**

```typescript
const assessmentNameMap: Record<string, string> = {
  // ... existing mappings
  '[Card Name] ([X] Questions)': '[assessment-id]',  // ← EXACT MATCH WITH STEP 6.1
};
```

**Verification:** ✅ Redemption mapping added with exact string match

### Step 5.6: Add Coupon Handler Logic
```typescript
else if (assessmentId === '[assessment-id]') {
  set[Assessment]Data({
    // initial data
  });
  setStart[Assessment](true);
}
```

**Verification:** ✅ Coupon handler logic added

### Step 5.7: Add Conditional Rendering for Assessment
```typescript
if (start[Assessment] && [assessment]Data) {
  return (
    <[Assessment]Assessment
      // props
      onClose={onClose}
    />
  );
}
```

**Verification:** ✅ Conditional rendering added

### Step 5.8: Create Complete Info Modal
**Required sections:**
- Gradient header with icon and badges
- "About This Assessment"
- "What Makes This Different?"
- "What You'll Discover" (features list)
- "How It Works" (step-by-step if applicable)
- "Important Disclaimer"
- Three action buttons:
  - Back to Assessments
  - Proceed to Payment (if paid)
  - Have a Coupon Code? / Resume My Test

**Verification:** ✅ Complete info modal created

### Step 5.9: Add Click Handler for Learn More
```typescript
onClick={() => {
  if (card.type === '[assessment-id]') {
    setSelected[Assessment](true);
  }
}}
```

**Verification:** ✅ Click handler added

### Step 5.10: Test Self-Assessments Page
- [ ] Card appears in grid
- [ ] "Learn More" opens modal
- [ ] All modal sections display correctly
- [ ] Payment button works (if applicable)
- [ ] Coupon button opens coupon modal
- [ ] Resume button opens resume modal

**Verification:** ✅ All tests pass

---

## PHASE 6: COUPON SYSTEM INTEGRATION (30 minutes)

### Step 6.1: Update CouponManagement Dropdown
**File:** `src/components/CouponManagement.tsx`

**⚠️ CRITICAL: The dropdown option MUST match the card name EXACTLY!**

**Format:** `'[Card Name from Step 5.3] ([questionCount] Questions)'`

**Location:** `getAssessmentOptions()` function

```typescript
const options = [
  // ... existing options
  { value: '[Card Name] ([X] Questions)', label: '[Card Name] ([X] Questions)' },
];
```

**Example:** If card name is "Parent/Caregiver ADHD 7-10 Assessment", dropdown must be:
```typescript
{ value: 'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)', label: 'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)' }
```

**Verification:** ✅ Dropdown option added with exact name match

### Step 6.2: Update Database ID Mapping
**⚠️ CRITICAL: The mapping key MUST exactly match the dropdown option from Step 6.1!**

**File:** `src/components/CouponManagement.tsx`

**Location:** `getAssessmentDatabaseId()` function

```typescript
const mapping: Record<string, string> = {
  // ... existing mappings
  '[Card Name] ([X] Questions)': '[assessment-id]',  // ← MUST MATCH STEP 6.1 EXACTLY
};
```

**Example:**
```typescript
'Parent/Caregiver ADHD 7-10 Assessment (80 Questions)': 'adhd710',
```

**Verification:** ✅ Database mapping added with exact string match

### Step 6.3: Test Coupon Creation
- [ ] New assessment appears in dropdown
- [ ] Can create coupon for assessment
- [ ] Correct assessment_type saved in database

**Verification:** ✅ Coupon creation tested

---

## PHASE 7: HOMEPAGE MODAL INTEGRATION (45 minutes)

### Step 7.1: Import Component
**File:** `src/components/GetStartedOptions.tsx`

```typescript
import [Assessment]Assessment from './[Assessment]Assessment';
```

**Verification:** ✅ Import added

### Step 7.2: Add to Step Type Union
```typescript
const [step, setStep] = useState<'options' | ... | '[assessment]_step' | 'payment'>(...);
```

**Verification:** ✅ Step type added

### Step 7.3: Add Assessment Type Mapping
**⚠️ CRITICAL: Must match dropdown option from Step 6.1 exactly!**

**File:** `src/components/GetStartedOptions.tsx`

```typescript
const assessmentTypeMap: Record<string, string> = {
  // ... existing mappings
  '[Card Name] ([X] Questions)': '[assessment-id]',  // ← EXACT MATCH WITH STEP 6.1
};
```

**Verification:** ✅ Type mapping added with exact string match

### Step 7.4: Add Routing Logic
```typescript
else if (mappedType === '[assessment-id]') {
  console.log('Navigating to [Assessment]');
  setShowCouponModal(false);
  setStep('[assessment]_step');
}
```

**Verification:** ✅ Routing logic added

### Step 7.5: Add Rendering Block
```typescript
if (step === '[assessment]_step') {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <[Assessment]Assessment
        // props
        onClose={onClose}
      />
    </div>
  );
}
```

**Verification:** ✅ Rendering block added

### Step 7.6: Test Homepage Flow
- [ ] Can redeem coupon from homepage
- [ ] Assessment launches correctly
- [ ] All props passed correctly
- [ ] onClose works properly

**Verification:** ✅ Homepage flow tested

---

## PHASE 8: EDGE FUNCTIONS (if emails required) (60 minutes)

### Step 8.1: Create Invitation Email Function
**Location:** `supabase/functions/send-[assessment]-invitation/index.ts`

**Required:**
- CORS headers
- Resend API integration
- Professional email template
- Error handling

**Verification:** ✅ Invitation function created

### Step 8.2: Create Results Email Function
**Location:** `supabase/functions/send-[assessment]-results/index.ts`

**Required:**
- Individual report email
- Combined report email (if applicable)
- PDF attachment support (if needed)

**Verification:** ✅ Results function created

### Step 8.3: Deploy Edge Functions
```bash
# Use MCP tool to deploy
```

**Verification:** ✅ Edge functions deployed

---

## PHASE 9: DASHBOARD INTEGRATION (30 minutes)

### Step 9.1: Add to Super Admin Dashboard
**File:** `src/components/SuperAdminDashboard.tsx`

- Add to statistics
- Add to filters
- Add to data export
- Add to search

**Verification:** ✅ Super admin integration complete

### Step 9.2: Add to Franchise Dashboard
**File:** `src/components/FranchiseDashboard.tsx`

- Add assessment card
- Add to completed list
- Add to statistics
- Test franchise owner access

**Verification:** ✅ Franchise dashboard integration complete

---

## PHASE 10: TESTING & VERIFICATION (45 minutes)

### Step 10.1: Build Test
```bash
npm run build
```

**Must complete without errors**

**Verification:** ✅ Build successful

### Step 10.2: Manual Testing Checklist

**Self-Assessments Page:**
- [ ] Assessment card appears
- [ ] Icon and colors correct
- [ ] **CRITICAL: Name displays (not blank)**
- [ ] **CRITICAL: Question count shows correct number (not 0)**
- [ ] Description displays
- [ ] Features list shows
- [ ] Target audience visible
- [ ] Special badge displays (if applicable)
- [ ] "Learn More" button works

**Info Modal:**
- [ ] Opens on button click
- [ ] All sections display
- [ ] Close button works
- [ ] Back button works
- [ ] Payment button works (if applicable)
- [ ] Coupon button opens coupon modal
- [ ] Resume button opens resume modal

**Coupon Flow:**
- [ ] **CRITICAL: Assessment appears in coupon dropdown with correct name and question count**
- [ ] Assessment name exactly matches in both dropdown and database mapping
- [ ] Can create coupon
- [ ] Correct DB type saved (verify in database)
- [ ] Can redeem from Self-Assessments page
- [ ] Can redeem from homepage modal
- [ ] Assessment launches correctly after redemption

**Assessment Completion:**
- [ ] Can enter required info
- [ ] Questions display correctly
- [ ] Progress tracking works
- [ ] Can navigate previous/next
- [ ] Auto-save functions
- [ ] Can complete assessment
- [ ] Report generates correctly
- [ ] Can share results

**Database:**
- [ ] Records created correctly
- [ ] RLS policies work
- [ ] Anonymous users can create
- [ ] Franchise owners see their data
- [ ] Super admins see all data

**Verification:** ✅ All manual tests pass

---

## PHASE 11: DOCUMENTATION (30 minutes)

### Step 11.1: Create Assessment Protocol Document
**File:** `[ASSESSMENT]_PROTOCOL.md`

Document:
- Assessment overview
- Flow diagrams
- Database schema
- Coupon integration
- Email templates
- Scoring methodology
- Report structure

**Verification:** ✅ Protocol document created

### Step 11.2: Update Main Protocol
Add assessment to current assessment types list in:
- `ASSESSMENT_SYSTEM_PROTOCOL.md`
- `NEW_ASSESSMENT_CHECKLIST.md`

**Verification:** ✅ Protocol documents updated

---

## FINAL VERIFICATION CHECKLIST

**Complete this checklist. ALL items must be ✅ before marking assessment as complete.**

### Integration Points
1. ✅ Assessment in `SelfAssessmentsPage.tsx` assessment cards array
2. ✅ **CRITICAL: Assessment added to `isSpecialType` check in rendering logic**
3. ✅ Assessment has complete info modal with "Learn More"
4. ✅ Assessment in `CouponManagement.tsx` dropdown
5. ✅ Assessment in `CouponManagement.tsx` getAssessmentDatabaseId
6. ✅ Assessment in `SelfAssessmentsPage` handleCouponRedemption
7. ✅ Assessment in `GetStartedOptions` assessmentTypeMap
8. ✅ Assessment component imported in `GetStartedOptions`
9. ✅ Assessment in `GetStartedOptions` step type union
10. ✅ Assessment routing in `GetStartedOptions` handleCouponRedemption
11. ✅ Assessment rendering in `GetStartedOptions`

### Visual Display
12. ✅ **Assessment name displays correctly (not blank)**
13. ✅ **Question count displays correctly (not 0)**
14. ✅ **Assessment shows in coupon dropdown with EXACT name match**
15. ✅ **Name is IDENTICAL in: Card, Dropdown, Database mapping, Redemption mapping, Homepage**

### Functionality
16. ✅ RLS policies allow anonymous INSERT
17. ✅ Can start from Self-Assessments page
18. ✅ Can redeem coupon from Self-Assessments
19. ✅ Can redeem coupon from homepage
20. ✅ `npm run build` succeeds

### Testing
21. ✅ Manual testing complete
22. ✅ Database queries tested
23. ✅ Reports generate correctly
24. ✅ Emails send successfully (if applicable)
25. ✅ Documentation complete

---

## PROTOCOL VIOLATIONS

**If ANY step is skipped or incomplete:**

1. Assessment is marked as INCOMPLETE
2. Assessment MUST NOT be deployed
3. ALL steps must be completed before proceeding

**Common violations and fixes:**

| Violation | Impact | Fix |
|-----------|--------|-----|
| Not in isSpecialType check | Name blank, 0 questions display | Add to rendering logic (Step 5.4b) |
| Not in coupon dropdown | Can't create coupons | Add to getAssessmentOptions (Step 6.1) |
| No database mapping | Coupon validation fails | Add to getAssessmentDatabaseId (Step 6.2) |
| **Name inconsistency** | **Redemption fails silently** | **Ensure exact match: Steps 5.3, 6.1, 6.2, 5.5, 7.3** |
| Not in SelfAssessmentsPage | Users can't find it | Add full integration |
| No GetStartedOptions integration | Homepage broken | Add full integration |
| Missing RLS policies | Users blocked | Create comprehensive policies |
| No info modal | Poor UX | Create complete modal |

---

## SIGN-OFF REQUIREMENTS

Before marking assessment as complete, THREE people must verify:

1. **Developer:** "I have completed all 25 checklist items and verified name consistency across all 5 integration points"
2. **Reviewer:** "I have verified all integration points work, name displays, question count shows, and names match exactly"
3. **Tester:** "I have tested the complete user journey and verified coupon dropdown shows assessment correctly"

**Signature Block:**
```
Developer: _________________ Date: _________
Reviewer:  _________________ Date: _________
Tester:    _________________ Date: _________
```

---

## MAINTENANCE

**This protocol must be updated when:**
- New integration points are added
- New tools or systems are introduced
- Common issues are discovered

**Review Schedule:** Monthly

**Version History:**
- v2.2 (2025-12-19): Added name consistency requirements across all integration points
- v2.1 (2025-12-19): Added critical visual display checks (name, question count, dropdown) and Step 5.4b
- v2.0 (2025-12-19): Added comprehensive checklist after ADHD710 incident
- v1.0 (2025-12-01): Initial protocol

---

**REMEMBER: NO SHORTCUTS. NO EXCEPTIONS. NO EXCUSES.**

**IF A STEP SEEMS OPTIONAL, IT'S NOT.**
