-- ============================================================
-- Move tenancy helper functions into a non-API-exposed `private` schema.
-- They must stay SECURITY DEFINER (to avoid RLS recursion when reading
-- memberships), so instead of exposing them as REST RPCs we relocate them
-- out of the `public` schema and grant execute only to `authenticated`.
-- ============================================================

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    join public.users u on u.id = m.user_id
    where m.org_id = target_org and u.auth_id = auth.uid()
  )
$$;

create or replace function private.shares_org(target_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m1
    join public.memberships m2 on m1.org_id = m2.org_id
    join public.users u on u.id = m1.user_id
    where u.auth_id = auth.uid() and m2.user_id = target_user
  )
$$;

revoke execute on function private.is_org_member(uuid) from public;
revoke execute on function private.shares_org(uuid) from public;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.shares_org(uuid) to authenticated;

-- Re-point every policy at the private helpers, then drop the public ones.
drop policy sel_orgs on public.orgs;
create policy sel_orgs on public.orgs for select to authenticated using (private.is_org_member(id));

drop policy sel_users on public.users;
create policy sel_users on public.users for select to authenticated using (auth_id = auth.uid() or private.shares_org(id));

drop policy sel_memberships on public.memberships;
create policy sel_memberships on public.memberships for select to authenticated using (private.is_org_member(org_id));

drop policy sel_integrations on public.integrations;
create policy sel_integrations on public.integrations for select to authenticated using (private.is_org_member(org_id));

drop policy sel_projects on public.projects;
create policy sel_projects on public.projects for select to authenticated using (private.is_org_member(org_id));

drop policy sel_project_integrations on public.project_integrations;
create policy sel_project_integrations on public.project_integrations for select to authenticated using (exists (select 1 from public.projects p where p.id = project_id and private.is_org_member(p.org_id)));

drop policy sel_identities on public.identities;
create policy sel_identities on public.identities for select to authenticated using (private.is_org_member(org_id));

drop policy sel_identity_links on public.identity_links;
create policy sel_identity_links on public.identity_links for select to authenticated using (exists (select 1 from public.identities i where i.id = identity_id and private.is_org_member(i.org_id)));

drop policy sel_activity_events on public.activity_events;
create policy sel_activity_events on public.activity_events for select to authenticated using (private.is_org_member(org_id));

drop policy sel_risk_flags on public.risk_flags;
create policy sel_risk_flags on public.risk_flags for select to authenticated using (private.is_org_member(org_id));

drop policy sel_report_schedules on public.report_schedules;
create policy sel_report_schedules on public.report_schedules for select to authenticated using (private.is_org_member(org_id));

drop policy sel_reports on public.reports;
create policy sel_reports on public.reports for select to authenticated using (private.is_org_member(org_id));

drop policy sel_report_versions on public.report_versions;
create policy sel_report_versions on public.report_versions for select to authenticated using (exists (select 1 from public.reports r where r.id = report_id and private.is_org_member(r.org_id)));

drop policy sel_audit_log on public.audit_log;
create policy sel_audit_log on public.audit_log for select to authenticated using (org_id is not null and private.is_org_member(org_id));

drop function public.is_org_member(uuid);
drop function public.shares_org(uuid);
