-- One-time 2026-2027 class-level rollover for legacy VENSA accounts.
-- Accounts created on or after August 15, 2026 are treated as the new cohort
-- and retain the academic level they selected during signup.
--
-- This legacy rollover applies to every matching undergraduate account. It
-- intentionally does not depend on the newer automatic-progression preference
-- because these members completed the prior academic year before that setting
-- existed. It also does not update role, status, is_admin, or any E-Board and
-- newsletter authorization field.

update public.profiles
set year = case
  when year::text = 'Senior' then 'Alumni'::public.year_status
  else public.advance_undergraduate_year(year, 1)
end
where created_at < timestamptz '2026-08-15 00:00:00 America/New_York'
  and year::text in ('Freshman', 'Sophomore', 'Junior', 'Senior');

-- Graduate and Alumni profiles are already post-undergraduate and are excluded.
