/*
  # Fix sales_log trigger for anonymous users

  1. Problem
    - Anonymous users completing career assessments trigger `create_sales_log_from_self_assessment`
    - The trigger tries to insert into `sales_log`, but RLS policies block anonymous inserts
    - This causes the entire self_assessment insert to fail

  2. Solution
    - Add RLS policy to allow inserts from the trigger function
    - Use SECURITY DEFINER context to bypass user authentication check
    - Only applies when franchise_owner_id is provided
*/

-- Drop and recreate the trigger function with proper RLS handling
DROP TRIGGER IF EXISTS create_sales_log_on_self_assessment ON self_assessment_responses;
DROP FUNCTION IF EXISTS create_sales_log_from_self_assessment();

CREATE OR REPLACE FUNCTION create_sales_log_from_self_assessment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  franchise_code text;
  owner_id uuid;
BEGIN
  -- Get franchise owner ID from the self assessment response
  owner_id := NEW.franchise_owner_id;
  
  -- Only create sales log if franchise owner exists AND assessment is completed
  IF owner_id IS NOT NULL AND NEW.status = 'completed' THEN
    -- Get franchise code from franchise_owners table
    SELECT fo.unique_link_code INTO franchise_code
    FROM franchise_owners fo
    WHERE fo.id = owner_id
    LIMIT 1;
    
    -- Create sales log entry (bypasses RLS due to SECURITY DEFINER)
    INSERT INTO sales_log (
      franchise_code,
      assessment_type,
      client_name,
      client_email,
      submission_date,
      franchise_owner_id
    )
    VALUES (
      franchise_code,
      'self_assessment',
      NEW.customer_name,
      NEW.customer_email,
      NEW.completed_at,
      owner_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER create_sales_log_on_self_assessment
  AFTER INSERT OR UPDATE ON self_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION create_sales_log_from_self_assessment();
