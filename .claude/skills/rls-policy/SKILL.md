---
name: rls-policy
description: Write and verify default-deny Row-Level Security policies for a tenant-scoped table so isolation is DB-enforced. Use whenever a new tenant table is created or its access rules change.
argument-hint: [table] [access rules]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Make tenant isolation DB-enforced, not app-logic-dependent (PRD §4, §6).

Steps:
1. `ENABLE ROW LEVEL SECURITY` on the table.
2. Start default-deny; add explicit policies keyed on the caller's `org_id`, resolved via `memberships`.
3. Gate writes by role where required (owner/admin/member/viewer).
4. Add the policy SQL to a migration (via `/supabase-migration`).
5. Require an `/rls-isolation-test` proving cross-org reads return zero rows — the change is not done without it.

Security-critical: never weaken or bypass RLS on a tenant table. Route the result to security-review.

Docs: https://supabase.com/docs/guides/database/postgres/row-level-security · https://www.postgresql.org/docs/current/ddl-rowsecurity.html
