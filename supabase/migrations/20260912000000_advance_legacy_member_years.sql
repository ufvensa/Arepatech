-- One-time 2026-2027 class-level rollover for legacy VENSA accounts.
-- Accounts created on or after August 15, 2026 are treated as the new cohort
-- and retain the academic level they selected during signup.
--
-- This intentionally does not update role, status, is_admin, or any E-Board
-- and newsletter authorization field.

update public.profiles
set year = public.advance_undergraduate_year(year, 1)
where created_at < timestamptz '2026-08-15 00:00:00 America/New_York'
  and year::text in ('Freshman', 'Sophomore', 'Junior')
  and automatic_year_progression = true
  and academic_level_override = false;

-- Seniors remain Seniors; Graduate and Alumni profiles are intentionally
-- excluded because undergraduate progression must never infer graduation.
