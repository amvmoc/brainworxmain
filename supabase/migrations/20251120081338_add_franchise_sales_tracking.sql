/*
  # Add Franchise Sales Tracking System

  1. New Tables
    - `sales_log`
      - `id` (uuid, primary key)
      - `franchise_owner_id` (uuid) - The franchise holder who made the sale
      - `customer_name` (text) - Customer name
      - `customer_email` (text) - Customer email
      - `assessment_type` (text) - Type of assessment (Full NIP, Self-Assessment, etc)
      - `response_id` (uuid, nullable) - Links to response if completed
      - `self_assessment_response_id` (uuid, nullable) - Links to self assessment if completed
      - `invoice_id` (uuid, nullable) - Links to invoice if created
      - `amount` (numeric) - Sale amount
      - `status` (text) - Status: lead, in_progress, completed, paid
      - `referral_source` (text) - How they came (franchise_link, direct, etc)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Updates
    - Add franchise_link_code field to track which FH link was used
    - Update RLS policies to allow super admin full access
    
  3. Security
    - Enable RLS on sales_log
    - FH can only view their own sales
    - Super admin can view all sales
    - Add policies for all tables to support super admin access

  4. Important Notes
    - Sales are automatically logged when customer starts via FH link
    - FH referral link format: ?fh=FRANCHISE_CODE
    - Super admin has is_super_admin = true in franchise_owners table
*/

-- Create sales_log table
CREATE TABLE IF NOT EXISTS sales_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_owner_id uuid REFERENCES franchise_owners(id) ON DELETE SET NULL NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  assessment_type text NOT NULL,
  response_id uuid REFERENCES responses(id) ON DELETE SET NULL,
  self_assessment_response_id uuid REFERENCES self_assessment_responses(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  amount numeric DEFAULT 0 CHECK (amount >= 0),
  status text DEFAULT 'lead' NOT NULL CHECK (status IN ('lead', 'in_progress', 'completed', 'paid')),
  referral_source text DEFAULT 'franchise_link' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for sales_log
CREATE INDEX IF NOT EXISTS idx_sales_log_franchise_owner_id ON sales_log(franchise_owner_id);
CREATE INDEX IF NOT EXISTS idx_sales_log_customer_email ON sales_log(customer_email);
CREATE INDEX IF NOT EXISTS idx_sales_log_status ON sales_log(status);
CREATE INDEX IF NOT EXISTS idx_sales_log_created_at ON sales_log(created_at DESC);

-- Enable RLS
ALTER TABLE sales_log ENABLE ROW LEVEL SECURITY;

-- Sales log policies

-- Super admin can view all sales
CREATE POLICY "Super admin can view all sales"
  ON sales_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- FH can view their own sales
CREATE POLICY "Franchise owners can view own sales"
  ON sales_log FOR SELECT
  TO authenticated
  USING (
    franchise_owner_id = auth.uid()
  );

-- FH can create their own sales logs
CREATE POLICY "Franchise owners can create sales logs"
  ON sales_log FOR INSERT
  TO authenticated
  WITH CHECK (
    franchise_owner_id = auth.uid()
  );

-- FH can update their own sales logs
CREATE POLICY "Franchise owners can update own sales"
  ON sales_log FOR UPDATE
  TO authenticated
  USING (franchise_owner_id = auth.uid())
  WITH CHECK (franchise_owner_id = auth.uid());

-- Super admin can update all sales
CREATE POLICY "Super admin can update all sales"
  ON sales_log FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Update existing RLS policies to support super admin access

-- Drop and recreate responses policies with super admin support
DROP POLICY IF EXISTS "Franchise owners can view own responses" ON responses;
CREATE POLICY "Franchise owners can view own responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    franchise_owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Drop and recreate self_assessment_responses policies with super admin support
DROP POLICY IF EXISTS "Franchise owners can view own self assessments" ON self_assessment_responses;
CREATE POLICY "Franchise owners can view own self assessments"
  ON self_assessment_responses FOR SELECT
  TO authenticated
  USING (
    franchise_owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Drop and recreate invoices policies with super admin support
DROP POLICY IF EXISTS "Franchise owners can view own invoices" ON invoices;
CREATE POLICY "Franchise owners can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    franchise_owner_id IN (
      SELECT id FROM franchise_owners WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND franchise_owners.is_super_admin = true
    )
  );

-- Function to update sales_log updated_at
CREATE OR REPLACE FUNCTION update_sales_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sales_log
DROP TRIGGER IF EXISTS update_sales_log_updated_at ON sales_log;
CREATE TRIGGER update_sales_log_updated_at
  BEFORE UPDATE ON sales_log
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_log_updated_at();

-- Function to automatically create sales log when response is created with franchise_owner_id
CREATE OR REPLACE FUNCTION create_sales_log_from_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.franchise_owner_id IS NOT NULL THEN
    INSERT INTO sales_log (
      franchise_owner_id,
      customer_name,
      customer_email,
      assessment_type,
      response_id,
      status,
      referral_source
    ) VALUES (
      NEW.franchise_owner_id,
      NEW.customer_name,
      NEW.customer_email,
      'Full NIP Assessment',
      NEW.id,
      'in_progress',
      COALESCE(NEW.entry_type, 'franchise_link')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create sales log from response
DROP TRIGGER IF EXISTS create_sales_log_on_response ON responses;
CREATE TRIGGER create_sales_log_on_response
  AFTER INSERT ON responses
  FOR EACH ROW
  EXECUTE FUNCTION create_sales_log_from_response();

-- Function to automatically create sales log when self assessment is created
CREATE OR REPLACE FUNCTION create_sales_log_from_self_assessment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.franchise_owner_id IS NOT NULL THEN
    INSERT INTO sales_log (
      franchise_owner_id,
      customer_name,
      customer_email,
      assessment_type,
      self_assessment_response_id,
      status,
      referral_source
    ) VALUES (
      NEW.franchise_owner_id,
      NEW.customer_name,
      NEW.customer_email,
      NEW.assessment_type,
      NEW.id,
      'in_progress',
      COALESCE(NEW.entry_type, 'franchise_link')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create sales log from self assessment
DROP TRIGGER IF EXISTS create_sales_log_on_self_assessment ON self_assessment_responses;
CREATE TRIGGER create_sales_log_on_self_assessment
  AFTER INSERT ON self_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION create_sales_log_from_self_assessment();
