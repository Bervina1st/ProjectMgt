# @pmstatus/db

Supabase schema, migrations, RLS policies, and generated types for
PM Status Autopilot / Statuscope (PRD §4). Applied to the Supabase project
**my-statuscope-app** (`nihtdxrjymkjdskjrcsf`).

## Contents
- `migrations/` — version-controlled SQL, applied in order:
  - `0001_init_schema.sql` — 14 tables, enums (CHECK), indexes, default-deny RLS + org-scoped SELECT policies.
  - `0002_harden_helpers_private_schema.sql` — moves the `is_org_member` / `shares_org` tenancy helpers into a non-API-exposed `private` schema (security-advisor clean).
- `types.ts` — TypeScript types generated from the live schema. **Regenerate after any migration** (see the `db-types-sync` skill); do not edit by hand.

## Status (roadmap M1 — Data Foundation & Tenancy)
- ✅ Schema + RLS applied; security advisor returns zero lints.
- ✅ Cross-tenant isolation verified (an Org-A user sees only Org-A rows).
- ✅ Types generated.
- ⏳ Next: seed data + an automated RLS isolation test in a Vitest harness (testing-agent), and write policies (INSERT/UPDATE/DELETE) with role-authz.

## Tenancy model
Every tenant table has `org_id`, RLS enabled, and a default-deny posture: reads are
scoped to the caller's org via `private.is_org_member(org_id)`. Writes currently go
through the `service_role` (server/worker); role-based write policies land with `role-authz`.
