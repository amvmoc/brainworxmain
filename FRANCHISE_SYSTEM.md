# BrainWorx Franchise System Documentation

## System Overview

This document outlines the complete franchise system implementation following the flowchart provided. The system manages multiple entry points for prospects and provides franchise owners with a dashboard to track results.

## Architecture

### Key Components

#### 1. Frontend Entry Points

**GetStartedOptions Component** (`src/components/GetStartedOptions.tsx`)
- Presents two pathways to prospects:
  - **Coach Link Path**: Prospect enters coach referral code
  - **Email Path**: Random visitor enters email for verification

**Questionnaire Component** (`src/components/Questionnaire.tsx`)
- 350-question assessment
- Tracks entry type (coach_link or random_visitor)
- Automatically marks coach-link entries as email_verified
- Stores responses with franchise owner association

**AnalysisReport Component** (`src/components/AnalysisReport.tsx`)
- Analyzes completed responses
- Generates personalized insights
- Calculates category scores
- Triggers email notifications

#### 2. Franchise Owner Dashboard

**FranchiseDashboard Component** (`src/components/FranchiseDashboard.tsx`)
- Displays all prospects for assigned franchise owner
- Shows statistics (total, completed, via coach, via email)
- Provides shareable coach referral link
- Displays detailed results for each prospect
- Super admin can view all franchise data

**FranchiseLogin Component** (`src/components/FranchiseLogin.tsx`)
- Secure authentication for franchise owners
- Email and password login
- Integrates with Supabase Auth

## Data Flow

### Flow 1: Coach Link Entry Path

```
1. Prospect receives coach link from franchise owner
2. Clicks "Get Started" → Selects "I Have a Coach Link"
3. Enters coach code → System validates code
4. Proceeds to questionnaire
5. Completes 350 questions
6. System marks as: entry_type='coach_link', email_verified=true
7. Analysis runs automatically
8. Results stored with franchise_owner_id
9. Dashboard shows result immediately to franchise owner
```

### Flow 2: Random Visitor Entry Path

```
1. Random visitor clicks "Get Started" → Selects "I'm a Random Visitor"
2. Enters email address
3. System generates unique access_token
4. Sends verification email with access_token link
5. Visitor clicks link in email
6. Email verified, proceeds to questionnaire
7. Completes assessment
8. System marks as: entry_type='random_visitor', email_verified=true
9. Analysis runs
10. Results available but NOT shown in franchise dashboard (different flow)
```

## Database Schema

### Tables

#### franchise_owners
```sql
- id (uuid) - references auth.users
- email (text, unique)
- name (text)
- is_super_admin (boolean)
- unique_link_code (text, unique) - coach referral code
- created_at, updated_at (timestamp)
```

#### responses
```sql
- id (uuid, primary key)
- questionnaire_id (uuid)
- customer_name (text)
- customer_email (text)
- answers (jsonb)
- analysis_results (jsonb)
- status (text) - 'in_progress', 'completed', 'analyzed'
- franchise_owner_id (uuid) - links to franchise owner
- coach_id (uuid) - for future coach feature
- access_token (text) - for email verification
- email_verified (boolean)
- entry_type (text) - 'coach_link' or 'random_visitor'
- verification_sent_at (timestamp)
- booking_link_sent (boolean) - for calendar booking
- started_at, completed_at (timestamp)
```

#### coaches
```sql
- id (uuid, primary key)
- email (text, unique)
- name (text)
- bio, specialization, hourly_rate
- is_certified (boolean)
```

#### payment_records
```sql
- id (uuid, primary key)
- customer_email, customer_name (text)
- amount, payment_status, payment_type
- coach_id, franchise_owner_id
- stripe_payment_id (for payment tracking)
```

#### hic_enrollments & hic_payments
```sql
- Track HIC course enrollments and payments
- Link customers to coaches for paid courses
```

## Security Features

### Row Level Security (RLS)

**Franchise Owners**
- Can only view their own prospects
- Super admins can view all prospects
- Data strictly isolated by franchise_owner_id

**Coaches** (Future)
- Can view only their enrolled students
- Can view payments for their courses

**Prospects**
- Can update their own responses during assessment
- Can view own results with access token

## Email Notifications

### Edge Functions

**send-verification-email**
- Triggered when random visitor submits email
- Generates unique access token
- Sends email with verification link
- Token expires in 24 hours

**send-analysis-email**
- Triggered when assessment completed
- Sends results to customer
- Sends results to coach (if applicable)
- Sends notification to franchise owner admin

## Implementation Status

### Completed
✓ Database schema with RLS policies
✓ Frontend components (GetStartedOptions, Questionnaire, AnalysisReport)
✓ Franchise owner dashboard
✓ Login authentication
✓ Email verification flow (UI)
✓ Coach link tracking
✓ Entry type classification
✓ Analysis system with scoring

### Pending (Requires Active Database)
- Edge function deployments
- Payment platform integration
- Calendar booking system
- HIC course payment tracking
- Email service integration (SendGrid/Mailgun)
- Super admin management interface

## Usage Guide

### For Franchise Owners

1. **Login**: Navigate to `/franchise` and login with credentials
2. **Get Coach Link**: Copy unique referral link from dashboard
3. **Share Link**: Send link to prospects
4. **Track Results**: View all completed assessments in table
5. **View Details**: Click "View" to see full analysis

### For Prospects (Coach Link)

1. Receive link from franchise owner
2. Click "Get Started"
3. Select "I Have a Coach Link"
4. Enter coach code
5. Complete assessment
6. Receive results via email

### For Random Visitors

1. Click "Get Started"
2. Select "I'm a Random Visitor"
3. Enter email address
4. Receive verification email
5. Click link in email
6. Complete assessment
7. Receive results via email

## Future Enhancements

1. Payment processing for HIC courses
2. Coach profile management
3. Calendar integration for booking
4. Advanced analytics and reporting
5. Custom questionnaire templates
6. Multi-language support
7. API for third-party integrations

## Technical Notes

- All components are React with TypeScript
- Tailwind CSS for styling
- Supabase for backend
- Row Level Security for data isolation
- Edge Functions for serverless operations
- Lucide React for icons
