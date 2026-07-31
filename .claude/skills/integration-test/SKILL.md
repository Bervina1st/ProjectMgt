---
name: integration-test
description: Test a full pipeline slice — webhook → normalize → store → digest → generate — against an ephemeral Postgres with providers mocked. Use after wiring a pipeline path.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Prove end-to-end pipeline correctness.

Steps:
1. Stand up an ephemeral/local Postgres (Supabase local / testcontainers); seed via `/seed-data`.
2. Mock provider APIs with MSW; drive the pipeline path under test.
3. Assert correct normalization, idempotency on re-delivery, and expected report output.
4. Keep it deterministic; no live external calls.

Docs: https://supabase.com/docs/guides/local-development · https://mswjs.io/ · https://node.testcontainers.org/
