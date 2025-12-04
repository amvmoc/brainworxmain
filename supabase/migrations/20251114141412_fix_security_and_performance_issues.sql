/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
    - Add index on `hic_payments.hic_enrollment_id`
    - Add index on `payment_records.coach_id`
    - Add index on `payment_records.franchise_owner_id`
    - Add index on `responses.questionnaire_id`

  ### 2. Optimize RLS Policies (Auth Function Initialization)
    - Update all policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation for each row, significantly improving performance
    - Affects policies on: responses, franchise_owners, coaches, payment_records, hic_enrollments, hic_payments

  ### 3. Remove Duplicate Indexes
    - Drop `idx_franchise_owners_link_code` (duplicate of `idx_franchise_owners_code`)
    - Drop `idx_responses_franchise` (duplicate of `idx_responses_franchise_owner`)

  ### 4. Remove Unused Indexes
    - Drop 15 unused indexes that are not being utilized by queries
    - Reduces database maintenance overhead

  ### 5. Consolidate Duplicate Policies
    - Merge duplicate SELECT policies on franchise_owners table
    - Merge duplicate SELECT policies on responses table

  ### 6. Fix Function Security
    - Update `generate_unique_link_code` function with immutable search_path

  ## Security Improvements
    - All RLS policies now use optimized auth function calls
    - Removed redundant policies to simplify security model
    - Fixed function search path mutability issue

  ## Performance Improvements
    - Added critical foreign key indexes for optimal joins
    - Removed 15 unused indexes (reduces write overhead)
    - Removed 2 duplicate indexes
    - Optimized RLS policy evaluation
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_hic_payments_enrollment_id 
  ON public.hic_payments(hic_enrollment_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_coach_id 
  ON public.payment_records(coach_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_franchise_owner_id 
  ON public.payment_records(franchise_owner_id);

CREATE INDEX IF NOT EXISTS idx_responses_questionnaire_id 
  ON public.responses(questionnaire_id);

-- ============================================================================
-- 2. REMOVE DUPLICATE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_franchise_owners_link_code;
DROP INDEX IF EXISTS public.idx_responses_franchise;

-- ============================================================================
-- 3. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_questions_questionnaire;
DROP INDEX IF EXISTS public.idx_responses_email;
DROP INDEX IF EXISTS public.idx_responses_franchise_owner;
DROP INDEX IF EXISTS public.idx_responses_access_token;
DROP INDEX IF EXISTS public.idx_franchise_owners_code;
DROP INDEX IF EXISTS public.idx_coaches_email;
DROP INDEX IF EXISTS public.idx_payment_records_customer;
DROP INDEX IF EXISTS public.idx_payment_records_status;
DROP INDEX IF EXISTS public.idx_hic_enrollments_customer;
DROP INDEX IF EXISTS public.idx_hic_enrollments_coach;
DROP INDEX IF EXISTS public.idx_hic_payments_coach;
DROP INDEX IF EXISTS public.idx_responses_coach;
DROP INDEX IF EXISTS public.idx_responses_entry_type;
DROP INDEX IF EXISTS public.idx_responses_parent_response_id;
DROP INDEX IF EXISTS public.idx_responses_email_status;

-- ============================================================================
-- 4. CONSOLIDATE AND OPTIMIZE RLS POLICIES
-- ============================================================================

-- Drop all existing policies that need to be recreated with optimization
DROP POLICY IF EXISTS "Franchise owners can view their prospects" ON public.responses;
DROP POLICY IF EXISTS "Franchise owners view their prospects" ON public.responses;
DROP POLICY IF EXISTS "Coaches view their customers responses" ON public.responses;
DROP POLICY IF EXISTS "Franchise owners can view own profile" ON public.franchise_owners;
DROP POLICY IF EXISTS "Franchise owners view own profile" ON public.franchise_owners;
DROP POLICY IF EXISTS "Super admins can view all franchise owners" ON public.franchise_owners;
DROP POLICY IF EXISTS "Super admins view all franchises" ON public.franchise_owners;
DROP POLICY IF EXISTS "Coaches view own profile" ON public.coaches;
DROP POLICY IF EXISTS "Users view own payments" ON public.payment_records;
DROP POLICY IF EXISTS "Franchise owners insert payments" ON public.payment_records;
DROP POLICY IF EXISTS "Coaches view their enrollments" ON public.hic_enrollments;
DROP POLICY IF EXISTS "Coaches view payments for their courses" ON public.hic_payments;

-- RESPONSES TABLE - Optimized policies (consolidated duplicates)
CREATE POLICY "Franchise owners view their prospects"
  ON public.responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM franchise_owners
      WHERE franchise_owners.id = (select auth.uid())
        AND (franchise_owners.is_super_admin = true 
             OR responses.franchise_owner_id = franchise_owners.id)
    )
  );

CREATE POLICY "Coaches view their customers responses"
  ON public.responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM coaches
      WHERE coaches.id = (select auth.uid())
        AND responses.coach_id = coaches.id
    )
  );

-- FRANCHISE_OWNERS TABLE - Consolidated and optimized policies
CREATE POLICY "Franchise owners view own profile"
  ON public.franchise_owners
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Super admins view all franchises"
  ON public.franchise_owners
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM franchise_owners fo
      WHERE fo.id = (select auth.uid())
        AND fo.is_super_admin = true
    )
  );

-- COACHES TABLE - Optimized policy
CREATE POLICY "Coaches view own profile"
  ON public.coaches
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- PAYMENT_RECORDS TABLE - Optimized policies
CREATE POLICY "Users view own payments"
  ON public.payment_records
  FOR SELECT
  TO authenticated
  USING (
    franchise_owner_id = (select auth.uid())
    OR coach_id = (select auth.uid())
  );

CREATE POLICY "Franchise owners insert payments"
  ON public.payment_records
  FOR INSERT
  TO authenticated
  WITH CHECK (franchise_owner_id = (select auth.uid()));

-- HIC_ENROLLMENTS TABLE - Optimized policy
CREATE POLICY "Coaches view their enrollments"
  ON public.hic_enrollments
  FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

-- HIC_PAYMENTS TABLE - Optimized policy
CREATE POLICY "Coaches view payments for their courses"
  ON public.hic_payments
  FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

-- ============================================================================
-- 5. FIX FUNCTION SECURITY
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_unique_link_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    SELECT EXISTS(
      SELECT 1 FROM public.franchise_owners WHERE unique_link_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;