-- KSA SAFETY BOARD Safety Vision foundation
-- No demo rows. Browser-facing integrations must use a real gateway; raw RTSP credentials never belong here.

create type public.vision_device_status as enum ('registered', 'provisioning', 'active', 'degraded', 'offline', 'maintenance', 'revoked', 'retired');
create type public.vision_camera_status as enum ('online', 'offline', 'warning', 'degraded', 'maintenance', 'disabled', 'unknown');
create type public.vision_alert_severity as enum ('low', 'medium', 'high', 'critical');
create type public.vision_alert_status as enum ('open', 'acknowledged', 'under_review', 'resolved', 'false_positive');
create type public.vision_rule_status as enum ('draft', 'active', 'paused', 'retired');

create table public.vision_devices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),
  device_identifier text not null check (length(device_identifier) between 1 and 160),
  device_type text not null,
  site text,
  zone text,
  status public.vision_device_status not null default 'registered',
  firmware_version text,
  last_seen_at timestamptz,
  heartbeat_at timestamptz,
  cpu_percent numeric(5,2) check (cpu_percent between 0 and 100),
  memory_percent numeric(5,2) check (memory_percent between 0 and 100),
  temperature_c numeric(6,2),
  storage_percent numeric(5,2) check (storage_percent between 0 and 100),
  network_quality text,
  provisioning_state text not null default 'unprovisioned',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (org_id, device_identifier)
);
create index vision_devices_org_status_idx on public.vision_devices(org_id, status, last_seen_at desc);

create table public.vision_cameras (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  device_id uuid references public.vision_devices(id) on delete set null,
  name text not null check (length(name) between 1 and 160),
  name_en text,
  site text,
  building text,
  floor text,
  area text,
  zone text,
  camera_type text not null,
  manufacturer text,
  model text,
  serial_number text,
  status public.vision_camera_status not null default 'unknown',
  network_reachable boolean,
  stream_healthy boolean,
  analytics_healthy boolean,
  gateway_reference text,
  nvr_channel text,
  recording_enabled boolean not null default false,
  analytics_enabled boolean not null default false,
  last_seen_at timestamptz,
  last_frame_at timestamptz,
  reconnect_count integer not null default 0 check (reconnect_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index vision_cameras_org_status_idx on public.vision_cameras(org_id, status, last_seen_at desc);
create index vision_cameras_device_idx on public.vision_cameras(device_id);

create table public.vision_alerts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  camera_id uuid references public.vision_cameras(id) on delete set null,
  device_id uuid references public.vision_devices(id) on delete set null,
  event_key text not null,
  violation_type text not null,
  severity public.vision_alert_severity not null,
  status public.vision_alert_status not null default 'open',
  confidence numeric(5,2) check (confidence between 0 and 100),
  zone text,
  plant text,
  detected_at timestamptz not null,
  acknowledged_at timestamptz,
  acknowledged_by uuid references auth.users(id) on delete set null,
  source_event_id text,
  model_version text,
  evidence_attachment_id uuid references public.attachments(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, event_key)
);
create index vision_alerts_org_status_idx on public.vision_alerts(org_id, status, severity, detected_at desc);
create index vision_alerts_camera_idx on public.vision_alerts(camera_id, detected_at desc);

create table public.vision_recordings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  camera_id uuid not null references public.vision_cameras(id) on delete cascade,
  alert_id uuid references public.vision_alerts(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  availability text not null default 'metadata_only',
  storage_reference text,
  thumbnail_reference text,
  retention_until timestamptz,
  legal_hold boolean not null default false,
  export_status text not null default 'not_requested',
  created_at timestamptz not null default timezone('utc', now()),
  check (ended_at is null or ended_at >= started_at)
);
create index vision_recordings_camera_time_idx on public.vision_recordings(org_id, camera_id, started_at desc);

create table public.vision_restricted_zones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),
  zone_type text not null check (zone_type in ('polygon', 'rectangle', 'line_crossing')),
  camera_id uuid references public.vision_cameras(id) on delete cascade,
  geometry jsonb not null default '{}'::jsonb,
  severity public.vision_alert_severity not null default 'high',
  schedule jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index vision_zones_org_active_idx on public.vision_restricted_zones(org_id, active);

create table public.vision_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),
  module text not null default 'vision',
  detection text not null,
  conditions jsonb not null default '{}'::jsonb,
  severity public.vision_alert_severity not null default 'medium',
  notification_config jsonb not null default '{}'::jsonb,
  hse_automation_config jsonb not null default '{}'::jsonb,
  status public.vision_rule_status not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index vision_rules_org_status_idx on public.vision_rules(org_id, status);

create table public.vision_audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_values jsonb not null default '{}'::jsonb,
  after_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index vision_audit_logs_org_created_idx on public.vision_audit_logs(org_id, created_at desc);

create trigger vision_devices_set_updated_at before update on public.vision_devices for each row execute procedure public.set_updated_at();
create trigger vision_cameras_set_updated_at before update on public.vision_cameras for each row execute procedure public.set_updated_at();
create trigger vision_zones_set_updated_at before update on public.vision_restricted_zones for each row execute procedure public.set_updated_at();
create trigger vision_rules_set_updated_at before update on public.vision_rules for each row execute procedure public.set_updated_at();

alter table public.vision_devices enable row level security;
alter table public.vision_cameras enable row level security;
alter table public.vision_alerts enable row level security;
alter table public.vision_recordings enable row level security;
alter table public.vision_restricted_zones enable row level security;
alter table public.vision_rules enable row level security;
alter table public.vision_audit_logs enable row level security;

create policy "vision members read devices" on public.vision_devices for select to authenticated using (public.is_org_member(org_id, null::public.organization_role[]));
create policy "vision operators manage devices" on public.vision_devices for all to authenticated using (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer']::public.organization_role[])) with check (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer']::public.organization_role[]));
create policy "vision members read cameras" on public.vision_cameras for select to authenticated using (public.is_org_member(org_id, null::public.organization_role[]));
create policy "vision operators manage cameras" on public.vision_cameras for all to authenticated using (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer']::public.organization_role[])) with check (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer']::public.organization_role[]));
create policy "vision members read alerts" on public.vision_alerts for select to authenticated using (public.is_org_member(org_id, null::public.organization_role[]));
create policy "vision operators update alerts" on public.vision_alerts for update to authenticated using (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer','supervisor']::public.organization_role[])) with check (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer','supervisor']::public.organization_role[]));
create policy "vision members read recordings" on public.vision_recordings for select to authenticated using (public.is_org_member(org_id, null::public.organization_role[]));
create policy "vision operators manage zones" on public.vision_restricted_zones for all to authenticated using (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer']::public.organization_role[])) with check (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager','safety_officer']::public.organization_role[]));
create policy "vision members read rules" on public.vision_rules for select to authenticated using (public.is_org_member(org_id, null::public.organization_role[]));
create policy "vision managers manage rules" on public.vision_rules for all to authenticated using (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager']::public.organization_role[])) with check (public.is_org_member(org_id, array['platform_owner','org_admin','safety_manager']::public.organization_role[]));
create policy "vision members read audit logs" on public.vision_audit_logs for select to authenticated using (public.is_org_member(org_id, null::public.organization_role[]));
create policy "vision operators append audit logs" on public.vision_audit_logs for insert to authenticated with check (public.is_org_member(org_id, null::public.organization_role[]) and actor_id = auth.uid());
