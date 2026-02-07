-- ============================================================================
-- VENSA Admin System - Run this in Supabase SQL Editor to enable Admin features
-- ============================================================================

-- 1. ADD is_admin COLUMN TO PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- 2. CREATE BANNED_EMAILS TABLE
CREATE TABLE IF NOT EXISTS public.banned_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  banned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banned_emails_email ON public.banned_emails(email);

ALTER TABLE public.banned_emails ENABLE ROW LEVEL SECURITY;

-- Policies for banned_emails
CREATE POLICY "Admins can view banned emails"
  ON public.banned_emails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can ban emails"
  ON public.banned_emails
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can unban emails"
  ON public.banned_emails
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update ban records"
  ON public.banned_emails
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 3. FUNCTION TO CHECK IF EMAIL IS BANNED
CREATE OR REPLACE FUNCTION public.is_email_banned(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.banned_emails
    WHERE LOWER(email) = LOWER(check_email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCTION TO DELETE USER ACCOUNT (ADMIN ONLY)
-- NOTE: This handles profile deletion and email banning.
-- To fully remove the auth.users record, use the Supabase Admin API
-- (service role key) from a server-side function or Edge Function,
-- since direct DELETE on auth.users is restricted.
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID,
  ban_email BOOLEAN DEFAULT true,
  ban_reason TEXT DEFAULT 'Removed by admin'
)
RETURNS JSON AS $$
DECLARE
  admin_id UUID;
  user_email TEXT;
  result JSON;
BEGIN
  -- Check if the current user is an admin
  admin_id := auth.uid();
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can delete user accounts';
  END IF;

  -- Prevent admins from deleting themselves
  IF admin_id = target_user_id THEN
    RAISE EXCEPTION 'Admins cannot delete their own account';
  END IF;

  -- Get user email
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = target_user_id;

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Ban email if requested
  IF ban_email THEN
    INSERT INTO public.banned_emails (email, banned_by, reason)
    VALUES (user_email, admin_id, ban_reason)
    ON CONFLICT (email) DO NOTHING;
  END IF;

  -- Delete the user profile
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Attempt to delete from auth.users to prevent "zombie" accounts
  -- Note: This requires the function to run as a superuser/owner (SECURITY DEFINER)
  -- and relies on the postgres role having access to auth schema.
  BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
  EXCEPTION WHEN OTHERS THEN
    -- If this fails due to permissions, we swallow the error but note it
    -- The user is still effectively banned/deleted from the app via the profile deletion + ban list
    RAISE NOTICE 'Could not delete from auth.users: %', SQLERRM;
  END;

  result := json_build_object(
    'success', true,
    'deleted_user_id', target_user_id,
    'email_banned', ban_email,
    'note', 'Profile deleted. Auth user deletion attempted.'
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. UPDATE RLS POLICIES FOR ADMIN ACTIONS ON PROFILES
CREATE POLICY "Admins can delete any profile"
  ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.is_admin = true
      AND admin_profile.id != profiles.id
    )
  );

-- 6. AUTO-SYNC ADMIN STATUS WITH E-BOARD ROLE
-- Automatically grants admin when someone becomes eboard,
-- and revokes admin when they lose eboard status.
CREATE OR REPLACE FUNCTION public.sync_admin_with_eboard()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'eboard' THEN
    NEW.is_admin := true;
  ELSIF OLD.status = 'eboard' AND NEW.status != 'eboard' THEN
    NEW.is_admin := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_admin_eboard ON public.profiles;
CREATE TRIGGER trigger_sync_admin_eboard
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_admin_with_eboard();

-- 7. SET ALL EXISTING E-BOARD MEMBERS AS ADMINS
UPDATE public.profiles SET is_admin = true WHERE status = 'eboard';

-- ============================================================================
-- VERIFICATION: Check which users are now admins
-- ============================================================================
SELECT id, first_name, last_name, email, status, is_admin
FROM public.profiles
WHERE is_admin = true;
