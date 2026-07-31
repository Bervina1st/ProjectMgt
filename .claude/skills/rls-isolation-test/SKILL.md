---
name: rls-isolation-test
description: Security test asserting cross-tenant reads return ZERO rows under RLS. Use for EVERY tenant table — a failing or missing test blocks merge.
argument-hint: [table]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Prove tenant isolation is DB-enforced (PRD §6 — non-negotiable).

Steps:
1. Seed two orgs (A and B) with `/seed-data`.
2. Authenticated as org B via the app role, attempt to read org A's rows in the table.
3. Assert the result is ZERO rows.
4. Repeat for read and write paths. A missing test for a tenant table is an incomplete change.

Docs: https://supabase.com/docs/guides/database/postgres/row-level-security#testing-policies
