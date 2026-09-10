-- Fabio's existing profile uses his full name and an account email that does
-- not match the school-email roster entry. Map that verified profile to his
-- current E-Board role without relying on the old frontend name matcher.

do $$
declare
  matched_profiles integer;
begin
  update public.profiles
  set
    status = 'eboard',
    is_admin = true,
    role = 'technology',
    organization_position = 'VP of Technology',
    major = 'Computer Science',
    year = 'Senior'::public.year_status,
    position_description = 'Leads VENSA''s technology strategy, maintains its digital platforms, and develops reliable tools that support the organization.',
    eboard_sort_order = 12
  where lower(regexp_replace(trim(concat_ws(' ', first_name, last_name)), '\s+', ' ', 'g'))
    in ('fabio jorge hernandez', 'fabio jorge');

  get diagnostics matched_profiles = row_count;

  if matched_profiles <> 1 then
    raise exception 'Expected exactly one Fabio Jorge profile, matched %', matched_profiles;
  end if;
end;
$$;

-- Retain the actual account email as a private roster alias so the same
-- defaults remain available if Fabio's profile is recreated later.
insert into public.eboard_profile_defaults (
  email,
  first_name,
  last_name,
  newsletter_role,
  organization_position,
  major,
  class_year,
  position_description,
  sort_order
)
select
  lower(trim(email)),
  first_name,
  last_name,
  'technology',
  'VP of Technology',
  'Computer Science',
  'Senior'::public.year_status,
  'Leads VENSA''s technology strategy, maintains its digital platforms, and develops reliable tools that support the organization.',
  12
from public.profiles
where lower(regexp_replace(trim(concat_ws(' ', first_name, last_name)), '\s+', ' ', 'g'))
  in ('fabio jorge hernandez', 'fabio jorge')
  and nullif(trim(email), '') is not null
on conflict (email) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  newsletter_role = excluded.newsletter_role,
  organization_position = excluded.organization_position,
  major = excluded.major,
  class_year = excluded.class_year,
  position_description = excluded.position_description,
  sort_order = excluded.sort_order;
