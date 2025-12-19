# New Assessment Integration Checklist

This document outlines ALL steps required when adding a new assessment type to the BrainWorX platform. Follow this checklist completely to ensure proper integration across all system components.

## Overview

When adding a new assessment, you must update:
1. Assessment card display
2. Information modal (Learn More page)
3. Payment/coupon flow
4. Coupon creation dropdown
5. Coupon redemption mapping
6. Database tables and migrations
7. Edge functions (if emails required)
8. Reports generation

## Step-by-Step Integration Process

### 1. Database Setup

**Location:** `/supabase/migrations/`

**Actions:**
- [ ] Create new migration file with descriptive name
- [ ] Add table(s) for assessment data
- [ ] Add response/submission tracking table
- [ ] Create scoring/results table if needed
- [ ] Add status tracking fields
- [ ] Create share_token field for public viewing
- [ ] Enable Row Level Security (RLS) on ALL tables
- [ ] Create RLS policies for:
  - Super admins (full access)
  - Franchise owners (their data only)
  - Anonymous users (creation via coupon)
  - Public viewing (via share_token)
- [ ] Add indexes for performance
- [ ] Create status update triggers if needed
- [ ] Test migration locally

**Example fields for main assessment table:**
```sql
id uuid primary key default gen_random_uuid()
franchise_owner_id uuid references franchise_owners(id)
created_by_email text not null
coupon_id uuid references coupon_codes(id)
status text default 'pending'
share_token text unique default generate_share_token()
created_at timestamptz default now()
updated_at timestamptz default now()
```

### 2. Assessment Card Configuration

**Location:** `/src/components/SelfAssessmentsPage.tsx`

**Actions:**
- [ ] Add card object with properties:
  - `id`: Unique identifier (e.g., 'adhd-caregiver')
  - `type`: Same as id
  - `name`: Display name
  - `description`: Full description (2-3 sentences)
  - `icon`: Lucide React icon component
  - `color`: Tailwind gradient (from-X to-Y)
  - `iconColor`: Tailwind text color
  - `borderColor`: Tailwind border color
  - `bgColor`: Tailwind background color
  - `targetAudience`: Age range or audience
  - `questionCount`: Number of questions
  - `price`: Price string (e.g., 'R950') if applicable
  - `assessmentType`: Type label
  - `features`: Array of feature strings (6-8 items)
  - `instructions`: How to complete (paragraph)
  - `disclaimer`: Legal/medical disclaimer
- [ ] Add card to `assessmentCards` array in correct position

### 3. Information Modal (Learn More Page)

**Location:** `/src/components/SelfAssessmentsPage.tsx`

**Actions:**
- [ ] Add state variable: `const [selectedXXX, setSelectedXXX] = useState(false);`
- [ ] Update "Learn More" button onClick to set state to true
- [ ] Create modal component with sections:
  - **Header**: Gradient banner with icon, name, badges
  - **About This Assessment**: Full description
  - **What Makes This Different?**: Unique value proposition
  - **What You'll Discover**: Feature list from card
  - **How It Works**: Step-by-step process (if applicable)
  - **Important Disclaimer**: Legal/medical notice
- [ ] Add three action buttons:
  - "Back to Assessments" (gray)
  - "Proceed to Payment" (gradient, calls `onStartPayment` if applicable)
  - "Have a Coupon Code? / Resume My Test" (green, opens choice modal)
- [ ] Add choice modal with two options:
  - Redeem Coupon Code → Opens `CouponRedemption`
  - Resume My Test → Opens resume email input modal
- [ ] Add resume modal logic to find in-progress assessments
- [ ] Ensure all modals have proper close buttons and state cleanup

**Standard Modal Structure:**
```tsx
if (selectedXXX) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
      {/* Header with close button */}
      {/* Card gradient banner */}
      {/* Info sections */}
      {/* Action buttons */}
      {/* Choice modal */}
      {/* Resume modal */}
      {/* Coupon redemption modal */}
    </div>
  );
}
```

### 4. Coupon System Integration

#### 4.1 Coupon Creation Dropdown

**Location:** `/src/components/CouponManagement.tsx`

**Actions:**
- [ ] Add entry to `getAssessmentOptions()` array:
  ```tsx
  { value: 'Assessment Name (XX Questions)', label: 'Assessment Name (XX Questions)' }
  ```
- [ ] Update `getAssessmentDatabaseId()` mapping:
  ```tsx
  'Assessment Name (XX Questions)': 'database-id'
  ```
- [ ] Ensure mapping function is called in `handleCreateCoupon`
- [ ] Test coupon creation saves correct `assessment_type` in database

#### 4.2 Coupon Redemption Mapping (SelfAssessmentsPage)

**Location:** `/src/components/SelfAssessmentsPage.tsx`

**Actions:**
- [ ] Add mapping in `handleCouponRedemption()`:
  ```tsx
  'Assessment Name (XX Questions)': 'assessment-id'
  ```
- [ ] Add routing logic for assessment type:
  ```tsx
  else if (assessmentId === 'assessment-id') {
    setAssessmentData({
      // Initial data
    });
    setStartAssessment(true);
  }
  ```
- [ ] Test coupon code properly launches assessment

#### 4.3 Coupon Redemption Mapping (GetStartedOptions)

**Location:** `/src/components/GetStartedOptions.tsx`

**CRITICAL:** This file handles coupon redemption from the homepage "Get Started" flow. ALL assessment types must be recognized here to prevent "Unknown assessment type" errors.

**Actions:**
- [ ] Add mapping in `assessmentTypeMap`:
  ```tsx
  'Assessment Name (XX Questions)': 'assessment-id'
  ```
- [ ] Add handling logic in the if-else chain:
  ```tsx
  else if (mappedType === 'assessment-id') {
    // Option 1: Handle directly if assessment can be started from here
    setShowCouponModal(false);
    setStep('assessment_step');

    // Option 2: Redirect with helpful message if assessment requires special flow
    setShowCouponModal(false);
    alert('This coupon is for [Assessment Name]. Please access this from [Location].');
    onClose();
  }
  ```
- [ ] Choose appropriate handling based on assessment requirements:
  - If assessment can be started from homepage → Add new step and render component
  - If assessment requires specific page/flow → Show message and close modal
- [ ] Test coupon redemption from homepage
- [ ] Verify error message is clear and helpful

**Why This Matters:**
Users can redeem coupons from two places:
1. From the Self-Assessments page (dedicated assessment selection)
2. From the homepage "Get Started" modal (quick access)

Both locations MUST recognize all valid assessment types to avoid errors.

### 5. Assessment Component Creation

**Location:** `/src/components/` (new file)

**Actions:**
- [ ] Create main assessment component (e.g., `ADHDAssessment.tsx`)
- [ ] Add props interface with required data
- [ ] Implement welcome/info screen
- [ ] Add user information collection form:
  - All required fields for the assessment
  - Proper validation
  - Clear labels and placeholders
- [ ] Create question display component
- [ ] Add progress tracking (progress bar, question counter)
- [ ] Implement auto-save functionality
- [ ] Add previous/next navigation
- [ ] Handle submission logic
- [ ] Generate and display results
- [ ] Add database save operations
- [ ] Include error handling and loading states

**Standard Data Collection Fields:**
- Email (required)
- Name (required)
- Any assessment-specific fields
- Franchise owner ID (from coupon if applicable)
- Coupon ID (if redeemed via coupon)

### 6. Scoring and Report Generation

**Location:** `/src/utils/` or component-specific

**Actions:**
- [ ] Create scoring algorithm
- [ ] Define category breakdowns
- [ ] Calculate overall scores
- [ ] Determine severity levels
- [ ] Generate individual reports
- [ ] Create comprehensive reports (if multi-respondent)
- [ ] Add visual components (charts, graphs, bars)
- [ ] Implement PDF generation if required
- [ ] Add print-friendly styling

### 7. Edge Functions (Email System)

**Location:** `/supabase/functions/`

**Actions:**
- [ ] Create invitation email function if needed:
  - Professional HTML email template
  - CORS headers properly configured
  - Resend API integration
  - Include coupon code and direct link
  - Test email delivery
- [ ] Create results email function if needed:
  - Client report email
  - Coach report email
  - Attachment handling (PDFs)
- [ ] Update edge function permissions
- [ ] Deploy all functions using MCP tool
- [ ] Test function execution

**Standard Edge Function Template:**
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Function logic here

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

### 8. Payment Integration (Paid Assessments)

**CRITICAL:** This section is for paid assessments that appear in the "Get Started" modal with payment options. If your assessment is free/coupon-only, skip to section 9.

**Primary Location:** `/src/components/GetStartedOptions.tsx`

#### 8.1 Add Payment Type to TypeScript Interfaces

**Line ~14:** Update `preselectedPaymentType` interface prop:
```tsx
preselectedPaymentType?: 'tadhd' | 'pcadhd' | 'tcf' | 'YOUR_NEW_TYPE' | null;
```

**Line ~20:** Update `selectedPaymentType` state type:
```tsx
const [selectedPaymentType, setSelectedPaymentType] = useState<'nipa' | 'tadhd' | 'pcadhd' | 'tcf' | 'YOUR_NEW_TYPE' | null>(preselectedPaymentType || null);
```

#### 8.2 Add Assessment Selection Button

**Location:** Assessment type selection screen (~line 270-345)

**Actions:**
- [ ] Add button with appropriate styling (border color, icon color)
- [ ] Choose icon from lucide-react
- [ ] Set onClick to: `setSelectedPaymentType('YOUR_NEW_TYPE'); setStep('payment');`
- [ ] Add title, description, and price

**Template:**
```tsx
<button
  onClick={() => {
    setSelectedPaymentType('YOUR_NEW_TYPE');
    setStep('payment');
  }}
  className="w-full p-4 border-2 border-[COLOR]-500 rounded-lg hover:bg-[COLOR]-500/10 transition-all text-left group"
>
  <div className="flex items-center gap-3">
    <YourIcon className="text-[COLOR]-500 group-hover:scale-110 transition-transform" size={24} />
    <div className="flex-1">
      <h3 className="font-bold text-[#0A2A5E]">CODE - Assessment Name</h3>
      <p className="text-sm text-gray-600">XX questions • Description</p>
    </div>
    <div className="text-right">
      <p className="text-lg font-bold text-[COLOR]-500">R850</p>
    </div>
  </div>
</button>
```

#### 8.3 Add Payment Summary Display

**Location:** Payment confirmation screen (~line 545-565)

**Actions:**
- [ ] Add conditional display for assessment name:
  ```tsx
  {selectedPaymentType === 'YOUR_NEW_TYPE' && 'Full Assessment Name'}
  ```
- [ ] Add conditional display for price:
  ```tsx
  {selectedPaymentType === 'YOUR_NEW_TYPE' && 'R850.00'}
  ```

#### 8.4 Add Payment Form Fields

**Location:** Hidden form fields for payment gateway (~line 620-695)

**Actions:**
- [ ] Add conditional form section for your assessment:
  ```tsx
  {selectedPaymentType === 'YOUR_NEW_TYPE' && (
    <>
      {/* Standard payment fields */}
      <input required type="hidden" name="merchant_id" value={import.meta.env.VITE_PAYFAST_MERCHANT_ID} />
      <input required type="hidden" name="merchant_key" value={import.meta.env.VITE_PAYFAST_MERCHANT_KEY} />
      <input required type="hidden" name="return_url" value={returnUrl} />
      <input required type="hidden" name="cancel_url" value={cancelUrl} />
      <input required type="hidden" name="notify_url" value={notifyUrl} />

      {/* Assessment-specific fields */}
      <input required type="hidden" name="item_name" maxLength={255} value="YOUR_CODE" />
      <input type="hidden" name="item_description" maxLength={255} value="Full Description" />
      <input required type="hidden" name="amount" value="850.00" />

      {/* Customer fields */}
      <input type="hidden" name="name_first" value={customerName.split(' ')[0]} />
      <input type="hidden" name="name_last" value={customerName.split(' ').slice(1).join(' ') || customerName.split(' ')[0]} />
      <input required type="hidden" name="email_address" maxLength={100} value={email} />

      {/* Custom fields */}
      <input type="hidden" name="custom_str1" value={franchiseOwnerId || ''} />
      <input type="hidden" name="custom_str2" value={couponId || ''} />
      <input type="hidden" name="custom_str3" value="YOUR_NEW_TYPE" />
    </>
  )}
  ```

#### 8.5 Current Paid Assessment Types Reference

| Code | Full Name | Questions | Price | Icon | Color | Line (~) |
|------|-----------|-----------|-------|------|-------|----------|
| NIPA | Full Assessment | 343 | R950 | Brain | Blue (3DB3E3) | ~270 |
| TADHD | Teen ADHD Screener | 48 | R850 | Baby | Purple | ~289 |
| PCADHD | Parent/Caregiver ADHD | 48 | R850 | UserCheck | Blue | ~308 |
| TCF | Teen Career & Future Direction | 132 | R850 | Briefcase | Amber | ~327 |

#### 8.6 Testing Checklist

- [ ] TypeScript types include new payment type (no errors)
- [ ] Button appears in "Get Started" modal
- [ ] Button styling matches other assessments
- [ ] Clicking button navigates to payment screen
- [ ] Payment summary shows correct name and price
- [ ] Payment form includes all required fields
- [ ] Payment gateway receives correct data
- [ ] Successful payment redirects correctly
- [ ] Assessment launches after payment
- [ ] Database records payment transaction

#### 8.7 Additional Integration Points

**Other files that may need updates:**
- `/src/components/HomePage.tsx` - If assessment is launched from homepage
- Payment callback handlers - To process successful payments
- Database tables - To record payment transactions
- Invoice system - To generate invoices for paid assessments

### 9. Dashboard Integration

#### 9.1 Super Admin Dashboard

**Location:** `/src/components/SuperAdminDashboard.tsx`

**Actions:**
- [ ] Add assessment to statistics display
- [ ] Include in assessment type filters
- [ ] Add to data export functionality
- [ ] Update search/filtering logic

#### 9.2 Franchise Dashboard

**Location:** `/src/components/FranchiseDashboard.tsx`

**Actions:**
- [ ] Add assessment card to dashboard grid
- [ ] Include in completed assessments list
- [ ] Add to franchise statistics
- [ ] Update filtering and search
- [ ] Test franchise owner access controls

### 10. Public Results Viewing

**Location:** `/src/components/PublicResultsView.tsx`

**Actions:**
- [ ] Add assessment type to results viewer
- [ ] Handle share token validation
- [ ] Display appropriate report format
- [ ] Test anonymous access
- [ ] Verify RLS policies allow public viewing

### 11. Testing Checklist

- [ ] **Database**
  - Migration runs without errors
  - Tables created with correct schema
  - RLS policies work correctly
  - Triggers fire as expected

- [ ] **UI Flow**
  - Card displays correctly
  - Learn More opens info modal
  - Payment button works (if applicable)
  - Coupon redemption flows properly
  - Resume test finds assessments
  - Assessment launches correctly

- [ ] **Assessment Completion**
  - Questions display properly
  - Progress tracking works
  - Auto-save functions correctly
  - Navigation (previous/next) works
  - Submission completes successfully
  - Results display correctly

- [ ] **Reports**
  - Individual reports generate
  - Combined reports work (if applicable)
  - Charts and visuals render
  - Share links function
  - PDF generation works (if applicable)

- [ ] **Coupon System**
  - Coupons create with correct assessment_type
  - Dropdown shows new assessment
  - Redemption launches correct assessment
  - Validation works properly
  - Email invitations send (if applicable)

- [ ] **Access Control**
  - Super admins see all data
  - Franchise owners see only their data
  - Anonymous users can complete via coupon
  - Public share links work
  - Unauthorized access blocked

- [ ] **Edge Cases**
  - Invalid coupon codes handled
  - Expired coupons rejected
  - Duplicate submissions prevented
  - Missing data errors handled
  - Network errors handled gracefully

### 12. Documentation

**Actions:**
- [ ] Create assessment-specific protocol document
- [ ] Update this checklist if needed
- [ ] Document any special considerations
- [ ] Add code comments for complex logic
- [ ] Update README if needed

## Common Pitfalls to Avoid

1. **Forgetting Coupon System**: Always add new assessments to both dropdown AND mapping
2. **Missing RLS Policies**: Every table MUST have Row Level Security enabled
3. **Inconsistent Naming**: Keep database IDs consistent across all files
4. **No Error Handling**: Always handle API errors and display user-friendly messages
5. **Missing CORS Headers**: All edge functions need proper CORS configuration
6. **Skipping Tests**: Test the complete flow from card click to report generation
7. **Hardcoded Values**: Use configuration objects and mapping functions
8. **No Auto-Save**: Users expect to resume interrupted assessments
9. **Missing Share Links**: All assessments should support public result sharing
10. **Poor Mobile Experience**: Test on mobile devices and responsive breakpoints

## Assessment Type Mappings Reference

### Paid Assessments (GetStartedOptions Modal)

These appear in the "Get Started" payment modal with pricing.

| Payment Code | Full Name | Database ID | Questions | Price | Component |
|-------------|-----------|-------------|-----------|-------|-----------|
| nipa | Full Assessment | nip3 | 343 | R950 | NIP3Assessment |
| tadhd | Teen ADHD Screener | tadhd | 48 | R850 | SelfAssessmentQuestionnaire |
| pcadhd | Parent/Caregiver ADHD | pcadhd | 48 | R850 | SelfAssessmentQuestionnaire |
| tcf | Teen Career & Future Direction | teen-career | 132 | R850 | CareerAssessment |

**Where Used:**
- **GetStartedOptions.tsx**: Payment type unions (line ~14, ~20)
- **GetStartedOptions.tsx**: Assessment selection buttons (~line 270-345)
- **GetStartedOptions.tsx**: Payment summary (~line 545-565)
- **GetStartedOptions.tsx**: Payment form fields (~line 620-695)

### Free/Coupon-Based Assessments

These are accessed via the Self-Assessments page and require coupon codes.

| Display Name (Coupon Dropdown) | Database ID | Component | Questions | Access |
|-------------------------------|-------------|-----------|-----------|--------|
| Full Assessment (343 Questions) | nipa | NIP3Assessment | 343 | Paid + Coupon |
| Full ADHD Assessment (128 Questions) | nipa | NIP3Assessment | 128 | Paid + Coupon |
| ADHD Caregiver Assessment (50 Questions) | adhd-caregiver | ADHDAssessment | 50 | Coupon Only |
| Teen Career & Future Direction | teen-career | CareerAssessment | Varies | Paid + Coupon |
| Child Focus & Behaviour Screen (4-6 years) | tcf | SelfAssessmentQuestionnaire | 48 | Coupon Only |
| Child Focus & Behaviour Screen (7-10 years) | tadhd | SelfAssessmentQuestionnaire | 60 | Coupon Only |

**Where Used:**
- **CouponManagement.tsx**: `getAssessmentOptions()` (dropdown list)
- **CouponManagement.tsx**: `getAssessmentDatabaseId()` (display name → DB ID mapping)
- **SelfAssessmentsPage.tsx**: `handleCouponRedemption()` (routing logic)
- **GetStartedOptions.tsx**: `assessmentTypeMap` (homepage coupon redemption)

### Critical Mapping Locations

When adding ANY new assessment, update ALL of these:

1. **For Paid Assessments:**
   - `GetStartedOptions.tsx` - Add to TypeScript types
   - `GetStartedOptions.tsx` - Add selection button
   - `GetStartedOptions.tsx` - Add to payment summary
   - `GetStartedOptions.tsx` - Add payment form fields

2. **For Free/Coupon Assessments:**
   - `CouponManagement.tsx` - Add to `getAssessmentOptions()`
   - `CouponManagement.tsx` - Add to `getAssessmentDatabaseId()`
   - `SelfAssessmentsPage.tsx` - Add to `handleCouponRedemption()`
   - `GetStartedOptions.tsx` - Add to `assessmentTypeMap`

3. **For ALL Assessments:**
   - Database migrations - Create tables
   - Assessment card - Add to SelfAssessmentsPage
   - Dashboard integration - SuperAdmin and Franchise
   - Edge functions - If emails needed

## File Structure Template

```
/supabase/migrations/
  └── YYYYMMDDHHMMSS_create_xxx_assessment_system.sql

/src/components/
  ├── XXXAssessment.tsx          (Main assessment component)
  ├── XXXReport.tsx              (Individual report)
  └── XXXComprehensiveReport.tsx (Combined report if needed)

/src/utils/
  └── xxxScoring.ts              (Scoring algorithms)

/src/data/
  └── xxxQuestions.ts            (Question data if separate)

/supabase/functions/
  ├── send-xxx-invitation/
  │   └── index.ts
  └── send-xxx-results/
      └── index.ts
```

## Version Control

When committing new assessment:
- Commit message: "Add [Assessment Name] - Complete integration"
- Include all modified files
- Test before committing
- Update version number if applicable

## Post-Integration

After completing all steps:
1. Build project: `npm run build`
2. Test in development environment
3. Deploy database migrations
4. Deploy edge functions
5. Test in production environment
6. Monitor for errors in first 24 hours
7. Document any issues encountered
8. Update this checklist if new steps discovered

---

**Last Updated:** 2025-12-19
**Version:** 1.0
**Assessments Covered:** NIPA, ADHD Caregiver, Teen Career, Child Focus (4-6), Child Focus (7-10)
