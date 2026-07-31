# Build Roadmap — PM Status Autopilot

**Date:** 2026-07-30
**Author:** architecture-agent (per [`agents.md`](./agents.md))
**Sources:** [`viability-analysis.md`](./viability-analysis.md) · [`tech-stack.md`](./tech-stack.md) · [`PRD.md`](./PRD.md) · [`skills.md`](./skills.md) · [`.claude/CLAUDE.md`](../.claude/CLAUDE.md)

> **Architectural stance:** this roadmap sequences the P0 build to protect the product's invariants (DB-enforced tenancy, encrypted tokens, deterministic-risk-then-narrate, human-approval gate, no Jira write-back) and to reach the one metric that decides the business — **edit ratio < 20%** — as early as possible. Feasibility is not the risk (viability §1); trust is. So the plan front-loads the trust core and gets a real report in front of design partners fast.

---

## 1. MVP Definition

### The smallest thing that delivers value to Priya
> **Connect Jira → receive an accurate, auto-drafted status report with the real risks already flagged and evidence attached → skim, edit, approve, and copy/export it — in ~10 minutes instead of half a day.**

That single vertical slice is the MVP. It exercises the whole trust loop (ingest → deterministic risk → grounded generation → review/approve) end to end, on one integration, for one PM. Everything else is in service of, or deferred from, that loop.

### P0 — in the MVP (from PRD §3)
| PRD ref | Feature |
|---|---|
| E1, E2 | Auth (Supabase magic link) + multi-tenant org/membership with RLS |
| A1, A2 | Connect Jira (OAuth 3LO, encrypted tokens) + normalized activity ingest |
| B1 | Deterministic risk computation with evidence |
| B2 | LLM narrative from a compact digest (anti-hallucination) |
| B3 | Two audience variants (executive, engineering) |
| B4 | Scheduled + on-demand generation |
| C1 | Edit-before-send review surface (state machine, evidence drill-down) |
| C2 | Manual export/copy delivery |
| E3 | Project dashboard (status snapshot, connection health, next report) |

### Explicitly deferred to post-MVP (from PRD §7)
- **GitHub / Slack / calendar ingest** — GitHub is the #1 P1 (unlocks the cross-tool wedge) but is *not* in the first shippable slice. Jira-only proves the trust loop first.
- Cross-tool "done-but-PR-open" detection, identity resolution (needs a 2nd source).
- Auto-delivery to Slack/email (C3), mid-cycle risk alerts (D1).
- Custom audience templates, portfolio/PMO roll-up.
- Billing, SSO/SAML, pgvector/embeddings, Redis, native mobile.

> **Named risk (viability §4):** shipping Jira-only means we look, briefly, like a "summarizer" — the lane Rovo owns. Mitigation: treat GitHub (M-later) as the immediate post-MVP priority so the cross-tool catch that *is* the differentiator lands right after validation. The MVP's job is to prove the trust threshold, not the moat.

---

## 2. Milestone Structure

Six milestones, ~7–9 weeks to a design-partner-ready MVP. Sequencing follows the skills.md §10 dependency graph. Every builder milestone ends at the **architecture → security → testing** gate before it's "done."

### M0 — Sprint Zero: Foundation
- **Duration:** ~4–5 days
- **Deliverables:** Turborepo scaffold (`apps/web`, `apps/worker`, `packages/{db,shared,integrations}`); CI pipeline (lint/typecheck/test); `.env.example` + secret handling; Supabase project provisioned; auth scaffolding (magic link + tRPC session context); Netlify + Railway projects connected (no prod deploy yet).
- **Agents:** `devops-agent` (repo, CI, env, hosting), `database-agent` (Supabase provisioning, migration tooling), `frontend-agent` (auth scaffold + tRPC context), `architecture-agent` (scaffold review).
- **Dependencies:** none — this is the start. **Requires user actions (see §3 escalations).**
- **Success criteria:** `pnpm install && pnpm build && pnpm test` green in CI; a logged-in user can reach an empty authenticated dashboard; `.env.example` complete and no secret committed.

### M1 — Data Foundation & Tenancy
- **Duration:** ~1 week
- **Deliverables:** Full PRD §4 schema as migrations; RLS default-deny on every tenant table; generated types; seed data; **RLS isolation tests** proving cross-org reads return zero rows.
- **Agents:** `database-agent` (schema/RLS/migrations), `testing-agent` (isolation tests), `security-review-agent` (RLS review — mandatory gate).
- **Dependencies:** M0.
- **Success criteria:** every tenant table has RLS + a passing isolation test; types generated; security-review PASS; migrations run clean in CI.
- **Auth setup checklist (Supabase dashboard — project `my-statuscope-app`, ref `nihtdxrjymkjdskjrcsf`):** pairs with the magic-link auth scaffolding from M0.
  - [ ] Confirm the **Email** provider + **Magic Link** are enabled — enabled by default on new projects; verify it wasn't turned off. (Authentication → Providers → Email: `/dashboard/project/nihtdxrjymkjdskjrcsf/auth/providers`)
  - [ ] Set the **Site URL** to the production app URL (the Netlify site). (Authentication → URL Configuration: `/dashboard/project/nihtdxrjymkjdskjrcsf/auth/url-configuration`)
  - [ ] Add the **Redirect URLs** allow-list on the same page: `http://localhost:3000/**` (dev), `https://<netlify-site>.netlify.app/**` (prod), plus any deploy-preview pattern. ⚠️ Any redirect target not on this list silently falls back to the Site URL.
  - [ ] Put `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the `sb_publishable_…` key) into Netlify env vars — names are in `.env.example`; never commit values.
  - [ ] Verify `emailRedirectTo` in the client `signInWithOtp` call matches an allow-listed redirect URL.

### M2 — Jira Ingest (the read side)
- **Duration:** ~1.5–2 weeks
- **Deliverables:** Jira OAuth 3LO connect/disconnect with **encrypted** tokens + refresh; rate-limit-aware client; signed webhook receiver; provider adapter normalizing Jira activity into `activity_events` (backfill + delta), idempotent; connection-health surface.
- **Agents:** `integrations-agent` (owns), `database-agent` (integrations/events tables), `security-review-agent` (tokens/webhook — mandatory gate), `testing-agent` (adapter unit + pipeline integration tests).
- **Dependencies:** M1.
- **Success criteria:** a real Jira project's activity flows into normalized `activity_events`; tokens encrypted, never logged; webhook rejects unsigned; 429 backoff verified; ingest lag < 15 min; security-review PASS.

### M3 — Report Engine (the trust core)
- **Duration:** ~1.5–2 weeks
- **Deliverables:** deterministic risk rules (overdue, idle, blocked, scope-added) each emitting evidence-backed flags; compact digest builder; LLM generation with anti-hallucination validation + cost capture; executive + engineering variants; scheduled + on-demand generation job.
- **Agents:** `report-engine-agent` (owns), `testing-agent` (rule/edge-case + generation validation), `architecture-agent` (pipeline-invariant review).
- **Dependencies:** M2 (needs normalized events).
- **Success criteria:** a report generates from real Jira data; every risk flag carries verifiable evidence; no hallucinated entities (validated); variants derive from one source; `cost_cents` recorded per report.

### M4 — Frontend Experience (the review loop)
- **Duration:** ~1.5–2 weeks
- **Deliverables:** tRPC endpoints (projects, reports, risks, schedules); project dashboard; **report editor** (TipTap) with per-audience tabs, click-to-evidence, `draft→edited→approved→sent` state machine, and the human-approval gate; copy/export delivery; WCAG 2.1 AA + 375px.
- **Agents:** `frontend-agent` (owns), `testing-agent` (component + a11y), `architecture-agent` (tRPC/boundary review).
- **Dependencies:** M3 (needs reports to display).
- **Success criteria:** a PM completes the full loop — connect → generate → review evidence → edit → approve → export — in the UI; nothing delivers without an explicit approve; a11y/responsive checks pass.

### M5 — Launch Hardening & Design-Partner Deploy
- **Duration:** ~1 week
- **Deliverables:** full security review; cost-per-report + ingest-lag observability live; performance verification; README + `docs/api.md` + CLAUDE.md Current State updated; production deploy to Netlify (web) + Railway (worker); 5–10 design partners onboarded; **edit-ratio instrumentation** live.
- **Agents:** `security-review-agent`, `devops-agent` (deploy), `docs-memory-agent` (docs), `testing-agent` (perf), `architecture-agent` (final coherence pass).
- **Dependencies:** M4.
- **Success criteria:** launch checklist (§5) fully green; app live; design partners generating real reports; edit ratio being measured from report #1.

---

## 3. Sprint Zero Checklist

**What must be true before we write feature code.** Items marked 🔺 are **escalations** — they need you (novel/irreversible, or require credentials/accounts the agents can't create).

### Repository setup
- [ ] 🔺 Create the GitHub repository (private) — *your action / approval*
- [ ] `git init` locally; Turborepo monorepo layout per CLAUDE.md §5
- [ ] `.gitignore` (node_modules, `.next`, `.env*` except `.env.example`)
- [ ] Base `package.json`, `turbo.json`, `tsconfig` bases, ESLint/Prettier

### CI/CD pipeline
- [ ] GitHub Actions: install → lint → typecheck → unit tests (RLS/integration wired as they arrive)
- [ ] Netlify Git integration for `apps/web` (Deploy Previews); Railway for `apps/worker` — connect, no prod deploy yet

### Development environment
- [ ] Node 20 + pnpm + Turborepo; Supabase CLI
- [ ] `.env.example` with all names (no values): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `TOKEN_ENCRYPTION_KEY`, `JIRA_OAUTH_CLIENT_ID/SECRET`
- [ ] Local Supabase stack runs; `pnpm dev` boots web + worker

### Database provisioning
- [ ] 🔺 Create the Supabase project (dev) — *your action (account/billing)*
- [ ] Migration tooling wired (`packages/db`); empty baseline migration applies clean
- [ ] `db-types-sync` produces types consumed by `packages/shared`

### Authentication scaffolding
- [ ] Supabase Auth magic-link login/sign-out
- [ ] Session-aware tRPC context resolving `user` + `org`
- [ ] `orgs`/`users`/`memberships` minimal tables + RLS (full schema lands M1)
- [ ] Authenticated empty dashboard reachable

### Secrets
- [ ] 🔺 Provide dev secrets (Anthropic key, Jira OAuth app credentials) into platform stores — *your action; never committed*
- [ ] 🔺 Register the Jira OAuth (3LO) app in Atlassian — *your action (external account)*

---

## 4. Risk Register

| # | Risk | Milestone | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | **Report output needs heavy editing** (edit ratio high) → value prop fails | M3–M5 | Med | **Critical** | Deterministic risk + evidence + anti-hallucination baked in from M3; measure edit ratio from report #1; treat >20% as a stop-and-fix signal, not a scaling trigger |
| R2 | Jira rate limits (points-based, 2 Mar 2026) throttle ingest | M2 | Med | High | Webhooks over polling; backoff + per-integration budget in the rate-limit-aware client; verify 429 handling before scaling projects |
| R3 | OAuth token lifecycle (encrypt/refresh/revoke) is fiddly & security-critical | M2 | High | High | Get `integrations` + refresh right early; mandatory security-review gate; encryption enforced by CI check |
| R4 | RLS gap leaks cross-tenant data | M1+ | Low | **Critical** | Default-deny; an isolation test per tenant table blocks merge; security-review gate |
| R5 | LLM cost per report erodes margin | M3+ | Med | Med | Compact digest only; cache when unchanged; cost-per-report tracked + alerted from M3 |
| R6 | Scope creep pulls GitHub/Slack/alerts into MVP | all | High | Med | Roadmap + PRD §7 are the boundary; orchestration escalates any deferred-work pull-in; architecture-agent blocks it |
| R7 | "Looks like a summarizer" vs. Rovo during Jira-only window | M5 | Med | Med | Frame validation as the trust test; queue GitHub as immediate post-MVP so the cross-tool catch lands fast |
| R8 | Netlify free build-minutes exhausted | M0/M5 | Low | Low | Cache deps; avoid deploy-on-every-commit; monitor budget |
| R9 | External dependencies unavailable (Atlassian MCP not connected, OAuth app approval lag) | M0/M2 | Med | Med | MCP is dev-convenience only, not a blocker (prod uses REST); start Jira OAuth app registration during M0 |

---

## 5. Launch Checklist (gate to ship — M5)

### Security
- [ ] RLS enabled + default-deny on **every** tenant table; isolation tests all green
- [ ] Integration tokens encrypted at rest; grep confirms no secret/token in code, logs, or repo history
- [ ] Every webhook verifies signature and rejects invalid
- [ ] OAuth scopes least-privilege
- [ ] `audit_log` written for sensitive actions (send/export, disconnect, deletes, token/role change)
- [ ] No auto-send path; approval gate enforced; no Jira write-back
- [ ] security-review-agent final verdict: PASS

### Performance
- [ ] Dashboard/report reads p95 < 500 ms (≤5k events)
- [ ] Ingest lag (webhook → queryable) p95 < 15 min
- [ ] Report generation (enqueue → draft ready) p95 < 60 s
- [ ] Cost-per-report within margin target; alerting live

### User testing
- [ ] 5–10 design partners onboarded and generating real reports
- [ ] **Edit ratio instrumented and being measured** from the first report
- [ ] Wizard-of-Oz / early feedback confirms drafts are send-worthy with light edits
- [ ] Full loop (connect → generate → review evidence → edit → approve → export) validated with a real user

### Documentation
- [ ] README (setup, env, run, deploy)
- [ ] `docs/api.md` generated from tRPC routers + Zod
- [ ] CLAUDE.md "Current State" reflects reality
- [ ] Netlify env-var + Railway env-var runbook (names only) documented

### Deploy
- [ ] Web on Netlify (OpenNext), worker on Railway, both healthy
- [ ] CI green on main; migrations applied
- [ ] Rollback path known (portable Docker worker; Netlify redeploy)

---

## 6. Sprint Zero Coordination Plan

Order and ownership for M0 (respecting the dependency graph and the build→review gates):

```
1. devops-agent      → git init, Turborepo scaffold, .gitignore, CI skeleton, .env.example
2. database-agent    → wire migration tooling, baseline migration, db-types-sync   [after 1]
3. frontend-agent    → Supabase magic-link auth + tRPC session context + empty dashboard   [after 2]
4. architecture-agent→ review scaffold for boundary/pattern conformance (gate)   [after 3]
5. testing-agent     → CI runs lint/typecheck/unit; smoke test the auth path   [after 4]
6. docs-memory-agent → update CLAUDE.md "Current State" to reflect scaffold landed   [last]
```
Each step returns to orchestration; nothing proceeds past step 4's gate without a PASS.

---

*Roadmap complete. M0–M5 sequence the P0 slice to reach a trust-validated, design-partner MVP in ~7–9 weeks, with GitHub cross-tool ingest as the immediate post-MVP priority.*
