/*
  # Add Child and Assessment Information to Coupons
  
  ## Changes
  This migration adds fields to store child details and caregiver relationship
  in the coupon_codes table for ADHD caregiver assessment invitations.
  
  1. New Columns Added to `coupon_codes`:
    - `child_name` (text, nullable) - Name of the child being assessed
    - `child_age` (integer, nullable) - Age of the child
    - `child_gender` (text, nullable) - Gender of the child
    - `caregiver_relationship` (text, nullable) - Pre-filled relationship (teacher, etc.)
    - `assessment_id` (uuid, nullable) - Link to the associated ADHD assessment
  
  ## Purpose
  When a parent sends a caregiver invitation, these fields allow the caregiver's form
  to be pre-filled with the child's information and relationship, eliminating redundant
  data entry and ensuring consistency between parent and caregiver responses.
  
  ## Security
  - No new RLS policies needed (existing policies cover these fields)
  - Fields are nullable for backward compatibility with existing coupons
*/

-- Add child information columns to coupon_codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupon_codes' AND column_name = 'child_name'
  ) THEN
    ALTER TABLE coupon_codes ADD COLUMN child_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupon_codes' AND column_name = 'child_age'
  ) THEN
    ALTER TABLE coupon_codes ADD COLUMN child_age integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupon_codes' AND column_name = 'child_gender'
  ) THEN
    ALTER TABLE coupon_codes ADD COLUMN child_gender text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupon_codes' AND column_name = 'caregiver_relationship'
  ) THEN
    ALTER TABLE coupon_codes ADD COLUMN caregiver_relationship text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupon_codes' AND column_name = 'assessment_id'
  ) THEN
    ALTER TABLE coupon_codes ADD COLUMN assessment_id uuid REFERENCES adhd_assessments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_coupon_codes_assessment_id ON coupon_codes(assessment_id);
