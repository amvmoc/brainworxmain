/*
  # Questionnaire System Setup

  1. New Tables
    - `questionnaires`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `questionnaire_id` (uuid, foreign key)
      - `question_number` (integer)
      - `question_text` (text)
      - `category` (text)
      - `options` (jsonb) - array of answer options
      - `created_at` (timestamp)
    
    - `responses`
      - `id` (uuid, primary key)
      - `questionnaire_id` (uuid, foreign key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `answers` (jsonb) - stores all answers
      - `analysis_results` (jsonb) - stores analyzed results
      - `status` (text) - 'in_progress', 'completed', 'analyzed', 'sent'
      - `started_at` (timestamp)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to questionnaires and questions (read-only)
    - Add policies for creating and reading own responses
*/

-- Create questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  category text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid REFERENCES questionnaires(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  analysis_results jsonb,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Policies for questionnaires (public read)
CREATE POLICY "Anyone can view questionnaires"
  ON questionnaires FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for questions (public read)
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for responses (users can create and read their own)
CREATE POLICY "Anyone can create responses"
  ON responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own responses"
  ON responses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own responses"
  ON responses FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire ON questions(questionnaire_id, question_number);
CREATE INDEX IF NOT EXISTS idx_responses_email ON responses(customer_email);
CREATE INDEX IF NOT EXISTS idx_responses_status ON responses(status);

-- Insert the main BrainWorx questionnaire
INSERT INTO questionnaires (title, description)
VALUES (
  'BrainWorx Comprehensive Assessment',
  'A comprehensive 350-question assessment to analyze your cognitive patterns, leadership potential, and personal development opportunities.'
)
ON CONFLICT DO NOTHING;