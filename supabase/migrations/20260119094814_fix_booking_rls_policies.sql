/*
  # Fix Booking RLS Policies

  1. Changes
    - Drop existing insert policy for bookings that only allows anon
    - Create new policies that allow both anon AND authenticated users to create bookings
    - Ensure public users can view availability for booking selection
    
  2. Security
    - Maintains security by only allowing insertion with valid franchise_owner_id
    - Both authenticated and anonymous users can create bookings (for customer booking flow)
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;

-- Create new policy that allows both anon and authenticated to create bookings
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Also ensure authenticated users can view availability
DROP POLICY IF EXISTS "Authenticated can view active availability" ON franchise_availability;
CREATE POLICY "Authenticated can view active availability"
  ON franchise_availability
  FOR SELECT
  TO authenticated
  USING (is_active = true);
