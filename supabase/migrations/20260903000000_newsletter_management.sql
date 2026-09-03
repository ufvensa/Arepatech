-- VENSA newsletter management, approval workflow, recipient privacy, and send safety.
create extension if not exists pgcrypto;

alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.profiles add column if not exists role text;
update public.profiles
set role = case
  when coalesce(is_admin, false) or status::text = 'eboard' then 'eboard'
  else 'member'
end
where role is null;
alter table public.profiles alter column role set default 'member';
alter table public.profiles alter column role set not null;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('member', 'eboard', 'president', 'technology'));
create index if not exists idx_profiles_role on public.profiles(role);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  first_name text,
  last_name text,
  email text not null,
  email_subscribed boolean not null default true,
  membership_status text not null default 'active'
    check (membership_status in ('active', 'inactive', 'alumni', 'bounced', 'complained')),
  unsubscribe_token text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_email_unique unique (email),
  constraint members_unsubscribe_token_unique unique (unsubscribe_token)
);

insert into public.members (profile_id, first_name, last_name, email, membership_status)
select id, first_name, last_name, lower(email),
  case when status::text = 'alumni' then 'alumni' else 'active' end
from public.profiles
where nullif(trim(email), '') is not null
on conflict (email) do update set
  profile_id = excluded.profile_id,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  updated_at = now();

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null default '',
  preview_text text not null default '',
  title text not null default '',
  intro text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'ready_for_review', 'approved', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.newsletter_sections (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.newsletters(id) on delete cascade,
  section_type text not null check (section_type in (
    'featured_event', 'upcoming_events', 'announcement', 'professional_opportunities',
    'community_service', 'athletics', 'member_spotlight', 'custom_text', 'image', 'cta'
  )),
  title text,
  content text,
  image_url text,
  button_text text,
  button_url text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.newsletters(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  recipient_email text not null,
  resend_email_id text,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'delivered', 'bounced', 'complained', 'skipped')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_sends_one_recipient unique (newsletter_id, recipient_email)
);

create table if not exists public.newsletter_webhook_events (
  svix_id text primary key,
  event_type text not null,
  resend_email_id text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index if not exists idx_members_delivery
  on public.members(email_subscribed, membership_status);
create index if not exists idx_members_unsubscribe_token on public.members(unsubscribe_token);
create index if not exists idx_newsletters_status_schedule on public.newsletters(status, scheduled_for);
create index if not exists idx_newsletters_created_by on public.newsletters(created_by);
create index if not exists idx_newsletter_sections_order
  on public.newsletter_sections(newsletter_id, display_order);
create index if not exists idx_newsletter_sends_newsletter_status
  on public.newsletter_sends(newsletter_id, status);
create index if not exists idx_newsletter_sends_resend_id on public.newsletter_sends(resend_email_id);
create index if not exists idx_newsletter_webhook_email_id on public.newsletter_webhook_events(resend_email_id);

create or replace function public.newsletter_actor_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    case when (auth.jwt() ->> 'role') = 'service_role' then 'service_role' end,
    'anonymous'
  );
$$;

create or replace function public.is_newsletter_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.newsletter_actor_role() in ('eboard', 'president', 'technology', 'service_role');
$$;

create or replace function public.is_newsletter_approver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.newsletter_actor_role() in ('president', 'technology', 'service_role');
$$;

create or replace function public.touch_newsletter_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
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

  if actor = 'eboard' and new.status is distinct from old.status and
     not (old.status = 'draft' and new.status = 'ready_for_review') then
    raise exception 'E-board members can only submit drafts for review';
  end if;

  if actor in ('president', 'technology') and new.status is distinct from old.status and not (
    (old.status = 'draft' and new.status = 'ready_for_review') or
    (old.status = 'ready_for_review' and new.status in ('draft', 'approved')) or
    (old.status = 'approved' and new.status = 'scheduled') or
    (old.status = 'scheduled' and new.status = 'approved') or
    (old.status = 'failed' and new.status = 'approved')
  ) then
    raise exception 'Invalid newsletter status transition';
  end if;

  if new.approved_by is distinct from old.approved_by and actor not in ('president', 'technology') then
    raise exception 'Only president or technology can set approval';
  end if;
  return new;
end;
$$;

drop trigger if exists newsletters_updated_at on public.newsletters;
create trigger newsletters_updated_at before update on public.newsletters
for each row execute function public.touch_newsletter_updated_at();
drop trigger if exists enforce_newsletter_workflow on public.newsletters;
create trigger enforce_newsletter_workflow before update on public.newsletters
for each row execute function public.enforce_newsletter_workflow();
drop trigger if exists newsletter_sections_updated_at on public.newsletter_sections;
create trigger newsletter_sections_updated_at before update on public.newsletter_sections
for each row execute function public.touch_newsletter_updated_at();
drop trigger if exists members_updated_at on public.members;
create trigger members_updated_at before update on public.members
for each row execute function public.touch_newsletter_updated_at();
drop trigger if exists newsletter_sends_updated_at on public.newsletter_sends;
create trigger newsletter_sends_updated_at before update on public.newsletter_sends
for each row execute function public.touch_newsletter_updated_at();

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
      case when new.status::text = 'alumni' then 'alumni' else 'active' end
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

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (auth.jwt() ->> 'role') = 'authenticated' and auth.uid() = old.id and (
    new.role is distinct from old.role or
    new.is_admin is distinct from old.is_admin or
    new.status is distinct from old.status
  ) then
    raise exception 'Role and administrative fields cannot be changed from a member session';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
before update of role, is_admin, status on public.profiles
for each row execute function public.protect_profile_privileges();

drop trigger if exists sync_profile_newsletter_member on public.profiles;
create trigger sync_profile_newsletter_member
after insert or update of email, first_name, last_name, status on public.profiles
for each row execute function public.sync_profile_to_newsletter_member();

alter table public.members enable row level security;
alter table public.newsletters enable row level security;
alter table public.newsletter_sections enable row level security;
alter table public.newsletter_sends enable row level security;
alter table public.newsletter_webhook_events enable row level security;

revoke all on public.members from anon, authenticated;
revoke all on public.newsletter_webhook_events from anon, authenticated;
grant select, insert, update, delete on public.newsletters to authenticated;
grant select, insert, update, delete on public.newsletter_sections to authenticated;
grant select on public.newsletter_sends to authenticated;
grant all on public.members, public.newsletters, public.newsletter_sections, public.newsletter_sends, public.newsletter_webhook_events to service_role;

drop policy if exists "Newsletter staff can read newsletters" on public.newsletters;
create policy "Newsletter staff can read newsletters" on public.newsletters
for select using (public.is_newsletter_staff());

drop policy if exists "Newsletter staff can create drafts" on public.newsletters;
create policy "Newsletter staff can create drafts" on public.newsletters
for insert with check (
  public.is_newsletter_staff() and created_by = auth.uid() and status = 'draft'
);

drop policy if exists "Newsletter staff can update unsent newsletters" on public.newsletters;
create policy "Newsletter staff can update unsent newsletters" on public.newsletters
for update using (public.is_newsletter_staff() and status <> 'sent')
with check (public.is_newsletter_staff() and status <> 'sent');

drop policy if exists "Newsletter staff can delete drafts" on public.newsletters;
create policy "Newsletter staff can delete drafts" on public.newsletters
for delete using (public.is_newsletter_staff() and status = 'draft');

drop policy if exists "Newsletter staff can read sections" on public.newsletter_sections;
create policy "Newsletter staff can read sections" on public.newsletter_sections
for select using (public.is_newsletter_staff());

drop policy if exists "Newsletter staff can add editable sections" on public.newsletter_sections;
create policy "Newsletter staff can add editable sections" on public.newsletter_sections
for insert with check (
  public.is_newsletter_staff() and exists (
    select 1 from public.newsletters n
    where n.id = newsletter_id and n.status = 'draft'
  )
);

drop policy if exists "Newsletter staff can update editable sections" on public.newsletter_sections;
create policy "Newsletter staff can update editable sections" on public.newsletter_sections
for update using (
  public.is_newsletter_staff() and exists (
    select 1 from public.newsletters n
    where n.id = newsletter_id and n.status = 'draft'
  )
) with check (
  public.is_newsletter_staff() and exists (
    select 1 from public.newsletters n
    where n.id = newsletter_id and n.status = 'draft'
  )
);

drop policy if exists "Newsletter staff can delete editable sections" on public.newsletter_sections;
create policy "Newsletter staff can delete editable sections" on public.newsletter_sections
for delete using (
  public.is_newsletter_staff() and exists (
    select 1 from public.newsletters n
    where n.id = newsletter_id and n.status = 'draft'
  )
);

drop policy if exists "Newsletter staff can read send analytics" on public.newsletter_sends;
create policy "Newsletter staff can read send analytics" on public.newsletter_sends
for select using (public.is_newsletter_staff());

-- members intentionally has no client-facing policies. Edge Functions use service_role.

create or replace function public.newsletter_member_count()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_newsletter_staff() then raise exception 'Not authorized'; end if;
  return (
    select count(*) from public.members
    where email_subscribed = true and membership_status = 'active'
      and email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  );
end;
$$;

create or replace function public.submit_newsletter(p_newsletter_id uuid)
returns public.newsletters
language plpgsql security definer set search_path = public as $$
declare result public.newsletters;
begin
  if not public.is_newsletter_staff() then raise exception 'Not authorized'; end if;
  if not exists (
    select 1 from public.newsletters
    where id = p_newsletter_id
      and nullif(trim(subject), '') is not null
      and nullif(trim(title), '') is not null
  ) then raise exception 'Subject and newsletter heading are required'; end if;
  if not exists (
    select 1 from public.newsletter_sections
    where newsletter_id = p_newsletter_id and is_visible = true
  ) then raise exception 'Add at least one visible newsletter section'; end if;
  update public.newsletters set status = 'ready_for_review', approved_by = null,
    scheduled_for = null
  where id = p_newsletter_id and status = 'draft' returning * into result;
  if result.id is null then raise exception 'Newsletter must be a draft'; end if;
  return result;
end;
$$;

create or replace function public.review_newsletter(p_newsletter_id uuid, p_approve boolean)
returns public.newsletters
language plpgsql security definer set search_path = public as $$
declare result public.newsletters;
begin
  if not public.is_newsletter_approver() then raise exception 'Only president or technology can review newsletters'; end if;
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
language plpgsql security definer set search_path = public as $$
declare result public.newsletters;
begin
  if not public.is_newsletter_approver() then raise exception 'Only president or technology can schedule newsletters'; end if;
  if p_scheduled_for <= now() then raise exception 'Schedule time must be in the future'; end if;
  update public.newsletters set status = 'scheduled', scheduled_for = p_scheduled_for
  where id = p_newsletter_id and status = 'approved' returning * into result;
  if result.id is null then raise exception 'Newsletter must be approved'; end if;
  return result;
end;
$$;

create or replace function public.duplicate_newsletter(p_newsletter_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare source public.newsletters; new_id uuid;
begin
  if not public.is_newsletter_staff() then raise exception 'Not authorized'; end if;
  select * into source from public.newsletters where id = p_newsletter_id;
  if source.id is null then raise exception 'Newsletter not found'; end if;
  insert into public.newsletters(subject, preview_text, title, intro, status, created_by)
  values ('Copy of ' || source.subject, source.preview_text, 'Copy of ' || source.title,
    source.intro, 'draft', auth.uid()) returning id into new_id;
  insert into public.newsletter_sections(
    newsletter_id, section_type, title, content, image_url, button_text,
    button_url, display_order, is_visible, metadata
  )
  select new_id, section_type, title, content, image_url, button_text,
    button_url, display_order, is_visible, metadata
  from public.newsletter_sections where newsletter_id = p_newsletter_id;
  return new_id;
end;
$$;

create or replace function public.claim_newsletter_for_sending(p_newsletter_id uuid)
returns public.newsletters
language plpgsql security definer set search_path = public as $$
declare result public.newsletters;
begin
  if (auth.jwt() ->> 'role') <> 'service_role' then raise exception 'Service role required'; end if;
  update public.newsletters set status = 'sending'
  where id = p_newsletter_id and (
    status = 'approved'
    or status = 'failed'
    or (status = 'scheduled' and scheduled_for <= now())
  ) returning * into result;
  return result;
end;
$$;

create or replace function public.process_resend_newsletter_webhook(
  p_svix_id text,
  p_event_type text,
  p_resend_email_id text,
  p_status text,
  p_error_message text,
  p_payload jsonb
)
returns boolean
language plpgsql security definer set search_path = public as $$
declare inserted_count integer; send_record public.newsletter_sends; effective_status text;
begin
  if (auth.jwt() ->> 'role') <> 'service_role' then raise exception 'Service role required'; end if;
  insert into public.newsletter_webhook_events(svix_id, event_type, resend_email_id, payload)
  values (p_svix_id, p_event_type, p_resend_email_id, p_payload)
  on conflict (svix_id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  select * into send_record from public.newsletter_sends
  where resend_email_id = p_resend_email_id for update;
  if send_record.id is null then return true; end if;

  effective_status := case
    when send_record.status in ('bounced', 'complained') then send_record.status
    when p_status in ('bounced', 'complained') then p_status
    when send_record.status = 'delivered' then 'delivered'
    else p_status
  end;
  update public.newsletter_sends set status = effective_status, error_message = p_error_message
  where id = send_record.id;

  if send_record.member_id is not null and effective_status in ('bounced', 'complained') then
    update public.members set email_subscribed = false, membership_status = effective_status
    where id = send_record.member_id;
  end if;
  return true;
end;
$$;

revoke all on function public.newsletter_actor_role() from public;
revoke all on function public.is_newsletter_staff() from public;
revoke all on function public.is_newsletter_approver() from public;
grant execute on function public.newsletter_actor_role() to authenticated, service_role;
grant execute on function public.is_newsletter_staff() to authenticated, service_role;
grant execute on function public.is_newsletter_approver() to authenticated, service_role;
grant execute on function public.newsletter_member_count() to authenticated;
grant execute on function public.submit_newsletter(uuid) to authenticated;
grant execute on function public.review_newsletter(uuid, boolean) to authenticated;
grant execute on function public.schedule_newsletter(uuid, timestamptz) to authenticated;
grant execute on function public.duplicate_newsletter(uuid) to authenticated;
revoke all on function public.claim_newsletter_for_sending(uuid) from public, anon, authenticated;
grant execute on function public.claim_newsletter_for_sending(uuid) to service_role;
revoke all on function public.process_resend_newsletter_webhook(text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.process_resend_newsletter_webhook(text, text, text, text, text, jsonb) to service_role;
