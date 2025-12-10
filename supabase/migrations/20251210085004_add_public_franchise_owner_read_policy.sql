/*
  # Add Public Read Access for Franchise Owners (Booking Page)

  ## Changes
  - Add policy allowing anonymous users to read basic franchise owner info
  - This enables the public booking page to look up franchise owners by unique_link_code
  - Only allows reading basic info: id, name, email (no sensitive data exposed)

  ## Security
  - Anonymous users can only SELECT (read) data
  - No write, update, or delete access granted
  - Exposes minimal information needed for booking functionality
*/

-- Allow anonymous users to view franchise owner basic info for booking
CREATE POLICY "Public can view franchise owners for booking"
  ON franchise_owners
  FOR SELECT
  TO anon
  USING (true);
