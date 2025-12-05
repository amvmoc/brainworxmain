/*
  # Fix Super Admin Access to View All Users

  1. New Functions
    - `is_super_admin()` - Helper function to check if current user is super admin
    - Uses SECURITY DEFINER to bypass RLS

  2. Changes
    - Add policy to allow super admins to view all franchise owners
    - Use helper function to avoid recursion

  3. Security
    - Super admins can view all franchise owner records
    - Regular franchise owners can only view their own profile
*/

-- Create helper function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM franchise_owners
    WHERE id = auth.uid()
    AND is_super_admin = true
  );
$$;

-- Add policy for super admins to view all franchise owners
CREATE POLICY "Super admins can view all franchise owners"
  ON franchise_owners
  FOR SELECT
  TO authenticated
  USING (is_super_admin());
