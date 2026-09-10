-- Store public E-Board presentation data on profiles and expose only the
-- profile rows/columns needed by the public E-Board page to anonymous users.

alter table public.profiles
  add column if not exists organization_position text,
  add column if not exists position_description text,
  add column if not exists eboard_sort_order integer;

alter table public.profiles
  drop constraint if exists profiles_eboard_sort_order_check;

alter table public.profiles
  add constraint profiles_eboard_sort_order_check
  check (eboard_sort_order is null or eboard_sort_order > 0);

comment on column public.profiles.organization_position is
  'Public VENSA organization title displayed on the E-Board page.';
comment on column public.profiles.position_description is
  'Public description of the member''s E-Board responsibilities.';
comment on column public.profiles.eboard_sort_order is
  'Optional display order for E-Board profiles; lower numbers appear first.';

create table if not exists public.eboard_profile_defaults (
  email text primary key,
  first_name text not null,
  last_name text not null,
  newsletter_role text not null
    check (newsletter_role in ('eboard', 'president', 'technology')),
  organization_position text not null,
  major text not null,
  class_year public.year_status not null,
  position_description text not null,
  sort_order integer not null check (sort_order > 0)
);

alter table public.eboard_profile_defaults enable row level security;
revoke all on table public.eboard_profile_defaults from public, anon, authenticated;

insert into public.eboard_profile_defaults (
  email, first_name, last_name, newsletter_role, organization_position,
  major, class_year, position_description, sort_order
)
values
    ('v.cadavieco@ufl.edu', 'Valeria', 'Cadavieco', 'president', 'President', 'Marine Science; Minors in Geology and Extension Education', 'Senior', 'Supervises and supports E-Board members and assists the Treasurer with organizational budgeting.', 1),
    ('alamosofia@ufl.edu', 'Sofia', 'Alamo', 'eboard', 'Vice President', 'Sports Journalism', 'Sophomore', 'Supports the President, oversees the Mentorship program, and plans engaging experiences for VENSA members.', 2),
    ('rodrigoblanco@ufl.edu', 'Rodrigo', 'Blanco', 'eboard', 'Treasurer', 'Finance', 'Junior', 'Manages VENSA''s funds, budgets, and financial planning to support valuable experiences for members.', 3),
    ('pulido.jd@ufl.edu', 'José', 'Pulido', 'eboard', 'Secretary', 'Computer Engineering', 'Senior', 'Manages internal communications, records official meeting minutes, and maintains the organization''s administrative records.', 4),
    ('mcarrerojimenez@ufl.edu', 'Maria Victoria', 'Carrero', 'eboard', 'Community Manager', 'Nursing', 'Sophomore', 'Documents VENSA events and manages social media to share the organization''s work and strengthen its community.', 5),
    ('federica.sosa@ufl.edu', 'Federica', 'Sosa', 'eboard', 'VP of Marketing', 'Interior Design', 'Junior', 'Leads VENSA''s brand strategy, social media, promotions, and creative campaigns connecting students with Venezuelan culture and events.', 6),
    ('vjedlicka@ufl.edu', 'Valentina', 'Jedlicka', 'eboard', 'VP of Community Service', 'Psychology; Minor in Theater', 'Junior', 'Organizes philanthropic, volunteer, and team-building opportunities that connect VENSA with the broader community.', 7),
    ('vmedinalaguado@ufl.edu', 'Victoria', 'Medina', 'eboard', 'VP of Professional Development', 'Psychology (Neuroscience) and Anthropology', 'Senior', 'Leads career-readiness programming, including résumé workshops, interview preparation, and professional development opportunities.', 8),
    ('aidanle@ufl.edu', 'Aidan', 'Le', 'eboard', 'VP of Athletics', 'Biology', 'Junior', 'Coordinates athletic events, intramural teams, and collaborations with fitness and workout classes for VENSA members.', 9),
    ('jimenez.a1@ufl.edu', 'Anyelina', 'Jimenez', 'eboard', 'VP of Outreach', 'Biochemistry and Women''s Studies (HESJ)', 'Junior', 'Organizes fundraising events and outreach opportunities that generate support for Venezuelan organizations.', 10),
    ('anavegas@ufl.edu', 'Ana', 'Vegas', 'eboard', 'VP of Events', 'Marketing', 'Sophomore', 'Plans social events that celebrate Venezuelan culture, bring students together, and foster a welcoming community.', 11),
    ('f.jorgehernandez@ufl.edu', 'Fabio', 'Jorge', 'technology', 'VP of Technology', 'Computer Science', 'Senior', 'Leads VENSA''s technology strategy, maintains its digital platforms, and develops reliable tools that support the organization.', 12),
    ('aarveloferreira@ufl.edu', 'Andy', 'Arvelo', 'eboard', 'Scrum Master', 'Computer Science', 'Sophomore', 'Coordinates the technology team''s workflow, organizes development sprints, removes blockers, and keeps digital projects on schedule.', 13)
on conflict (email) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  newsletter_role = excluded.newsletter_role,
  organization_position = excluded.organization_position,
  major = excluded.major,
  class_year = excluded.class_year,
  position_description = excluded.position_description,
  sort_order = excluded.sort_order;

update public.profiles as profile
set
  first_name = board_data.first_name,
  last_name = board_data.last_name,
  status = 'eboard',
  is_admin = true,
  role = board_data.newsletter_role,
  organization_position = board_data.organization_position,
  major = board_data.major,
  year = board_data.class_year::public.year_status,
  position_description = board_data.position_description,
  eboard_sort_order = board_data.sort_order
from auth.users as account
join public.eboard_profile_defaults as board_data
  on lower(trim(account.email)) = board_data.email
where account.id = profile.id;

-- Preserve the migrated presentation data for current members who have not
-- created an account yet. The trigger trusts auth.users.email, not the
-- client-editable profile email.
create or replace function public.apply_current_eboard_profile_defaults()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  account_email text;
  board_data public.eboard_profile_defaults%rowtype;
begin
  select lower(trim(email)) into account_email
  from auth.users
  where id = new.id;

  select * into board_data
  from public.eboard_profile_defaults
  where email = account_email;

  if found then
    new.first_name := board_data.first_name;
    new.last_name := board_data.last_name;
    new.status := 'eboard';
    new.is_admin := true;
    new.role := board_data.newsletter_role;
    new.organization_position := board_data.organization_position;
    new.major := board_data.major;
    new.year := board_data.class_year;
    new.position_description := board_data.position_description;
    new.eboard_sort_order := board_data.sort_order;
  end if;

  return new;
end;
$$;

revoke all on function public.apply_current_eboard_profile_defaults() from public;

drop trigger if exists apply_current_eboard_profile_defaults on public.profiles;
create trigger apply_current_eboard_profile_defaults
before insert on public.profiles
for each row execute function public.apply_current_eboard_profile_defaults();

-- The previous policy exposed every profile row to anonymous visitors. Public
-- visitors now see only E-Board rows, while signed-in members retain the
-- directory access already used by the application.
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Public E-Board profiles are viewable by everyone" on public.profiles;
drop policy if exists "Authenticated users can view profiles" on public.profiles;

create policy "Public E-Board profiles are viewable by everyone"
on public.profiles
for select
to anon
using (role in ('eboard', 'president', 'technology'));

create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

-- Anonymous clients can read only the fields rendered by the public E-Board
-- cards. Authenticated grants remain unchanged for member/profile features.
revoke select on table public.profiles from anon;
grant select (
  id,
  first_name,
  last_name,
  email,
  major,
  year,
  avatar_url,
  role,
  organization_position,
  position_description,
  eboard_sort_order
) on table public.profiles to anon;
