/*
  # Remove ADHD Caregiver Assessment System

  This migration removes the dual-respondent ADHD Caregiver Assessment system (ages 4-18) that required both parent and teacher input.

  ## Changes
  - Drop adhd_assessments table
  - Drop adhd_assessment_responses table
  - Drop related functions
  - Clean up related policies

  ## Note
  This does NOT affect:
  - ADHD 7-10 Assessment (adhd710_assessments)
  - ADHD 11-18 Assessment (adhd1118_assessments)
*/

-- Drop tables if they exist
DROP TABLE IF EXISTS adhd_assessment_responses CASCADE;
DROP TABLE IF EXISTS adhd_assessments CASCADE;

-- Drop any related functions
DROP FUNCTION IF EXISTS create_adhd_assessment_from_coupon CASCADE;
