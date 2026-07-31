# @pmstatus/db — DEFERRED

Reserved workspace for the Supabase schema, migrations, RLS policies, and generated types
(PRD §4). **Intentionally empty for the frontend MVP** — the current prototype has no database.

Lands in **roadmap M1 (Data Foundation & Tenancy)**. When it does:
- Migrations under `migrations/` via the Supabase CLI
- RLS default-deny on every tenant table + isolation tests
- Generated types consumed by `@pmstatus/shared`

See `research/PRD.md` §4 and `research/roadmap.md` M1.
