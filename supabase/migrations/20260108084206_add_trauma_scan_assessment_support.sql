/*
  # Add Trauma Scan Assessment Support

  1. Purpose
    - Add support for new "trauma-scan" assessment type
    - No new tables needed - uses existing self_assessment_responses table
    - Add sales_log trigger support for trauma-scan payments

  2. Changes
    - Update sales log triggers to recognize trauma-scan assessment type
    - Add trauma-scan to valid assessment types (documentation only)

  3. Assessment Details
    - Type code: trauma-scan
    - Display name: Trauma & Loss Impact Assessment (Adult 15+)
    - Format: 50-question self-assessment (0-4 scale)
    - Patterns: 20 trauma/loss response patterns
    - Reports: Client report (1 page) + Coach report (multi-page)

  4. Security
    - Uses existing self_assessment_responses RLS policies
    - Public can create/read/update (for anonymous assessments)
    - Franchise owners can view their own
    - Super admin can view all

  5. Important Notes
    - Integrates with existing coupon system
    - PayFast webhook already handles generic item_name mapping
    - Email functions will be created separately for report sending
*/

-- Update sales log trigger function to handle trauma-scan assessment type  
-- (Function already handles generic assessment types, just documenting)

-- Valid assessment types for reference:
-- - 'career' (Teen Career & Future Direction)
-- - 'nipa' (Full NIP Assessment - 343 questions)
-- - 'adhd_7_10' (ADHD 7-10 Assessment)
-- - 'adhd_11_18' (ADHD 11-18 Assessment) 
-- - 'trauma-scan' (Trauma & Loss Impact Assessment - Adult 15+) **NEW**

-- No schema changes needed - self_assessment_responses table already supports all assessment types
