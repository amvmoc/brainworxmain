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

#### 4.2 Coupon Redemption Mapping

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

### 8. Payment Integration (if applicable)

**Location:** `/src/components/HomePage.tsx` or payment handler

**Actions:**
- [ ] Add payment type to `onStartPayment` callback
- [ ] Update payment type union in interfaces
- [ ] Configure pricing in payment system
- [ ] Test payment flow
- [ ] Verify successful payment launches assessment

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

### Current Assessment Types

| Display Name | Database ID | Component | Questions |
|-------------|-------------|-----------|-----------|
| Full Assessment (343 Questions) | nipa | NIP3Assessment | 343 |
| ADHD Caregiver Assessment (50 Questions) | adhd-caregiver | ADHDAssessment | 50 |
| Teen Career & Future Direction | teen-career | CareerAssessment | Varies |
| Child Focus & Behaviour Screen (4-6 years) | tcf | SelfAssessmentQuestionnaire | 48 |
| Child Focus & Behaviour Screen (7-10 years) | tadhd | SelfAssessmentQuestionnaire | 60 |

### Where Mappings Are Used

1. **CouponManagement.tsx**: `getAssessmentDatabaseId()` function
2. **SelfAssessmentsPage.tsx**: `handleCouponRedemption()` function
3. **Database**: `assessment_type` column in various tables
4. **Edge Functions**: Email templates and routing logic

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
