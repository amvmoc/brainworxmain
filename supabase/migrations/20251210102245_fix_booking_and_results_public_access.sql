/*
  # Fix Public Access for Booking and Results Pages
  
  1. Issues Fixed
    - Add RLS policies for anonymous users to read franchise_availability slots
    - Fix conflicting response access policies
  
  2. Security
    - Maintain strict RLS - only allow necessary public reads
    - Public can ONLY read availability, not modify
*/

-- Drop the overly permissive policy for responses
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'responses' 
    AND policyname = 'Users with access token can view their response'
  ) THEN
    DROP POLICY "Users with access token can view their response" ON responses;
  END IF;
END $$;

-- Add public read access to franchise_availability table for booking calendar
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'franchise_availability' 
    AND policyname = 'Public can view availability for booking'
  ) THEN
    CREATE POLICY "Public can view availability for booking"
      ON franchise_availability
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;