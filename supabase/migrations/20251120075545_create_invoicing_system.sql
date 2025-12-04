/*
  # Create Invoicing System

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key) - Unique invoice identifier
      - `invoice_number` (text, unique) - Format: YYMMDDHHMMSS (e.g., 2511200954)
      - `franchise_owner_id` (uuid, nullable) - Links to franchise owner if applicable
      - `customer_name` (text) - Name of the customer/client
      - `customer_email` (text) - Customer email address
      - `customer_address` (text, nullable) - Customer address
      - `assessment_type` (text) - Type of assessment purchased
      - `response_id` (uuid, nullable) - Links to the assessment response
      - `amount` (numeric) - Invoice amount
      - `currency` (text) - Currency code (default: USD)
      - `status` (text) - Status: pending, paid, cancelled
      - `payment_method` (text, nullable) - How payment was received
      - `payment_date` (timestamptz, nullable) - When payment was received
      - `due_date` (timestamptz) - Payment due date
      - `notes` (text, nullable) - Additional notes
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key) - Links to invoice
      - `description` (text) - Item description
      - `quantity` (integer) - Quantity
      - `unit_price` (numeric) - Price per unit
      - `total` (numeric) - Total for this line item
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Franchise owners can view/manage their own invoices
    - Add policies for authenticated franchise owners

  3. Indexes
    - Add index on invoice_number for fast lookups
    - Add index on franchise_owner_id for filtering
    - Add index on customer_email for searching
    - Add index on status for filtering

  4. Important Notes
    - Invoice numbers are auto-generated using format YYMMDDHHMMSS
    - Supports multiple line items per invoice
    - Tracks payment status and history
    - Links to assessment responses when applicable
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  franchise_owner_id uuid REFERENCES franchise_owners(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_address text,
  assessment_type text NOT NULL,
  response_id uuid REFERENCES responses(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'USD' NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method text,
  payment_date timestamptz,
  due_date timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity integer DEFAULT 1 NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total numeric NOT NULL CHECK (total >= 0),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_franchise_owner_id ON invoices(franchise_owner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for invoices table

-- Franchise owners can view their own invoices
CREATE POLICY "Franchise owners can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    franchise_owner_id IN (
      SELECT id FROM franchise_owners WHERE id = auth.uid()
    )
  );

-- Franchise owners can create invoices
CREATE POLICY "Franchise owners can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    franchise_owner_id IN (
      SELECT id FROM franchise_owners WHERE id = auth.uid()
    )
  );

-- Franchise owners can update their own invoices
CREATE POLICY "Franchise owners can update own invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    franchise_owner_id IN (
      SELECT id FROM franchise_owners WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    franchise_owner_id IN (
      SELECT id FROM franchise_owners WHERE id = auth.uid()
    )
  );

-- Franchise owners can delete their own invoices
CREATE POLICY "Franchise owners can delete own invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    franchise_owner_id IN (
      SELECT id FROM franchise_owners WHERE id = auth.uid()
    )
  );

-- Policies for invoice_items table

-- Franchise owners can view items for their invoices
CREATE POLICY "Franchise owners can view own invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE franchise_owner_id IN (
        SELECT id FROM franchise_owners WHERE id = auth.uid()
      )
    )
  );

-- Franchise owners can create items for their invoices
CREATE POLICY "Franchise owners can create invoice items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE franchise_owner_id IN (
        SELECT id FROM franchise_owners WHERE id = auth.uid()
      )
    )
  );

-- Franchise owners can update items for their invoices
CREATE POLICY "Franchise owners can update invoice items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE franchise_owner_id IN (
        SELECT id FROM franchise_owners WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE franchise_owner_id IN (
        SELECT id FROM franchise_owners WHERE id = auth.uid()
      )
    )
  );

-- Franchise owners can delete items for their invoices
CREATE POLICY "Franchise owners can delete invoice items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE franchise_owner_id IN (
        SELECT id FROM franchise_owners WHERE id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

-- Function to generate invoice number in format YYMMDDHHMMSS
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
BEGIN
  RETURN TO_CHAR(NOW(), 'YYMMDD') || 
         TO_CHAR(NOW(), 'HH24MISS');
END;
$$ LANGUAGE plpgsql;
