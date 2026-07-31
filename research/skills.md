# Skills Inventory — PM Status Autopilot

**Date:** 2026-07-30
**Derived from:** [`PRD.md`](./PRD.md) · [`tech-stack.md`](./tech-stack.md)
**Format basis:** [Claude Code Skills docs](https://code.claude.com/docs/en/skills) (the Anthropic docs URL 301-redirects here).

## How to read this

Each entry below is a candidate **Claude Code skill** — a repeatable, project-specific procedure we'd codify as `.claude/skills/<name>/SKILL.md` so any future session (or teammate) executes it consistently. Skills load **on demand** (unlike CLAUDE.md facts, which load every session), so they're the right home for multi-step build procedures.

**SKILL.md shape we'll use** (from the docs): a directory `.claude/skills/<name>/` containing `SKILL.md` with YAML frontmatter (`description` is the key field — put the use case first; optional `name`, `argument-hint`, `allowed-tools`, `disable-model-invocation`, `context: fork`, `paths`). Body states *what to do*, concisely. Supporting files (templates, scripts, examples) live beside it and load only when referenced.

> **Exhaustiveness note (as requested):** this lists more skills than the MVP strictly needs. §12 explicitly marks the ones we should **not** build yet, so the over-identification is deliberate, not scope creep.

---

## Summary table

| # | Skill | Category | Complexity | MVP? |
|---|---|---|---|---|
| 1 | `supabase-migration` | Database | Moderate | P0 |
| 2 | `rls-policy` | Database / Security | Complex | P0 |
| 3 | `db-types-sync` | Database | Simple | P0 |
| 4 | `seed-data` | Database | Simple | P0 |
| 5 | `supabase-auth-flow` | Auth | Moderate | P0 |
| 6 | `oauth-integration` | Auth / Integration | Complex | P0 |
| 7 | `role-authz` | Auth | Moderate | P0 (basic) |
| 8 | `provider-adapter` | Integration | Complex | P0 (Jira) |
| 9 | `webhook-receiver` | Integration / Security | Complex | P0 |
| 10 | `rate-limit-aware-client` | Integration | Moderate | P0 |
| 11 | `identity-resolution` | Integration / Domain | Complex | P1 |
| 12 | `risk-rule` | Domain | Moderate | P0 |
| 13 | `report-digest-builder` | Domain | Complex | P0 |
| 14 | `llm-report-generation` | Domain / AI | Complex | P0 |
| 15 | `scheduled-job` | Backend/Infra | Moderate | P0 |
| 16 | `trpc-endpoint` | Backend/Frontend | Moderate | P0 |
| 17 | `react-component` | Frontend | Moderate | P0 |
| 18 | `report-editor` | Frontend | Complex | P0 |
| 19 | `responsive-a11y-check` | Frontend / QA | Moderate | P0 |
| 20 | `zod-schema` | Validation | Simple | P0 |
| 21 | `unit-test` | Testing | Simple | P0 |
| 22 | `integration-test` | Testing | Complex | P0 |
| 23 | `rls-isolation-test` | Testing / Security | Complex | P0 |
| 24 | `error-handling` | Error handling | Moderate | P0 |
| 25 | `structured-logging-audit` | Logging / Security | Moderate | P0 |
| 26 | `cost-and-lag-observability` | Observability | Moderate | P1 |
| 27 | `netlify-deploy` | Deployment | Moderate | P0 |
| 28 | `railway-worker-deploy` | Deployment | Moderate | P0 |
| 29 | `ci-pipeline` | Deployment | Moderate | P0 |
| 30 | `env-management` | Infra / Security | Simple | P0 |
| 31 | `api-docs-gen` | Documentation | Simple | P1 |
| 32 | `update-project-memory` | Documentation | Simple | P0 |

---

## 1. Database Operations

### 1. `supabase-migration`
- **Description:** Author and apply a version-controlled Supabase/Postgres migration (new table, column, enum CHECK, index) that conforms to the PRD §4 schema, then regenerate types.
- **Input:** The schema change intent; the relevant PRD §4 table definition; existing migration history.
- **Output:** A new SQL migration file under `packages/db/migrations/`, applied to the dev branch; updated generated types.
- **Dependencies:** *Libs:* Supabase CLI, `postgres`/`pg`. *APIs:* Supabase. *Skills:* → `db-types-sync`, → `rls-policy` (any new tenant table).
- **Docs:** [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations) · [Postgres DDL](https://www.postgresql.org/docs/current/ddl.html)
- **Complexity:** Moderate
- **Example:** `/supabase-migration add report_versions table per PRD §4`

### 2. `rls-policy`
- **Description:** Write and verify Row-Level Security policies for a tenant-scoped table — default-deny, org resolved via `memberships` — so isolation is DB-enforced.
- **Input:** Table name + its `org_id` column; the access rules (which roles read/write).
- **Output:** `ENABLE ROW LEVEL SECURITY` + policy SQL in a migration; a note linking to the isolation test (skill 23).
- **Dependencies:** *Libs:* Supabase CLI. *APIs:* Supabase. *Skills:* ← `supabase-migration`, → `rls-isolation-test`.
- **Docs:** [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) · [Postgres RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- **Complexity:** Complex (security-critical — must never be skipped on a tenant table)
- **Example:** `/rls-policy activity_events read for org members, write service-role only`

### 3. `db-types-sync`
- **Description:** Regenerate TypeScript types from the live Supabase schema so the app + worker share accurate DB types.
- **Input:** Current Supabase schema (post-migration).
- **Output:** Updated `packages/db/types.ts` (or generated file) consumed by `packages/shared`.
- **Dependencies:** *Libs:* Supabase CLI / `supabase gen types`. *APIs:* Supabase. *Skills:* ← `supabase-migration`.
- **Docs:** [Generating types](https://supabase.com/docs/guides/api/rest/generating-types)
- **Complexity:** Simple
- **Example:** `/db-types-sync`

### 4. `seed-data`
- **Description:** Generate realistic seed/fixture data (orgs, projects, normalized `activity_events`, risk_flags) that respects FKs, enums, and tenancy — for local dev and tests.
- **Input:** Target tables + volume; a scenario (e.g., "a project with a done-but-PR-open contradiction").
- **Output:** Seed script/SQL producing valid multi-tenant data.
- **Dependencies:** *Libs:* `@faker-js/faker`, Supabase CLI. *Skills:* ← schema skills.
- **Docs:** [Supabase seeding](https://supabase.com/docs/guides/local-development/seeding-your-database) · [Faker](https://fakerjs.dev/)
- **Complexity:** Simple
- **Example:** `/seed-data one org, 2 projects, 200 events incl. an overdue critical item`

---

## 2. Authentication & Authorization

### 5. `supabase-auth-flow`
- **Description:** Implement/extend Supabase magic-link auth and session propagation into tRPC context.
- **Input:** Auth requirement (login, session refresh, sign-out); the tRPC context wiring.
- **Output:** Working auth pages + a session-aware tRPC context resolving the caller's `user`/`org`.
- **Dependencies:** *Libs:* `@supabase/supabase-js`, `@supabase/ssr`, Next.js. *APIs:* Supabase Auth. *Skills:* → `role-authz`.
- **Docs:** [Supabase Auth](https://supabase.com/docs/guides/auth) · [Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- **Complexity:** Moderate
- **Example:** `/supabase-auth-flow add magic-link login + session in tRPC context`

### 6. `oauth-integration`
- **Description:** Implement a per-tenant OAuth 2.0 (3LO) connect flow for an external provider — authorize URL, state/CSRF, callback token exchange, **encrypted** token storage, and automatic refresh.
- **Input:** Provider (jira/github/slack), required scopes, redirect URI.
- **Output:** Working connect/disconnect flow; encrypted tokens in `integrations`; refresh + `needs_reauth` handling.
- **Dependencies:** *Libs:* provider SDK/OAuth lib, Supabase Vault/KMS, Zod. *APIs:* provider OAuth (Atlassian/GitHub/Slack). *Skills:* ← `supabase-auth-flow`, → `env-management`, → `error-handling`.
- **Docs:** [Atlassian OAuth 2.0 (3LO)](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/) · [GitHub OAuth](https://docs.github.com/apps/oauth-apps/building-oauth-apps) · [Slack OAuth](https://api.slack.com/authentication/oauth-v2) · [Supabase Vault](https://supabase.com/docs/guides/database/vault)
- **Complexity:** Complex (most security-sensitive plumbing — see PRD §6)
- **Example:** `/oauth-integration jira scopes=read:jira-work,read:jira-user`

### 7. `role-authz`
- **Description:** Enforce role-based authorization (owner/admin/member/viewer) on tRPC procedures via reusable middleware.
- **Input:** Procedure + minimum role required.
- **Output:** A `protectedProcedure`/role-gated middleware applied consistently.
- **Dependencies:** *Libs:* tRPC. *Skills:* ← `supabase-auth-flow`.
- **Docs:** [tRPC middleware / authorization](https://trpc.io/docs/server/middlewares)
- **Complexity:** Moderate
- **Example:** `/role-authz require admin+ on integrations.disconnect`

---

## 3. External API Integration & Ingest

### 8. `provider-adapter`
- **Description:** Build a provider adapter that fetches (backfill) and receives (webhook) a provider's activity and maps it to the **provider-normalized** `activity_events` shape — the heart of cross-tool value.
- **Input:** Provider + event kinds to support; the normalized event-type vocabulary.
- **Output:** An adapter in `packages/integrations/<provider>/` emitting normalized, idempotent events.
- **Dependencies:** *Libs:* provider SDK (Jira REST client, Octokit, `@slack/web-api`), Zod. *APIs:* provider REST. *Skills:* ← `rate-limit-aware-client`, → `identity-resolution`, → `unit-test`.
- **Docs:** [Jira Cloud REST](https://developer.atlassian.com/cloud/jira/platform/rest/v3/) · [Octokit](https://github.com/octokit/octokit.js) · [Slack Web API](https://api.slack.com/web)
- **Complexity:** Complex
- **Example:** `/provider-adapter jira: issue status changes, comments, due dates, sprints`

### 9. `webhook-receiver`
- **Description:** Implement a public webhook endpoint that **verifies the provider signature**, responds fast (<3s), and enqueues heavy processing — never processing synchronously.
- **Input:** Provider + its signature scheme; the target queue.
- **Output:** A Next.js route handler under `/api/webhooks/<provider>` with signature verification and enqueue.
- **Dependencies:** *Libs:* provider crypto (HMAC), pg-boss. *APIs:* provider webhooks. *Skills:* → `scheduled-job` (queue), → `error-handling`.
- **Docs:** [GitHub webhook validation](https://docs.github.com/webhooks/using-webhooks/validating-webhook-deliveries) · [Slack request signing](https://api.slack.com/authentication/verifying-requests-from-slack) · [Atlassian webhooks](https://developer.atlassian.com/cloud/jira/platform/webhooks/)
- **Complexity:** Complex (reject-on-invalid is mandatory — PRD §6)
- **Example:** `/webhook-receiver github verify X-Hub-Signature-256`

### 10. `rate-limit-aware-client`
- **Description:** Wrap a provider HTTP client with quota awareness: batching, exponential backoff on 429, per-integration token buckets — sized for Jira's points-based limits (enforced 2 Mar 2026).
- **Input:** Provider limit model; concurrency budget.
- **Output:** A shared client wrapper used by all adapters.
- **Dependencies:** *Libs:* `p-queue`/`bottleneck`, `undici`/fetch. *APIs:* provider REST. *Skills:* → `provider-adapter`, → `structured-logging-audit`.
- **Docs:** [Jira rate limiting](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/) · [Atlassian points-based limits](https://www.atlassian.com/blog/developer/evolving-api-rate-limits)
- **Complexity:** Moderate
- **Example:** `/rate-limit-aware-client jira points-aware, backoff on 429`

### 11. `identity-resolution`
- **Description:** Correlate people and issue keys across tools (Jira assignee ↔ GitHub author ↔ Slack user; PR/branch ↔ Jira key) into `identities`/`identity_links`. Enables the "done ticket, open PR" catch.
- **Input:** Raw actor handles/keys from adapters.
- **Output:** Resolved `actor_identity_id` on events; link records; confidence handling for near-misses.
- **Dependencies:** *Libs:* Postgres. *Skills:* ← `provider-adapter`, → `risk-rule` (cross-tool rules).
- **Docs:** [Postgres text/matching](https://www.postgresql.org/docs/current/functions-matching.html)
- **Complexity:** Complex (never 100%; wrong matches erode trust — PRD §2/§6)
- **Example:** `/identity-resolution link GitHub logins to Jira accounts for org`

---

## 4. Report Generation (Core Domain)

### 12. `risk-rule`
- **Description:** Implement a **deterministic** risk-detection rule over `activity_events` that emits a `risk_flags` row carrying its triggering evidence — never an LLM guess.
- **Input:** Rule definition (e.g., `idle_gt_threshold`, `overdue`, `done_but_pr_open`, `blocked`, `scope_added`) + thresholds.
- **Output:** A pure SQL/TS rule + tests; open/resolve lifecycle on the flag.
- **Dependencies:** *Libs:* Postgres/TS. *Skills:* ← `identity-resolution` (cross-tool rules), → `unit-test`.
- **Docs:** [Postgres queries](https://www.postgresql.org/docs/current/queries.html) — (business logic; no external API)
- **Complexity:** Moderate (this is the trust backbone — must be explainable)
- **Example:** `/risk-rule done_but_pr_open: issue Done with linked PR still open`

### 13. `report-digest-builder`
- **Description:** Compute the **compact digest** for a project+period — the pre-computed facts (moved/stuck/overdue/scope) plus open risk flags with evidence — that is the *only* thing sent to the LLM (cost + grounding control).
- **Input:** Project id, period window, current events + risk flags.
- **Output:** A structured, size-bounded `digest` JSON stored on the `reports` row.
- **Dependencies:** *Libs:* Postgres/TS, Zod. *Skills:* ← `risk-rule`, → `llm-report-generation`.
- **Docs:** — (internal domain logic)
- **Complexity:** Complex
- **Example:** `/report-digest-builder project=X period=last-7-days`

### 14. `llm-report-generation`
- **Description:** Call the Anthropic API to render the digest into audience-variant narratives (executive, engineering), with **anti-hallucination validation** (every referenced entity must exist in the digest) and per-report cost capture.
- **Input:** The digest; target audiences; prompt templates.
- **Output:** `report_versions` rows (Markdown + JSON) mapping each risk claim back to a flag; `cost_cents` recorded.
- **Dependencies:** *Libs:* `@anthropic-ai/sdk`, Zod. *APIs:* Anthropic. *Skills:* ← `report-digest-builder`, → `error-handling`, → `cost-and-lag-observability`.
- **Docs:** [Anthropic API](https://docs.anthropic.com/en/api) · [Anthropic SDKs](https://docs.anthropic.com/en/api/client-sdks) · project [`claude-api` skill]
- **Complexity:** Complex
- **Example:** `/llm-report-generation digest=<id> audiences=executive,engineering`

### 15. `scheduled-job`
- **Description:** Define a durable pg-boss job — scheduled (report cadence) or queued (ingest/generation) — that runs in the Railway worker, timezone-correct and idempotent.
- **Input:** Job name, trigger (cron/enqueue), handler, retry policy.
- **Output:** A registered worker job + schedule; failure states surfaced.
- **Dependencies:** *Libs:* pg-boss, `luxon`/`date-fns-tz`. *APIs:* Postgres. *Skills:* → `structured-logging-audit`.
- **Docs:** [pg-boss](https://github.com/timgit/pg-boss/blob/master/docs/readme.md)
- **Complexity:** Moderate
- **Example:** `/scheduled-job weekly report generation, Fri 09:00 PM tz`

---

## 5. Frontend Component Generation

### 16. `trpc-endpoint`
- **Description:** Add an end-to-end tRPC procedure: router + Zod input/output + role gating, wired to a typed frontend hook (spans BE+FE).
- **Input:** Procedure name, input/output schema, required role, data operation.
- **Output:** Server procedure + client hook + types; no schema duplication.
- **Dependencies:** *Libs:* tRPC, TanStack Query, Zod. *Skills:* ← `zod-schema`, ← `role-authz`.
- **Docs:** [tRPC](https://trpc.io/docs) · [tRPC + React Query](https://trpc.io/docs/client/react)
- **Complexity:** Moderate
- **Example:** `/trpc-endpoint reports.get -> report + versions + evidence`

### 17. `react-component`
- **Description:** Scaffold a Next.js/React component using shadcn/ui + Tailwind, TanStack Query for data, with an accessibility baseline (labels, focus, ARIA).
- **Input:** Component purpose, data source (tRPC hook), states (loading/empty/error).
- **Output:** A typed, accessible component with all states handled.
- **Dependencies:** *Libs:* React, Next.js, Tailwind, shadcn/ui, TanStack Query. *Skills:* ← `trpc-endpoint`, → `responsive-a11y-check`.
- **Docs:** [Next.js](https://nextjs.org/docs) · [React](https://react.dev/) · [shadcn/ui](https://ui.shadcn.com/) · [TanStack Query](https://tanstack.com/query/latest)
- **Complexity:** Moderate
- **Example:** `/react-component ProjectDashboard: list projects + status + next report`

### 18. `report-editor`
- **Description:** Integrate the TipTap rich-text editor for the report review/edit surface — load AI draft, edit, expandable evidence per risk flag, and drive the `draft→edited→approved→sent` state machine.
- **Input:** Report + versions + risk evidence; the state transitions.
- **Output:** An editor with per-audience tabs, evidence drill-down, and an explicit approve gate.
- **Dependencies:** *Libs:* TipTap/ProseMirror, React. *Skills:* ← `trpc-endpoint`, → `responsive-a11y-check`.
- **Docs:** [TipTap](https://tiptap.dev/docs) · [ProseMirror](https://prosemirror.net/docs/)
- **Complexity:** Complex (the trust-critical surface — PRD Epic C)
- **Example:** `/report-editor review screen with exec/eng tabs + evidence popovers`

### 19. `responsive-a11y-check`
- **Description:** Verify a view meets WCAG 2.1 AA and works at 375px — keyboard nav, focus, contrast, no color-only meaning, no horizontal page scroll; the read/approve flow must be fully usable on mobile.
- **Input:** The component/page under test.
- **Output:** A pass/fail report with specific fixes.
- **Dependencies:** *Libs:* `@axe-core/playwright`, Playwright. *Skills:* ← `react-component`, `report-editor`.
- **Docs:** [WCAG 2.1](https://www.w3.org/TR/WCAG21/) · [axe-core](https://github.com/dequelabs/axe-core) · [Radix a11y](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- **Complexity:** Moderate
- **Example:** `/responsive-a11y-check report review screen @375px`

---

## 6. Testing & Validation

### 20. `zod-schema`
- **Description:** Author a shared Zod schema in `packages/shared` used for validation at every FE/BE boundary and as the tRPC contract.
- **Input:** The data shape + constraints.
- **Output:** A reusable schema + inferred TS type.
- **Dependencies:** *Libs:* Zod. *Skills:* consumed by `trpc-endpoint`, adapters.
- **Docs:** [Zod](https://zod.dev/)
- **Complexity:** Simple
- **Example:** `/zod-schema ReportVersion { audience, content_md, content_json }`

### 21. `unit-test`
- **Description:** Write fast unit tests (Vitest) for pure logic — risk rules, digest builder, normalization, identity matching.
- **Input:** The unit under test + expected cases (incl. edge cases).
- **Output:** A passing test file with meaningful coverage of branches.
- **Dependencies:** *Libs:* Vitest. *Skills:* ← `risk-rule`, `report-digest-builder`, `provider-adapter`.
- **Docs:** [Vitest](https://vitest.dev/)
- **Complexity:** Simple
- **Example:** `/unit-test risk-rule idle_gt_threshold boundary cases`

### 22. `integration-test`
- **Description:** Test a full pipeline slice — webhook → normalize → store → digest → generate — against an ephemeral Postgres, with providers mocked.
- **Input:** The pipeline path + fixtures.
- **Output:** An integration test proving end-to-end correctness incl. idempotency.
- **Dependencies:** *Libs:* Vitest, `testcontainers`/Supabase local, MSW. *Skills:* ← `seed-data`, adapters, generation skills.
- **Docs:** [Supabase local dev](https://supabase.com/docs/guides/local-development) · [MSW](https://mswjs.io/) · [Testcontainers](https://node.testcontainers.org/)
- **Complexity:** Complex
- **Example:** `/integration-test jira webhook -> report draft`

### 23. `rls-isolation-test`
- **Description:** Security test asserting cross-tenant reads return **zero rows** under RLS — run for every tenant table. A failing test blocks merge.
- **Input:** Tenant table + two orgs' data.
- **Output:** A test proving org B cannot read org A's rows via the app role.
- **Dependencies:** *Libs:* Vitest, Supabase local. *Skills:* ← `rls-policy`, `seed-data`.
- **Docs:** [Testing RLS](https://supabase.com/docs/guides/database/postgres/row-level-security#testing-policies)
- **Complexity:** Complex (non-negotiable — PRD §6)
- **Example:** `/rls-isolation-test activity_events cross-org denial`

---

## 7. Error Handling & Logging

### 24. `error-handling`
- **Description:** Apply the standard typed-error + consistent error-response format across tRPC and REST — user-safe messages, mapped provider/LLM failures, retry semantics.
- **Input:** The failure surface (endpoint/job) + error classes.
- **Output:** Consistent error mapping + client handling; no leaked internals.
- **Dependencies:** *Libs:* tRPC error formatter, Zod. *Skills:* used across integration/generation skills.
- **Docs:** [tRPC error handling](https://trpc.io/docs/server/error-handling)
- **Complexity:** Moderate
- **Example:** `/error-handling map Jira 401 -> needs_reauth surfaced to PM`

### 25. `structured-logging-audit`
- **Description:** Add structured logging and write `audit_log` rows for sensitive actions (sends, disconnects, deletes, role/token changes). Never log secrets/tokens.
- **Input:** The action + context (org, user, target).
- **Output:** A structured log line + an `audit_log` entry where required.
- **Dependencies:** *Libs:* `pino`. *Skills:* ← schema, → `cost-and-lag-observability`.
- **Docs:** [Pino](https://getpino.io/) — audit table from PRD §4
- **Complexity:** Moderate
- **Example:** `/structured-logging-audit record report.sent with report id`

### 26. `cost-and-lag-observability`
- **Description:** Instrument the two guardrail metrics: **cost-per-report** (COGS) and **ingest lag**; alert when thresholds are exceeded.
- **Input:** Metric source (report `cost_cents`, event `ingested_at − occurred_at`).
- **Output:** Metrics/dashboards + alert thresholds.
- **Dependencies:** *Libs:* logging/metrics sink (e.g., Logtail/Grafana Cloud free tier). *Skills:* ← `structured-logging-audit`, `llm-report-generation`.
- **Docs:** [OpenTelemetry JS](https://opentelemetry.io/docs/languages/js/)
- **Complexity:** Moderate
- **Example:** `/cost-and-lag-observability alert if avg cost/report > target`

---

## 8. Deployment & Infrastructure

### 27. `netlify-deploy`
- **Description:** Configure and deploy the Next.js web app to Netlify (OpenNext runtime, build settings, env vars, Deploy Previews); mind the 300 free build-minute budget.
- **Input:** Build command, env var names, branch.
- **Output:** A deployed site + preview-on-PR wiring.
- **Dependencies:** *APIs:* Netlify. *Skills:* ← `env-management`, `ci-pipeline`.
- **Docs:** [Netlify](https://docs.netlify.com/) · [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- **Complexity:** Moderate
- **Example:** `/netlify-deploy apps/web production`

### 28. `railway-worker-deploy`
- **Description:** Deploy the always-on Node worker (ingest + generation) to Railway with a Dockerfile and env vars; keep it portable (Render/Fly interchangeable).
- **Input:** Worker start command, env var names, resources.
- **Output:** A running worker service connected to Postgres/pg-boss.
- **Dependencies:** *APIs:* Railway. *Skills:* ← `env-management`, `scheduled-job`.
- **Docs:** [Railway](https://docs.railway.com/) · [Railway Dockerfile deploys](https://docs.railway.com/guides/dockerfiles)
- **Complexity:** Moderate
- **Example:** `/railway-worker-deploy apps/worker`

### 29. `ci-pipeline`
- **Description:** Author a GitHub Actions workflow: install, lint, typecheck, unit+integration tests, run RLS isolation tests, apply migrations on merge.
- **Input:** The monorepo task graph (Turborepo).
- **Output:** A CI workflow gating merges; migration step on main.
- **Dependencies:** *Libs:* GitHub Actions, Turborepo. *Skills:* ← test skills, `supabase-migration`.
- **Docs:** [GitHub Actions](https://docs.github.com/actions) · [Turborepo CI](https://turbo.build/repo/docs/guides/ci-vendors/github-actions)
- **Complexity:** Moderate
- **Example:** `/ci-pipeline lint+typecheck+test+rls+migrate`

### 30. `env-management`
- **Description:** Manage environment variables consistently across Netlify/Railway/Supabase — names only, values in platform stores, never in repo; keep a documented `.env.example`.
- **Input:** The new variable(s) + which service(s) need them.
- **Output:** Updated `.env.example` + platform config guidance; nothing secret committed.
- **Dependencies:** *Skills:* supports `oauth-integration`, deploy skills.
- **Docs:** [Netlify env vars](https://docs.netlify.com/environment-variables/overview/) · [Railway variables](https://docs.railway.com/guides/variables)
- **Complexity:** Simple
- **Example:** `/env-management add JIRA_OAUTH_CLIENT_ID to web+worker`

---

## 9. Documentation Generation

### 31. `api-docs-gen`
- **Description:** Generate developer docs for the tRPC procedures and REST/webhook endpoints from their Zod schemas (inputs, outputs, auth, roles).
- **Input:** The routers + schemas.
- **Output:** A generated `docs/api.md` kept in sync.
- **Dependencies:** *Libs:* tRPC, Zod (`zod-to-json-schema`). *Skills:* ← `trpc-endpoint`, `zod-schema`.
- **Docs:** [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema)
- **Complexity:** Simple
- **Example:** `/api-docs-gen`

### 32. `update-project-memory`
- **Description:** Keep [`.claude/CLAUDE.md`](../.claude/CLAUDE.md) (esp. the **Current State** section) and the `research/` docs consistent as work lands — the "fresh session catches up" guarantee.
- **Input:** What changed (built/in-progress/known issues).
- **Output:** Updated CLAUDE.md Current State + any affected research doc.
- **Dependencies:** *Skills:* touches everything.
- **Docs:** [Claude Code memory](https://code.claude.com/docs/en/memory)
- **Complexity:** Simple
- **Example:** `/update-project-memory built Jira OAuth + ingest; next: risk rules`

---

## 10. Cross-cutting dependency graph (build order)

```
env-management ─┐
                ├─> supabase-migration ─> db-types-sync
rls-policy ─────┘        │
                         └─> rls-isolation-test
supabase-auth-flow ─> role-authz ─> trpc-endpoint ─> react-component ─> report-editor
oauth-integration ─> provider-adapter ─> identity-resolution ─> risk-rule ─> report-digest-builder ─> llm-report-generation
rate-limit-aware-client ─┘         webhook-receiver ─> scheduled-job ─┘
zod-schema, error-handling, structured-logging-audit  = used everywhere
unit-test / integration-test / responsive-a11y-check  = gate each of the above
netlify-deploy + railway-worker-deploy + ci-pipeline  = ship it
```

**Critical path to a P0 demo:** `env-management → supabase-migration + rls-policy → supabase-auth-flow → oauth-integration (Jira) → provider-adapter (Jira) → webhook-receiver + rate-limit-aware-client → risk-rule → report-digest-builder → llm-report-generation → trpc-endpoint → report-editor → deploy`.

---

## 11. Coverage check against PRD

| PRD area | Covered by skills |
|---|---|
| Epic A (integrations/ingest) | 6, 8, 9, 10, 11, 15 |
| Epic B (report generation) | 12, 13, 14, 15 |
| Epic C (review/edit/deliver) | 16, 17, 18, 19 |
| Epic D (risk alerts) | 12, 15, 25 |
| Epic E (accounts/foundation) | 1–4, 5, 7, 16, 17 |
| §4 Database | 1, 2, 3, 4, 23 |
| §5 API | 7, 9, 16, 24, 31 |
| §6 Non-functional (security/a11y/perf) | 2, 6, 9, 19, 23, 24, 25, 26 |
| §8 Metrics (edit ratio, cost, lag) | 18, 26 |

Every PRD epic and NFR maps to at least one skill. No P0 gap identified.

---

## 12. Skills we deliberately do NOT need (MVP)

Listed so the boundary is explicit (per "better to identify skills we don't need"):

- **`billing-subscriptions`** — Stripe/paywall. Deferred; design partners are free (PRD §7).
- **`vector-search` / `embeddings-dedup`** — pgvector semantic clustering. Deterministic correlation first; add only when volume justifies (PRD §7).
- **`redis-cache`** — Upstash Redis layer. Not needed until scale; pg-boss on Postgres covers MVP queueing.
- **`native-mobile-build`** — React Native/Expo. Web-first; no native app at MVP (tech-stack §1).
- **`jira-writeback`** — creating/updating Jira issues. Out of scope — we read and sit on top (PRD §7, §0 positioning). **Explicitly forbidden**, not merely deferred.
- **`auto-send`** — unattended delivery without human approval. Never — approval gate is a product invariant.
- **`sso-saml`** — enterprise SSO. Post-MVP enterprise tier.
- **`elasticsearch-index`** — external search engine. Postgres FTS suffices at this scale.
- **`multi-pm-tool-adapters`** (Asana/Linear/Monday) — Jira-first; other PM tools are future expansion.

---

*Inventory complete. Skills 1–32 cover the full MVP build surface; §12 marks the boundary. Codify each as `.claude/skills/<name>/SKILL.md` when we reach it — with a `description` that leads with the use case, and `allowed-tools` scoped to what the procedure actually needs.*
