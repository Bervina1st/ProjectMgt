---
name: scheduled-job
description: Define a durable pg-boss job — scheduled (report cadence) or queued (ingest/generation) — that runs in the Railway worker, timezone-correct and idempotent. Use for background work that must not run in serverless functions.
argument-hint: [job name] [trigger]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Register a durable worker job (PRD Epic B/D; tech-stack §2).

Steps:
1. Define the job handler in `apps/worker` with a retry policy.
2. For scheduled jobs, compute cadence in the PM's timezone (store UTC); for queued jobs, enqueue from webhooks/API.
3. Make handlers idempotent — re-delivery must be safe.
4. Surface failures via `/structured-logging-audit`; expose failed state.

Long/bursty jobs belong here, never in Netlify functions.

Docs: https://github.com/timgit/pg-boss/blob/master/docs/readme.md
