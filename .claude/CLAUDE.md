<!-- Project memory for PM Status Autopilot. Keep under ~200 lines; link to research docs rather than duplicating them. Update the "Current State" section as work progresses. -->

# PM Status Autopilot

An app that plugs into a PM's tools (Jira first, then GitHub/Slack/calendar), reads the activity already happening, and auto-drafts send-ready **project status reports** the PM edits before sending.

**Full context lives in the research docs — read them before non-trivial work:**
- Product spec (build contract): [research/PRD.md](research/PRD.md)
- Tech stack + rationale: [research/tech-stack.md](research/tech-stack.md)
- Market/feasibility: [research/viability-analysis.md](research/viability-analysis.md)

## 1. Project Identity
- **Mission:** Remove the ~half-day/week PMs lose assembling status updates, and catch real slippage early.
- **The wedge (this is the whole point):** NOT "AI writes your report" — Atlassian Rovo already does that. Our defensible core is a **cross-tool truth layer**: catch where tools disagree (e.g. "ticket Done but its PR is still open"), and **explainable, evidence-backed risk detection**. Every design decision should protect trust in the output.
- **Success = trust, not usage.** North-star: approved reports sent per PM per week. The make-or-break metric is **edit ratio < 20%** (how much of a draft the PM rewrites). If drafts need heavy editing, the product is failing — fix accuracy before adding features.

## 2. Technical Context
**Stack** (full justification in tech-stack.md):
- **Frontend:** Next.js (React) + TypeScript, **web-first — no React Native at MVP**. TipTap (report editor), TanStack Query (server state), Zustand (UI state), Tailwind + shadcn/ui, Zod.
- **Backend:** Node.js + TypeScript. **Two processes:** (1) Next.js app API on Netlify; (2) a **separate always-on worker on Railway** for scheduled ingest + LLM generation (serverless can't run these long jobs). Job queue = **pg-boss** on Postgres (no Redis at MVP).
- **API:** **tRPC internally** (typed, first-party frontend); **REST + webhooks externally** (OAuth callbacks, provider webhooks).
- **DB/Auth:** **Supabase** Postgres + Auth (magic link) + **Row-Level Security**. pgvector available (defer to P1+).
- **LLM:** Anthropic API (default to latest Claude). Generation reads a **compact digest of pre-computed facts**, never the raw event firehose.
- **Hosting:** Netlify (web) + Railway (worker) + Supabase. MVP ~$5–30/mo. CI/CD: GitHub Actions + Netlify/Railway git deploys.

**Key architectural decisions & why:**
- **Risk detection is deterministic, not LLM-guessed.** Rules run in SQL/TS over the event log; each risk flag carries its triggering evidence. The LLM only writes prose around these facts. This is the trust backbone — never let the model invent risks or entities not in the digest.
- **Provider-normalized event log** (`activity_events`) is the heart of the system — all tools land in one shape. Cross-tool value depends on this being provider-agnostic.
- **Multi-tenant via `org_id` + RLS** (default-deny) on every tenant table. Isolation is DB-enforced, not app-logic-dependent.
- **Nothing sends without explicit human approval.** Report state machine: `draft → edited → approved → sent`.
- **Integration tokens encrypted at rest** (Supabase Vault/KMS). Most sensitive data in the system.
- **Quota-aware ingest:** Jira Cloud moved to points-based rate limits (enforced 2 Mar 2026). Prefer webhooks over polling; batch; back off on 429.

**Coding standards / conventions:**
- TypeScript everywhere; **Zod schemas shared** across frontend/backend — validate at every boundary.
- Monorepo (Turborepo): web app + worker share types and the event-normalization layer.
- Enums enforced with Postgres `CHECK` constraints; ingest is idempotent (`ON CONFLICT DO NOTHING` on the event unique tuple).
- Verify every inbound webhook signature; reject unsigned.
- Match surrounding code's style; keep comment density and naming consistent.

## 3. Current State
> **Update this section as work progresses — it's the fastest way for a fresh session to catch up.**
- **Built so far:** **Turborepo scaffolded + a working frontend MVP.** `apps/web` = Next.js **"Statuscope"** (light theme, Netlify-ready). **Routes:** `/` marketing landing (nav: Product/Connectors/Features/Pricing + Sign in/Sign up; hero, connectors, features, pricing Free/Pro/Team, CTA, footer), `/studio` = the interactive tool, `/signin` + `/signup` = **demo-only** auth (no backend — buttons route to `/studio`). Shared UI in `app/components/` (Logo, SiteNav). The tool: connect demo sources → work items with source badges → deterministic risk flags → **Executive / Engineering / PMO** report variants (PMO has owner-grouped "who owns what's at risk") → edit + copy/download Markdown. Logic in `packages/shared` (Zod schemas source of truth + risk/report). **Verified: build + type-check + live smoke tests.** `packages/{db,integrations}` and `apps/worker` are **reserved-but-empty** (deferred). Planning set in `research/`; 32 skills + 11 agents in `.claude/`.
- **M1 IN PROGRESS (Data Foundation & Tenancy):** Full PRD §4 schema is **live in Supabase project `my-statuscope-app` (`nihtdxrjymkjdskjrcsf`)** — 14 tables, enums, indexes, **default-deny RLS + org-scoped SELECT policies**; tenancy helpers in a non-exposed `private` schema. **Security advisor: 0 lints. Cross-tenant isolation verified** (Org-A user sees only Org-A rows). Version-controlled migrations in `packages/db/migrations/` (0001 schema, 0002 harden); generated `packages/db/types.ts`. **Next M1 steps:** seed data + automated RLS isolation test (Vitest harness), then write policies via role-authz. NOTE: the DB has schema only — the frontend `apps/web` is still standalone/client-side and not yet wired to Supabase.
- **Scope note:** `apps/web` now has **working Supabase magic-link auth** (`@supabase/supabase-js`, PKCE; client factory in `app/lib/supabase.ts` that degrades gracefully if env vars are unset; `/signin` + `/signup` call `signInWithOtp`; `/auth/callback` exchanges the code → `/studio`; nav shows email + Sign out). Public env vars in `apps/web/.env.local` (gitignored) for local — **must also be set in Netlify** (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) or deployed sign-in shows "unconfigured". Still NOT wired: tRPC/DB reads, worker, LLM (land M1–M3).
- **Toolchain:** **npm workspaces** (pnpm not installed; memory previously said pnpm — Turborepo structure is identical). Node 24, **Next 15.5.22, React 19.2.8** — pinned to patched versions for CVE-2025-55182 (React2Shell RCE) / CVE-2025-66478; do NOT downgrade below these. On GitHub at `Bervina1st/ProjectMgt` (main); CI + Netlify auto-build on push.
- **Blocked on user (for the full build, not the MVP):** GitHub repo; Supabase dev project; Jira OAuth 3LO app; Anthropic key + secrets into env stores. The frontend MVP needs none of these.
- **Known issues / tech debt:** `.claude/agents/` reference MCP servers by logical name (`supabase`/`atlassian`/`github`) — align to actual configured MCP server ids or grants no-op. Root `npm install` shows transitive audit warnings (via Next/sharp) — cosmetic.
- **Immediate next step:** push `apps/web` to GitHub + deploy to Netlify (see root [README](../README.md); base=repo root, publish=`apps/web/.next`, no env vars). Then resume the full build at roadmap M1 (Supabase schema + RLS) when ready.

## 4. Agent Instructions
**How to approach this codebase:**
- Read the PRD before implementing a feature; features are specified with priorities (P0/P1/P2), acceptance criteria, and dependencies. **Build P0 first.** Don't add surface area beyond the current priority tier.
- Preserve the trust invariants above (deterministic risk, no hallucinated entities, human-gated sending, RLS isolation) — they are the product, not implementation details.
- Keep `research/*` and this file consistent; if a decision changes, update both.

**Ask before making changes when:**
- A change would alter the data model / `activity_events` normalization, the RLS/tenancy model, or the report state machine.
- Scope is ambiguous or would pull a P1/P2 feature into the MVP.
- Adding a new third-party service, dependency, or env var.
- Anything touches token storage, auth, or webhook verification (security-critical).

**Never do without explicit approval:**
- Commit or push (not in a git repo yet — ask before `git init` / first commit).
- Auto-send/deliver a report without a human-approval gate in the flow.
- Store integration tokens (or any secret) in plaintext, in the repo, or in logs.
- Weaken or bypass RLS, or query across tenants without `org_id` scoping.
- Add Jira write-back or autonomous behavior (out of scope — we read and sit on top; see PRD §7).
- Introduce Redis, a search engine, embeddings, billing, or native mobile at MVP (all explicitly deferred).

## 5. File Structure Map
Currently only research docs exist. Planned monorepo layout (create as scaffolded):
```
Project Mgt_App/
├── .claude/CLAUDE.md        # this file — project memory
├── research/                # PRD, tech-stack, viability (source of truth for what/why)
├── apps/
│   ├── web/                 # Next.js app: dashboard, report review/edit, tRPC API
│   └── worker/              # Node worker: scheduled ingest + LLM generation (Railway)
├── packages/
│   ├── db/                  # Supabase schema, migrations (Supabase CLI), generated types
│   ├── shared/              # shared Zod schemas + types (used by web + worker)
│   └── integrations/        # provider adapters (jira/github/slack) → normalized events
└── turbo.json / package.json
```
**Naming:** kebab-case files; normalized event types are snake_case strings (`issue_status_changed`, `pr_opened`, `done_but_pr_open`). DB tables/columns snake_case. Migrations version-controlled — never click-edit prod schema.

## 6. External Dependencies
| Service | Purpose | Docs |
|---|---|---|
| Supabase | Postgres + Auth + RLS + storage | https://supabase.com/docs |
| Anthropic API | LLM report narrative generation | https://docs.anthropic.com/en/api |
| Netlify | Host Next.js web app | https://docs.netlify.com |
| Railway | Host always-on worker | https://docs.railway.com |
| Jira Cloud | P0 activity source (OAuth 3LO + webhooks) | https://developer.atlassian.com/cloud/jira/platform/ |
| GitHub | P1 activity source (unlocks cross-tool wedge) | https://docs.github.com/rest |
| Slack | P1 activity source + delivery | https://api.slack.com |
| Upstash Redis | Rate-limit/cache — only if needed at scale | https://upstash.com/docs/redis |

**Env vars needed (names only — never commit values):**
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (worker/pg-boss), `ANTHROPIC_API_KEY`, `TOKEN_ENCRYPTION_KEY`, `JIRA_OAUTH_CLIENT_ID`, `JIRA_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET`.

**MCP servers available for dev (NOT the production data path):** Atlassian (Jira), Supabase, GitHub. Use these to prototype logic against real data inside Claude Code — but production ingest is REST + webhooks + per-tenant OAuth, never MCP.

## 7. User Avatar Reminder
**"Priya, the Accountable-but-Blind PM"** — a technical PM juggling several workstreams, accountable for status upward.
- **Fears:** being blindsided by a slip she should've caught; sending a wrong report and losing credibility.
- **Disposition:** skeptical of dashboards that look good and say nothing. Trust is the entire relationship.
- **Word-of-mouth trigger:** the *"how did it know that?"* moment — surfacing a real risk she'd have missed, with evidence.

**UX principles for this audience:**
- **Accuracy > features.** A confidently-wrong report sets adoption back weeks.
- **Always show the evidence** behind a risk flag (one click to the tickets/PRs). Never ask her to trust a black box.
- **Keep her in control** — draft, don't send. Fast to skim, edit, approve (target < 15 min).
- **Respect her time:** she'll approve from her phone — the read/approve flow must work at 375px (WCAG 2.1 AA).
