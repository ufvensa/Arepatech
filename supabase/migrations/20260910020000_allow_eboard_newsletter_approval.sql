-- Allow every authenticated E-Board member to review, approve, schedule, and
-- send newsletters. A newsletter creator may approve their own submission.

create or replace function public.is_newsletter_approver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.newsletter_actor_role() in ('eboard', 'president', 'technology', 'service_role');
$$;

create or replace function public.enforce_newsletter_workflow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare actor text := public.newsletter_actor_role();
begin
  if actor = 'service_role' then return new; end if;
  if actor not in ('eboard', 'president', 'technology') then raise exception 'Not authorized'; end if;
  if old.status = 'sent' then raise exception 'Sent newsletters are immutable'; end if;
  if new.created_by is distinct from old.created_by then raise exception 'created_by is immutable'; end if;

  if old.status <> 'draft' and (
    new.subject is distinct from old.subject or
    new.preview_text is distinct from old.preview_text or
    new.title is distinct from old.title or
    new.intro is distinct from old.intro
  ) then
    raise exception 'Only draft newsletter content can be edited';
  end if;

  if new.status in ('sending', 'sent', 'failed') and new.status is distinct from old.status then
    raise exception 'Only the sending service can set this status';
  end if;

  if new.status is distinct from old.status and not (
    (old.status = 'draft' and new.status = 'ready_for_review') or
    (old.status = 'ready_for_review' and new.status in ('draft', 'approved')) or
    (old.status = 'approved' and new.status = 'scheduled') or
    (old.status = 'scheduled' and new.status = 'approved') or
    (old.status = 'failed' and new.status = 'approved')
  ) then
    raise exception 'Invalid newsletter status transition';
  end if;

  return new;
end;
$$;

create or replace function public.review_newsletter(p_newsletter_id uuid, p_approve boolean)
returns public.newsletters
language plpgsql
security definer
set search_path = public
as $$
declare result public.newsletters;
begin
  if not public.is_newsletter_approver() then raise exception 'Only E-Board members can review newsletters'; end if;
  update public.newsletters set
    status = case when p_approve then 'approved' else 'draft' end,
    approved_by = case when p_approve then auth.uid() else null end,
    scheduled_for = null
  where id = p_newsletter_id and status = 'ready_for_review' returning * into result;
  if result.id is null then raise exception 'Newsletter is not ready for review'; end if;
  return result;
end;
$$;

create or replace function public.schedule_newsletter(p_newsletter_id uuid, p_scheduled_for timestamptz)
returns public.newsletters
language plpgsql
security definer
set search_path = public
as $$
declare result public.newsletters;
begin
  if not public.is_newsletter_approver() then raise exception 'Only E-Board members can schedule newsletters'; end if;
  if p_scheduled_for <= now() then raise exception 'Schedule time must be in the future'; end if;
  update public.newsletters set status = 'scheduled', scheduled_for = p_scheduled_for
  where id = p_newsletter_id and status = 'approved' returning * into result;
  if result.id is null then raise exception 'Newsletter must be approved'; end if;
  return result;
end;
$$;

revoke all on function public.is_newsletter_approver() from public;
grant execute on function public.is_newsletter_approver() to authenticated, service_role;
grant execute on function public.review_newsletter(uuid, boolean) to authenticated;
grant execute on function public.schedule_newsletter(uuid, timestamptz) to authenticated;
