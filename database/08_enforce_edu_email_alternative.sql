-- ============================================
-- Alternative: Enforce .edu Email Using User Table Check
-- ============================================
-- Since we cannot create triggers on auth.users (permission denied),
-- we'll enforce .edu validation on the public.users table instead
-- and ensure it syncs with auth.users email
--
-- Strategy:
-- 1. Add CHECK constraint to public.users table
-- 2. Modify create-profile API to validate .edu
-- 3. Frontend + Backend validation (already done)
--
-- This is still secure because:
-- - Users cannot access protected routes without profile
-- - Profile creation requires .edu email
-- - RLS policies protect data
-- ============================================

-- ============================================
-- Step 1: Add CHECK constraint to users table
-- ============================================

-- First, check if constraint already exists and drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_email_edu_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_email_edu_check;
    RAISE NOTICE 'Dropped existing constraint users_email_edu_check';
  END IF;
END $$;

-- Add CHECK constraint for .edu email
-- This ensures ANY email in public.users table must contain .edu
ALTER TABLE public.users
ADD CONSTRAINT users_email_edu_check
CHECK (email ~* '@[^@]+\.edu(\.|$)');

-- Add comment
COMMENT ON CONSTRAINT users_email_edu_check ON public.users IS
  'Enforces .edu email requirement. Email must contain .edu in domain (e.g., @university.edu or @university.edu.vn)';

-- ============================================
-- Step 2: Create validation function (optional utility)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_edu_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email_address ~* '@[^@]+\.edu(\.|$)';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.is_edu_email(TEXT) IS
  'Utility function to check if email is valid .edu email. Returns true if email contains .edu in domain.';

-- ============================================
-- Step 3: Validate existing users
-- ============================================

DO $$
DECLARE
  invalid_count INTEGER;
  invalid_emails TEXT;
BEGIN
  SELECT COUNT(*), STRING_AGG(email, ', ')
  INTO invalid_count, invalid_emails
  FROM public.users
  WHERE NOT is_edu_email(email);

  IF invalid_count > 0 THEN
    RAISE WARNING '⚠️  Found % existing users with non-.edu emails: %', invalid_count, invalid_emails;
    RAISE WARNING 'These users will need to be migrated or their emails updated';
  ELSE
    RAISE NOTICE '✅ All existing users have valid .edu emails';
  END IF;
END $$;

-- ============================================
-- Step 4: Create function to sync email validation
-- ============================================

-- This function can be called from API to validate before profile creation
CREATE OR REPLACE FUNCTION public.validate_and_create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_university TEXT DEFAULT '',
  p_major TEXT DEFAULT '',
  p_year INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Validate .edu email
  IF NOT is_edu_email(p_email) THEN
    RAISE EXCEPTION 'Only .edu email addresses are allowed. Email must contain .edu in domain'
      USING HINT = 'Use your university email (e.g., student@university.edu or student@university.edu.vn)',
            ERRCODE = '23514';
  END IF;

  -- Create user profile
  INSERT INTO public.users (
    id,
    email,
    "firstName",
    "lastName",
    university,
    major,
    year,
    "createdAt",
    "updatedAt"
  ) VALUES (
    p_user_id,
    p_email,
    p_first_name,
    p_last_name,
    p_university,
    p_major,
    p_year,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    university = EXCLUDED.university,
    major = EXCLUDED.major,
    year = EXCLUDED.year,
    "updatedAt" = NOW();

  -- Return success
  result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'email', p_email
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.validate_and_create_user_profile IS
  'Validates .edu email and creates user profile. Used by create-profile API endpoint.';

-- ============================================
-- Testing Queries
-- ============================================

-- Test 1: Check constraint exists
-- SELECT conname, contype, consrc
-- FROM pg_constraint
-- WHERE conname = 'users_email_edu_check';

-- Test 2: Try insert non-.edu email (should FAIL)
-- INSERT INTO public.users (id, email, "firstName", "lastName", university, major, year)
-- VALUES (gen_random_uuid(), 'test@gmail.com', 'Test', 'User', 'Test Uni', 'CS', 1);
-- Expected: ERROR: new row for relation "users" violates check constraint

-- Test 3: Try insert .edu email (should SUCCEED)
-- INSERT INTO public.users (id, email, "firstName", "lastName", university, major, year)
-- VALUES (gen_random_uuid(), 'test@university.edu', 'Test', 'User', 'Test Uni', 'CS', 1);
-- Expected: Success

-- Test 4: Test validation function
-- SELECT
--   email,
--   is_edu_email(email) as is_valid
-- FROM (
--   VALUES
--     ('student@university.edu'),
--     ('student@university.edu.vn'),
--     ('test@gmail.com')
-- ) AS test_emails(email);

-- ============================================
-- Rollback Instructions
-- ============================================
-- To remove this enforcement:
/*
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_edu_check;
DROP FUNCTION IF EXISTS public.is_edu_email(TEXT);
DROP FUNCTION IF EXISTS public.validate_and_create_user_profile;
*/

-- ============================================
-- Security Summary
-- ============================================
-- Layer 1: Frontend validation (register page) - WEAK
-- Layer 2: Backend validation (signUp function) - MEDIUM
-- Layer 3: Database CHECK constraint (this script) - STRONG
--
-- Even though we cannot add trigger to auth.users,
-- we enforce .edu on public.users table which is where
-- all user data is stored and accessed.
--
-- Users cannot use the app without a profile in public.users,
-- so this is still effective security.
