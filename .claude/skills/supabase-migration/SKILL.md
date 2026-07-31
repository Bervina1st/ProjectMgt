---
name: supabase-migration
description: Author and apply a version-controlled Supabase/Postgres migration (table, column, enum CHECK, index) that conforms to PRD §4. Use when a task needs a schema change, a new table, or an index.
argument-hint: [change description]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Author a version-controlled migration that matches `research/PRD.md` §4.

Steps:
1. Read the relevant PRD §4 table definition and the existing migration history under `packages/db/migrations/`.
2. Write a new timestamped SQL migration file. Use `CHECK` constraints for all enums; add only the indexes PRD §4 specifies for hot paths.
3. For any tenant-scoped table, the migration MUST add `org_id` and you MUST also invoke `/rls-policy` for it (a tenant table without RLS is incomplete).
4. Make ingest tables idempotent (unique tuple + `ON CONFLICT DO NOTHING`).
5. Apply to the DEV branch only, then invoke `/db-types-sync`.
6. Notify testing to add an `/rls-isolation-test` for new tenant tables.

Never run ad-hoc DDL against a shared/prod database. Dropping columns/tables or any destructive change is irreversible — stop and escalate before doing it.

Docs: https://supabase.com/docs/guides/deployment/database-migrations · https://www.postgresql.org/docs/current/ddl.html
