# ADHD Caregiver Assessment Protocol

## Overview
The ADHD Caregiver Assessment is a dual-respondent system requiring input from BOTH a parent/guardian AND a teacher/caregiver. This protocol ensures proper data collection across different environmental contexts (home vs. school).

## Assessment Flow

### Step 1: User Clicks "Learn More"
When a user clicks "Learn More" on the ADHD Caregiver Assessment card, they see:

**Assessment Information Modal** containing:
- About This Assessment
- What Makes This Assessment Different?
- What You'll Discover (8 features)
- How It Works (4-step process)
- Important Disclaimer

**Action Buttons:**
1. "Back to Assessments" (gray)
2. "Proceed to Payment" (emerald gradient)
3. "Have a Coupon Code? / Resume My Test" (green)

### Step 2: Payment or Coupon Selection
User chooses between:
- **Proceed to Payment**: Redirects to payment gateway
- **Have a Coupon Code**: Opens modal with two options:
  - Redeem Coupon Code
  - Resume My Test

### Step 3A: Coupon Redemption Flow
If user selects "Redeem Coupon Code":
1. Enter coupon code
2. System validates code and checks assessment type
3. If valid for 'adhd-caregiver', proceeds to Step 4

### Step 3B: Resume Flow
If user selects "Resume My Test":
1. Enter email address
2. System searches for in-progress assessment
3. If found, loads existing data and continues

### Step 4: Parent Information Collection
Parent/Guardian provides:
- Child's name
- Child's age (0-18)
- Child's gender
- Parent's name
- Parent's email
- Relationship to child (mother, father, guardian, etc.)

### Step 5: Parent Questionnaire
Parent completes 50 questions across 8 categories:
1. Inattention (9 questions)
2. Hyperactivity (6 questions)
3. Impulsivity (5 questions)
4. Executive Function (5 questions)
5. Emotional Regulation (5 questions)
6. Social Skills (5 questions)
7. Academic Performance (5 questions)
8. Daily Functioning (10 questions)

**Features:**
- Progress bar showing completion percentage
- Auto-save on each answer
- Previous button for navigation
- Submit button appears when all questions answered

### Step 6: Parent Report Generation
Upon completion, parent receives:
- Individual Parent Report showing:
  - Overall severity score (%)
  - Category breakdown with visual bars
  - Top 3 areas of concern
  - Severity levels (Low, Moderate, Elevated, High)
- Call-to-action to invite caregiver

### Step 7: Caregiver Invitation
Parent provides caregiver information:
- Caregiver's name
- Caregiver's email
- Relationship type (teacher, school_counselor, therapist, etc.)

**System Actions:**
1. Generates unique coupon code (ADHD-XXXXXXXX)
2. Creates coupon record in database with:
   - `assessment_type: 'adhd-caregiver'`
   - `max_uses: 1`
   - `recipient_email` and `recipient_name`
   - 30-day validity
3. Sends professional invitation email via edge function
4. Email includes:
   - Explanation of why their input matters
   - Unique coupon code
   - Direct assessment link with embedded parameters
   - Expected time (15-20 minutes)

### Step 8: Caregiver Completion
Caregiver receives email and:
1. Clicks link or enters coupon code manually
2. System loads existing assessment via `assessment_id`
3. Sets `respondent_type: 'caregiver'`
4. Caregiver provides their information
5. Completes same 50 questions from their perspective
6. Receives Individual Caregiver Report

### Step 9: Comprehensive Report
Once BOTH assessments are complete:
- System status updates to 'both_completed'
- Comprehensive Combined Report becomes available showing:
  - Side-by-side comparison scores
  - Bar charts comparing all categories
  - Radar charts for visual comparison
  - Combined overall severity rating
  - Areas of agreement (< 15% difference)
  - Areas of discrepancy (≥ 30% difference)
  - Clinical interpretation notes

## Database Schema

### Tables Used

#### `adhd_assessments`
Main assessment record:
- `id` (uuid, primary key)
- `child_name`, `child_age`, `child_gender`
- `franchise_owner_id` (nullable)
- `created_by_email`
- `coupon_id` (nullable)
- `status`: 'pending', 'parent_completed', 'caregiver_completed', 'both_completed'
- `share_token` for public result viewing
- Timestamps

#### `adhd_assessment_responses`
Individual respondent data:
- `id` (uuid, primary key)
- `assessment_id` (FK to adhd_assessments)
- `respondent_type`: 'parent' or 'caregiver'
- `respondent_name`, `respondent_email`, `respondent_relationship`
- `responses` (jsonb) - All question answers
- `scores` (jsonb) - Calculated category and overall scores
- `completed` (boolean)
- `completed_at` (timestamp)
- UNIQUE constraint on (assessment_id, respondent_type)

#### `coupon_codes`
Coupon management:
- Used to grant caregiver access
- Linked via `coupon_id` in adhd_assessments

### Status Trigger
Automatic status updates via `update_adhd_assessment_status()` trigger:
- Fires after INSERT or UPDATE on `adhd_assessment_responses`
- Updates parent assessment status based on completion states:
  - Both complete → 'both_completed'
  - Only parent → 'parent_completed'
  - Only caregiver → 'caregiver_completed'
  - Neither → 'pending'

## Edge Functions

### `send-adhd-caregiver-invitation`
**Purpose:** Sends professional invitation email to caregiver with unique access code

**Input:**
```typescript
{
  caregiverName: string;
  caregiverEmail: string;
  caregiverRelationship: string;
  parentName: string;
  childName: string;
  childAge: number;
  couponCode: string;
  assessmentUrl: string;
  assessmentId: string;
}
```

**Email Content:**
- Branded header with gradient
- Personal greeting
- Explanation of why their input matters
- Coupon code in highlighted box
- Direct action button
- 4-step what to expect list
- Important note about thoughtful completion

**Security:**
- No JWT verification (public function)
- CORS enabled for all origins
- Uses Resend API for email delivery

## Reports

### Individual Reports

#### Parent Report
- Overall severity percentage and level
- Category breakdown (all 8 categories)
- Visual progress bars
- Top 3 areas of concern
- Severity interpretation guide

#### Caregiver Report
- Same structure as parent report
- Educational setting context
- Observed challenges specific to school/care

### Comprehensive Report
Available only when both_completed:
- Child information header
- Dual assessment summary cards
- Combined overall score
- Comparison bar charts (all categories)
- Radar chart visualization
- Discrepancy analysis with color coding:
  - Green: Consistent (< 15% difference)
  - Orange: Moderate (15-29% difference)
  - Red: Significant (≥ 30% difference)
- Areas of agreement highlighted
- Areas of discrepancy detailed
- Clinical interpretation section
- Recommendations for next steps

## Scoring System

### Response Values
- Never (0): 0 points
- Rarely (25): 1 point
- Sometimes (50): 2 points
- Often (75): 3 points
- Very Often (100): 4 points

### Category Scoring
For each category:
- Sum all question scores
- Calculate max possible (number of questions × 4)
- Percentage = (score / max) × 100

### Overall Scoring
- Sum all question scores across all categories
- Total max = 50 questions × 4 = 200
- Overall percentage = (total / 200) × 100

### Severity Levels
- **Low**: 0-24% - Minimal concerns
- **Moderate**: 25-49% - Some concerns, monitoring recommended
- **Elevated**: 50-74% - Significant concerns, evaluation recommended
- **High**: 75-100% - Severe concerns, immediate evaluation needed

## Security & RLS Policies

### Access Control
- **Super Admins**: Full access to all assessments
- **Franchise Owners**: Access to their own assessments
- **Anonymous Users**:
  - Can create assessments (for coupon redemption)
  - Can complete responses
  - Can view via share_token
- **Public Viewing**: Via unique share_token in URL

### RLS Policies
All tables have Row Level Security enabled with policies for:
- SELECT (read)
- INSERT (create)
- UPDATE (modify)
- DELETE (remove)

## Important Notes

1. **Both Assessments Required**: Comprehensive report only available when both parent AND caregiver complete their assessments

2. **No Direct Start**: ADHD assessment MUST go through info modal → payment/coupon → then data collection

3. **One Response Per Type**: UNIQUE constraint prevents duplicate parent or caregiver responses for same assessment

4. **Auto-Save**: All responses auto-saved as user progresses through questions

5. **Email Verification**: Not required - anonymous completion supported for easier caregiver participation

6. **Share Links**: Each assessment gets unique share_token for public result viewing

7. **Coupon Validation**: System checks assessment_type matches 'adhd-caregiver' before allowing redemption

8. **Status Tracking**: Automatic status updates via database trigger ensure accurate progress tracking

## Standard Assessment Pattern

This assessment follows the standard pattern used across all BrainWorX assessments:

1. **Card Display**: Shows assessment in grid with icon, description, features
2. **Learn More**: Opens detailed information modal
3. **Payment/Coupon Choice**: User selects how to proceed
4. **Data Collection**: Gather user information after payment/coupon verified
5. **Questionnaire**: Present questions with progress tracking
6. **Report Generation**: Calculate scores and display results
7. **Follow-up Actions**: Additional steps specific to assessment type

This pattern ensures consistent UX across all assessment types and proper payment/access control.
