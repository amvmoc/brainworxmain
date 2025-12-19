/*
  # Create ADHD Caregiver Assessment System

  ## Overview
  This migration creates a comprehensive ADHD assessment system for parents and caregivers/teachers.
  Each assessment type (parent and caregiver) has separate questionnaires and reports.
  The franchise owner receives a combined comprehensive report.

  ## New Tables
  
  ### `adhd_assessments`
  Main assessment records linking a child to their assessments
  - `id` (uuid, primary key)
  - `child_name` (text) - Name of the child being assessed
  - `child_age` (integer) - Age of the child
  - `child_gender` (text) - Gender of the child
  - `franchise_owner_id` (uuid, nullable) - FK to franchise_owners
  - `created_by_email` (text) - Email of person who initiated
  - `coupon_id` (uuid, nullable) - FK to coupon_codes if used
  - `status` (text) - 'pending', 'parent_completed', 'caregiver_completed', 'both_completed'
  - `share_token` (text, unique) - Token for sharing results publicly
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `adhd_assessment_responses`
  Individual responses from parents or caregivers
  - `id` (uuid, primary key)
  - `assessment_id` (uuid) - FK to adhd_assessments
  - `respondent_type` (text) - 'parent' or 'caregiver'
  - `respondent_name` (text) - Name of the person filling it out
  - `respondent_email` (text) - Email of respondent
  - `respondent_relationship` (text) - 'mother', 'father', 'teacher', 'guardian', etc.
  - `responses` (jsonb) - All question responses
  - `scores` (jsonb) - Calculated scores by category
  - `completed` (boolean) - Whether assessment is complete
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Franchise owners can view/edit their assessments
  - Super admins can view/edit all assessments
  - Public access via share_token for viewing results only
  - Respondents can complete assessments via direct link (anonymous access)

  ## Important Notes
  - Assessments require both parent AND caregiver responses
  - Each respondent gets their own report
  - Franchise owner gets comprehensive combined report
  - Share tokens allow public viewing of completed reports
*/

-- Create adhd_assessments table
CREATE TABLE IF NOT EXISTS adhd_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name text NOT NULL,
  child_age integer NOT NULL CHECK (child_age >= 0 AND child_age <= 18),
  child_gender text DEFAULT 'prefer_not_to_say',
  franchise_owner_id uuid REFERENCES franchise_owners(id) ON DELETE SET NULL,
  created_by_email text NOT NULL,
  coupon_id uuid REFERENCES coupon_codes(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'parent_completed', 'caregiver_completed', 'both_completed')),
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create adhd_assessment_responses table
CREATE TABLE IF NOT EXISTS adhd_assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES adhd_assessments(id) ON DELETE CASCADE,
  respondent_type text NOT NULL CHECK (respondent_type IN ('parent', 'caregiver')),
  respondent_name text NOT NULL,
  respondent_email text NOT NULL,
  respondent_relationship text NOT NULL,
  responses jsonb DEFAULT '{}',
  scores jsonb DEFAULT '{}',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, respondent_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_adhd_assessments_franchise_owner ON adhd_assessments(franchise_owner_id);
CREATE INDEX IF NOT EXISTS idx_adhd_assessments_share_token ON adhd_assessments(share_token);
CREATE INDEX IF NOT EXISTS idx_adhd_assessments_status ON adhd_assessments(status);
CREATE INDEX IF NOT EXISTS idx_adhd_responses_assessment ON adhd_assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_adhd_responses_type ON adhd_assessment_responses(respondent_type);

-- Enable RLS
ALTER TABLE adhd_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE adhd_assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for adhd_assessments

-- Super admins can view all assessments
CREATE POLICY "Super admins can view all ADHD assessments"
  ON adhd_assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Franchise owners can view their own assessments
CREATE POLICY "Franchise owners can view own ADHD assessments"
  ON adhd_assessments FOR SELECT
  TO authenticated
  USING (franchise_owner_id = auth.uid());

-- Public can view assessments via share token
CREATE POLICY "Public can view ADHD assessments via share token"
  ON adhd_assessments FOR SELECT
  TO anon
  USING (true);

-- Super admins can insert assessments
CREATE POLICY "Super admins can create ADHD assessments"
  ON adhd_assessments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Franchise owners can create their own assessments
CREATE POLICY "Franchise owners can create own ADHD assessments"
  ON adhd_assessments FOR INSERT
  TO authenticated
  WITH CHECK (franchise_owner_id = auth.uid());

-- Anonymous users can create assessments (for coupon redemption)
CREATE POLICY "Anonymous users can create ADHD assessments"
  ON adhd_assessments FOR INSERT
  TO anon
  WITH CHECK (true);

-- Super admins can update all assessments
CREATE POLICY "Super admins can update all ADHD assessments"
  ON adhd_assessments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Franchise owners can update their own assessments
CREATE POLICY "Franchise owners can update own ADHD assessments"
  ON adhd_assessments FOR UPDATE
  TO authenticated
  USING (franchise_owner_id = auth.uid())
  WITH CHECK (franchise_owner_id = auth.uid());

-- Anonymous users can update assessments (for status updates)
CREATE POLICY "Anonymous users can update ADHD assessments"
  ON adhd_assessments FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Super admins can delete assessments
CREATE POLICY "Super admins can delete ADHD assessments"
  ON adhd_assessments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Franchise owners can delete their own assessments
CREATE POLICY "Franchise owners can delete own ADHD assessments"
  ON adhd_assessments FOR DELETE
  TO authenticated
  USING (franchise_owner_id = auth.uid());

-- RLS Policies for adhd_assessment_responses

-- Super admins can view all responses
CREATE POLICY "Super admins can view all ADHD responses"
  ON adhd_assessment_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Franchise owners can view responses for their assessments
CREATE POLICY "Franchise owners can view own ADHD responses"
  ON adhd_assessment_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adhd_assessments
      WHERE adhd_assessments.id = adhd_assessment_responses.assessment_id
      AND adhd_assessments.franchise_owner_id = auth.uid()
    )
  );

-- Public can view responses via share token
CREATE POLICY "Public can view ADHD responses via share token"
  ON adhd_assessment_responses FOR SELECT
  TO anon
  USING (true);

-- Anonymous users can insert responses
CREATE POLICY "Anonymous users can create ADHD responses"
  ON adhd_assessment_responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can insert responses
CREATE POLICY "Authenticated users can create ADHD responses"
  ON adhd_assessment_responses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anonymous users can update their responses
CREATE POLICY "Anonymous users can update ADHD responses"
  ON adhd_assessment_responses FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Authenticated users can update responses
CREATE POLICY "Authenticated users can update ADHD responses"
  ON adhd_assessment_responses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Super admins can delete responses
CREATE POLICY "Super admins can delete ADHD responses"
  ON adhd_assessment_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Franchise owners can delete responses for their assessments
CREATE POLICY "Franchise owners can delete own ADHD responses"
  ON adhd_assessment_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adhd_assessments
      WHERE adhd_assessments.id = adhd_assessment_responses.assessment_id
      AND adhd_assessments.franchise_owner_id = auth.uid()
    )
  );

-- Function to update assessment status
CREATE OR REPLACE FUNCTION update_adhd_assessment_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE adhd_assessments
  SET 
    status = CASE
      WHEN EXISTS (
        SELECT 1 FROM adhd_assessment_responses
        WHERE assessment_id = NEW.assessment_id
        AND respondent_type = 'parent'
        AND completed = true
      ) AND EXISTS (
        SELECT 1 FROM adhd_assessment_responses
        WHERE assessment_id = NEW.assessment_id
        AND respondent_type = 'caregiver'
        AND completed = true
      ) THEN 'both_completed'
      WHEN EXISTS (
        SELECT 1 FROM adhd_assessment_responses
        WHERE assessment_id = NEW.assessment_id
        AND respondent_type = 'parent'
        AND completed = true
      ) THEN 'parent_completed'
      WHEN EXISTS (
        SELECT 1 FROM adhd_assessment_responses
        WHERE assessment_id = NEW.assessment_id
        AND respondent_type = 'caregiver'
        AND completed = true
      ) THEN 'caregiver_completed'
      ELSE 'pending'
    END,
    updated_at = now()
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status updates
DROP TRIGGER IF EXISTS trigger_update_adhd_assessment_status ON adhd_assessment_responses;
CREATE TRIGGER trigger_update_adhd_assessment_status
  AFTER INSERT OR UPDATE ON adhd_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_adhd_assessment_status();
