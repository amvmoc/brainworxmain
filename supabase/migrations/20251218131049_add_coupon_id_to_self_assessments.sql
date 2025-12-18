/*
  # Add coupon_id column to self_assessment_responses table

  1. Changes
    - Add `coupon_id` column to `self_assessment_responses` table to track which coupon was used
    - Foreign key reference to `coupon_codes` table
    - Nullable since not all self assessments use coupons

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'self_assessment_responses' AND column_name = 'coupon_id'
  ) THEN
    ALTER TABLE self_assessment_responses ADD COLUMN coupon_id uuid REFERENCES coupon_codes(id);
    CREATE INDEX IF NOT EXISTS idx_self_assessment_responses_coupon_id ON self_assessment_responses(coupon_id);
  END IF;
END $$;
