/*
  # Update Coupon Validation to Return Child Information
  
  ## Changes
  Updates the `validate_and_use_coupon` function to return child details and
  caregiver relationship stored in the coupon for ADHD caregiver assessments.
  
  1. Function Changes:
    - Returns `child_name`, `child_age`, `child_gender` for pre-filling forms
    - Returns `caregiver_relationship` to skip relationship selection
    - Returns `assessment_id` to link caregiver response to parent's assessment
  
  ## Purpose
  When caregivers redeem their invitation codes, the form can be pre-filled with
  the child's information that the parent already entered, eliminating redundant
  data entry and ensuring data consistency.
  
  ## Security
  - Function remains SECURITY DEFINER
  - No new security concerns (just passing through existing coupon data)
*/

-- Update the validate_and_use_coupon function to return child information
CREATE OR REPLACE FUNCTION validate_and_use_coupon(
  p_code text,
  p_user_name text,
  p_user_email text
) RETURNS json AS $$
DECLARE
  v_coupon coupon_codes%ROWTYPE;
  v_redemption_id uuid;
BEGIN
  -- Get the coupon
  SELECT * INTO v_coupon
  FROM coupon_codes
  WHERE code = p_code
  AND is_active = true
  FOR UPDATE;

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid coupon code');
  END IF;

  -- Check if expired
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'Coupon has expired');
  END IF;

  -- Check if max uses reached
  IF v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'Coupon has reached maximum uses');
  END IF;

  -- Create redemption record
  INSERT INTO coupon_redemptions (coupon_id, user_name, user_email)
  VALUES (v_coupon.id, p_user_name, p_user_email)
  RETURNING id INTO v_redemption_id;

  -- Update coupon uses
  UPDATE coupon_codes
  SET current_uses = current_uses + 1
  WHERE id = v_coupon.id;

  -- Return success with coupon details including child information
  RETURN json_build_object(
    'success', true,
    'coupon_id', v_coupon.id,
    'redemption_id', v_redemption_id,
    'assessment_type', v_coupon.assessment_type,
    'created_by', v_coupon.created_by,
    'child_name', v_coupon.child_name,
    'child_age', v_coupon.child_age,
    'child_gender', v_coupon.child_gender,
    'caregiver_relationship', v_coupon.caregiver_relationship,
    'assessment_id', v_coupon.assessment_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
