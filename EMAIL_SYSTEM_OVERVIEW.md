# BrainWorx Email System Overview

## Email Reports for NIP Assessments

When a client completes a Neural Imprint Patterns (NIP) assessment, the system automatically sends **5 emails** with two different report formats:

### 📧 Email Distribution

#### 1. **Client Report** → Customer
- **Recipient:** Client's email address
- **Subject:** "Your BrainWorx Neural Imprint Patterns Assessment Results"
- **Format:** Simple, client-friendly report
- **Contents:**
  - Visual scoring graph with all Neural Imprint Patterns
  - Color-coded bars (High/Medium/Low)
  - Call-to-action to book FREE 45-minute coaching session
  - Links to view full results online
  - Professional disclaimer
  - BrainWorx branding

#### 2. **Coach Report** → Franchise Owner
- **Recipient:** Franchise owner's email (if assigned)
- **Subject:** "NIP Assessment Report - [Client Name] - Comprehensive Coach Analysis"
- **Format:** Detailed, comprehensive coaching report
- **Contents:**
  - Executive summary with complete scoring overview
  - Detailed pattern analysis for high/medium priority patterns
  - Pattern descriptions and interpretations
  - Comprehensive action plans and recommendations
  - Follow-up guidance for coaches
  - Professional formatting for coaching sessions

#### 3. **Coach Report** → info@brainworx.co.za
- **Recipient:** info@brainworx.co.za
- **Subject:** "NIP Assessment Report - [Client Name] - Comprehensive Coach Analysis"
- **Format:** Same as franchise owner's coach report
- **Purpose:** Administrative oversight and record-keeping

#### 4. **Client Report** → info@brainworx.co.za
- **Recipient:** info@brainworx.co.za
- **Subject:** "NIP Client Report - [Client Name] - Assessment Results"
- **Format:** Same as customer's client report
- **Purpose:** See exactly what the client receives

#### 5. **Coach Report** → kobus@brainworx.co.za
- **Recipient:** kobus@brainworx.co.za
- **Subject:** "NIP Assessment Report - [Client Name] - Comprehensive Coach Analysis"
- **Format:** Same as franchise owner's coach report
- **Purpose:** Executive oversight

---

## Report Formats

### 📊 Client Report (Simple Format)
**Recipients:** Customer + info@brainworx.co.za

**Key Features:**
- Clean, visually appealing design with gradient backgrounds
- Complete scoring graph showing all Neural Imprint Patterns
- Color-coded scoring system:
  - 🔴 High (60-100%): Significant presence
  - 🟠 Medium (40-59%): Moderate presence
  - 🔵 Low (0-39%): Minimal presence
- Clear call-to-action for booking coaching session
- Contact information for franchise owner (if applicable) or BrainWorx
- Professional disclaimer about assessment limitations
- Printable format
- Mobile-responsive design

**Purpose:** Give clients a clear, understandable overview of their results and encourage them to book a coaching session for detailed interpretation.

---

### 📋 Coach Report (Comprehensive Format)
**Recipients:** Franchise Owner + info@brainworx.co.za (2 copies) + kobus@brainworx.co.za

**Key Features:**

#### Cover Page
- BrainWorx branding
- Client information
- Assessment date
- Franchise owner information (if applicable)

#### Executive Summary
- Client demographics
- Total patterns assessed
- Complete scoring overview with visual bar charts
- Priority breakdown (High/Medium/Low)
- Overall profile assessment
- Critical findings alert (if applicable)
- Key strengths identified
- Primary concerns listed

#### Detailed Pattern Analysis
**High Priority Patterns (60-100%):**
- Pattern description
- What it means for the client
- How it manifests in daily life
- Root causes and contributing factors
- Impact on other areas
- Immediate recommendations
- 90-day action plan

**Medium Priority Patterns (40-59%):**
- Brief description
- Impact assessment
- Monitoring recommendations

#### Comprehensive Action Plan
- Phase 1: Stabilization (Months 1-2)
- Phase 2: Skill Building (Months 3-4)
- Phase 3: Integration & Prevention (Months 5-6)
- Specific weekly action items
- Progress milestones

#### Resources & Support
- Recommended professionals
- Books and reading materials
- Apps and digital tools
- Emergency contacts

#### Progress Tracking Framework
- Monthly check-in questions
- Success indicators
- Reassessment timeline

#### Coach's Clinical Notes
- Session observations
- Client's primary concerns
- Client's goals
- Referrals made
- Follow-up plan

#### Summary & Prognosis
- Current status assessment
- Prognosis with intervention
- Prognosis without intervention
- Critical success factors
- Final recommendations

**Purpose:** Provide coaches/franchise owners with comprehensive information needed for professional consultation, intervention planning, and client support.

---

## Technical Implementation

### Edge Function
**Location:** `/supabase/functions/send-analysis-email/`

**Files:**
- `index.ts` - Main edge function
- `client-report.ts` - Client report generator
- `comprehensive-coach-report.ts` - Coach report generator

**Trigger:** Called after client completes NIP assessment

**Data Flow:**
1. Assessment completed → Analysis results generated
2. Edge function triggered with customer info + analysis data
3. Both report formats generated dynamically
4. 5 emails sent via Gmail SMTP
5. Delivery status logged

**Error Handling:**
- Individual email failures are logged but don't block others
- Comprehensive logging for troubleshooting
- Email delivery summary provided in console

---

## Email Subjects

All emails use descriptive subjects for easy identification:

- **Client Report (to customer):** "Your BrainWorx Neural Imprint Patterns Assessment Results"
- **Coach Report (to coaches/admin):** "NIP Assessment Report - [Client Name] - Comprehensive Coach Analysis"
- **Client Report (to admin):** "NIP Client Report - [Client Name] - Assessment Results"

---

## Important Notes

1. **info@brainworx.co.za receives 2 emails per assessment:**
   - One coach report (comprehensive)
   - One client report (simple)
   - This allows admin to see both perspectives

2. **Franchise owners only receive the coach report:**
   - They need the detailed information for coaching
   - Clients handle their own access to client report

3. **All emails are sent via Gmail SMTP:**
   - Sender: payments@brainworx.co.za
   - Reliable delivery through Google's infrastructure

4. **Reports include links:**
   - View full results online
   - Book consultation (if franchise booking page available)
   - All links are dynamically generated

5. **Privacy & Confidentiality:**
   - All reports clearly marked as confidential
   - Copyright notices included
   - Professional disclaimers present

---

## Future Enhancements

Potential improvements:
- PDF attachment generation
- Email delivery confirmation tracking
- Customizable report templates per franchise
- Multi-language support
- Automated follow-up email sequences
- Email open/click tracking

---

**Last Updated:** December 2024
**Version:** 1.0.0
