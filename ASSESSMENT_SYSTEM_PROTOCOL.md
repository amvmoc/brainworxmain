# Assessment System Protocol

## Complete Guide for Adding New Assessments to BrainworX Platform

**Version:** 1.1
**Last Updated:** December 19, 2025
**Author:** BrainworX Development Team

---

## ⚠️ CRITICAL: PRE-DEPLOYMENT CHECKLIST ⚠️

**BEFORE marking ANY assessment as "complete", verify ALL of these:**

### Integration Checklist
1. ✅ Assessment appears in `SelfAssessmentsPage.tsx` assessment cards array
2. ✅ Assessment has complete info modal with "Learn More" functionality
3. ✅ Assessment in `CouponManagement.tsx` dropdown options
4. ✅ Assessment in `CouponManagement.tsx` getAssessmentDatabaseId mapping
5. ✅ Assessment in `SelfAssessmentsPage` handleCouponRedemption mapping
6. ✅ Assessment in `GetStartedOptions` assessmentTypeMap
7. ✅ Assessment component imported in `GetStartedOptions`
8. ✅ Assessment has step type in `GetStartedOptions` union
9. ✅ Assessment has routing logic in `GetStartedOptions` handleCouponRedemption
10. ✅ Assessment has rendering block in `GetStartedOptions`
11. ✅ RLS policies allow anonymous INSERT
12. ✅ Can start assessment from Self-Assessments page
13. ✅ Can redeem coupon from Self-Assessments page
14. ✅ Can redeem coupon from homepage "Get Started" modal
15. ✅ `npm run build` completes without errors

**IF ANY ITEM IS MISSING, THE ASSESSMENT IS NOT COMPLETE!**

---

## Table of Contents

1. [Overview](#overview)
2. [Assessment Types](#assessment-types)
3. [Step-by-Step Protocol for Adding New Tests](#step-by-step-protocol)
4. [Database Architecture](#database-architecture)
5. [Coupon & Payment Integration](#coupon--payment-integration)
6. [Report Generation System](#report-generation-system)
7. [Email Delivery System](#email-delivery-system)
8. [Testing Procedures](#testing-procedures)
9. [Deployment Checklist](#deployment-checklist)

---

## Overview

The BrainworX platform supports multiple assessment types with a standardized architecture for:
- **Question delivery** and progress tracking
- **Response collection** and storage
- **Scoring** and analysis
- **Report generation** (individual and comprehensive)
- **Coupon redemption** and payment processing
- **Email delivery** of results

### Current Assessment Types

| Assessment ID | Name | Respondents | Question Count | Database |
|--------------|------|-------------|----------------|----------|
| `nipa` | Neural Imprint Patterns Assessment | Single | 344 | `responses` |
| `teen-adhd` | Teen ADHD Self-Assessment | Single | 48 | `self_assessment_responses` |
| `child-adhd-4-6` | Child ADHD (4-6 years) | Single | 48 | `self_assessment_responses` |
| `child-adhd-7-10` | Child ADHD (7-10 years) | Single | 60 | `self_assessment_responses` |
| `teen-career` | Teen Career & Future Direction | Single | Variable | `responses` |
| `adhd-caregiver` | ADHD Caregiver Assessment | Dual (Parent + Caregiver) | 50 each | `adhd_assessments` + `adhd_assessment_responses` |

---

## Assessment Types

### Type 1: Single-Respondent Self-Assessment
**Examples:** Teen ADHD, Child ADHD
**Database:** `self_assessment_responses`
**Features:**
- One person completes assessment
- Immediate individual report
- Optional franchise owner oversight
- Coupon-based access

### Type 2: Single-Respondent Full Assessment
**Examples:** NIPA, Career Assessment
**Database:** `responses`
**Features:**
- Comprehensive multi-round questionnaire
- Detailed client and coach reports
- Mandatory payment or coupon
- Professional debrief session included

### Type 3: Multi-Respondent Assessment
**Examples:** ADHD Caregiver Assessment
**Database:** `adhd_assessments` + `adhd_assessment_responses`
**Features:**
- Multiple respondents required (parent + teacher)
- Individual report for each respondent
- Comprehensive combined report when all complete
- Comparison analysis across settings

---

## Step-by-Step Protocol for Adding New Tests

### Phase 1: Planning & Design

#### 1.1 Define Assessment Specifications

Create a specification document including:

```markdown
# Assessment Specification

## Basic Information
- **Assessment Name:** [Full name]
- **Assessment ID:** [unique-id]
- **Target Audience:** [age range, population]
- **Assessment Type:** [single/multi-respondent]
- **Question Count:** [number]
- **Estimated Duration:** [minutes]
- **Price:** [amount or free]

## Assessment Structure
- Categories/Domains covered
- Question format (Likert scale, multiple choice, etc.)
- Scoring methodology
- Severity levels or classifications

## Respondent Requirements
- Who can complete this assessment?
- Number of respondents required
- Relationship requirements (if applicable)

## Report Requirements
- Individual report format
- Comprehensive report (if multi-respondent)
- Key metrics and visualizations
- Recommendations structure

## Integration Requirements
- Payment/coupon support needed
- Email delivery requirements
- Franchise owner visibility
- Public sharing capability
```

#### 1.2 Choose Database Architecture

**Decision Tree:**

```
Is it multi-respondent?
├─ YES → Create dedicated tables (like adhd_assessments)
│        - Main assessment table
│        - Response table with respondent_type
│        - Status tracking across respondents
│
└─ NO → Is it comprehensive full assessment?
         ├─ YES → Use `responses` table
         │        - Supports two-round process
         │        - Coach report generation
         │        - Parent-child relationships
         │
         └─ NO → Use `self_assessment_responses`
                  - Simpler structure
                  - Direct completion
                  - Immediate results
```

### Phase 2: Database Implementation

#### 2.1 Create Migration File

Location: `supabase/migrations/YYYYMMDDHHMMSS_create_[assessment_name]_system.sql`

**Template for Single-Respondent:**

```sql
/*
  # Create [Assessment Name] System

  ## Overview
  [Brief description of the assessment]

  ## New Tables
  N/A - Uses existing self_assessment_responses table

  ## Updates
  - Add assessment type to coupon_codes validation
  - Update sales_log to track this assessment type

  ## Security
  - RLS policies inherited from self_assessment_responses
*/

-- No new tables needed for single-respondent assessments
-- Just ensure assessment_type is properly handled

-- Add to coupon types if using coupons
-- (handled in coupon management)
```

**Template for Multi-Respondent:**

```sql
/*
  # Create [Assessment Name] System

  ## New Tables

  ### `[assessment]_assessments`
  Main assessment record
  - `id` (uuid, primary key)
  - `[subject fields - name, age, etc.]`
  - `franchise_owner_id` (uuid, nullable)
  - `created_by_email` (text)
  - `coupon_id` (uuid, nullable)
  - `status` (text) - tracks completion progress
  - `share_token` (text, unique)
  - `created_at`, `updated_at`

  ### `[assessment]_responses`
  Individual respondent responses
  - `id` (uuid, primary key)
  - `assessment_id` (uuid) - FK to main table
  - `respondent_type` (text) - role identifier
  - `respondent_name`, `respondent_email`
  - `respondent_relationship` (text)
  - `responses` (jsonb)
  - `scores` (jsonb)
  - `completed` (boolean)
  - `completed_at`
  - `created_at`, `updated_at`

  ## Security
  - Enable RLS on all tables
  - Franchise owners can view/edit their assessments
  - Super admins can view/edit all
  - Public access via share_token
  - Anonymous access for respondents

  ## Triggers
  - Auto-update status based on completion
  - Sales log integration
*/

-- CREATE TABLE statements
-- CREATE INDEX statements
-- ALTER TABLE ENABLE ROW LEVEL SECURITY
-- CREATE POLICY statements for all operations
-- CREATE FUNCTION for triggers
-- CREATE TRIGGER statements
```

#### 2.2 Create RLS Policies

**Standard Policy Set:**

```sql
-- Super admin read all
CREATE POLICY "Super admins can view all [table]"
  ON [table] FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Franchise owner read own
CREATE POLICY "Franchise owners can view own [table]"
  ON [table] FOR SELECT
  TO authenticated
  USING (franchise_owner_id = auth.uid());

-- Public read via token
CREATE POLICY "Public can view [table] via share token"
  ON [table] FOR SELECT
  TO anon
  USING (true);

-- Anonymous insert (for new assessments)
CREATE POLICY "Anonymous users can create [table]"
  ON [table] FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anonymous update (for progress)
CREATE POLICY "Anonymous users can update [table]"
  ON [table] FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Franchise owner delete own
CREATE POLICY "Franchise owners can delete own [table]"
  ON [table] FOR DELETE
  TO authenticated
  USING (franchise_owner_id = auth.uid());
```

### Phase 3: Frontend Implementation

#### 3.1 Create Questions Data File

Location: `src/data/[assessment]Questions.ts`

```typescript
export interface [Assessment]Question {
  id: number;
  category: string;
  text: string;
  // Add respondent filtering if multi-respondent:
  respondentTypes?: ('type1' | 'type2')[];
}

export const [ASSESSMENT]_CATEGORIES = {
  CATEGORY1: 'Category Name 1',
  CATEGORY2: 'Category Name 2',
  // ... more categories
};

export const [ASSESSMENT]_QUESTIONS: [Assessment]Question[] = [
  {
    id: 1,
    category: [ASSESSMENT]_CATEGORIES.CATEGORY1,
    text: 'Question text here',
    respondentTypes: ['type1', 'type2'] // if applicable
  },
  // ... more questions
];

export const RESPONSE_OPTIONS = [
  { value: 0, label: 'Never', score: 0 },
  { value: 1, label: 'Rarely', score: 1 },
  { value: 2, label: 'Sometimes', score: 2 },
  { value: 3, label: 'Often', score: 3 },
  { value: 4, label: 'Very Often', score: 4 }
];

// Scoring functions
export function calculateCategoryScores(
  responses: Record<number, number>
) {
  // Implementation
}

export function calculateOverallScore(
  responses: Record<number, number>
) {
  // Implementation
}

export function getSeverityLevel(percentage: number) {
  if (percentage < 25) return 'low';
  if (percentage < 50) return 'moderate';
  if (percentage < 75) return 'high';
  return 'severe';
}
```

#### 3.2 Create Assessment Component

Location: `src/components/[Assessment]Assessment.tsx`

**Key Features to Include:**
- Info collection stage
- Question progression with progress bar
- Response validation
- Auto-save functionality
- Completion handling
- Error handling and user feedback

**Standard Structure:**

```typescript
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { [ASSESSMENT]_QUESTIONS, RESPONSE_OPTIONS } from '../data/[assessment]Questions';

interface [Assessment]AssessmentProps {
  assessmentId?: string;
  onClose?: () => void;
  // Add more props as needed
}

export default function [Assessment]Assessment({
  assessmentId,
  onClose
}: [Assessment]AssessmentProps) {
  const [stage, setStage] = useState<'info' | 'questions' | 'complete'>('info');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for user info
  // State for assessment data

  // Load existing assessment if resuming
  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  // Implementation functions:
  // - loadAssessment()
  // - handleStartAssessment()
  // - handleResponse()
  // - handleSubmit()
  // - Auto-save logic

  return (
    // JSX implementation with stages
  );
}
```

#### 3.3 Create Report Components

Create separate components for each report type:

**Individual Report** (`src/components/[Assessment]Report.tsx`):
- Assessment details
- Overall score with severity
- Category breakdown with charts
- Top concerns
- Understanding results section
- Next steps
- Disclaimer

**Comprehensive Report** (if multi-respondent):
- Combined analysis
- Comparison charts (bar, radar)
- Areas of agreement
- Areas of discrepancy
- Clinical summary
- Intervention recommendations
- Follow-up actions

#### 3.4 Integrate with Self-Assessments Page

Location: `src/components/SelfAssessmentsPage.tsx`

**Steps:**

1. **Import the assessment component:**
```typescript
import [Assessment]Assessment from './[Assessment]Assessment';
```

2. **Add state management:**
```typescript
const [start[Assessment], setStart[Assessment]] = useState(false);
const [[assessment]Data, set[Assessment]Data] = useState<{
  // Define data structure
} | null>(null);
```

3. **Add to coupon handler:**
```typescript
const assessmentNameMap: Record<string, string> = {
  // existing mappings...
  '[Assessment Display Name]': '[assessment-id]'
};

// In handler logic:
else if (assessmentId === '[assessment-id]') {
  set[Assessment]Data({
    // set data
  });
  setStart[Assessment](true);
}
```

4. **Add conditional rendering:**
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

5. **Create assessment card:**
```typescript
const [assessment]Card = {
  id: '[assessment-id]',
  name: '[Assessment Name]',
  description: '[Description]',
  icon: [IconComponent],
  color: 'from-[color1] to-[color2]',
  iconColor: 'text-[color]',
  borderColor: 'border-[color]',
  bgColor: 'bg-[color]-50',
  targetAudience: '[Target Audience]',
  questionCount: [number],
  assessmentType: '[Type]',
  features: [
    'Feature 1',
    'Feature 2',
    // ...
  ],
  instructions: '[Instructions]',
  disclaimer: '[Disclaimer]'
};
```

6. **Add to assessmentCards array:**
```typescript
const assessmentCards = [
  // existing cards...
  {
    type: '[assessment-id]',
    ...[assessment]Card
  }
];
```

### Phase 4: Coupon & Payment Integration

#### 4.1 Update Coupon System

**Location:** `src/components/CouponManagement.tsx`

Add assessment type to the dropdown:

```typescript
<option value="[assessment-id]">[Assessment Display Name]</option>
```

#### 4.2 Update Coupon Code Creation

In `supabase/migrations/`, ensure coupon_codes table supports the new assessment type:

```sql
-- coupon_codes.assessment_type should allow your new type
-- Update CHECK constraint if needed
ALTER TABLE coupon_codes DROP CONSTRAINT IF EXISTS coupon_codes_assessment_type_check;
ALTER TABLE coupon_codes ADD CONSTRAINT coupon_codes_assessment_type_check
  CHECK (assessment_type IN (
    'nipa',
    'teen-adhd',
    'child-adhd-4-6',
    'child-adhd-7-10',
    'teen-career',
    'adhd-caregiver',
    '[new-assessment-id]'  -- Add new type here
  ));
```

#### 4.3 Add Payment Type (if applicable)

**Location:** `src/components/SelfAssessmentsPage.tsx`

Update payment type mapping:

```typescript
interface SelfAssessmentsPageProps {
  onClose: () => void;
  onStartPayment?: (paymentType: 'nipa' | 'tcf' | 'tadhd' | 'pcadhd' | '[new-type]') => void;
}

// In button handler:
const paymentTypeMap: Record<string, PaymentType> = {
  '[assessment-id]': '[payment-type]'
};
```

#### 4.4 Sales Log Integration

Ensure sales are tracked when assessment completes:

```sql
CREATE OR REPLACE FUNCTION log_[assessment]_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_id IS NOT NULL AND NEW.status = 'completed' THEN
    INSERT INTO sales_log (
      franchise_owner_id,
      sale_type,
      amount,
      coupon_id,
      -- reference to assessment
    )
    SELECT
      NEW.franchise_owner_id,
      '[assessment-type]',
      c.value,
      NEW.coupon_id,
      NEW.id
    FROM coupon_codes c
    WHERE c.id = NEW.coupon_id
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_[assessment]_sale
  AFTER UPDATE ON [assessment_table]
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION log_[assessment]_sale();
```

### Phase 5: Report Generation & Email System

#### 5.1 Create Email Edge Function

**Location:** `supabase/functions/send-[assessment]-report/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { assessmentId, reportType, recipientEmail } = await req.json();

    // Fetch assessment data
    // Generate report HTML
    // Send via email service (Resend)

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
```

#### 5.2 Deploy Edge Function

```bash
# Test locally first (if Supabase CLI available)
# Then deploy via MCP tool:

mcp__supabase__deploy_edge_function({
  name: "send-[assessment]-report",
  slug: "send-[assessment]-report",
  verify_jwt: false,
  files: [
    {
      name: "index.ts",
      content: "[file content]"
    }
  ]
})
```

#### 5.3 Create Report HTML Templates

**Best Practices:**
- Inline CSS for email compatibility
- Responsive design
- Logo and branding
- Clear data visualization
- Printer-friendly format
- Professional disclaimer

#### 5.4 Trigger Email Sending

Options:
1. **Automatic:** Trigger on assessment completion
2. **Manual:** Button in admin dashboard
3. **On-Demand:** Share link sends email

### Phase 6: Admin Dashboard Integration

#### 6.1 Add to Super Admin Dashboard

**Location:** `src/components/SuperAdminDashboard.tsx`

Add tab/section for new assessment:

```typescript
// Add state
const [[assessment]List, set[Assessment]List] = useState<any[]>([]);

// Fetch function
async function fetch[Assessment]s() {
  const { data, error } = await supabase
    .from('[assessment_table]')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && data) {
    set[Assessment]List(data);
  }
}

// Call in useEffect
useEffect(() => {
  fetch[Assessment]s();
}, []);

// Render in UI
<div className="assessment-section">
  <h3>[Assessment Name] Assessments</h3>
  <div className="assessment-list">
    {[assessment]List.map(assessment => (
      <div key={assessment.id} className="assessment-card">
        {/* Display assessment details */}
        {/* Actions: View, Delete, Resend Email */}
      </div>
    ))}
  </div>
</div>
```

#### 6.2 Add Management Actions

- View completed assessments
- View individual responses
- Download reports
- Resend emails
- Delete assessments
- Export data

### Phase 7: Testing

#### 7.1 Unit Testing Checklist

- [ ] Question data structure valid
- [ ] Scoring functions accurate
- [ ] Severity level calculations correct
- [ ] All categories covered

#### 7.2 Integration Testing Checklist

- [ ] Database tables created correctly
- [ ] RLS policies work as expected
- [ ] Coupon redemption flows properly
- [ ] Assessment completion updates status
- [ ] Sales log entries created
- [ ] Reports generate correctly
- [ ] Emails send successfully

#### 7.3 User Journey Testing

**Single-Respondent Journey:**
1. Navigate to Self-Assessments
2. Select new assessment
3. Read information
4. Redeem coupon OR proceed to payment
5. Complete assessment
6. View report
7. Receive email confirmation

**Multi-Respondent Journey:**
1. Franchise owner creates assessment
2. Share links with respondents
3. First respondent completes
4. Receives individual report
5. Second respondent completes
6. Receives individual report
7. Franchise owner views comprehensive report
8. All parties receive appropriate emails

#### 7.4 Edge Cases to Test

- Resume partially completed assessment
- Multiple browser sessions
- Expired coupons
- Already-used coupons
- Network interruptions
- Invalid responses
- Missing required fields
- Concurrent respondent submissions (multi-respondent)

### Phase 8: Documentation

#### 8.1 Update User Documentation

Create user guide:
- What is this assessment?
- Who should take it?
- How long does it take?
- How to interpret results
- What to do with results

#### 8.2 Update Technical Documentation

- Database schema additions
- API endpoints (if any)
- Component architecture
- Integration points
- Troubleshooting guide

---

## Database Architecture

### Standard Table Structure

#### Main Assessment Table
```sql
CREATE TABLE [assessment]_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Subject information fields
  franchise_owner_id uuid REFERENCES franchise_owners(id) ON DELETE SET NULL,
  created_by_email text NOT NULL,
  coupon_id uuid REFERENCES coupon_codes(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Response Table (if separate respondents)
```sql
CREATE TABLE [assessment]_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES [assessment]_assessments(id) ON DELETE CASCADE,
  respondent_type text,
  respondent_name text NOT NULL,
  respondent_email text NOT NULL,
  responses jsonb DEFAULT '{}',
  scores jsonb DEFAULT '{}',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_[assessment]_franchise ON [assessment]_assessments(franchise_owner_id);
CREATE INDEX idx_[assessment]_status ON [assessment]_assessments(status);
CREATE INDEX idx_[assessment]_share_token ON [assessment]_assessments(share_token);
CREATE INDEX idx_[assessment]_responses_assessment ON [assessment]_responses(assessment_id);
```

---

## Coupon & Payment Integration

### Coupon Code Structure

```sql
-- coupon_codes table supports all assessment types
{
  id: uuid,
  code: text,  -- unique code
  assessment_type: text,  -- '[assessment-id]'
  max_uses: integer,
  current_uses: integer,
  is_active: boolean,
  expires_at: timestamptz,
  created_by: uuid,  -- franchise owner
  recipient_name: text,
  recipient_email: text,
  email_sent: boolean
}
```

### Creating Coupons for New Assessment

1. Super admin or franchise owner creates coupon
2. Selects assessment type from dropdown
3. Sets max uses and expiration
4. Optionally sends to specific recipient
5. Coupon tracked in `coupon_codes` table
6. Redemption tracked in `coupon_redemptions`

### Payment Flow (if paid assessment)

1. User clicks "Proceed to Payment"
2. `onStartPayment` callback with payment type
3. Payment gateway integration (external)
4. On success, user gains access
5. No coupon needed if paid

---

## Report Generation System

### Report Types

#### 1. Individual Report (Single Respondent)
**Components:**
- Header with logo and title
- Assessment details (name, date, respondent info)
- Overall score with severity indicator
- Category breakdown (bar charts, percentages)
- Top 3 areas of concern
- Understanding your results section
- Next steps and recommendations
- Disclaimer

#### 2. Individual Report (Multi-Respondent)
**Same as above, plus:**
- Respondent role clearly indicated
- Context-specific insights (home vs. school)
- Notification of other respondents' status

#### 3. Comprehensive Report (Multi-Respondent)
**Components:**
- Combined assessment overview
- Side-by-side respondent comparison
- Interactive visualizations (bar charts, radar charts)
- Areas of strong agreement
- Areas of significant discrepancy
- Clinical summary
- Intervention recommendations with severity-based urgency
- Follow-up action plan
- Comprehensive disclaimer

### Scoring Methodology

**Standard Scoring:**
```typescript
// Category Score
categoryScore = sum of responses in category
maxScore = number of questions * max response value
percentage = (categoryScore / maxScore) * 100

// Overall Score
overallScore = sum of all responses
maxOverallScore = total questions * max response value
overallPercentage = (overallScore / maxOverallScore) * 100

// Severity Level
if (percentage < 25) return 'low';
if (percentage < 50) return 'moderate';
if (percentage < 75) return 'high';
return 'severe';
```

### Color Coding

```typescript
const severityColors = {
  low: '#10b981',      // Green
  moderate: '#f59e0b', // Amber
  high: '#ef4444',     // Red
  severe: '#991b1b'    // Dark Red
};
```

---

## Email Delivery System

### Email Templates

#### 1. Assessment Invitation Email
```html
Subject: You've been invited to complete [Assessment Name]

Body:
- Greeting with recipient name
- Brief explanation of assessment
- Estimated time to complete
- Unique access link
- Instructions
- Support contact info
```

#### 2. Assessment Completed Email
```html
Subject: Your [Assessment Name] Results are Ready

Body:
- Congratulations message
- Link to view results online
- PDF attachment (optional)
- Next steps
- Support contact info
```

#### 3. Multi-Respondent Status Email
```html
Subject: [Assessment Name] Status Update

Body:
- Status of all respondents
- Who has completed / who is pending
- Reminder to pending respondents
- Link to comprehensive report (if all complete)
```

### Email Service Integration

**Current:** Resend API
**Environment Variables:**
- `RESEND_API_KEY`
- Automatically available in edge functions

**Best Practices:**
- HTML + plain text versions
- Responsive design
- Clear CTAs
- Unsubscribe option (if marketing)
- Professional branding

---

## Testing Procedures

### Pre-Deployment Testing

#### Database Testing
```bash
# Test migration
npm run supabase:migration:up

# Verify tables created
# Verify indexes created
# Verify RLS policies work

# Test queries
SELECT * FROM [assessment]_assessments;
# Should return empty initially

# Test RLS as different users
# - Super admin
# - Franchise owner
# - Anonymous user
```

#### Component Testing
```bash
# Build project
npm run build

# Check for TypeScript errors
npm run typecheck

# Run in development
npm run dev

# Test all user journeys manually
```

### Post-Deployment Testing

#### Smoke Tests
- [ ] New assessment appears in list
- [ ] Can create new assessment
- [ ] Can complete assessment
- [ ] Reports generate correctly
- [ ] Emails send successfully
- [ ] Admin dashboard shows new data

#### Performance Tests
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] Report generation fast enough
- [ ] Email delivery timely

#### Security Tests
- [ ] RLS policies prevent unauthorized access
- [ ] Tokens are secure and unique
- [ ] No data leakage between franchises
- [ ] Proper authentication required

---

## Deployment Checklist

### Pre-Deployment

- [ ] All code reviewed and approved
- [ ] Database migration tested in staging
- [ ] All tests passing
- [ ] Documentation updated
- [ ] User guide created
- [ ] Email templates approved
- [ ] Edge functions deployed and tested

### Deployment Steps

1. **Database Migration**
   ```bash
   # Apply migration to production
   mcp__supabase__apply_migration({
     filename: "...",
     content: "..."
   })
   ```

2. **Deploy Edge Functions**
   ```bash
   mcp__supabase__deploy_edge_function({
     name: "...",
     files: [...]
   })
   ```

3. **Deploy Frontend**
   ```bash
   npm run build
   # Deploy to hosting (automatic on push to main)
   ```

4. **Verify Deployment**
   - [ ] Database tables exist
   - [ ] Edge functions responding
   - [ ] Frontend loads new assessment
   - [ ] Test end-to-end user journey

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check email delivery rates
- [ ] Verify sales tracking
- [ ] Gather user feedback
- [ ] Document any issues
- [ ] Plan iterative improvements

---

## Common Issues & Troubleshooting

### Issue: Assessment not appearing in list
**Solution:** Check that card is added to `assessmentCards` array in `SelfAssessmentsPage.tsx`

### Issue: Coupon redemption fails
**Solution:**
- Verify assessment type in `assessment NameMap`
- Check coupon is active and not expired
- Verify max uses not exceeded

### Issue: Report not generating
**Solution:**
- Check all required data is present in database
- Verify scoring functions return valid data
- Check for null/undefined values
- Review browser console for errors

### Issue: Email not sending
**Solution:**
- Verify RESEND_API_KEY is set
- Check edge function logs
- Verify recipient email is valid
- Check spam folder

### Issue: RLS blocking legitimate access
**Solution:**
- Review RLS policies
- Check user authentication state
- Verify franchise_owner_id is set correctly
- Test with different user roles

---

## Maintenance & Updates

### Regular Maintenance Tasks

**Weekly:**
- Monitor assessment completion rates
- Check email delivery success
- Review error logs
- Address user support tickets

**Monthly:**
- Analyze usage patterns
- Identify areas for improvement
- Update questions if needed
- Review and update documentation

**Quarterly:**
- Major feature updates
- Performance optimization
- Security audit
- User feedback integration

### Version Control

**Schema Changes:**
- Always create new migration file
- Never modify existing migrations
- Test thoroughly before production
- Document breaking changes

**Code Changes:**
- Follow Git workflow
- Create feature branches
- Pull request reviews required
- Tag releases with version numbers

---

## Support & Resources

### Internal Resources
- Database Schema Docs: [Link to schema documentation]
- Component Library: [Link to component docs]
- API Documentation: [Link to API docs]

### External Resources
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- TypeScript Docs: https://www.typescriptlang.org/docs
- Recharts Docs: https://recharts.org

### Team Contacts
- Technical Lead: [Contact info]
- Database Admin: [Contact info]
- Frontend Team: [Contact info]
- Support Team: [Contact info]

---

**Document Status:** Living Document
**Next Review:** March 2026
**Maintained By:** BrainworX Development Team

---

*This protocol should be reviewed and updated with each new assessment added to ensure it remains current and comprehensive.*
