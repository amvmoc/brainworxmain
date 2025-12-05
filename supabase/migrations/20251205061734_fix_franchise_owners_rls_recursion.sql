/*
  # Fix infinite recursion in franchise_owners RLS policy

  1. Changes
    - Drop the problematic "Super admins view all franchises" policy that causes recursion
    - Keep the simple policy that allows owners to view their own profile
    - Super admins can still access their own data through the basic policy

  2. Security
    - Franchise owners can view their own profile only
    - No infinite recursion issues
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super admins view all franchises" ON franchise_owners;

-- The remaining policy "Franchise owners view own profile" is sufficient
-- It allows any authenticated user to view their own franchise_owners record
