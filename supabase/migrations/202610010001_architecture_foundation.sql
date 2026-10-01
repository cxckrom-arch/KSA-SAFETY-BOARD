-- KSA SAFETY BOARD shared foundation
-- Apply through the Supabase migration workflow. No seed/demo records are created.

create extension if not exists pgcrypto;

create type public.organization_role as enum (
  'platform_owner',
  'org_admin',
  'safety_manager',
  'safety_officer',
  'supervisor',
  'employee',
  'viewer'
);

create type public.action_status as enum (
  'open',
  'assigned',
  'in_progress',
  'pending_verification',
  'closed',
  'reopened'
);

create type public.action_priority as enum ('low', 'medium', 'high', 'critical');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  default_locale text not null default 'ar' check (default_locale in ('ar', 'en')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_locale text not null default 'ar' check (preferred_locale in ('ar', 'en')),
  is_locked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (org_id, user_id)
);

create index organization_members_user_idx on public.organization_members(user_id, org_id);

create or replace function public.is_org_member(
  target_org_id uuid,
  allowed_roles public.organization_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.org_id = target_org_id
      and om.user_id = auth.uid()
      and (allowed_roles is null or om.role = any(allowed_roles))
  );
$$;

revoke all on function public.is_org_member(uuid, public.organization_role[]) from public;
grant execute on function public.is_org_member(uuid, public.organization_role[]) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations
  for each row execute procedure public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  event_type text not null,
  previous_values jsonb not null default '{}'::jsonb,
  new_values jsonb not null default '{}'::jsonb,
  request_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index audit_events_org_created_idx on public.audit_events(org_id, created_at desc);
create index audit_events_entity_idx on public.audit_events(entity_type, entity_id, created_at desc);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  storage_path text not null,
  file_name text not null check (length(file_name) between 1 and 255),
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, storage_path)
);

create index attachments_entity_idx on public.attachments(org_id, entity_type, entity_id);

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  action_number bigint generated always as identity,
  source_type text not null,
  source_id uuid,
  title text not null check (length(title) between 1 and 240),
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  priority public.action_priority not null default 'medium',
  status public.action_status not null default 'open',
  due_at timestamptz,
  verification_notes text,
  closed_at timestamptz,
  closed_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index actions_org_status_idx on public.actions(org_id, status, due_at);
create index actions_owner_status_idx on public.actions(owner_id, status, due_at);
create index actions_source_idx on public.actions(source_type, source_id);

create trigger actions_set_updated_at before update on public.actions
  for each row execute procedure public.set_updated_at();

create table public.action_events (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references public.actions(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  from_status public.action_status,
  to_status public.action_status not null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index action_events_action_idx on public.action_events(action_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index notifications_recipient_idx on public.notifications(recipient_id, read_at, created_at desc);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.audit_events enable row level security;
alter table public.attachments enable row level security;
alter table public.actions enable row level security;
alter table public.action_events enable row level security;
alter table public.notifications enable row level security;

create policy "members can read organizations"
  on public.organizations for select to authenticated
  using (public.is_org_member(id));

create policy "users can read their profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "users can update their profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "members can read memberships"
  on public.organization_members for select to authenticated
  using (public.is_org_member(org_id));

create policy "org admins can manage memberships"
  on public.organization_members for all to authenticated
  using (public.is_org_member(org_id, array['platform_owner', 'org_admin']::public.organization_role[]))
  with check (public.is_org_member(org_id, array['platform_owner', 'org_admin']::public.organization_role[]));

create policy "members can read audit events"
  on public.audit_events for select to authenticated
  using (public.is_org_member(org_id));

create policy "members can create audit events"
  on public.audit_events for insert to authenticated
  with check (public.is_org_member(org_id) and actor_id = auth.uid());

create policy "members can read attachment metadata"
  on public.attachments for select to authenticated
  using (public.is_org_member(org_id));

create policy "safety roles can create attachment metadata"
  on public.attachments for insert to authenticated
  with check (public.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer']::public.organization_role[]) and uploaded_by = auth.uid());

create policy "members can read actions"
  on public.actions for select to authenticated
  using (public.is_org_member(org_id));

create policy "safety roles can create actions"
  on public.actions for insert to authenticated
  with check (public.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer']::public.organization_role[]) and created_by = auth.uid());

create policy "authorized roles can update actions"
  on public.actions for update to authenticated
  using (public.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer', 'supervisor']::public.organization_role[]))
  with check (public.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer', 'supervisor']::public.organization_role[]));

create policy "members can read action events"
  on public.action_events for select to authenticated
  using (public.is_org_member(org_id));

create policy "authorized roles can create action events"
  on public.action_events for insert to authenticated
  with check (public.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer', 'supervisor']::public.organization_role[]) and actor_id = auth.uid());

create policy "recipients can read notifications"
  on public.notifications for select to authenticated
  using (public.is_org_member(org_id) and recipient_id = auth.uid());

create policy "recipients can mark notifications read"
  on public.notifications for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());
