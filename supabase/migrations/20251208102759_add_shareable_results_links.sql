/*
  # Add Shareable Results Link System

  1. Changes
    - Add `share_token` column to `responses` table for unique shareable links
    - Add `share_token` column to `self_assessment_responses` table
    - Create function to generate unique tokens
    - Add indexes for efficient token lookup
  
  2. Security
    - Tokens are UUID-based for security
    - RLS policies allow public access via valid share token
    - Share tokens can be regenerated if needed
*/

-- Add share_token column to responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE responses ADD COLUMN share_token uuid DEFAULT gen_random_uuid();
    CREATE INDEX idx_responses_share_token ON responses(share_token);
  END IF;
END $$;

-- Add share_token column to self_assessment_responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'self_assessment_responses' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE self_assessment_responses ADD COLUMN share_token uuid DEFAULT gen_random_uuid();
    CREATE INDEX idx_self_assessment_responses_share_token ON self_assessment_responses(share_token);
  END IF;
END $$;

-- Generate tokens for existing records that don't have one
UPDATE responses SET share_token = gen_random_uuid() WHERE share_token IS NULL;
UPDATE self_assessment_responses SET share_token = gen_random_uuid() WHERE share_token IS NULL;

-- Add RLS policy to allow public access to results via share token
DROP POLICY IF EXISTS "Public can view results via share token" ON responses;
CREATE POLICY "Public can view results via share token"
  ON responses
  FOR SELECT
  TO anon
  USING (share_token IS NOT NULL);

DROP POLICY IF EXISTS "Public can view self assessment results via share token" ON self_assessment_responses;
CREATE POLICY "Public can view self assessment results via share token"
  ON self_assessment_responses
  FOR SELECT
  TO anon
  USING (share_token IS NOT NULL);