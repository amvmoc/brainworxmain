/*
  # Fix sales_log trigger function to use correct column names

  1. Problem
    - Trigger function references columns that don't exist in sales_log table
    - Uses `franchise_code`, `client_name`, `client_email`, `submission_date`
    - Actual columns are `customer_name`, `customer_email`, no franchise_code/submission_date

  2. Solution
    - Update trigger to use correct column names
    - Link self_assessment_response via self_assessment_response_id
    - Remove references to non-existent columns
*/

DROP TRIGGER IF EXISTS create_sales_log_on_self_assessment ON self_assessment_responses;
DROP FUNCTION IF EXISTS create_sales_log_from_self_assessment();

CREATE OR REPLACE FUNCTION create_sales_log_from_self_assessment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  owner_id uuid;
BEGIN
  -- Get franchise owner ID from the self assessment response
  owner_id := NEW.franchise_owner_id;
  
  -- Only create sales log if franchise owner exists AND assessment is completed
  IF owner_id IS NOT NULL AND NEW.status = 'completed' THEN
    -- Create or update sales log entry
    INSERT INTO sales_log (
      franchise_owner_id,
      customer_name,
      customer_email,
      assessment_type,
      self_assessment_response_id,
      status,
      created_at,
      updated_at
    )
    VALUES (
      owner_id,
      NEW.customer_name,
      NEW.customer_email,
      NEW.assessment_type,
      NEW.id,
      'completed',
      NEW.created_at,
      NEW.completed_at
    )
    ON CONFLICT (self_assessment_response_id) 
    DO UPDATE SET
      status = 'completed',
      updated_at = NEW.completed_at;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER create_sales_log_on_self_assessment
  AFTER INSERT OR UPDATE ON self_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION create_sales_log_from_self_assessment();
