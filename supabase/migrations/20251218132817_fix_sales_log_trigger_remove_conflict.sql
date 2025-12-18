/*
  # Fix sales_log trigger - remove ON CONFLICT clause

  1. Problem
    - Trigger function uses ON CONFLICT but no unique constraint exists
    - This causes the insert to fail

  2. Solution
    - Remove ON CONFLICT clause
    - Check if sales log already exists before inserting
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
  existing_log_id uuid;
BEGIN
  -- Get franchise owner ID from the self assessment response
  owner_id := NEW.franchise_owner_id;
  
  -- Only create sales log if franchise owner exists AND assessment is completed
  IF owner_id IS NOT NULL AND NEW.status = 'completed' THEN
    -- Check if sales log already exists for this response
    SELECT id INTO existing_log_id
    FROM sales_log
    WHERE self_assessment_response_id = NEW.id
    LIMIT 1;
    
    IF existing_log_id IS NULL THEN
      -- Create new sales log entry
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
      );
    ELSE
      -- Update existing sales log
      UPDATE sales_log
      SET 
        status = 'completed',
        updated_at = NEW.completed_at
      WHERE id = existing_log_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER create_sales_log_on_self_assessment
  AFTER INSERT OR UPDATE ON self_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION create_sales_log_from_self_assessment();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_sales_log_from_self_assessment() TO anon;
GRANT EXECUTE ON FUNCTION create_sales_log_from_self_assessment() TO authenticated;
