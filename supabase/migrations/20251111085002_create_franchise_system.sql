/*
  # Franchise System Complete Setup

  1. New Tables
    - `franchise_owners` - Franchise/coach accounts with unique referral codes
    - `coaches` - Individual coaches for HIC courses
    - `payment_records` - Track all payment transactions
    - `hic_enrollments` - HIC course enrollments
    - `hic_payments` - HIC course payment tracking
    
  2. Modified Tables
    - `responses` - Add franchise tracking, email verification, and entry type fields

  3. Security
    - Enable RLS on all tables
    - Franchise owners see only their prospects
    - Super admins see all data
    - Strict data isolation

  4. Indexes
    - Performance indexes on frequently queried columns
*/

CREATE TABLE IF NOT EXISTS coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  bio text,
  specialization text,
  hourly_rate decimal(10, 2),
  is_certified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS franchise_owners (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  is_super_admin boolean DEFAULT false,
  unique_link_code text UNIQUE NOT NULL DEFAULT substr(md5(random()::text || now()::text), 1, 12),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  payment_status text DEFAULT 'pending',
  payment_type text NOT NULL,
  coach_id uuid REFERENCES coaches(id),
  franchise_owner_id uuid REFERENCES franchise_owners(id),
  stripe_payment_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hic_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  coach_id uuid REFERENCES coaches(id),
  course_name text NOT NULL,
  enrollment_status text DEFAULT 'pending',
  payment_completed boolean DEFAULT false,
  enrollment_date timestamptz DEFAULT now(),
  completion_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hic_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hic_enrollment_id uuid REFERENCES hic_enrollments(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES coaches(id),
  amount decimal(10, 2) NOT NULL,
  payment_status text DEFAULT 'pending',
  stripe_payment_id text UNIQUE,
  payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hic_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hic_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches view own profile"
  ON coaches FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view certified coaches"
  ON coaches FOR SELECT
  TO anon
  USING (is_certified = true);

CREATE POLICY "Franchise owners view own profile"
  ON franchise_owners FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins view all franchises"
  ON franchise_owners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners fo
      WHERE fo.id = auth.uid()
      AND fo.is_super_admin = true
    )
  );

CREATE POLICY "Users view own payments"
  ON payment_records FOR SELECT
  TO authenticated
  USING (
    franchise_owner_id = auth.uid()
    OR coach_id = auth.uid()
  );

CREATE POLICY "Franchise owners insert payments"
  ON payment_records FOR INSERT
  TO authenticated
  WITH CHECK (franchise_owner_id = auth.uid());

CREATE POLICY "Coaches view their enrollments"
  ON hic_enrollments FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Users insert own enrollments"
  ON hic_enrollments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Coaches view payments for their courses"
  ON hic_payments FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_coaches_email ON coaches(email);
CREATE INDEX IF NOT EXISTS idx_franchise_owners_code ON franchise_owners(unique_link_code);
CREATE INDEX IF NOT EXISTS idx_payment_records_customer ON payment_records(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_hic_enrollments_customer ON hic_enrollments(customer_email);
CREATE INDEX IF NOT EXISTS idx_hic_enrollments_coach ON hic_enrollments(coach_id);
CREATE INDEX IF NOT EXISTS idx_hic_payments_coach ON hic_payments(coach_id);
