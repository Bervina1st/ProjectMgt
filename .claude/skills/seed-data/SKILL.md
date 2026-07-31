---
name: seed-data
description: Generate realistic seed/fixture data (orgs, projects, normalized activity_events, risk_flags) that respects FKs, enums, and tenancy. Use for local dev and as fixtures for integration/isolation tests.
argument-hint: [scenario]
allowed-tools: Read, Write, Edit, Bash
---

Produce valid multi-tenant fixture data.

Steps:
1. Take a scenario (e.g. "a project with a done-but-PR-open contradiction", "an overdue critical item").
2. Generate rows that respect FKs, CHECK enums, and `org_id` tenancy, using faker for variety.
3. Emit a seed script/SQL that loads cleanly into a fresh DB.
4. Include at least two orgs when the fixture is for isolation tests.

Docs: https://supabase.com/docs/guides/local-development/seeding-your-database · https://fakerjs.dev/
