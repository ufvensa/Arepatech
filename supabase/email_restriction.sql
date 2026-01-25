-- ============================================================================
-- UFL Email Domain Restriction
-- Run this in Supabase SQL Editor to enforce @ufl.edu emails server-side
-- ============================================================================

-- Create a function to validate UFL email domains
CREATE OR REPLACE FUNCTION public.is_ufl_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if email ends with @ufl.edu or any subdomain like @mail.ufl.edu
  RETURN email ~* '@([a-z0-9-]+\.)*ufl\.edu$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to block non-UFL signups
-- This runs BEFORE the user is inserted into auth.users
CREATE OR REPLACE FUNCTION public.enforce_ufl_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_ufl_email(NEW.email) THEN
    RAISE EXCEPTION 'Only @ufl.edu email addresses are allowed to sign up. Please use your GatorLink email.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: The trigger on auth.users requires special permissions.
-- In Supabase, you have two options:

-- ============================================================================
-- OPTION 1: Use Supabase Auth Hook (Recommended)
-- ============================================================================
-- Go to Supabase Dashboard > Authentication > Hooks
-- Enable "Before User Created" hook and add this function:
--
-- This is the cleanest approach as it uses Supabase's built-in hook system.

-- ============================================================================
-- OPTION 2: Database Trigger (Requires superuser access)
-- ============================================================================
-- If you have access to run this as superuser:
--
-- DROP TRIGGER IF EXISTS enforce_ufl_email_trigger ON auth.users;
-- CREATE TRIGGER enforce_ufl_email_trigger
--   BEFORE INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.enforce_ufl_email();

-- ============================================================================
-- OPTION 3: Edge Function (Alternative)
-- ============================================================================
-- Create a Supabase Edge Function that wraps the signup process
-- and validates the email before calling supabase.auth.signUp()

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Test the email validation function:
SELECT
  'student@ufl.edu' AS email,
  public.is_ufl_email('student@ufl.edu') AS is_valid;

SELECT
  'student@mail.ufl.edu' AS email,
  public.is_ufl_email('student@mail.ufl.edu') AS is_valid;

SELECT
  'student@gmail.com' AS email,
  public.is_ufl_email('student@gmail.com') AS is_valid;

SELECT
  'fake@notufl.edu' AS email,
  public.is_ufl_email('fake@notufl.edu') AS is_valid;
