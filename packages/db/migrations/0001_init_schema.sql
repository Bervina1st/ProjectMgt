-- ============================================================
-- PM Status Autopilot / Statuscope — initial schema (PRD §4)
-- Multi-tenant, RLS default-deny, org-scoped.
-- Applied to Supabase project: my-statuscope-app (nihtdxrjymkjdskjrcsf)
-- ============================================================

-- ---------------- tables (FK-ordered) ----------------

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  provider text not null check (provider in ('jira','github','slack','gcal','msteams','mscal')),
  external_account_id text,
  access_token_enc bytea not null,
  refresh_token_enc bytea,
  token_expires_at timestamptz,
  scopes text[],
  status text not null default 'active' check (status in ('active','needs_reauth','error','revoked')),
  created_at timestamptz not null default now(),
  unique (org_id, provider, external_account_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  external_ref jsonb,
  settings jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.project_integrations (
  project_id uuid not null references public.projects(id) on delete cascade,
  integration_id uuid not null references public.integrations(id) on delete cascade,
  config jsonb,
  primary key (project_id, integration_id)
);

create table if not exists public.identities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  display_name text,
  primary_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.identity_links (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid not null references public.identities(id) on delete cascade,
  provider text not null,
  external_handle text not null,
  unique (provider, external_handle)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  provider text not null,
  event_type text not null,
  entity_type text,
  entity_ref text,
  actor_identity_id uuid references public.identities(id) on delete set null,
  occurred_at timestamptz not null,
  payload jsonb not null,
  ingested_at timestamptz not null default now(),
  unique (provider, entity_ref, event_type, occurred_at)
);

create table if not exists public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  rule_id text not null,
  severity text not null check (severity in ('low','medium','high')),
  entity_ref text,
  evidence jsonb not null,
  status text not null default 'open' check (status in ('open','acknowledged','resolved','dismissed')),
  first_detected_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.report_schedules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  cadence text not null check (cadence in ('weekly','biweekly','daily')),
  day_of_week int,
  time_local time,
  timezone text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  period_start timestamptz,
  period_end timestamptz,
  state text not null default 'draft' check (state in ('draft','edited','approved','sent','failed')),
  generated_by text check (generated_by in ('schedule','manual')),
  digest jsonb,
  cost_cents numeric,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  sent_at timestamptz
);

create table if not exists public.report_versions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  audience text not null,
  content_md text not null,
  content_json jsonb,
  edited_by uuid references public.users(id) on delete set null,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

-- audit_log keeps history even if the org/user is deleted (set null, not cascade).
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------------- indexes (PRD §4 hot paths) ----------------
create index if not exists idx_activity_events_project_time on public.activity_events (project_id, occurred_at desc);
create index if not exists idx_activity_events_org_time on public.activity_events (org_id, occurred_at desc);
create index if not exists idx_risk_flags_open on public.risk_flags (project_id) where status = 'open';
create index if not exists idx_reports_project_time on public.reports (project_id, created_at desc);
create index if not exists idx_memberships_user on public.memberships (user_id);
create index if not exists idx_memberships_org on public.memberships (org_id);
create index if not exists idx_integrations_org_provider on public.integrations (org_id, provider);

-- partial unique: one OPEN risk flag per (project, rule, entity)
create unique index if not exists uq_risk_flags_open on public.risk_flags (project_id, rule_id, entity_ref) where status = 'open';
-- partial unique: exactly one current version per (report, audience)
create unique index if not exists uq_report_versions_current on public.report_versions (report_id, audience) where is_current;

-- ---------------- tenancy helpers (security definer to avoid RLS recursion) ----------------
create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    join public.users u on u.id = m.user_id
    where m.org_id = target_org and u.auth_id = auth.uid()
  )
$$;

create or replace function public.shares_org(target_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m1
    join public.memberships m2 on m1.org_id = m2.org_id
    join public.users u on u.id = m1.user_id
    where u.auth_id = auth.uid() and m2.user_id = target_user
  )
$$;

-- ---------------- RLS: enable + default-deny + org-scoped SELECT ----------------
-- Enabling RLS with no permissive policy denies all access to anon/authenticated;
-- the service_role bypasses RLS for server/worker writes. SELECT policies below scope
-- reads to the caller's org(s). Write policies (role-based) land with role-authz.

alter table public.orgs                 enable row level security;
alter table public.users                enable row level security;
alter table public.memberships          enable row level security;
alter table public.integrations         enable row level security;
alter table public.projects             enable row level security;
alter table public.project_integrations enable row level security;
alter table public.identities           enable row level security;
alter table public.identity_links       enable row level security;
alter table public.activity_events      enable row level security;
alter table public.risk_flags           enable row level security;
alter table public.report_schedules     enable row level security;
alter table public.reports              enable row level security;
alter table public.report_versions      enable row level security;
alter table public.audit_log            enable row level security;

create policy sel_orgs on public.orgs
  for select to authenticated using (public.is_org_member(id));

create policy sel_users on public.users
  for select to authenticated using (auth_id = auth.uid() or public.shares_org(id));

create policy sel_memberships on public.memberships
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_integrations on public.integrations
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_projects on public.projects
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_project_integrations on public.project_integrations
  for select to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id))
  );

create policy sel_identities on public.identities
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_identity_links on public.identity_links
  for select to authenticated using (
    exists (select 1 from public.identities i where i.id = identity_id and public.is_org_member(i.org_id))
  );

create policy sel_activity_events on public.activity_events
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_risk_flags on public.risk_flags
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_report_schedules on public.report_schedules
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_reports on public.reports
  for select to authenticated using (public.is_org_member(org_id));

create policy sel_report_versions on public.report_versions
  for select to authenticated using (
    exists (select 1 from public.reports r where r.id = report_id and public.is_org_member(r.org_id))
  );

create policy sel_audit_log on public.audit_log
  for select to authenticated using (org_id is not null and public.is_org_member(org_id));
