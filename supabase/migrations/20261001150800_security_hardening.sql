-- Keep SECURITY DEFINER helpers outside the exposed public API schema.
create schema if not exists private;

create or replace function private.is_org_member(
  target_org_id uuid,
  allowed_roles public.organization_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.org_id = target_org_id
      and om.user_id = auth.uid()
      and (allowed_roles is null or om.role = any(allowed_roles))
  );
$$;

revoke all on function private.is_org_member(uuid, public.organization_role[]) from public;
grant execute on function private.is_org_member(uuid, public.organization_role[]) to authenticated;

-- Repoint every tenant-scoped policy to the private helper, then remove the
-- equivalent public RPC function from the exposed schema.
drop policy "members can read organizations" on public.organizations;
drop policy "members can read memberships" on public.organization_members;
drop policy "org admins can manage memberships" on public.organization_members;
drop policy "members can read audit events" on public.audit_events;
drop policy "members can create audit events" on public.audit_events;
drop policy "members can read attachment metadata" on public.attachments;
drop policy "safety roles can create attachment metadata" on public.attachments;
drop policy "members can read actions" on public.actions;
drop policy "safety roles can create actions" on public.actions;
drop policy "authorized roles can update actions" on public.actions;
drop policy "members can read action events" on public.action_events;
drop policy "authorized roles can create action events" on public.action_events;
drop policy "recipients can read notifications" on public.notifications;
drop policy "recipients can mark notifications read" on public.notifications;

create policy "members can read organizations"
  on public.organizations for select to authenticated
  using (private.is_org_member(id));

create policy "members can read memberships"
  on public.organization_members for select to authenticated
  using (private.is_org_member(org_id));

create policy "org admins can manage memberships"
  on public.organization_members for all to authenticated
  using (private.is_org_member(org_id, array['platform_owner', 'org_admin']::public.organization_role[]))
  with check (private.is_org_member(org_id, array['platform_owner', 'org_admin']::public.organization_role[]));

create policy "members can read audit events"
  on public.audit_events for select to authenticated
  using (private.is_org_member(org_id));

create policy "members can create audit events"
  on public.audit_events for insert to authenticated
  with check (private.is_org_member(org_id) and actor_id = auth.uid());

create policy "members can read attachment metadata"
  on public.attachments for select to authenticated
  using (private.is_org_member(org_id));

create policy "safety roles can create attachment metadata"
  on public.attachments for insert to authenticated
  with check (private.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer']::public.organization_role[]) and uploaded_by = auth.uid());

create policy "members can read actions"
  on public.actions for select to authenticated
  using (private.is_org_member(org_id));

create policy "safety roles can create actions"
  on public.actions for insert to authenticated
  with check (private.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer']::public.organization_role[]) and created_by = auth.uid());

create policy "authorized roles can update actions"
  on public.actions for update to authenticated
  using (private.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer', 'supervisor']::public.organization_role[]))
  with check (private.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer', 'supervisor']::public.organization_role[]));

create policy "members can read action events"
  on public.action_events for select to authenticated
  using (private.is_org_member(org_id));

create policy "authorized roles can create action events"
  on public.action_events for insert to authenticated
  with check (private.is_org_member(org_id, array['platform_owner', 'org_admin', 'safety_manager', 'safety_officer', 'supervisor']::public.organization_role[]) and actor_id = auth.uid());

create policy "recipients can read notifications"
  on public.notifications for select to authenticated
  using (private.is_org_member(org_id) and recipient_id = auth.uid());

create policy "recipients can mark notifications read"
  on public.notifications for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

drop function public.is_org_member(uuid, public.organization_role[]);

-- Trigger-only helper: never expose it as a callable API function.
alter function public.handle_new_user() set search_path = public, pg_temp;
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- Stable trigger helper search path.
alter function public.set_updated_at() set search_path = public, pg_temp;
