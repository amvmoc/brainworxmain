/*
  # Fix Database Function Security Settings

  1. Security Improvements
    - Set proper search_path for all database functions to prevent SQL injection
    - All functions are set to SECURITY DEFINER with restricted search_path
    
  2. Changes
    - Update update_invoice_updated_at function with security settings
    - Update generate_invoice_number function with security settings
    - Update update_sales_log_updated_at function with security settings
    - Update create_sales_log_from_response function with security settings
    - Update create_sales_log_from_self_assessment function with security settings
*/

-- Fix update_invoice_updated_at function
DROP FUNCTION IF EXISTS update_invoice_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

-- Fix generate_invoice_number function
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN TO_CHAR(NOW(), 'YYMMDD') || TO_CHAR(NOW(), 'HH24MISS');
END;
$$;

-- Fix update_sales_log_updated_at function
DROP FUNCTION IF EXISTS update_sales_log_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_sales_log_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_sales_log_updated_at_trigger ON sales_log;
CREATE TRIGGER update_sales_log_updated_at_trigger
  BEFORE UPDATE ON sales_log
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_log_updated_at();

-- Fix create_sales_log_from_response function
DROP FUNCTION IF EXISTS create_sales_log_from_response() CASCADE;
CREATE OR REPLACE FUNCTION create_sales_log_from_response()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  franchise_code text;
  owner_id uuid;
BEGIN
  -- Get franchise owner ID
  owner_id := NEW.franchise_owner_id;
  
  -- Get franchise code for this owner
  SELECT fc.franchise_code INTO franchise_code
  FROM franchise_codes fc
  WHERE fc.owner_id = owner_id
  LIMIT 1;

  -- Create sales log entry
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
    'questionnaire',
    NEW.customer_name,
    NEW.customer_email,
    NEW.completed_at,
    owner_id
  );

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS create_sales_log_on_response ON responses;
CREATE TRIGGER create_sales_log_on_response
  AFTER INSERT ON responses
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION create_sales_log_from_response();

-- Fix create_sales_log_from_self_assessment function
DROP FUNCTION IF EXISTS create_sales_log_from_self_assessment() CASCADE;
CREATE OR REPLACE FUNCTION create_sales_log_from_self_assessment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  franchise_code text;
  owner_id uuid;
BEGIN
  -- Get franchise owner ID from the self assessment response
  owner_id := NEW.franchise_owner_id;
  
  -- Get franchise code for this owner
  SELECT fc.franchise_code INTO franchise_code
  FROM franchise_codes fc
  WHERE fc.owner_id = owner_id
  LIMIT 1;

  -- Create sales log entry
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

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS create_sales_log_on_self_assessment ON self_assessment_responses;
CREATE TRIGGER create_sales_log_on_self_assessment
  AFTER INSERT ON self_assessment_responses
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION create_sales_log_from_self_assessment();
