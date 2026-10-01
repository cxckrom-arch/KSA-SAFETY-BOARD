-- Restore the shared organization-membership helper required by RLS policies.
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
