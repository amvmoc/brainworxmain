/*
  # Add Delete Policies for Assessments

  1. Changes
    - Add DELETE policy for super admins on `responses` table
    - Add DELETE policy for super admins on `self_assessment_responses` table

  2. Security
    - Only super admins (is_super_admin = true) can delete assessment responses
    - Ensures data safety by restricting delete access to authorized administrators only
*/

-- Add DELETE policy for responses table
CREATE POLICY "Super admins can delete responses"
  ON responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = (SELECT auth.uid())
      AND franchise_owners.is_super_admin = true
    )
  );

-- Add DELETE policy for self_assessment_responses table
CREATE POLICY "Super admins can delete self assessments"
  ON self_assessment_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = (SELECT auth.uid())
      AND franchise_owners.is_super_admin = true
    )
  );