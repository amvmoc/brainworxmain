/*
  # Update Responses Table for Franchise System

  Adds fields to track:
  - Franchise owner association
  - Coach assignment
  - Email verification status
  - Entry type (coach_link vs random_visitor)
  - Access tokens for email verification
  - Booking link tracking
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'franchise_owner_id'
  ) THEN
    ALTER TABLE responses ADD COLUMN franchise_owner_id uuid REFERENCES franchise_owners(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'coach_id'
  ) THEN
    ALTER TABLE responses ADD COLUMN coach_id uuid REFERENCES coaches(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'access_token'
  ) THEN
    ALTER TABLE responses ADD COLUMN access_token text UNIQUE DEFAULT substr(md5(random()::text || now()::text), 1, 32);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE responses ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'verification_sent_at'
  ) THEN
    ALTER TABLE responses ADD COLUMN verification_sent_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'entry_type'
  ) THEN
    ALTER TABLE responses ADD COLUMN entry_type text CHECK (entry_type IN ('coach_link', 'random_visitor'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'booking_link_sent'
  ) THEN
    ALTER TABLE responses ADD COLUMN booking_link_sent boolean DEFAULT false;
  END IF;
END $$;

DROP POLICY IF EXISTS "Franchise owners view their prospects" ON responses;
DROP POLICY IF EXISTS "Coaches view their customers responses" ON responses;

CREATE POLICY "Franchise owners view their prospects"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM franchise_owners
      WHERE franchise_owners.id = auth.uid()
      AND (
        franchise_owners.is_super_admin = true
        OR responses.franchise_owner_id = franchise_owners.id
      )
    )
  );

CREATE POLICY "Coaches view their customers responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches
      WHERE coaches.id = auth.uid()
      AND responses.coach_id = coaches.id
    )
  );

CREATE INDEX IF NOT EXISTS idx_responses_franchise ON responses(franchise_owner_id);
CREATE INDEX IF NOT EXISTS idx_responses_coach ON responses(coach_id);
CREATE INDEX IF NOT EXISTS idx_responses_access_token ON responses(access_token);
CREATE INDEX IF NOT EXISTS idx_responses_email ON responses(customer_email);
CREATE INDEX IF NOT EXISTS idx_responses_entry_type ON responses(entry_type);
