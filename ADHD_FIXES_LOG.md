# ADHD Assessment System - Fixes Log

This document tracks all fixes and changes made to the ADHD Assessment system.

## Fix #1: Gender Options (2025-12-19)

**Problem:** Gender dropdown showed "Non-binary" and "Prefer not to say" options which were not needed.

**Solution:**
- Removed "Non-binary" and "Prefer not to say" options from gender dropdown
- Changed default value from 'prefer_not_to_say' to 'male'
- Gender dropdown now only shows: Male, Female

**Files Changed:**
- `src/components/ADHDAssessment.tsx` (line 33, lines 581-583)

---

## Fix #2: Caregiver Invitation Visibility (2025-12-19)

**Problem:** After parent completed assessment, the option to invite caregiver was at the bottom of the page and easy to miss.

**Solution:**
- Moved caregiver invitation prompt to TOP of parent report page
- Created prominent blue banner with clear call-to-action
- Button text: "Send Caregiver Invitation →"

**Files Changed:**
- `src/components/ADHDAssessment.tsx` (lines 302-331)

---

## Fix #3: Caregiver Invitation Form Position (2025-12-19)

**Problem:** When clicking to invite caregiver, the invitation form appeared at the bottom below the parent report.

**Solution:**
- Moved invitation form to TOP of the page
- Parent report now displays below the invitation form
- Makes it clear what action needs to be taken first

**Files Changed:**
- `src/components/ADHDAssessment.tsx` (lines 334-460)

---

## Fix #4: Database Column Name Error (2025-12-19)

**Problem:** Coupon creation was failing with "Could not find the 'valid_until' column" error.

**Solution:**
- Changed `valid_until` to `expires_at` to match actual database schema
- The coupon_codes table uses `expires_at` not `valid_until`

**Files Changed:**
- `src/components/ADHDAssessment.tsx` (line 255)

---

## Fix #5: RLS Policy for Coupon Creation (2025-12-19)

**Problem:** Parents got "new row violates row-level security policy for table 'coupon_codes'" error when trying to create caregiver invitation coupons.

**Root Cause:**
- Original RLS policies only allowed franchise owners (authenticated users with created_by = auth.uid()) to create coupons
- Parents are not franchise owners and don't have franchise_owners records
- When parents try to invite caregivers, they need to create a coupon but don't have permission

**Solution:**
- Created new migration: `fix_adhd_caregiver_coupon_creation`
- Added policy: "Anyone can create adhd-caregiver invitation coupons"
  - Allows anon and authenticated users to create coupons
  - ONLY for assessment_type = 'adhd-caregiver'
  - created_by can be NULL for these system-generated coupons
- Added policy: "Anyone can view adhd-caregiver coupons"
  - Allows validation of these coupons without authentication

**Security Considerations:**
- Restricts creation to only adhd-caregiver type coupons
- Other coupon types still require franchise owner authentication
- Coupons have max_uses=1 and 30-day expiration to prevent abuse
- Each coupon is unique and tied to specific caregiver email

**Database Changes:**
- New migration file: `supabase/migrations/[timestamp]_fix_adhd_caregiver_coupon_creation.sql`
- Two new RLS policies on coupon_codes table

---

## Fix #6: Email Sending Method - Changed from Resend to Gmail SMTP (2025-12-19)

**Problem:** Caregiver invitation emails were failing to send with "500 Internal Server Error".

**Root Cause:**
- Edge function `send-adhd-caregiver-invitation` was using Resend API instead of Gmail SMTP
- Project uses Gmail SMTP (via nodemailer) for all email sending, not Resend
- The function had `verifyJWT: true` which also prevented unauthenticated parent access

**Solution:**
- Switched email sending from Resend API to Gmail SMTP using nodemailer
- Uses same Gmail credentials as other email functions: payments@brainworx.co.za
- Redeployed edge function with `verifyJWT: false` to allow unauthenticated access
- Removed dependency on RESEND_API_KEY environment variable

**Edge Function Changes:**
- File: `supabase/functions/send-adhd-caregiver-invitation/index.ts`
- Added import: `import { createTransport } from "npm:nodemailer@6.9.7"`
- Replaced Resend API fetch call with nodemailer transporter
- Changed verifyJWT setting from `true` to `false`
- Uses Gmail SMTP server (smtp.gmail.com:587)

**Technical Details:**
- Gmail account: payments@brainworx.co.za
- SMTP server: smtp.gmail.com
- Port: 587 (TLS)
- Matches implementation in send-coupon-email function

---

## Fix #7: Coupon Redemption Validation Error (2025-12-19)

**Problem:** Caregivers trying to redeem their invitation coupons got error "Invalid coupon data received. Please contact support."

**Root Cause:**
- ADHD caregiver invitation coupons have `created_by = NULL` (because parents create them without authentication)
- Coupon redemption validation required `created_by` to be present
- Code checked: `if (!result.assessment_type || !result.coupon_id || !result.created_by)`
- NULL values fail JavaScript truthiness checks, causing false validation failures

**Solution:**
- Modified validation to only require `assessment_type` and `coupon_id`
- Allow `created_by` to be NULL (pass `null` instead of undefined when missing)
- Changed check to: `if (!result.assessment_type || !result.coupon_id)`
- Pass `result.created_by || null` to success callback

**Files Changed:**
- `src/components/CouponRedemption.tsx` (lines 51-63)

**Why This Works:**
- System-generated coupons (adhd-caregiver) don't have franchise owners
- `created_by` is optional metadata, not required for redemption
- Only assessment type and coupon ID are needed to start the assessment
- Franchise tracking still works when `created_by` is present

---

## Fix #8: Pre-fill Caregiver Form with Child Details (2025-12-19)

**Problem:** Caregivers had to re-enter child's name, age, gender, and relationship that parent already provided.

**Root Cause:**
- Coupon system didn't store child information when parent sent invitation
- No way to pass child details from coupon to assessment form
- Relationship field shown even though parent already specified it (Teacher, Therapist, etc.)

**Solution:**
1. **Database Changes:**
   - Added columns to `coupon_codes`: `child_name`, `child_age`, `child_gender`, `caregiver_relationship`, `assessment_id`
   - Created migration: `add_child_info_to_coupons`
   - Updated `validate_and_use_coupon` function to return these fields

2. **Coupon Creation:**
   - Modified `ADHDAssessment.tsx` (line 247-263) to store child info when creating caregiver invitation

3. **Coupon Redemption:**
   - Updated `CouponRedemption.tsx` interface to accept child details
   - Modified callback to pass child info back (lines 6-17, 71-82)

4. **Form Pre-filling:**
   - Added prefilled props to `ADHDAssessment` component
   - Child name, age, gender fields pre-filled and disabled
   - Relationship field hidden when pre-filled from invitation
   - Only caregiver's own name and email need to be entered

5. **Flow Management:**
   - `GetStartedOptions.tsx` tracks and passes child info
   - Auto-detects caregiver vs parent based on presence of child data
   - Links caregiver response to correct assessment via `assessment_id`

**Files Changed:**
- `supabase/migrations/[timestamp]_add_child_info_to_coupons.sql` (new)
- `supabase/migrations/[timestamp]_update_coupon_validation_return_child_info.sql` (new)
- `src/components/ADHDAssessment.tsx` (lines 16-25, 29-38, 44-49, 247-263, 563-606, 634-653)
- `src/components/CouponRedemption.tsx` (lines 5-20, 69-82)
- `src/components/GetStartedOptions.tsx` (lines 32-39, 117-142, 246-263)

**User Experience Improvement:**
- Eliminates redundant data entry
- Ensures consistency between parent and caregiver responses
- Reduces form fields from 6 to 2 for caregivers
- Clear visual indication (grayed out fields) that data came from parent

---

## Summary of All Changes

### Code Changes
1. Gender dropdown simplified to Male/Female only
2. Caregiver invitation prominently displayed at top after parent assessment
3. Invitation form appears at top when clicked
4. Fixed database column name from valid_until to expires_at
5. Email sending switched from Resend API to Gmail SMTP (nodemailer)
6. Email function authentication fixed (verifyJWT: false)
7. Coupon redemption validation allows NULL created_by field
8. Caregiver assessment form pre-fills child details from coupon
9. Relationship field hidden when pre-filled by parent

### Database Changes
1. Added RLS policy for adhd-caregiver coupon creation (anon/authenticated)
2. Added RLS policy for adhd-caregiver coupon viewing (anon/authenticated)
3. Added child info columns to coupon_codes table
4. Updated validate_and_use_coupon function to return child details

### Edge Function Changes
1. send-adhd-caregiver-invitation switched from Resend API to Gmail SMTP
2. Deployed with verifyJWT: false for public access
3. Uses nodemailer with payments@brainworx.co.za Gmail account

### Impact
- Parents can now complete assessments and invite caregivers without authentication errors
- Clear user flow guides parents through the invitation process
- Caregivers only enter their own name and email (child info pre-filled)
- Guaranteed data consistency between parent and caregiver responses
- Relationship type determined by parent (Teacher, Therapist, etc.)
- Security maintained through type-specific policies and coupon constraints
- Email function publicly accessible for unauthenticated parent invitations
- Emails sent successfully via Gmail SMTP (consistent with other email functions)

### Technical Requirements
- Gmail SMTP credentials embedded in edge function
- No external API keys needed (removed Resend dependency)
- Email sent from: BrainWorX Assessments <payments@brainworx.co.za>
