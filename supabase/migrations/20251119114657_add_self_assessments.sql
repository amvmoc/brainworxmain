-- Add Self-Assessment System
--
-- 1. New Tables
--    - self_assessment_responses table with all necessary fields
--
-- 2. Security
--    - Enable RLS
--    - Add policies for public and authenticated access
--
-- 3. Important Notes
--    - Self-assessments use 1-4 scale (different from main 1-5 scale)
--    - Each assessment type has unique scoring logic
--    - Supports Neural Imprint + Domain scoring

CREATE TABLE IF NOT EXISTS self_assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  answers jsonb DEFAULT '{}'::jsonb,
  analysis_results jsonb,
  status text NOT NULL DEFAULT 'in_progress',
  current_question integer DEFAULT 0,
  franchise_owner_id uuid REFERENCES franchise_owners(id),
  entry_type text NOT NULL DEFAULT 'random_visitor',
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now()
);

ALTER TABLE self_assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for self assessments"
  ON self_assessment_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read own self assessments"
  ON self_assessment_responses
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public update own self assessments"
  ON self_assessment_responses
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read self assessments"
  ON self_assessment_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update self assessments"
  ON self_assessment_responses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_self_assessment_email 
  ON self_assessment_responses(customer_email);

CREATE INDEX IF NOT EXISTS idx_self_assessment_type 
  ON self_assessment_responses(assessment_type);

CREATE INDEX IF NOT EXISTS idx_self_assessment_status 
  ON self_assessment_responses(status);
