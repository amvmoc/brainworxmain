# NEW ASSESSMENT IMPLEMENTATION MASTER CHECKLIST

This is the **master template** for implementing any new assessment type in the BrainWorx system. Follow this checklist step-by-step to ensure complete, consistent implementation.

---

## ASSESSMENT INFORMATION

**Assessment Type:** _[e.g., ADHD 4-6, Career, Personality, etc.]_
**Age Range (if applicable):** _[e.g., 4-6 years, 18+, N/A]_
**Respondent Types:** _[e.g., parent + teacher, self-only, client + coach]_
**Assessment Code:** _[e.g., adhd46, career, personality]_
**Number of Questions:** _[Total count]_
**Patterns/Dimensions:** _[List all measured patterns/scales]_

---

## 1. DATABASE LAYER ✓

**Migration File:** `supabase/migrations/[timestamp]_create_[assessment_code]_assessment_system.sql`

### 1.1 Main Assessments Table
- [ ] Create table: `[assessment_code]_assessments`
- [ ] Add ID field (uuid, primary key, auto-generated)
- [ ] Add subject identification fields:
  - [ ] Subject name (text, required)
  - [ ] Subject age (integer with CHECK constraint if applicable)
  - [ ] Subject gender (text, optional)
  - [ ] Additional subject fields as needed
- [ ] Add administrative fields:
  - [ ] `franchise_owner_id` (uuid, foreign key to franchise_owners, nullable)
  - [ ] `created_by_email` (text, required)
  - [ ] `coupon_id` (uuid, foreign key to coupon_codes, nullable)
- [ ] Add status tracking:
  - [ ] `status` (text with CHECK constraint for valid statuses)
  - [ ] Define all possible statuses based on respondent flow
- [ ] Add sharing capability:
  - [ ] `share_token` (text, unique, auto-generated with default)
- [ ] Add timestamps:
  - [ ] `created_at` (timestamptz, default now())
  - [ ] `updated_at` (timestamptz, default now())

### 1.2 Responses Table
- [ ] Create table: `[assessment_code]_assessment_responses`
- [ ] Add ID field (uuid, primary key, auto-generated)
- [ ] Add assessment reference:
  - [ ] `assessment_id` (uuid, foreign key with CASCADE delete)
- [ ] Add respondent identification:
  - [ ] `respondent_type` (text with CHECK constraint for valid types)
  - [ ] `respondent_name` (text, required)
  - [ ] `respondent_email` (text, required)
  - [ ] `respondent_relationship` (text, required)
- [ ] Add data storage:
  - [ ] `responses` (jsonb, default '{}')
  - [ ] `scores` (jsonb, default '{}')
- [ ] Add completion tracking:
  - [ ] `completed` (boolean, default false)
  - [ ] `completed_at` (timestamptz, nullable)
- [ ] Add timestamps:
  - [ ] `created_at` (timestamptz, default now())
  - [ ] `updated_at` (timestamptz, default now())

### 1.3 Row Level Security (RLS)
- [ ] Enable RLS on assessments table
- [ ] Enable RLS on responses table

#### Public Access Policies
- [ ] **Assessments - SELECT:** Anyone can view by share token (USING true)
- [ ] **Assessments - INSERT:** Anyone can create (WITH CHECK true)
- [ ] **Assessments - UPDATE:** Anyone can update (USING true)
- [ ] **Responses - SELECT:** Anyone can view (USING true)
- [ ] **Responses - INSERT:** Anyone can create (WITH CHECK true)
- [ ] **Responses - UPDATE:** Anyone can update (USING true)

#### Authenticated User Policies
- [ ] **Assessments - SELECT:** Franchise owners can view own OR super admins can view all
- [ ] **Assessments - DELETE:** Franchise owners can delete own OR super admins can delete all
- [ ] **Responses - DELETE:** Franchise owners can delete responses for their assessments OR super admins can delete all

### 1.4 Automated Status Updates
- [ ] Create function: `update_[assessment_code]_assessment_status()`
- [ ] Implement status logic based on all respondent completion states
- [ ] Handle all status transitions properly
- [ ] Update `updated_at` timestamp
- [ ] Create trigger on responses table:
  - [ ] AFTER INSERT OR UPDATE OF completed
  - [ ] FOR EACH ROW
  - [ ] EXECUTE status update function
- [ ] Add DROP TRIGGER IF EXISTS before creating

### 1.5 Performance Optimization
- [ ] Create index on `franchise_owner_id`
- [ ] Create index on `share_token`
- [ ] Create index on `status`
- [ ] Create index on `assessment_id` in responses table
- [ ] Add IF NOT EXISTS to all index creations

### 1.6 Migration Documentation
- [ ] Add comprehensive multi-line comment header explaining:
  - [ ] Assessment title and purpose
  - [ ] New tables section with all fields listed
  - [ ] Security section explaining RLS policies
  - [ ] Triggers section explaining automation
  - [ ] Important notes section

---

## 2. QUESTIONS & SCORING DATA ✓

**File:** `src/data/[assessment_code]AssessmentQuestions.ts`

### 2.1 TypeScript Type Definitions
- [ ] Define `PatternId` type (union of all pattern codes)
- [ ] Define `Question` interface:
  - [ ] id (string)
  - [ ] pattern (PatternId)
  - [ ] text (string)
  - [ ] category (string, if applicable)
- [ ] Define `PatternMeta` interface:
  - [ ] code (PatternId)
  - [ ] name (string)
  - [ ] category (string, if applicable)
  - [ ] shortDescription (string)
  - [ ] fullDescription (string)

### 2.2 Pattern Information
- [ ] Create `PATTERN_INFO` object with all patterns
- [ ] Each pattern includes:
  - [ ] Unique code
  - [ ] Display name
  - [ ] Category classification
  - [ ] Short description (1 line)
  - [ ] Full description (detailed paragraph)

### 2.3 Questions Array
- [ ] Create `QUESTIONS` array with all questions
- [ ] Ensure balanced distribution across patterns
- [ ] Each question includes:
  - [ ] Unique ID
  - [ ] Pattern code
  - [ ] Question text
  - [ ] Category (if applicable)

### 2.4 Scoring Functions
- [ ] **`calculatePatternScores(responses)`**
  - Calculates average score per pattern
  - Returns object with pattern codes as keys
- [ ] **`getSeverityLabel[Code](score)`**
  - Maps numeric scores to severity labels
  - Returns: "Low", "Mild", "Moderate", "High" (or similar)
- [ ] **`scoreToPercentage(score)`**
  - Converts score to percentage (0-100)
- [ ] **`calculateOverall[Type](scores)`** (if applicable)
  - Calculates aggregate/overall score
  - May combine multiple patterns

### 2.5 Export Statements
- [ ] Export all types
- [ ] Export PATTERN_INFO
- [ ] Export QUESTIONS
- [ ] Export all scoring functions

---

## 3. ASSESSMENT COMPONENT ✓

**File:** `src/components/[AssessmentCode]Assessment.tsx`

### 3.1 Component Setup
- [ ] Define props interface:
  - [ ] assessmentId (string)
  - [ ] respondentType (string, specific to assessment)
- [ ] Import required dependencies:
  - [ ] React hooks (useState, useEffect)
  - [ ] Supabase client
  - [ ] Questions data
  - [ ] Scoring functions
  - [ ] Icons from lucide-react

### 3.2 State Management
- [ ] Assessment data state
- [ ] Response record state
- [ ] Current question index state
- [ ] Answers object state (questionId → score)
- [ ] Loading state
- [ ] Error state
- [ ] Completion state
- [ ] Saving indicator state

### 3.3 Data Loading (useEffect)
- [ ] Load assessment from database
- [ ] Validate assessment exists
- [ ] Load existing response or create new one
- [ ] Handle respondent type routing
- [ ] Load previously saved answers if exist
- [ ] Set initial question based on progress
- [ ] Handle errors gracefully

### 3.4 Question UI
- [ ] Display progress indicator (X of Y)
- [ ] Show current question text
- [ ] Show respondent context (who is answering)
- [ ] Implement answer input mechanism:
  - [ ] Radio buttons for scale (e.g., 0-3)
  - [ ] Clear labels for each option
  - [ ] Visual feedback for selected option
- [ ] Show previous/next navigation
- [ ] Disable next if question unanswered

### 3.5 Auto-Save Functionality
- [ ] Save to database on each answer change
- [ ] Update responses jsonb field
- [ ] Show saving indicator
- [ ] Handle save errors
- [ ] Debounce if needed for performance

### 3.6 Navigation Logic
- [ ] Previous button (if not on first question)
- [ ] Next button (if question answered and not last)
- [ ] Submit button (if last question)
- [ ] Track completion percentage
- [ ] Prevent navigation if unsaved changes

### 3.7 Completion Flow
- [ ] Calculate all pattern scores
- [ ] Update response record with:
  - [ ] All responses
  - [ ] Calculated scores
  - [ ] completed = true
  - [ ] completed_at = now()
- [ ] Show completion confirmation
- [ ] **CRITICAL: Add "Book Appointment" button/link for client respondents**
  - [ ] Link to booking calendar with franchise owner
  - [ ] Pre-fill client information if available
  - [ ] Make prominent and easy to find
- [ ] Display next steps based on respondent type
- [ ] Show links for next respondent (if applicable)
- [ ] Option to view results (if available)

### 3.8 Responsive Design
- [ ] Mobile-friendly layout
- [ ] Clear touch targets
- [ ] Readable font sizes
- [ ] Proper spacing

---

## 4. MANAGEMENT/DASHBOARD COMPONENT ✓

**File:** `src/components/[AssessmentCode]AssessmentsManagement.tsx`

### 4.1 Component Setup
- [ ] Define props interface:
  - [ ] franchiseOwnerId (string)
  - [ ] isSuperAdmin (boolean, default false)
- [ ] Import dependencies
- [ ] Import coach report component

### 4.2 State Management
- [ ] Assessments list state
- [ ] Loading state
- [ ] View mode state (list, various report views)
- [ ] Selected assessment state
- [ ] Form data state (for creation)
- [ ] Modal visibility states
- [ ] Action loading states (creating, sending, deleting)

### 4.3 Data Loading
- [ ] Load assessments from database
- [ ] Include related responses (join)
- [ ] Filter by franchise owner (if not super admin)
- [ ] Order by created_at descending
- [ ] Handle errors

### 4.4 Create New Assessment Modal
- [ ] Form fields for subject information:
  - [ ] Name (text input)
  - [ ] Age (number input with validation)
  - [ ] Email (email input)
  - [ ] Other required fields
- [ ] Form validation
- [ ] Submit handler:
  - [ ] Insert assessment record
  - [ ] Insert initial response record(s)
  - [ ] Generate assessment link(s)
  - [ ] Display links to user
  - [ ] Option to send via email
- [ ] Close and reset form
- [ ] Reload assessments list

### 4.5 Assessments List/Table
- [ ] Table headers:
  - [ ] Subject information
  - [ ] Status badge (color-coded)
  - [ ] Respondents with completion indicators
  - [ ] Created date
  - [ ] Actions column
- [ ] Each row displays:
  - [ ] Subject name, age, other info
  - [ ] Visual status indicator
  - [ ] Checkmarks for completed respondents
  - [ ] Action buttons
- [ ] Empty state message
- [ ] Loading skeleton

### 4.6 Action Buttons
- [ ] **Email/Invite button** (for additional respondents):
  - [ ] Creates new response record if needed
  - [ ] Generates and displays link
  - [ ] Option to send email
- [ ] **View Reports button**:
  - [ ] Switches to report view mode
  - [ ] Loads selected assessment
- [ ] **Send Reports button** (when complete):
  - [ ] Calls edge function
  - [ ] Shows loading state
  - [ ] Confirms success
- [ ] **Delete button**:
  - [ ] Confirmation dialog
  - [ ] Deletes assessment (cascades to responses)
  - [ ] Refreshes list

### 4.7 View Modes
- [ ] List view (default)
- [ ] Report view(s) for each respondent type
- [ ] Coach/comprehensive report view
- [ ] Back button from report views

### 4.8 Filters & Search (optional)
- [ ] Filter by status
- [ ] Search by name
- [ ] Date range filter

---

## 5. REPORT COMPONENTS ✓

### 5.1 Individual Respondent Report
**File:** `src/components/[AssessmentCode][RespondentType]Report.tsx`

- [ ] Component accepts assessment and response props
- [ ] Display header with subject info
- [ ] Display pattern scores:
  - [ ] Pattern name
  - [ ] Score value
  - [ ] Severity label
  - [ ] Visual bar/indicator
  - [ ] Color coding
- [ ] Group by category if applicable
- [ ] Show overall score if applicable
- [ ] Include pattern descriptions
- [ ] **Add "Book Appointment" button for client reports**
  - [ ] Prominent call-to-action
  - [ ] Links to franchise owner's booking calendar
  - [ ] Pre-fills client info when possible
- [ ] Add print styles
- [ ] Responsive layout

### 5.2 Coach/Comprehensive Report
**File:** `src/components/[AssessmentCode]CoachReport.tsx`

- [ ] Load assessment + all responses
- [ ] Display header with subject info
- [ ] Comparison table (if multiple respondents):
  - [ ] Pattern names
  - [ ] Score from each respondent
  - [ ] Discrepancy calculation
  - [ ] Color-coded severity
- [ ] Visual comparison charts/graphs
- [ ] Pattern descriptions
- [ ] Clinical notes section
- [ ] Recommendations section
- [ ] Print styles
- [ ] Professional formatting

---

## 6. EMAIL REPORTS EDGE FUNCTION ✓

**File:** `supabase/functions/send-[assessment-code]-reports/index.ts`

### 6.1 Function Setup
- [ ] Import Deno edge runtime types
- [ ] Import Supabase client
- [ ] Import Nodemailer
- [ ] Define CORS headers (required!)
- [ ] Define request body interface

### 6.2 Pattern Information
- [ ] Duplicate pattern info for email context
- [ ] Include names and descriptions
- [ ] Define severity functions
- [ ] Define color functions

### 6.3 HTML Report Generators
For each report type:

**`generate[Respondent]ClientReport()`**
- [ ] Accept assessment and response data
- [ ] Return complete HTML string
- [ ] Include inline CSS (no external stylesheets)
- [ ] Professional layout:
  - [ ] Header with logo placeholder
  - [ ] Subject information section
  - [ ] Pattern scores section with visual bars
  - [ ] Color-coded severity indicators
  - [ ] Pattern descriptions
  - [ ] **Prominent "Book Appointment" button/link**
    - [ ] Links to franchise owner's booking calendar
    - [ ] Styled as clear call-to-action
  - [ ] Footer with branding
- [ ] Responsive design
- [ ] Print-friendly styles

**`generateCoachReport()`**
- [ ] Accept assessment and all responses
- [ ] Comprehensive comparison layout
- [ ] Side-by-side scores
- [ ] Discrepancy analysis
- [ ] Clinical insights
- [ ] Professional formatting

### 6.4 Main Request Handler
- [ ] Handle OPTIONS request (CORS preflight)
- [ ] Parse request body
- [ ] Validate assessmentId
- [ ] Load assessment from database
- [ ] Load all responses
- [ ] Verify all required responses completed
- [ ] Calculate scores if not already calculated
- [ ] Generate all HTML reports
- [ ] Configure email transport (Nodemailer)
- [ ] Send emails:
  - [ ] One email per respondent (client reports)
  - [ ] One email to coach/admin (coach report)
  - [ ] Include subject lines
  - [ ] Attach HTML content
- [ ] Return success response with CORS headers
- [ ] Handle errors gracefully with proper responses

### 6.5 Email Configuration
- [ ] SMTP host from env
- [ ] SMTP port from env
- [ ] SMTP user from env
- [ ] SMTP password from env
- [ ] Default "from" address

---

## 7. APP ROUTING INTEGRATION ✓

**File:** `src/App.tsx`

### 7.1 State Addition
- [ ] Add route state for this assessment type
- [ ] Define type: `{ type: 'assessment' | 'results', id: string, respondentType?: string }`

### 7.2 URL Pattern Matching (in useEffect)
- [ ] Add regex for assessment routes:
  - Pattern: `/[assessment-code]/:id/:respondentType`
  - Extract ID and respondent type
  - Set route state
  - Return early
- [ ] Add regex for results routes (if applicable):
  - Pattern: `/[assessment-code]/:id/results`
  - Extract ID
  - Set route state
  - Return early

### 7.3 Conditional Rendering
- [ ] Add condition to check route state
- [ ] If assessment type, render Assessment component with props
- [ ] If results type, render Results component with props
- [ ] Pass assessmentId and respondentType

### 7.4 Public Flow Detection
- [ ] Add route state to `isInPublicFlow` check
- [ ] Ensures admin dashboard doesn't show during assessment

---

## 8. DASHBOARD TAB INTEGRATION ✓

### 8.1 Super Admin Dashboard
**File:** `src/components/SuperAdminDashboard.tsx`

- [ ] Add tab button for this assessment type
- [ ] Add to appropriate section (create section if needed)
- [ ] Add tab state value
- [ ] Add conditional rendering:
  - [ ] Render management component
  - [ ] Pass franchiseOwnerId
  - [ ] Pass isSuperAdmin={true}

### 8.2 Franchise Dashboard
**File:** `src/components/FranchiseDashboard.tsx`

- [ ] Add tab button (same as super admin)
- [ ] Add tab state value
- [ ] Add conditional rendering:
  - [ ] Render management component
  - [ ] Pass franchiseOwnerId
  - [ ] Pass isSuperAdmin={false}

### 8.3 Tab Styling
- [ ] Consistent with existing tabs
- [ ] Clear active state
- [ ] Icon if applicable
- [ ] Descriptive label

---

## 9. COUPON SYSTEM INTEGRATION (Optional) ✓

If this assessment should be available via coupons:

### 9.1 Coupon Type Addition
- [ ] Add assessment code to coupon_type CHECK constraint
- [ ] Update in migration or new migration

### 9.2 Coupon Creation UI
- [ ] Add option in coupon management
- [ ] Set assessment_type to this code
- [ ] Configure pricing

### 9.3 Coupon Redemption Flow
- [ ] Update redemption component to handle this type
- [ ] Route to correct assessment
- [ ] Associate coupon_id with assessment

---

## 10. TESTING CHECKLIST ✓

### 10.1 Database Layer
- [ ] Migration runs successfully
- [ ] Tables created with correct schema
- [ ] Constraints work (age range, respondent type, status)
- [ ] Foreign keys work correctly
- [ ] Default values populate
- [ ] Share token generates automatically
- [ ] Timestamps auto-populate

### 10.2 RLS Policies
- [ ] Public can create assessment without login
- [ ] Public can complete assessment without login
- [ ] Public can view via share token
- [ ] Franchise owner can only see own assessments
- [ ] Super admin can see all assessments
- [ ] Deletion restricted to owners

### 10.3 Status Updates
- [ ] Status updates when first respondent completes
- [ ] Status updates when second respondent completes
- [ ] Status updates correctly for all respondent combinations
- [ ] Trigger fires on INSERT and UPDATE

### 10.4 Assessment Flow
- [ ] Assessment link loads correctly
- [ ] Questions display properly
- [ ] Answer selection works
- [ ] Auto-save works (check database)
- [ ] Navigation works (previous/next)
- [ ] Progress tracking accurate
- [ ] Completion calculates scores
- [ ] Completion updates database
- [ ] Completion message displays
- [ ] **"Book Appointment" button appears for client respondents**
- [ ] **Booking link works and navigates correctly**
- [ ] **Client information pre-fills in booking form**

### 10.5 Management Interface
- [ ] Assessments list loads
- [ ] Create modal works
- [ ] Assessment creation succeeds
- [ ] Links generated correctly
- [ ] Invite buttons work
- [ ] View reports button works
- [ ] Send reports button works
- [ ] Delete button works with confirmation
- [ ] Filters work (if applicable)

### 10.6 Reports
- [ ] Individual reports display correctly
- [ ] Scores calculate accurately
- [ ] Severity labels correct
- [ ] Color coding appropriate
- [ ] **"Book Appointment" button displays on client reports**
- [ ] **Booking link URL is correct and functional**
- [ ] Coach report shows comparison
- [ ] Reports print properly
- [ ] Responsive on mobile

### 10.7 Email Function
- [ ] Edge function deploys successfully
- [ ] Function handles OPTIONS request
- [ ] Function loads data correctly
- [ ] HTML generation works
- [ ] Emails send successfully
- [ ] All recipients receive correct reports
- [ ] HTML renders properly in email clients
- [ ] **"Book Appointment" link works in emailed reports**
- [ ] **Link is clickable and navigates correctly from email**
- [ ] CORS headers present in all responses

### 10.8 Routing
- [ ] Assessment URLs work
- [ ] Respondent type routing works
- [ ] Results URLs work (if applicable)
- [ ] Browser back/forward works
- [ ] Direct URL access works

### 10.9 Edge Cases
- [ ] Incomplete assessments handle gracefully
- [ ] Missing responses don't break reports
- [ ] Deleted franchise owner doesn't break (SET NULL)
- [ ] Invalid IDs show error message
- [ ] Network errors handled
- [ ] Concurrent responses don't conflict

### 10.10 Performance
- [ ] Indexes improve query speed
- [ ] Auto-save doesn't cause lag
- [ ] Report generation is fast
- [ ] Email sending completes in reasonable time

---

## 11. DOCUMENTATION ✓

- [ ] Add entry to main README
- [ ] Document assessment purpose and age range
- [ ] Document patterns/dimensions measured
- [ ] Document respondent flow
- [ ] Document URL structure
- [ ] Add to system architecture docs
- [ ] Update API documentation
- [ ] Create user guide for franchise owners

---

## 12. DEPLOYMENT ✓

- [ ] Run migration on production database
- [ ] Deploy edge function to production
- [ ] Verify environment variables set
- [ ] Test on production with test assessment
- [ ] Monitor for errors
- [ ] Verify emails send in production

---

## KEY NAMING CONVENTIONS

**Use these patterns consistently:**

| Element | Pattern | Example |
|---------|---------|---------|
| Assessment code | `[type][agerange]` | `adhd1118`, `adhd46`, `career` |
| Tables | `[code]_assessments`, `[code]_assessment_responses` | `adhd46_assessments` |
| Components | `[Code]Assessment.tsx`, `[Code]CoachReport.tsx` | `ADHD46Assessment.tsx` |
| Data files | `[code]AssessmentQuestions.ts` | `careerAssessmentQuestions.ts` |
| Edge functions | `send-[code]-reports` | `send-adhd46-reports` |
| Routes | `/[code]/:id/:type` | `/adhd46/abc-123/parent` |

---

## IMPLEMENTATION ORDER

**Follow this order for efficiency:**

1. Database layer (foundation)
2. Questions & scoring data (core logic)
3. Assessment component (user-facing)
4. Management component (admin-facing)
5. Report components (analysis)
6. Email edge function (automation)
7. Routing integration (navigation)
8. Dashboard tabs (discoverability)
9. Testing (verification)
10. Documentation (knowledge transfer)

---

## QUALITY CHECKLIST

Before marking complete:

- [ ] All TypeScript types defined
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Responsive design works
- [ ] Print styles work
- [ ] Loading states everywhere
- [ ] Error handling everywhere
- [ ] User-friendly messages
- [ ] Consistent styling with app
- [ ] No hardcoded values (use env/config)
- [ ] Code commented where complex
- [ ] Functions have single responsibility
- [ ] Components reasonably sized (<500 lines)
- [ ] Database queries optimized
- [ ] Security policies tested
- [ ] CORS headers on all edge functions

---

## NOTES

- **CRITICAL: Always include "Book Appointment" button for client respondents** - this drives conversions and follow-up engagement
- Save time by copying from most similar existing assessment
- Test RLS policies thoroughly - security is critical
- Always include CORS headers in edge functions
- Use meaningful status names that describe the flow
- Pattern codes should be short (2-5 chars) and memorable
- Color code severity consistently across all reports
- Auto-save prevents data loss but adds complexity
- Email HTML must have inline CSS (no external stylesheets)
- Share tokens enable public access - secure appropriately
- Franchise isolation is critical - test thoroughly
- Booking links should pre-fill client information to reduce friction

---

**Document Version:** 1.0
**Last Updated:** 2024-12-23
**Maintained By:** Development Team
