-- Automatically classify opted-in Seniors as Alumni after their configured
-- expected graduation date. This scheduled function never assigns Graduate;
-- that remains an explicit, authenticated choice made by the member.

create or replace function public.process_academic_progression(p_as_of date default current_date)
returns table (profiles_advanced integer, confirmations_requested integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  advanced_count integer := 0;
  alumni_count integer := 0;
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
  set year = 'Alumni'::public.year_status
  from public.uf_academic_terms as term
  where profile.expected_graduation_term = term.term
    and profile.expected_graduation_year = term.academic_year
    and term.graduation_confirmation_on is not null
    and term.graduation_confirmation_on <= p_as_of
    and profile.year::text = 'Senior'
    and profile.automatic_year_progression = true
    and profile.academic_level_override = false;

  get diagnostics alumni_count = row_count;

  -- If a graduation date has passed while a profile is not a Senior, ask the
  -- member to resolve the mismatch rather than guessing their status.
  update public.profiles as profile
  set graduation_confirmation_required = true
  from public.uf_academic_terms as term
  where profile.expected_graduation_term = term.term
    and profile.expected_graduation_year = term.academic_year
    and term.graduation_confirmation_on is not null
    and term.graduation_confirmation_on <= p_as_of
    and profile.year::text not in ('Senior', 'Graduate', 'Alumni')
    and profile.graduation_confirmation_required = false;

  get diagnostics confirmation_count = row_count;
  return query select advanced_count + alumni_count, confirmation_count;
end;
$$;

revoke all on function public.process_academic_progression(date) from public, anon, authenticated;
grant execute on function public.process_academic_progression(date) to service_role;
