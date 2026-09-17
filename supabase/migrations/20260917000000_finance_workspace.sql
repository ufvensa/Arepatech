-- Treasury workspace: USD cents, source provenance, protected access, immutable audit.
begin;
create function public.is_finance_staff() returns boolean language sql stable security definer set search_path = public as $$
 select exists(select 1 from public.profiles where id = auth.uid() and role in ('eboard','president','technology'));
$$;
revoke all on function public.is_finance_staff() from public;
grant execute on function public.is_finance_staff() to authenticated;

create table public.finance_documents (
 id uuid primary key default gen_random_uuid(),
 external_id text unique,
 title text not null check(length(title) between 1 and 300),
 source_url text not null check(source_url ~ '^https://'),
 mime_type text, modified_at timestamptz,
 imported_at timestamptz not null default now(),
 review_status text not null default 'pending' check(review_status in ('pending','reviewed')),
 created_by uuid not null default auth.uid() references public.profiles(id)
);
create table public.finance_events (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 1 and 200),
 occurred_on date not null,
 fiscal_year text not null check(fiscal_year ~ '^\d{4}-\d{2}$'),
 attendance integer check(attendance >= 0),
 records_complete boolean not null default false,
 source_id uuid not null references public.finance_documents(id),
 created_by uuid not null default auth.uid() references public.profiles(id)
);
create table public.finance_funding (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 1 and 200),
 fiscal_year text not null check(fiscal_year ~ '^\d{4}-\d{2}$'),
 funding_type text not null check(funding_type in ('base','sar','other')),
 requested_cents bigint not null check(requested_cents between 0 and 10000000000),
 approved_cents bigint check(approved_cents between 0 and 10000000000),
 source_id uuid not null references public.finance_documents(id),
 created_by uuid not null default auth.uid() references public.profiles(id)
);
create table public.finance_transactions (
 id uuid primary key default gen_random_uuid(),
 external_key text unique,
 occurred_on date not null,
 ledger text not null check(ledger in ('cash','sg')),
 kind text not null check(kind in ('income','expense')),
 category text not null check(length(category) between 1 and 100),
 amount_cents bigint not null check(amount_cents between 1 and 10000000000),
 status text not null check(status in ('paid','committed','void')),
 event_id uuid references public.finance_events(id),
 funding_id uuid references public.finance_funding(id),
 source_id uuid not null references public.finance_documents(id),
 source_row text check(length(source_row) <= 200),
 created_by uuid not null default auth.uid() references public.profiles(id),
 check ((ledger = 'cash' and funding_id is null) or (ledger = 'sg' and kind = 'expense' and funding_id is not null)),
 check(kind = 'expense' or status <> 'committed')
);
create table public.finance_cash_snapshots (
 id uuid primary key default gen_random_uuid(),
 as_of date not null unique check(as_of <= current_date),
 balance_cents bigint not null check(balance_cents between 0 and 10000000000),
 source_id uuid not null references public.finance_documents(id),
 created_by uuid not null default auth.uid() references public.profiles(id)
);
create table public.finance_rules (
 id uuid primary key default gen_random_uuid(),
 fiscal_year text not null check(fiscal_year ~ '^\d{4}-\d{2}$'),
 funding_type text not null check(funding_type in ('base','sar','other')),
 min_utilization_percent numeric(5,2) not null check(min_utilization_percent between 0 and 100),
 effective_from date not null, effective_to date not null,
 source_id uuid not null references public.finance_documents(id),
 created_by uuid not null default auth.uid() references public.profiles(id),
 unique(fiscal_year, funding_type), check(effective_from <= effective_to)
);
create table public.finance_audit (
 id bigint generated always as identity primary key,
 actor_id uuid references public.profiles(id), occurred_at timestamptz not null default now(),
 entity text not null, operation text not null, record_id uuid not null,
 before_record jsonb, after_record jsonb
);
create table public.finance_request_limits (
 actor_id uuid references public.profiles(id) on delete cascade,
 bucket timestamptz not null, requests integer not null, primary key(actor_id,bucket)
);
create index on public.finance_transactions(event_id);
create index on public.finance_transactions(funding_id);
create index on public.finance_transactions(occurred_on);
create index on public.finance_transactions(source_id);

create function public.finance_audit_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
 insert into public.finance_audit(actor_id,entity,operation,record_id,before_record,after_record)
 values(auth.uid(),tg_table_name,tg_op,coalesce(new.id,old.id),case when tg_op <> 'INSERT' then to_jsonb(old) end,case when tg_op <> 'DELETE' then to_jsonb(new) end);
 return coalesce(new,old);
end;
$$;
revoke all on function public.finance_audit_change() from public;
do $$ declare t text; begin
 foreach t in array array['finance_documents','finance_events','finance_funding','finance_transactions','finance_cash_snapshots','finance_rules'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select, insert, update on public.%I to authenticated',t);
  execute format('create policy staff_read on public.%I for select to authenticated using (public.is_finance_staff())',t);
  execute format('create policy staff_insert on public.%I for insert to authenticated with check (public.is_finance_staff() and created_by = auth.uid())',t);
  execute format('create policy staff_update on public.%I for update to authenticated using (public.is_finance_staff()) with check (public.is_finance_staff())',t);
  execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function public.finance_audit_change()',t);
 end loop;
end $$;
alter table public.finance_audit enable row level security;
alter table public.finance_request_limits enable row level security;
revoke all on public.finance_audit, public.finance_request_limits from anon, authenticated;
grant select on public.finance_audit to authenticated;
create policy staff_audit_read on public.finance_audit for select to authenticated using(public.is_finance_staff());

-- Persisted, atomic limit also applies across concurrent Edge Function instances.
create function public.finance_take_request() returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
 if not public.is_finance_staff() then raise exception 'Finance access required'; end if;
 insert into public.finance_request_limits(actor_id,bucket,requests) values(auth.uid(),date_trunc('hour',now()),1)
 on conflict(actor_id,bucket) do update set requests = finance_request_limits.requests + 1
 returning requests into n;
 return n <= 20;
end;
$$;
revoke all on function public.finance_take_request() from public;
grant execute on function public.finance_take_request() to authenticated;

-- Consistent database snapshot, no PostgREST 1,000-row truncation. Fail closed at capacity.
create function public.finance_dataset() returns jsonb language plpgsql security invoker set search_path = public as $$
begin
 if not public.is_finance_staff() then raise exception 'Finance access required'; end if;
 if (select count(*) from public.finance_transactions) > 10000 then
  raise exception 'Finance dataset exceeds 10000 transactions; add server-side period aggregation before continuing';
 end if;
 return jsonb_build_object(
  'transactions',(select coalesce(jsonb_agg(t),'[]') from public.finance_transactions t),
  'snapshots',(select coalesce(jsonb_agg(t),'[]') from public.finance_cash_snapshots t),
  'funding',(select coalesce(jsonb_agg(t),'[]') from public.finance_funding t),
  'events',(select coalesce(jsonb_agg(t),'[]') from public.finance_events t),
  'rules',(select coalesce(jsonb_agg(t),'[]') from public.finance_rules t),
  'documents',(select coalesce(jsonb_agg(t),'[]') from public.finance_documents t)
 );
end;
$$;
revoke all on function public.finance_dataset() from public;
grant execute on function public.finance_dataset() to authenticated;
commit;
