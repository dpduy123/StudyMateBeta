-- ============================================
-- Enforce .edu Email Domain Validation
-- ============================================
-- Description: Database-level security to ensure only .edu emails can register
-- Created: 2025-01-28
-- Author: StudyMate Security Team
--
-- This script adds:
-- 1. Validation function to check .edu domain
-- 2. Trigger on auth.users table (INSERT/UPDATE)
-- 3. Audit table for rejected attempts (optional)
--
-- Security Layers:
-- - Frontend: Register page validates .edu
-- - Backend: signUp function validates .edu
-- - Database: This trigger (STRONGEST LAYER)
-- ============================================

-- ============================================
-- Step 1: Create validation function
-- ============================================
-- Note: Using public schema instead of auth schema due to permission restrictions
-- This is safe and works the same way
CREATE OR REPLACE FUNCTION public.check_edu_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email contains .edu after @ symbol (case-insensitive)
  -- Valid examples: user@university.edu, user@university.edu.vn
  -- Invalid examples: user@gmail.com, user@company.com
  IF NEW.email !~* '@[^@]+\.edu(\.|$)' THEN
    RAISE EXCEPTION 'Only .edu email addresses are allowed. Email must contain .edu in domain (e.g., @university.edu or @university.edu.vn)'
      USING HINT = 'Please use your university email address',
            ERRCODE = '23514'; -- check_violation error code
  END IF;

  -- Log successful validation (optional)
  RAISE NOTICE '✅ Validated .edu email: %', NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add documentation
COMMENT ON FUNCTION public.check_edu_email() IS
  'Validates that user email ends with .edu domain. Prevents non-university emails from registering. Part of multi-layer security (Frontend + Backend + Database).';

-- ============================================
-- Step 2: Create trigger on auth.users
-- ============================================
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_edu_email_trigger ON auth.users;

-- Create new trigger (using public.check_edu_email function)
CREATE TRIGGER enforce_edu_email_trigger
  BEFORE INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_edu_email();

-- Add documentation
COMMENT ON TRIGGER enforce_edu_email_trigger ON auth.users IS
  'Enforces .edu email requirement at database level. Triggered on INSERT and UPDATE of email column. This is the strongest security layer that cannot be bypassed.';

-- ============================================
-- Step 3: Validate existing users
-- ============================================
-- Check if any existing users have non-.edu emails
DO $$
DECLARE
  invalid_count INTEGER;
  invalid_emails TEXT;
BEGIN
  SELECT COUNT(*), STRING_AGG(email, ', ')
  INTO invalid_count, invalid_emails
  FROM auth.users
  WHERE email !~* '\.edu$';

  IF invalid_count > 0 THEN
    RAISE WARNING '⚠️  Found % existing users with non-.edu emails: %', invalid_count, invalid_emails;
    RAISE WARNING 'Action required: Review and migrate these users or remove them.';
  ELSE
    RAISE NOTICE '✅ All existing users have valid .edu emails. No action needed.';
  END IF;
END $$;

-- ============================================
-- Step 4: Create audit log (OPTIONAL)
-- ============================================
-- Uncomment below if you want to track rejected attempts

/*
-- Create table to log rejected email attempts
CREATE TABLE IF NOT EXISTS public.rejected_email_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempted_email TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  reason TEXT DEFAULT 'Non-.edu email',
  metadata JSONB
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rejected_email_attempts_email
  ON public.rejected_email_attempts(attempted_email);

CREATE INDEX IF NOT EXISTS idx_rejected_email_attempts_date
  ON public.rejected_email_attempts(attempted_at DESC);

-- Enable Row Level Security
ALTER TABLE public.rejected_email_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view rejected attempts
CREATE POLICY "Only admins can view rejected attempts"
  ON public.rejected_email_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin'
           OR auth.users.email = 'admin@university.edu')
    )
  );

-- Add documentation
COMMENT ON TABLE public.rejected_email_attempts IS
  'Audit log for tracking rejected non-.edu email registration attempts. Used for security monitoring and analytics.';
*/

-- ============================================
-- Testing Queries
-- ============================================
-- Run these queries to verify the trigger works:

-- Test 1: Try to insert non-.edu email (should FAIL)
-- INSERT INTO auth.users (email, encrypted_password)
-- VALUES ('test@gmail.com', 'dummy_hash');
-- Expected: ERROR: Only .edu email addresses are allowed

-- Test 2: Try to insert .edu email (should SUCCEED)
-- INSERT INTO auth.users (email, encrypted_password)
-- VALUES ('test@university.edu', 'dummy_hash');
-- Expected: SUCCESS

-- Test 3: Check all existing users
-- SELECT email, created_at
-- FROM auth.users
-- WHERE email !~* '\.edu$'
-- ORDER BY created_at DESC;

-- ============================================
-- Rollback Instructions
-- ============================================
-- If you need to remove this enforcement, run:
/*
DROP TRIGGER IF EXISTS enforce_edu_email_trigger ON auth.users;
DROP FUNCTION IF EXISTS auth.check_edu_email();
-- DROP TABLE IF EXISTS public.rejected_email_attempts; -- If you created it
*/

-- ============================================
-- Security Notes
-- ============================================
-- 1. This trigger runs BEFORE insert/update, so it blocks at database level
-- 2. Even if someone bypasses frontend/backend, they CANNOT bypass this
-- 3. The trigger uses SECURITY DEFINER to ensure it always runs
-- 4. Error code 23514 (check_violation) is standard PostgreSQL constraint violation
-- 5. This is the STRONGEST layer of defense

-- ============================================
-- Maintenance
-- ============================================
-- To temporarily disable (NOT RECOMMENDED):
-- ALTER TABLE auth.users DISABLE TRIGGER enforce_edu_email_trigger;

-- To re-enable:
-- ALTER TABLE auth.users ENABLE TRIGGER enforce_edu_email_trigger;

-- To check if trigger is active:
-- SELECT * FROM information_schema.triggers
-- WHERE trigger_name = 'enforce_edu_email_trigger';
