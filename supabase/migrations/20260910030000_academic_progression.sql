-- Automatic academic-level progression based on official UF term dates.
-- Permission roles remain independent and are never modified by this system.

alter table public.profiles
  add column if not exists expected_graduation_term text,
  add column if not exists expected_graduation_year integer,
  add column if not exists academic_level_updated_at date not null default current_date,
  add column if not exists automatic_year_progression boolean not null default true,
  add column if not exists academic_level_override boolean not null default false,
  add column if not exists graduation_confirmation_required boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_expected_graduation_term_check,
  drop constraint if exists profiles_expected_graduation_year_check,
  drop constraint if exists profiles_expected_graduation_pair_check;

alter table public.profiles
  add constraint profiles_expected_graduation_term_check
    check (expected_graduation_term is null or expected_graduation_term in ('Spring', 'Summer', 'Fall')),
  add constraint profiles_expected_graduation_year_check
    check (expected_graduation_year is null or expected_graduation_year between 2000 and 2200),
  add constraint profiles_expected_graduation_pair_check
    check ((expected_graduation_term is null) = (expected_graduation_year is null));

update public.profiles
set
  automatic_year_progression = false,
  academic_level_override = true,
  graduation_confirmation_required = false
where year::text in ('Graduate', 'Alumni');

create table if not exists public.uf_academic_terms (
  term text not null check (term in ('Spring', 'Summer', 'Fall')),
  academic_year integer not null check (academic_year between 2000 and 2200),
  classes_begin date not null,
  graduation_confirmation_on date,
  source_url text not null default 'https://catalog.ufl.edu/UGRD/dates-deadlines/',
  updated_at timestamptz not null default now(),
  primary key (term, academic_year)
);

comment on table public.uf_academic_terms is
  'Configurable UF term dates. Fall classes_begin advances undergraduate class levels; the official degree-status date, or commencement end date while degree status is TBD, triggers graduation confirmation.';

insert into public.uf_academic_terms
  (term, academic_year, classes_begin, graduation_confirmation_on, source_url)
values
  ('Fall', 2026, '2026-08-20', '2026-12-16', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2026-2027/'),
  ('Spring', 2027, '2027-01-11', '2027-05-05', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2026-2027/'),
  ('Summer', 2027, '2027-05-10', '2027-08-11', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2026-2027/'),
  ('Fall', 2027, '2027-08-19', '2027-12-15', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2027-2028/'),
  ('Spring', 2028, '2028-01-10', '2028-05-03', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2027-2028/'),
  ('Summer', 2028, '2028-05-08', '2028-08-09', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2027-2028/'),
  ('Fall', 2028, '2028-08-17', '2028-12-09', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2028-2029/'),
  ('Spring', 2029, '2029-01-11', '2029-05-06', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2028-2029/'),
  ('Summer', 2029, '2029-05-14', '2029-08-11', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2028-2029/'),
  ('Fall', 2029, '2029-08-23', '2029-12-15', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2029-2030/'),
  ('Spring', 2030, '2030-01-10', '2030-05-05', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2029-2030/'),
  ('Summer', 2030, '2030-05-13', '2030-08-10', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2029-2030/'),
  ('Fall', 2030, '2030-08-22', '2030-12-14', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2030-2031/'),
  ('Spring', 2031, '2031-01-09', '2031-05-04', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2030-2031/'),
  ('Summer', 2031, '2031-05-12', '2031-08-09', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2030-2031/'),
  ('Fall', 2031, '2031-08-21', '2031-12-13', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2031-2032/'),
  ('Spring', 2032, '2032-01-08', '2032-05-02', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2031-2032/'),
  ('Summer', 2032, '2032-05-10', '2032-08-07', 'https://catalog.ufl.edu/UGRD/dates-deadlines/2031-2032/')
on conflict (term, academic_year) do update set
  classes_begin = excluded.classes_begin,
  graduation_confirmation_on = excluded.graduation_confirmation_on,
  source_url = excluded.source_url,
  updated_at = now();

alter table public.uf_academic_terms enable row level security;
revoke all on table public.uf_academic_terms from anon, authenticated;
grant select on table public.uf_academic_terms to service_role;

create or replace function public.advance_undergraduate_year(
  current_year public.year_status,
  progression_steps integer
)
returns public.year_status
language sql
immutable
set search_path = public
as $$
  select case current_year::text
    when 'Freshman' then (case
      when progression_steps <= 0 then 'Freshman'
      when progression_steps = 1 then 'Sophomore'
      when progression_steps = 2 then 'Junior'
      else 'Senior'
    end)::public.year_status
    when 'Sophomore' then (case
      when progression_steps <= 0 then 'Sophomore'
      when progression_steps = 1 then 'Junior'
      else 'Senior'
    end)::public.year_status
    when 'Junior' then (case when progression_steps <= 0 then 'Junior' else 'Senior' end)::public.year_status
    else current_year
  end;
$$;

create or replace function public.normalize_academic_progression_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.year::text in ('Graduate', 'Alumni') then
    new.automatic_year_progression := false;
    new.academic_level_override := true;
    new.graduation_confirmation_required := false;
    new.expected_graduation_term := null;
    new.expected_graduation_year := null;
  else
    new.academic_level_override := not new.automatic_year_progression;
    if tg_op = 'INSERT' then
      new.academic_level_updated_at := current_date;
      new.graduation_confirmation_required := false;
    elsif new.year is distinct from old.year then
      new.academic_level_updated_at := current_date;
      new.graduation_confirmation_required := false;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists normalize_academic_progression_fields on public.profiles;
create trigger normalize_academic_progression_fields
before insert or update of year, automatic_year_progression, academic_level_override,
  expected_graduation_term, expected_graduation_year
on public.profiles
for each row execute function public.normalize_academic_progression_fields();

create or replace function public.process_academic_progression(p_as_of date default current_date)
returns table (profiles_advanced integer, confirmations_requested integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  advanced_count integer := 0;
  confirmation_count integer := 0;
begin
  with progression as (
    select
      profile.id,
      count(*)::integer as steps,
      max(term.classes_begin) as processed_through
    from public.profiles as profile
    join public.uf_academic_terms as term
      on term.term = 'Fall'
     and term.classes_begin > profile.academic_level_updated_at
     and term.classes_begin <= p_as_of
    where profile.automatic_year_progression = true
      and profile.academic_level_override = false
      and profile.year::text in ('Freshman', 'Sophomore', 'Junior', 'Senior')
    group by profile.id
  )
  update public.profiles as profile
  set
    year = public.advance_undergraduate_year(profile.year, progression.steps),
    academic_level_updated_at = progression.processed_through
  from progression
  where profile.id = progression.id;

  get diagnostics advanced_count = row_count;

  update public.profiles as profile
  set graduation_confirmation_required = true
  from public.uf_academic_terms as term
  where profile.expected_graduation_term = term.term
    and profile.expected_graduation_year = term.academic_year
    and term.graduation_confirmation_on is not null
    and term.graduation_confirmation_on <= p_as_of
    and profile.year::text not in ('Graduate', 'Alumni')
    and profile.graduation_confirmation_required = false;

  get diagnostics confirmation_count = row_count;
  return query select advanced_count, confirmation_count;
end;
$$;

create or replace function public.respond_to_graduation_confirmation(p_choice text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare result public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_choice not in ('alumni', 'graduate', 'still_enrolled') then
    raise exception 'Invalid academic status choice';
  end if;

  update public.profiles
  set
    year = case p_choice
      when 'alumni' then 'Alumni'::public.year_status
      when 'graduate' then 'Graduate'::public.year_status
      else year
    end,
    automatic_year_progression = case when p_choice = 'still_enrolled' then true else false end,
    academic_level_override = case when p_choice = 'still_enrolled' then false else true end,
    academic_level_updated_at = current_date,
    expected_graduation_term = null,
    expected_graduation_year = null,
    graduation_confirmation_required = false
  where id = auth.uid()
  returning * into result;

  if result.id is null then raise exception 'Profile not found'; end if;
  return result;
end;
$$;

-- Keep newsletter membership classification in sync without touching profile
-- permission roles. The public profile status is derived from year = Alumni.
create or replace function public.sync_profile_to_newsletter_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(new.email), '') is not null then
    insert into public.members (profile_id, first_name, last_name, email, membership_status)
    values (
      new.id, new.first_name, new.last_name, lower(new.email),
      case when new.status::text = 'alumni' or new.year::text = 'Alumni' then 'alumni' else 'active' end
    )
    on conflict (profile_id) do update set
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      email = excluded.email,
      membership_status = excluded.membership_status,
      updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists sync_profile_newsletter_member on public.profiles;
create trigger sync_profile_newsletter_member
after insert or update of email, first_name, last_name, status, year on public.profiles
for each row execute function public.sync_profile_to_newsletter_member();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, first_name, last_name, major, year, date_of_birth, linkedin_url,
    expected_graduation_term, expected_graduation_year,
    automatic_year_progression, academic_level_override
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    nullif(new.raw_user_meta_data->>'major', ''),
    coalesce(nullif(new.raw_user_meta_data->>'year', ''), 'Freshman')::public.year_status,
    nullif(new.raw_user_meta_data->>'date_of_birth', '')::date,
    nullif(new.raw_user_meta_data->>'linkedin_url', ''),
    nullif(new.raw_user_meta_data->>'expected_graduation_term', ''),
    case
      when coalesce(new.raw_user_meta_data->>'expected_graduation_year', '') ~ '^[0-9]{4}$'
        then (new.raw_user_meta_data->>'expected_graduation_year')::integer
      else null
    end,
    coalesce(nullif(new.raw_user_meta_data->>'automatic_year_progression', '')::boolean, true),
    not coalesce(nullif(new.raw_user_meta_data->>'automatic_year_progression', '')::boolean, true)
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    major = excluded.major,
    year = excluded.year,
    date_of_birth = excluded.date_of_birth,
    linkedin_url = coalesce(excluded.linkedin_url, profiles.linkedin_url),
    expected_graduation_term = excluded.expected_graduation_term,
    expected_graduation_year = excluded.expected_graduation_year,
    automatic_year_progression = excluded.automatic_year_progression,
    academic_level_override = excluded.academic_level_override;
  return new;
end;
$$;

revoke all on function public.advance_undergraduate_year(public.year_status, integer) from public;
revoke all on function public.process_academic_progression(date) from public, anon, authenticated;
revoke all on function public.respond_to_graduation_confirmation(text) from public, anon;
grant execute on function public.process_academic_progression(date) to service_role;
grant execute on function public.respond_to_graduation_confirmation(text) to authenticated;

create extension if not exists pg_cron;

do $$
declare existing_job_id bigint;
begin
  for existing_job_id in
    select jobid from cron.job where jobname = 'vensa-academic-progression'
  loop
    perform cron.unschedule(existing_job_id);
  end loop;

  perform cron.schedule(
    'vensa-academic-progression',
    '15 7 * * *',
    'select public.process_academic_progression(current_date);'
  );
end;
$$;
