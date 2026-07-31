# Tech Stack Recommendation — PM Status Autopilot

**Date:** 2026-07-30
**Builds on:** [`viability-analysis.md`](./viability-analysis.md)
**Guiding principle:** The viability analysis concluded feasibility is *not* the risk — trust and cross-tool synthesis are. So this stack optimizes for **fast iteration on the report-generation logic**, **cheap-to-idle infrastructure**, and **not painting ourselves into a corner** on multi-tenant OAuth and background jobs. Nothing here is exotic; that's deliberate.

**TL;DR stack:** Next.js (React) + TypeScript · tRPC internal API · a dedicated Node worker for scheduled ingest/generation · Supabase (Postgres + Auth + RLS) · Netlify (web) + Railway (worker) · GitHub Actions CI/CD. **MVP hosting lands ~$5–25/mo, well under your $50 cap.** The real variable cost is the LLM API (COGS), not hosting — budget that separately.

---

## ⚠️ Read this first: one architectural decision that shapes everything

There are **two different "integration" jobs** and they use different tools. Conflating them is the most expensive mistake you can make here.

1. **Dev-time / single-user assistant access** → use **MCP servers** (Atlassian, Supabase, GitHub). This is how *you and Claude Code* build and inspect the app, and potentially how a future "ask about my project" chat feature works for one authenticated user.
2. **Production multi-tenant ingest** → use the vendors' **REST APIs + webhooks with per-tenant OAuth 2.0 (3LO)**. Your backend polls/receives events for *thousands of customers' Jira sites*. You do **not** route that through the Atlassian MCP server — MCP is an agent-access layer, not a high-throughput multi-tenant data pipeline, and it's subject to the same underlying Jira rate limits (points-based, enforcement March 2, 2026 — see viability doc §1).

Keep these lanes separate in your head and in the codebase. §5 and §6 come back to this.

---

## 1. Frontend Recommendation

### Framework: **Next.js (React) — web-first. Defer React Native.**
You listed React/React Native for cross-platform. My recommendation: **build web-only with Next.js for the MVP**, and treat mobile as a later, optional native shell.

**Justification:** This product is a *report review-and-edit surface* plus a *dashboard* — a keyboard-and-screen workflow (editing prose, tweaking audiences, scanning risk lists), not a phone-first experience. React Native would roughly double your surface area and force React-Native-incompatible choices in the richest part of the UI (the report editor) for near-zero MVP value. PMs will approve/edit reports at a desk. A responsive Next.js web app covers 100% of the MVP job; wrap it later if usage data demands mobile. Next.js also gives you SSR, API route handlers, and the tightest possible integration with Vercel hosting.

- **Docs:** [Next.js](https://nextjs.org/docs) · [React](https://react.dev/)

### Key libraries (mapped to *our* features)
| Need | Library | Why |
|---|---|---|
| Editable report ("edit before send") | **TipTap** ([docs](https://tiptap.dev/docs)) | ProseMirror-based rich-text editor; clean for structured, editable AI-drafted content |
| Server data / caching | **TanStack Query** ([docs](https://tanstack.com/query/latest)) | Handles the fetch/cache/refetch of reports & status; removes most manual state |
| UI components | **Tailwind CSS** ([docs](https://tailwindcss.com/docs)) + **shadcn/ui** ([docs](https://ui.shadcn.com/)) | Fast, consistent, own-your-components; no runtime lock-in |
| Validation (shared FE/BE) | **Zod** ([docs](https://zod.dev/)) | One schema for forms + API contracts |
| Charts (risk trends, later) | **Recharts** ([docs](https://recharts.org/)) | Lightweight, React-native to the ecosystem |

### State management
**Don't reach for Redux.** Split state by kind:
- **Server state** (reports, tickets, integration status) → TanStack Query. This is 80% of your state.
- **Local UI state** (modals, editor draft, filters) → React hooks + **Zustand** ([docs](https://zustand.docs.pmnd.rs/)) for the few pieces of cross-component client state.
- **Auth/session** → Supabase client + context.

---

## 2. Backend Recommendation

### Runtime: **Node.js + TypeScript** (not Python).
Your call was "whichever has better library support for our needs." For *this* product, that's **Node/TypeScript**, decisively:
- First-party TS SDKs for every integration you need: Slack (`@slack/web-api`), GitHub (Octokit), Google/Microsoft calendar, and Atlassian's OAuth flows.
- **One language across FE/BE** → shared Zod schemas, shared types, one hiring profile, tRPC (below).
- The "AI" here is **calling a hosted LLM** (Claude/OpenAI), not training models — so Python's ML advantage is irrelevant. The [Anthropic SDK](https://docs.anthropic.com/en/api/client-sdks) is first-class in TS.
- *Only* reach for a small Python service later if you add heavy data-science-style analytics; not for MVP.

- **Docs:** [Node.js](https://nodejs.org/docs/latest/api/) · [TypeScript](https://www.typescriptlang.org/docs/)

### Two-process shape (important)
1. **App API** (in the Next.js deployment) — serves the dashboard, auth, CRUD, report review.
2. **Worker** (separate long-running Node process) — runs the **scheduled ingest + LLM generation**. This *cannot* live in Netlify Functions: generation is long-running and bursty, and serverless functions (Netlify's included) have execution-time limits. Netlify does offer scheduled/background functions, but a persistent worker is the right fit for a bursty, stateful ingest+generation pipeline — put it on Railway/Render (see §4). Use **pg-boss** ([docs](https://github.com/timgit/pg-boss)) for the job queue so you get a durable scheduler **on top of Postgres you already have** — no separate Redis needed at MVP.

### API architecture: **tRPC internally, REST/webhooks externally**
- **Internal (frontend ⇄ backend):** **tRPC** ([docs](https://trpc.io/docs)). It's a TS monorepo — tRPC gives you end-to-end type safety with zero schema duplication and no GraphQL server to operate. GraphQL would be over-engineering for a single first-party client.
- **External (integrations):** plain **REST calls + inbound webhooks** to Jira/Slack/GitHub. You consume their APIs; you expose webhook receiver endpoints (Next.js route handlers) for real-time events to reduce polling against the March-2026 rate limits.

### Authentication: **Supabase Auth**
- App login: **Supabase Auth** ([docs](https://supabase.com/docs/guides/auth)) — you already have a working magic-link Supabase setup (per project memory), so this is continuity, not new risk. Postgres **Row-Level Security** enforces per-tenant isolation at the database layer (see §3).
- Integration authorization: **per-tenant OAuth 2.0 (3LO)** to Jira/Slack/GitHub/Google. Store refresh tokens **encrypted** (Supabase Vault / a KMS), never in plaintext. This token store is security-critical — it's the single most sensitive table in the system.

---

## 3. Database Recommendation

### Primary: **Supabase Postgres**
Of your three (Supabase / Firebase / MongoDB Atlas), **Supabase wins clearly** for this app:
- The data is **relational** (tenants → integrations → projects → tickets → activity events → reports). Firebase/Mongo's document model fights that; you'd reinvent joins.
- **RLS** gives you multi-tenant isolation enforced by the DB, not just app code.
- Bundles **Auth + Postgres + storage + edge functions + a real MCP server** (§5) in one $25 tier.
- **pgvector** is built in — you'll want embeddings for de-duping/semantically clustering activity ("these 6 events are the same story") without a separate vector DB.
- **Docs:** [Supabase](https://supabase.com/docs) · [Postgres](https://www.postgresql.org/docs/) · [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Schema approach
- **Relational, multi-tenant, RLS-enforced.** Every tenant-scoped table carries `org_id`; RLS policies gate every row by the authenticated org.
- Core tables (sketch): `orgs`, `users`, `integrations` (encrypted tokens, per provider), `projects`, `activity_events` (normalized cross-tool event log — the heart of the system), `identities` (cross-tool person resolution — see viability §1 risk #2), `reports` (draft + audience variants + status), `risk_flags` (with the deterministic *reason* attached).
- Keep `activity_events` **provider-normalized** so Jira/Slack/GitHub all land in one shape — that normalization layer is where your cross-tool differentiation actually lives.

### Secondary data stores
- **Cache / queue:** none separate at MVP — use **Postgres + pg-boss**. Add **Upstash Redis** ([docs](https://upstash.com/docs/redis)) only when queue throughput or hot-path caching demands it (likely near 10k-user scale). Upstash's per-request pricing keeps idle cost ~$0.
- **Search:** **Postgres full-text search + pgvector**. Do **not** stand up Elasticsearch/Algolia — unjustified cost and ops for this scale.

### Backup & migration strategy
- **Backups:** Supabase **Pro** includes daily automated backups (the Free tier does **not** — this alone justifies moving to Pro before you have real customer data). Enable Point-in-Time Recovery when you're revenue-bearing.
- **Migrations:** version-controlled SQL via the **Supabase CLI** ([docs](https://supabase.com/docs/guides/deployment/database-migrations)) — migrations live in the repo and run in CI. Never click-edit production schema.

---

## 4. Infrastructure & Hosting

### Deployment platform
| Component | Platform | Why |
|---|---|---|
| Web app + API (Next.js) | **Netlify** ([docs](https://docs.netlify.com/)) | Free tier is genuinely free; full Next.js support via the [OpenNext runtime](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) (all plans, zero-config); Deploy Previews on every PR |
| Worker (ingest + generation) | **Railway** ([docs](https://docs.railway.com/)) | Long-running process, no cold starts, cheap usage-based (~$5/mo at MVP). Render ([docs](https://render.com/docs)) is the flat-rate fallback if Railway billing gets noisy |
| DB + Auth | **Supabase** | See §3 |

> **Portability note:** the worker is a Dockerized Node process — Railway/Render/Fly are interchangeable at the container level (DNS + env-var move). No architectural lock-in; only operational. That keeps your negotiating position and exit options open.

### CI/CD
- **GitHub Actions** ([docs](https://docs.github.com/actions)) for lint/typecheck/test + DB migrations on merge.
- **Netlify Git integration** ([docs](https://docs.netlify.com/deploy/create-deploys/)) for automatic Deploy Previews + production deploys of the web app.
- **Railway GitHub deploys** for the worker.
- **Watch build minutes:** Netlify's free tier includes **300 build minutes/mo**. Next.js builds are not tiny, so avoid deploy-on-every-commit noise (use PR previews judiciously, cache dependencies) or you'll burn the free allowance faster than bandwidth.

### Estimated monthly cost
Hosting only — **LLM API cost is separate COGS, see below.**

| Stage | Netlify | Supabase | Worker (Railway) | Redis | **Hosting total** |
|---|---|---|---|---|---|
| **MVP / design partners** | $0 (Free) | $0 (Free)* | ~$5 | $0 | **~$5** ✅ under $50 |
| **~1,000 users** | $0–9 (Free→Personal) | $25 (Pro) | ~$10–20 | $0–5 | **~$45–70** |
| **~10,000 users** | $20 (Pro) + usage | $25 + usage (egress/compute) | ~$30–60 | ~$10 | **~$150–250+** |

\* Move to Supabase **Pro ($25)** *before* onboarding real customer data — Free tier has **no backups** and **pauses after 7 days idle**. So realistically budget **~$30/mo the moment you have paying-adjacent data** — still under your cap.

### 🔴 The cost that actually matters: LLM inference
Hosting is trivially under budget. Your true variable cost is **tokens per report × reports × users**. A cross-tool status report with lots of activity context can be a large prompt. Controls:
- Do the **deterministic diff/risk computation in Postgres first**, send the LLM a *compact digest*, not raw event firehoses.
- Cache/skip generation when nothing changed.
- Track cost-per-report as a first-class metric from day one. This — not your Railway bill — is what determines gross margin.

---

## 5. MCP Server Availability

**Strong story here — this is a genuine advantage for *development velocity*.** (Reminder from the top: MCP = dev-time/assistant lane, **not** your production multi-tenant pipeline.)

| Component | MCP server | Status | What it enables |
|---|---|---|---|
| **Jira / Confluence / Bitbucket** | **Atlassian Official Remote MCP** ([repo](https://github.com/atlassian/atlassian-mcp-server) · [announcement](https://www.atlassian.com/blog/announcements/remote-mcp-server)) | **GA Feb 2026, Claude was first partner** | Claude Code can read/search/write Jira during dev; lets you explore real ticket shapes and prototype the "read activity → summarize" logic against live data via OAuth without building an integration first |
| **Supabase** | **Supabase MCP** ([docs](https://supabase.com/docs/guides/getting-started/mcp)) | GA (**already connected in this session**) | Claude Code inspects tables, runs SQL, applies migrations, checks advisors — tightens the DB dev loop dramatically |
| **GitHub** | **GitHub MCP** ([repo](https://github.com/github/github-mcp-server)) | GA | Dev-time repo/PR/issue access; prototype the repo-signal side of cross-tool synthesis |
| **Slack** | Community/official MCP options | Varies | Prototype chat-signal ingestion patterns |

**What this enables concretely:** you can build and validate the hardest/most-differentiating logic — *cross-tool synthesis and risk detection* — against **real Jira + real Supabase data from inside Claude Code**, before writing a line of production OAuth plumbing. That's exactly the "validate the trust threshold cheaply" advice from the viability doc, accelerated. **Caveat:** don't let MCP convenience blur into the product architecture — production ingest is REST/webhooks + per-tenant OAuth, full stop.

---

## 6. Integration Map

```
                 ┌──────────────────────────── Browser (PM) ───────────────────────────┐
                 │           Next.js (React) app  —  Netlify (Free → Pro)              │
                 │   TipTap report editor · TanStack Query · shadcn/ui · Supabase Auth  │
                 └───────────────┬───────────────────────────────┬─────────────────────┘
                          tRPC (typed)                     webhook receivers
                                 │                          (route handlers)
                 ┌───────────────▼───────────────┐                 ▲
                 │        Supabase Postgres       │                 │ inbound events
                 │  RLS · pgvector · encrypted    │                 │
                 │  token store · pg-boss queue   │                 │
                 └───────────────┬───────────────┘                 │
                                 │ jobs / data                      │
                 ┌───────────────▼───────────────┐        ┌─────────┴──────────┐
                 │   Worker (Node/TS) — Railway   │  OAuth │  Jira · Slack ·    │
                 │  scheduled ingest → normalize  │◄──3LO──│  GitHub · Calendar │
                 │  → deterministic risk rules    │  REST  │  (per-tenant)      │
                 │  → LLM digest → draft reports  │        └────────────────────┘
                 └───────────────┬───────────────┘
                                 │ generation
                        ┌────────▼─────────┐
                        │  Anthropic API   │  (compact digest in → report out)
                        └──────────────────┘
```

### Potential integration pain points (ranked by how much they'll hurt)
1. **Per-tenant OAuth token lifecycle.** Storing, encrypting, refreshing, and revoking 3LO tokens across four providers × every tenant is the fiddliest, most security-sensitive plumbing. Get the `integrations` table + refresh logic right early; it's painful to retrofit.
2. **Jira rate limits (points-based, enforced March 2, 2026).** Your worker must be quota-aware: prefer **webhooks over polling**, batch, back off on 429s, cache deltas. A naive per-project poller *will* hit walls at scale. (Cross-ref viability §1.)
3. **Serverless execution limits vs. long generation jobs.** Netlify Functions (like any serverless runtime) cap execution time, so the generation pipeline lives in the separate always-on worker. That mitigates the limit but means **two deploy targets** (Netlify web + Railway worker), two sets of env vars, and shared code between them. Use a **monorepo** (Turborepo) so FE/worker share types and the normalization layer.
4. **Cross-tool identity resolution.** Matching one human across Jira/Slack/GitHub/Calendar is never 100%. It's an app-logic problem (the `identities` table), not a stack problem — but wrong matches produce wrong-sounding reports and kill trust, so it's high-stakes. (Cross-ref viability §1 risk #2.)
5. **Webhook security.** Verify signatures on every inbound webhook (Slack signing secret, GitHub HMAC, Atlassian). An unauthenticated receiver is a data-integrity hole.

---

## Summary table

| Layer | Choice | One-line why |
|---|---|---|
| Frontend | **Next.js / React** (defer React Native) | Web-first review/edit surface; RN adds cost, no MVP value |
| Editor | **TipTap** | Rich, structured editing of AI drafts |
| Server state | **TanStack Query** (+ Zustand for UI) | Kills most manual state |
| Runtime | **Node.js + TypeScript** | Best SDK coverage; one language FE↔BE; LLM is hosted anyway |
| Internal API | **tRPC** | End-to-end types, no schema dup, no GraphQL ops |
| External API | **REST + webhooks** | Standard vendor integration; webhooks dodge rate limits |
| Background | **Dedicated Node worker + pg-boss** | Long jobs can't run on Vercel functions; queue on existing Postgres |
| DB / Auth | **Supabase (Postgres + RLS + Auth)** | Relational data, DB-enforced tenancy, pgvector, you already use it |
| Search/vector | **Postgres FTS + pgvector** | No separate search engine needed at this scale |
| Web host | **Netlify** | Free tier; full Next.js support via OpenNext runtime |
| Worker host | **Railway** (Render fallback) | Cheap always-on; portable Docker |
| CI/CD | **GitHub Actions + Vercel/Railway git deploys** | Standard, low-friction |
| Dev accelerant | **Atlassian + Supabase + GitHub MCP** | Prototype the hard synthesis logic against real data inside Claude Code |

**Cost verdict:** Hosting is **~$5–30/mo through MVP — comfortably under your $50 cap.** Watch **LLM token cost**, not servers — that's the line that decides your margins.

---

### Sources
- [Next.js](https://nextjs.org/docs) · [React](https://react.dev/) · [React Native](https://reactnative.dev/) · [TipTap](https://tiptap.dev/docs) · [TanStack Query](https://tanstack.com/query/latest) · [Tailwind](https://tailwindcss.com/docs) · [shadcn/ui](https://ui.shadcn.com/) · [Zod](https://zod.dev/) · [Zustand](https://zustand.docs.pmnd.rs/)
- [Node.js](https://nodejs.org/docs/latest/api/) · [TypeScript](https://www.typescriptlang.org/docs/) · [tRPC](https://trpc.io/docs) · [pg-boss](https://github.com/timgit/pg-boss) · [Anthropic SDK](https://docs.anthropic.com/en/api/client-sdks)
- [Supabase](https://supabase.com/docs) · [Supabase Auth](https://supabase.com/docs/guides/auth) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) · [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations) · [Postgres](https://www.postgresql.org/docs/) · [Supabase pricing](https://supabase.com/pricing)
- [Netlify](https://docs.netlify.com/) · [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) · [Netlify pricing](https://www.netlify.com/pricing/) · [Railway](https://docs.railway.com/) · [Render](https://render.com/docs) · [Upstash Redis](https://upstash.com/docs/redis) · [GitHub Actions](https://docs.github.com/actions)
- MCP: [Atlassian Remote MCP (repo)](https://github.com/atlassian/atlassian-mcp-server) · [Atlassian MCP announcement](https://www.atlassian.com/blog/announcements/remote-mcp-server) · [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp) · [GitHub MCP](https://github.com/github/github-mcp-server)
- Rate limits (cross-ref): [Atlassian evolving API rate limits](https://www.atlassian.com/blog/development/evolving-api-rate-limits)
