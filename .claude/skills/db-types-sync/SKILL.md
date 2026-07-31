---
name: db-types-sync
description: Regenerate TypeScript types from the live Supabase schema so app and worker share accurate DB types. Use after any migration.
allowed-tools: Read, Write, Bash
---

Regenerate DB types after a schema change.

Steps:
1. Run `supabase gen types typescript` against the current schema.
2. Write the output to the generated types file in `packages/db/` consumed by `packages/shared`.
3. Confirm the app and worker typecheck against the new types.

Docs: https://supabase.com/docs/guides/api/rest/generating-types
