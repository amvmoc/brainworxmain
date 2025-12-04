/*
  # Add Round 2 Assessment Support

  1. Changes
    - Add `parent_response_id` column to responses table to link Round 2 to Round 1
    - This allows tracking progressive assessments over multiple rounds

  2. Notes
    - Round 1 will have NULL parent_response_id
    - Round 2 will reference the Round 1 response ID
    - Enables comparative analysis between rounds
*/

-- Add parent_response_id column to responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'parent_response_id'
  ) THEN
    ALTER TABLE responses ADD COLUMN parent_response_id uuid REFERENCES responses(id);
    CREATE INDEX IF NOT EXISTS idx_responses_parent_response_id ON responses(parent_response_id);
  END IF;
END $$;
