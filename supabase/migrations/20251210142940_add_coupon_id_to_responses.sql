/*
  # Add coupon_id column to responses table

  1. Changes
    - Add `coupon_id` column to `responses` table to track which coupon was used
    - Foreign key reference to `coupon_codes` table
    - Nullable since not all responses use coupons

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'coupon_id'
  ) THEN
    ALTER TABLE responses ADD COLUMN coupon_id uuid REFERENCES coupon_codes(id);
    CREATE INDEX IF NOT EXISTS idx_responses_coupon_id ON responses(coupon_id);
  END IF;
END $$;