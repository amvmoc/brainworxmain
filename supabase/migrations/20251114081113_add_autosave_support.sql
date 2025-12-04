/*
  # Add Auto-Save Support for Questionnaires

  ## Summary
  This migration adds auto-save functionality to allow customers to resume their assessment 
  if they lose connection or close the browser. Progress is automatically saved after each 
  question is answered.

  ## Changes Made

  ### Modified Tables
  - `responses` table:
    - Add `current_question` column to track progress (integer, default 0)
    - Add `last_activity_at` column to track when user last interacted (timestamptz)
  
  ### Indexes
  - Add index on `customer_email` and `status` for faster lookups when resuming

  ## Security
  - No changes to existing RLS policies
  - Users can still update their own responses

  ## Important Notes
  1. The `current_question` field stores the index of the current question (0-based)
  2. Progress is saved automatically after each answer
  3. Users can resume by entering their email address
*/

-- Add current_question column to track progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'current_question'
  ) THEN
    ALTER TABLE responses ADD COLUMN current_question integer DEFAULT 0;
  END IF;
END $$;

-- Add last_activity_at column to track when user last interacted
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE responses ADD COLUMN last_activity_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create index for faster lookups when resuming
CREATE INDEX IF NOT EXISTS idx_responses_email_status ON responses(customer_email, status);
