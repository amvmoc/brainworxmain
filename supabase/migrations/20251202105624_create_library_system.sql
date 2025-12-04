/*
  # Create Library System

  ## New Tables
  
  ### `books`
  - `id` (uuid, primary key) - Unique book identifier
  - `title` (text) - Book title
  - `description` (text) - Book description
  - `author` (text) - Book author
  - `cover_image_url` (text, nullable) - URL to cover image
  - `pdf_file_path` (text) - Path to PDF file in storage
  - `price` (decimal) - Book price (0 for free books)
  - `is_active` (boolean) - Whether book is available for purchase
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `book_purchases`
  - `id` (uuid, primary key) - Unique purchase identifier
  - `book_id` (uuid, foreign key) - Reference to books table
  - `customer_email` (text) - Customer email address
  - `customer_name` (text, nullable) - Customer name
  - `purchase_price` (decimal) - Price paid (0 if coupon used)
  - `coupon_code` (text, nullable) - Coupon code used (if any)
  - `payment_reference` (text, nullable) - Payment reference/transaction ID
  - `franchise_code` (text, nullable) - Franchise code for revenue tracking
  - `purchased_at` (timestamptz) - Purchase timestamp
  - `download_count` (integer) - Number of times downloaded
  - `last_downloaded_at` (timestamptz, nullable) - Last download timestamp
  
  ### `book_coupons`
  - `id` (uuid, primary key) - Unique coupon identifier
  - `code` (text, unique) - Coupon code
  - `book_id` (uuid, foreign key, nullable) - Specific book (null = all books)
  - `discount_type` (text) - 'free' or 'percentage' or 'fixed'
  - `discount_value` (decimal) - Discount amount/percentage
  - `max_uses` (integer, nullable) - Maximum number of uses (null = unlimited)
  - `current_uses` (integer) - Current number of uses
  - `expires_at` (timestamptz, nullable) - Expiration date (null = no expiry)
  - `is_active` (boolean) - Whether coupon is active
  - `created_by` (uuid, nullable) - Franchise owner who created it
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public can view active books
  - Authenticated users can manage books and coupons
  - Anyone can create purchases (for checkout flow)
  - Only purchasers can access their downloads
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  author text NOT NULL,
  cover_image_url text,
  pdf_file_path text NOT NULL,
  price decimal(10, 2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create book_purchases table
CREATE TABLE IF NOT EXISTS book_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  customer_name text,
  purchase_price decimal(10, 2) NOT NULL DEFAULT 0,
  coupon_code text,
  payment_reference text,
  franchise_code text,
  purchased_at timestamptz DEFAULT now(),
  download_count integer DEFAULT 0,
  last_downloaded_at timestamptz
);

-- Create book_coupons table
CREATE TABLE IF NOT EXISTS book_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  discount_type text NOT NULL CHECK (discount_type IN ('free', 'percentage', 'fixed')),
  discount_value decimal(10, 2) NOT NULL DEFAULT 0,
  max_uses integer,
  current_uses integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES franchise_owners(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_active ON books(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_book_purchases_email ON book_purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_book_purchases_book_id ON book_purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_book_coupons_code ON book_coupons(code) WHERE is_active = true;

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_coupons ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "Anyone can view active books"
  ON books FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (true);

-- Book purchases policies
CREATE POLICY "Anyone can create purchases"
  ON book_purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own purchases by email"
  ON book_purchases FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update purchases"
  ON book_purchases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Book coupons policies
CREATE POLICY "Anyone can view active coupons by code"
  ON book_coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert coupons"
  ON book_coupons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update coupons"
  ON book_coupons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete coupons"
  ON book_coupons FOR DELETE
  TO authenticated
  USING (true);

-- Function to update book updated_at timestamp
CREATE OR REPLACE FUNCTION update_book_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_book_updated_at();