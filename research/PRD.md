# Product Requirements Document — PM Status Autopilot

**Version:** 1.0 (MVP)
**Date:** 2026-07-30
**Status:** Draft for build
**Related docs:** [`viability-analysis.md`](./viability-analysis.md) · [`tech-stack.md`](./tech-stack.md)

> **How to read this doc:** A developer new to the project should be able to build the MVP from sections 3–6 alone. Sections 1–2 explain *who* and *why*; 7–8 define the boundary and the scorecard. Where a decision traces back to an earlier doc, it's cross-referenced.

---

## 1. Executive Summary

### What we're building
**PM Status Autopilot** is a web application that sits on top of the tools a project manager already uses — Jira first, then chat (Slack/Teams), code repos (GitHub), and calendars — reads the activity already happening in them, and automatically drafts clear, send-ready project status updates on a schedule the PM sets. It does not replace Jira; it removes the busywork Jira creates. Critically, it is **not merely an auto-summarizer** (Atlassian's Rovo already does that inside Jira — see viability §2). Its defensible core is a **cross-tool truth layer**: it catches where the tools *disagree* ("the ticket is marked Done, but its PR is still open and the demo meeting got cancelled"), flags what is genuinely at risk of slipping with **explainable, evidence-backed reasons**, and renders the same update in different versions for different audiences. The PM always reviews and edits before anything is sent — the human stays in control; the tedious 80% (gathering, correlating, synthesizing, writing) is done for them.

### Primary value proposition
> **Stop chasing updates and piecing together status by hand. Get an accurate, ready-to-send status report — with the real risks already flagged and the receipts attached — in the time it takes to skim and hit send.**

The wedge that separates us from native/single-tool AI is **cross-tool synthesis + trustworthy, explainable risk detection**, not "AI writes your update." (See viability §4 — this framing is the go-condition, not a nice-to-have.)

### Target user persona (psychographic)

**"Priya, the Accountable-but-Blind PM."** A technical program / project manager (or delivery lead / eng manager doing PM duties) responsible for 2–6 concurrent workstreams across one or more engineering teams.

- **Motivations:** To be the person who *always knows where things really stand* and is never caught off guard in front of leadership. She wants to spend her hours on unblocking people and managing risk — the parts of the job that need judgment — not on assembling reports.
- **Fears:** Being blindsided by a slip she should have seen coming. Sending a status update that turns out to be wrong and losing credibility. Being perceived as "just overhead" that shuffles tickets. Drowning in status meetings and DMs.
- **Goals:** Catch risks early enough to act. Communicate crisply to very different audiences (a CTO wants one line; her eng leads want detail). Reclaim the ~half-day-plus per week she currently loses to status compilation (viability §2: ~45% of PMs lose >1 day/week to this).
- **Disposition toward the product:** Skeptical by default — she's been burned by dashboards that look impressive and say nothing. She will trust the tool only if its output is *accurate enough to send with light edits* and its risk flags are *explainable*. Trust is the entire relationship. A single confidently-wrong report sets adoption back weeks.

---

## 2. User Avatar Deep Dive

### Who exactly is this for?
- **Primary:** Technical Project/Program Managers and Delivery Leads at software companies (~50–2,000 employees) who live in Jira and are accountable for communicating status upward and outward.
- **Secondary:** Engineering Managers and Team Leads who inherit PM duties and resent the reporting overhead.
- **Buyer vs. user:** Often the same person at MVP scale (bottom-up adoption), evolving to a PMO/Head-of-Delivery buyer at team/enterprise tiers.
- **Explicitly not for (at MVP):** Non-technical PMs on non-Jira stacks; solo founders; agencies doing client reporting (different data shape). See §7.

### Their current painful workflow (the "before")
1. **Thursday/Friday dread.** A recurring status report is due. Priya opens Jira, filters boards, and starts a manual sweep.
2. **Chasing.** Tickets are stale or lie. She pings 5–8 people on Slack: "is TICKET-123 actually done?" and waits, context-switching.
3. **Reconciling.** She mentally cross-references: the ticket says In Review, but she remembers the PR was reverted; a dependency's owner is on PTO (which she finds by accident). Nothing tells her this — she has to *know* it.
4. **Rewriting N times.** She writes a detailed version for her eng leads, then hand-trims a one-liner for the VP, then a different cut for the client/stakeholder channel.
5. **Guessing at risk.** Under time pressure, "at risk" is whatever she happens to remember, not a systematic scan. Things slip through.
6. **Sending into the void.** She's not even sure anyone reads it — but if she *doesn't* send it, that's the week something blows up.

Net: **a half-day-plus of low-judgment assembly work, producing output she's not fully confident in.**

### What success looks like for them (the "after")
- Opens the app on report day to a **pre-drafted, accurate report** with risks already surfaced and each flag backed by evidence she can verify in one click.
- Spends **10–15 minutes** skimming, lightly editing, and approving — down from hours.
- Gets the **audience variants generated for her** (exec one-liner, eng detail) from the same source of truth.
- Is **warned mid-week**, not just on report day, when something crosses a risk threshold — so she can act before it's a slip.
- Walks into leadership reviews knowing the report is *right* because it's grounded in actual cross-tool activity, not memory.

### What would make them tell a colleague?
The **"how did it know that?" moment**: the product surfaces a real, non-obvious risk she would have missed — a "done" ticket whose PR never merged, a critical-path item silently idle for 6 days, a dependency owner who's out — *with the evidence attached*, and she catches a slip because of it. That specific experience — being made to look prepared and prescient — is the word-of-mouth trigger. Not "it writes my reports" (everyone claims that); **"it caught something I would have missed."**

---

## 3. Feature Specification

Priorities: **P0** = MVP-critical (no launch without it) · **P1** = important (fast-follow) · **P2** = nice-to-have.

> **Scope tension to decide consciously (from viability §4):** the *differentiator* is cross-tool synthesis, but the fastest shippable MVP is Jira-only. Resolution in this PRD: **Jira ingest + generation + risk + audience variants + review/send are P0** (a coherent, demoable product), and **GitHub ingest is the highest-priority P1** because it's the cheapest way to unlock the cross-tool "truth layer" catch that validates the actual wedge. Ship P0 to design partners in weeks; add GitHub fast to test the differentiation. Do not let the MVP calcify as a Jira-only summarizer — that lane is closed.

### Epic A — Integrations & Ingest

**A1. Connect Jira (OAuth) — P0**
- *Story:* As a PM, I want to securely connect my Jira site so that the app can read my projects' activity without me exporting anything.
- *Acceptance criteria:*
  - OAuth 2.0 (3LO) flow completes; tokens stored **encrypted** (never plaintext).
  - User selects which Jira project(s) to track.
  - Connection status (healthy / needs re-auth / error) is visible.
  - Token refresh happens automatically; a broken/expired token surfaces a clear re-connect prompt.
  - Disconnecting removes access and stops ingest.
- *Technical notes/deps:* Jira Cloud REST + webhooks; per-tenant token store in `integrations` (encrypted via Supabase Vault/KMS). Must be **quota-aware** — points-based rate limits enforced March 2, 2026 (viability §1). Prefer webhooks over polling.

**A2. Ingest & normalize Jira activity — P0**
- *Story:* As the system, I need to pull ticket state changes, comments, assignees, due dates, and sprint data so that reports reflect what actually happened.
- *Acceptance criteria:*
  - Backfill on connect (configurable window, default 30 days) + ongoing delta ingest.
  - Events land in a **provider-normalized** `activity_events` shape (not raw Jira JSON).
  - Handles pagination and 429s with backoff; no data loss on transient failures.
  - Ingest lag < 15 min from event to stored (webhook path).
- *Technical notes/deps:* Worker (Railway) + pg-boss (tech-stack §2). Normalization layer is where cross-tool value lives — design it provider-agnostic from day one.

**A3. Connect GitHub & correlate with Jira — P1 (highest-priority follow-on)**
- *Story:* As a PM, I want the app to also read repo activity so that it can catch when a ticket's real code state contradicts its Jira status.
- *Acceptance criteria:*
  - GitHub OAuth; select repos.
  - PRs/commits linked to Jira issues (by key in branch/PR title/commit) land as normalized events.
  - System can answer "issue marked Done but linked PR is open/unmerged."
- *Technical notes/deps:* Octokit; identity + issue-key correlation (`identities`, `identity_links`). **This unlocks the differentiator** — prioritize immediately after P0.

**A4. Connect Slack/Teams & Calendar — P1/P2**
- *Story:* As a PM, I want chat and calendar signal folded in so that blockers discussed in chat and cancelled key meetings show up in status.
- *Priority:* Slack **P1**, Calendar **P2**.
- *Acceptance criteria:* OAuth connect; blocker/mention/keyword signal and key-meeting events normalized. Webhook signatures verified.
- *Technical notes/deps:* `@slack/web-api`; Google/MS calendar APIs. Privacy-sensitive — ingest metadata/flagged signals, not wholesale message archives (see §6 security).

### Epic B — Report Generation

**B1. Deterministic status + risk computation — P0**
- *Story:* As the system, I want to compute what moved, what's stuck, and what's at risk from raw events **before** involving the LLM so that reports are grounded and explainable.
- *Acceptance criteria:*
  - Computes per-project: items completed, in-progress, newly blocked, overdue, idle-past-threshold, scope added.
  - Each **risk flag carries a machine-readable reason** (rule id + the evidence rows that triggered it), not an LLM opinion.
  - Rules configurable (idle-days threshold, due-date proximity).
- *Technical notes/deps:* Pure SQL/TS over `activity_events`. This is the **trust backbone** (viability §1, §4) — risk detection must be deterministic and auditable.

**B2. LLM narrative generation from a compact digest — P0**
- *Story:* As a PM, I want a well-written status narrative generated from the computed facts so that I don't write it from scratch.
- *Acceptance criteria:*
  - LLM receives a **compact digest** (computed facts + evidence), not the raw event firehose (cost control — tech-stack §4).
  - Output is structured (summary, highlights, risks, next steps) and maps every risk claim back to a B1 flag.
  - No hallucinated tickets/people: every referenced entity must exist in the digest.
  - Regeneration is idempotent-ish: same inputs → materially consistent output.
- *Technical notes/deps:* Anthropic API (default to latest Claude). Track **cost-per-report** as a first-class metric.

**B3. Multi-audience variants — P0**
- *Story:* As a PM, I want the same update rendered as an exec one-liner and a detailed eng view so that I don't hand-trim N versions.
- *Acceptance criteria:*
  - At least two built-in audiences: **Executive** (≤3 sentences, outcomes/risks only) and **Engineering** (detailed, per-workstream).
  - Variants derive from one source of truth; editing facts doesn't desync variants.
  - Custom audience templates — **P1**.
- *Technical notes/deps:* Prompt/templating layer; variants stored in `report_versions`.

**B4. Scheduled generation — P0**
- *Story:* As a PM, I want reports auto-drafted on my cadence so that they're ready when I need them.
- *Acceptance criteria:*
  - Per-project schedule (e.g., weekly Fri 9am, PM's timezone).
  - Draft is generated and PM notified it's ready to review.
  - Manual "generate now" also available.
- *Technical notes/deps:* pg-boss scheduled jobs; timezone-correct.

### Epic C — Review, Edit, Deliver

**C1. Edit-before-send review surface — P0**
- *Story:* As a PM, I want to review and edit the draft before anything goes out so that I stay in control of what's communicated.
- *Acceptance criteria:*
  - Rich-text editor (TipTap) pre-loaded with the draft.
  - Each risk flag shows its **evidence** (click → the tickets/PRs/events behind it).
  - Edits are saved; report has explicit states: `draft → edited → approved → sent`.
  - Nothing is sent without an explicit human approve action.
- *Technical notes/deps:* TipTap (tech-stack §1); `reports`/`report_versions` state machine.

**C2. Manual export/copy delivery — P0**
- *Story:* As a PM, I want to copy or export the approved report so that I can paste it wherever it needs to go.
- *Acceptance criteria:* Copy-to-clipboard (formatted + plain), Markdown export. Records `sent` state + timestamp.
- *Technical notes/deps:* Deliberately manual at MVP to avoid the "send on user's behalf" surface and permission complexity.

**C3. Auto-delivery to Slack/email — P1**
- *Story:* As a PM, I want approved reports posted to a channel or emailed automatically so that I skip the copy-paste.
- *Acceptance criteria:* Only fires **after** human approval (never auto-send an unreviewed report). Destination configurable. Full audit trail.
- *Technical notes/deps:* Outbound sending is a sensitive action — always human-gated; log every send.

### Epic D — Proactive Risk Alerts

**D1. Mid-cycle risk alerts — P1**
- *Story:* As a PM, I want to be warned when something crosses a risk threshold between reports so that I can act before it slips.
- *Acceptance criteria:* When a B1 rule newly trips (e.g., critical-path item idle 5+ days), notify the PM with the evidence. Deduped; not noisy.
- *Technical notes/deps:* Runs on ingest, not just on schedule. This is a core "tell a colleague" driver (§2) — high value, hence early P1.

### Epic E — Accounts & Foundation

**E1. Auth & org onboarding — P0** — Supabase Auth (magic link, continuity with existing setup, tech-stack §2); create org on signup.
**E2. Multi-tenant org & membership — P0** — org/user/membership model with RLS isolation (§4).
**E3. Project dashboard — P0** — list tracked projects, their status snapshot, next scheduled report, connection health.
**E4. Team members & roles — P1** — invite teammates; roles (owner/admin/member/viewer).
**E5. Billing/subscriptions — P2 (out of MVP)** — see §7.

---

## 4. Database Schema

**Engine:** Supabase Postgres. **Isolation:** every tenant-scoped table carries `org_id`; **Row-Level Security (RLS)** policies gate every row by the authenticated org (tech-stack §3). App code never relies on WHERE-clause discipline alone.

### Multi-tenancy architecture
- **Model:** shared-database, shared-schema, **row-level isolation via `org_id` + RLS**. Simplest to operate at MVP scale; RLS makes isolation DB-enforced.
- **Auth linkage:** Supabase `auth.users.id` → `users.auth_id`. RLS policies resolve the caller's `org_id` via their `memberships` and restrict all reads/writes.
- **Encryption:** integration tokens encrypted at the column level (Supabase Vault / pgsodium or app-side KMS). The `integrations` token columns are the most sensitive data in the system.

### Entity-relationship overview
```
orgs ──< memberships >── users(auth)
  │
  ├──< integrations           (per provider, encrypted tokens)
  ├──< projects ──< project_integrations >── integrations
  │        │
  │        ├──< activity_events        (normalized cross-tool event log)
  │        ├──< risk_flags             (deterministic, evidence-backed)
  │        ├──< report_schedules
  │        └──< reports ──< report_versions   (per audience)
  │
  ├──< identities ──< identity_links   (cross-tool person resolution)
  └──< audit_log
```

### Tables

**orgs** — a tenant.
| field | type | notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| name | text NOT NULL | |
| created_at | timestamptz NOT NULL default now() | |

**users** — app users linked to Supabase auth.
| id | uuid PK |
| auth_id | uuid UNIQUE NOT NULL | → `auth.users.id` |
| email | citext NOT NULL | |
| display_name | text | |
| created_at | timestamptz default now() |

**memberships** — user ↔ org, with role.
| id | uuid PK |
| org_id | uuid FK→orgs NOT NULL |
| user_id | uuid FK→users NOT NULL |
| role | text NOT NULL CHECK in ('owner','admin','member','viewer') |
| created_at | timestamptz default now() |
| — | UNIQUE(org_id, user_id) |

**integrations** — a connected external account for an org.
| id | uuid PK |
| org_id | uuid FK→orgs NOT NULL |
| provider | text NOT NULL CHECK in ('jira','github','slack','gcal','msteams','mscal') |
| external_account_id | text | e.g., Jira cloudid |
| access_token_enc | bytea NOT NULL | encrypted |
| refresh_token_enc | bytea | encrypted |
| token_expires_at | timestamptz | |
| scopes | text[] | |
| status | text NOT NULL default 'active' CHECK in ('active','needs_reauth','error','revoked') |
| created_at | timestamptz default now() |
| — | UNIQUE(org_id, provider, external_account_id) |

**projects** — a tracked workstream.
| id | uuid PK |
| org_id | uuid FK→orgs NOT NULL |
| name | text NOT NULL |
| external_ref | jsonb | e.g., {jira_project_key} |
| settings | jsonb | risk thresholds, etc. |
| created_at | timestamptz default now() |

**project_integrations** — which integrations feed a project (M:N).
| project_id | uuid FK→projects | PK part |
| integration_id | uuid FK→integrations | PK part |
| config | jsonb | e.g., repo list, board id |

**activity_events** — the normalized cross-tool event log (heart of the system).
| id | uuid PK |
| org_id | uuid FK→orgs NOT NULL |
| project_id | uuid FK→projects NOT NULL |
| provider | text NOT NULL |
| event_type | text NOT NULL | normalized: 'issue_status_changed','issue_blocked','pr_opened','pr_merged','comment_added','meeting_cancelled', etc. |
| entity_type | text | 'issue','pr','commit','meeting','message' |
| entity_ref | text | provider-native id/key |
| actor_identity_id | uuid FK→identities | nullable until resolved |
| occurred_at | timestamptz NOT NULL |
| payload | jsonb NOT NULL | normalized fields (from_status, to_status, due_date, title…) |
| ingested_at | timestamptz default now() |
| — | UNIQUE(provider, entity_ref, event_type, occurred_at) — idempotent ingest |

**identities** — a resolved person within an org.
| id | uuid PK | org_id FK→orgs NOT NULL | display_name text | primary_email citext | created_at |

**identity_links** — provider handles that map to one identity (cross-tool resolution).
| id | uuid PK | identity_id uuid FK→identities NOT NULL | provider text NOT NULL | external_handle text NOT NULL | UNIQUE(provider, external_handle) |

**risk_flags** — deterministic, evidence-backed risks.
| id | uuid PK |
| org_id | uuid FK→orgs NOT NULL |
| project_id | uuid FK→projects NOT NULL |
| rule_id | text NOT NULL | e.g., 'overdue','idle_gt_threshold','done_but_pr_open','blocked','scope_added' |
| severity | text NOT NULL CHECK in ('low','medium','high') |
| entity_ref | text | the at-risk item |
| evidence | jsonb NOT NULL | the event ids / values that triggered the rule |
| status | text NOT NULL default 'open' CHECK in ('open','acknowledged','resolved','dismissed') |
| first_detected_at | timestamptz default now() |
| resolved_at | timestamptz |
| — | UNIQUE(project_id, rule_id, entity_ref) while open |

**report_schedules** — when to auto-generate.
| id | uuid PK | org_id FK | project_id FK NOT NULL | cadence text ('weekly','biweekly','daily') | day_of_week int | time_local time | timezone text NOT NULL | enabled bool default true | created_at |

**reports** — one status report instance for a project + period.
| id | uuid PK |
| org_id | uuid FK→orgs NOT NULL |
| project_id | uuid FK→projects NOT NULL |
| period_start | timestamptz | period_end timestamptz |
| state | text NOT NULL default 'draft' CHECK in ('draft','edited','approved','sent','failed') |
| generated_by | text CHECK in ('schedule','manual') |
| digest | jsonb | the compact facts sent to the LLM (auditability) |
| cost_cents | numeric | LLM cost for this report (margin tracking) |
| created_at | timestamptz default now() | approved_at timestamptz | sent_at timestamptz |

**report_versions** — per-audience rendering of a report.
| id | uuid PK | report_id uuid FK→reports NOT NULL | audience text NOT NULL ('executive','engineering', custom) | content_md text NOT NULL | content_json jsonb | edited_by uuid FK→users | is_current bool default true | created_at |

**audit_log** — sensitive actions (sends, deletes, token changes).
| id | uuid PK | org_id FK | user_id FK | action text NOT NULL | target_type text | target_id uuid | metadata jsonb | created_at default now() |

### Indexing strategy (for common queries)
- `activity_events (project_id, occurred_at DESC)` — report generation reads a project's recent events. **Primary hot path.**
- `activity_events (org_id, occurred_at DESC)` — org-wide feeds/alerts.
- Partial index `risk_flags (project_id) WHERE status = 'open'` — dashboards & alerts read open risks.
- `reports (project_id, created_at DESC)` — report history.
- `memberships (user_id)` and `memberships (org_id)` — RLS policy resolution (keep fast).
- `integrations (org_id, provider)` — connection health lookups.
- GIN index on `activity_events.payload` only if/when payload filtering is needed (defer).
- pgvector index (ivfflat/hnsw) on an events-embedding column **only when** semantic de-dup is implemented (P1+), not at MVP.

### Data validation rules
- All enums enforced via `CHECK` constraints (listed above) — invalid states impossible at the DB layer.
- FKs `ON DELETE CASCADE` from `orgs` downward (deleting a tenant purges its data); `RESTRICT` where an accidental cascade would lose audit history (`audit_log` retained).
- `activity_events` idempotency via the UNIQUE tuple — re-ingesting the same event is a no-op (`ON CONFLICT DO NOTHING`).
- Tokens: NOT NULL on `access_token_enc`; app-layer refuses to persist plaintext.
- `report_versions`: exactly one `is_current = true` per (report_id, audience) — enforced by partial unique index.
- Timezones: `report_schedules.timezone` required; all scheduling computed in the PM's zone, stored UTC.
- RLS: default-deny; every tenant table has an explicit policy keyed on the caller's org via `memberships`.

---

## 5. API Specification

**Two API surfaces (tech-stack §2):**
1. **Internal app API — tRPC** (type-safe, first-party frontend only). Described below as procedures grouped by router. Auth: Supabase session (JWT) on every call; RLS enforces tenancy.
2. **External-facing HTTP endpoints — REST** (Next.js route handlers on Netlify): OAuth callbacks and inbound webhooks. These are the only publicly reachable HTTP routes.

> **Convention:** tRPC procedures are `query` (read) or `mutation` (write). All internal procedures require an authenticated session; authorization is by org membership + role. All requests/responses validated with **Zod** (shared FE/BE schemas).

### 5.1 Internal API (tRPC procedures)

**auth / org**
| Procedure | Type | Auth | Purpose |
|---|---|---|---|
| `org.current` | query | session | Current org + role |
| `org.create` | mutation | session | Create org on onboarding |
| `org.members.list` | query | member+ | List members |
| `org.members.invite` | mutation | admin+ | Invite (P1) |

**integrations**
| `integrations.list` | query | member+ | Connected providers + health |
| `integrations.startOAuth` | mutation | admin+ | Returns provider OAuth URL + state |
| `integrations.disconnect` | mutation | admin+ | Revoke + stop ingest |

Request (`startOAuth`): `{ provider: 'jira'|'github'|'slack'|... }` → Response: `{ authorizeUrl: string, state: string }`.

**projects**
| `projects.list` | query | member+ | Tracked projects + status snapshot |
| `projects.create` | mutation | member+ | Create; attach integration(s) & external ref |
| `projects.get` | query | member+ | Detail: recent events, open risks, next report |
| `projects.updateSettings` | mutation | member+ | Risk thresholds, etc. |

**risks**
| `risks.listOpen` | query | member+ | Open risk_flags for a project (with evidence) |
| `risks.updateStatus` | mutation | member+ | acknowledge/resolve/dismiss |

**reports**
| `reports.generateNow` | mutation | member+ | Enqueue generation for a project → job id |
| `reports.list` | query | member+ | Report history for a project |
| `reports.get` | query | member+ | Report + all audience versions + digest/evidence |
| `reports.updateVersion` | mutation | member+ | Save edits to a version |
| `reports.approve` | mutation | member+ | draft/edited → approved |
| `reports.markSent` | mutation | member+ | approved → sent (manual delivery) |
| `reports.deliver` | mutation | member+ | Auto-deliver approved report (P1); human-gated |

Response (`reports.get`): `{ id, state, period, versions: [{audience, content_md, content_json, is_current}], risks: [{rule_id, severity, entity_ref, evidence}], digest, cost_cents }`.

**schedules**
| `schedules.upsert` | mutation | member+ | Set/replace a project's cadence |
| `schedules.list` | query | member+ | Schedules for org/project |

### 5.2 External REST endpoints (route handlers)

| Method & path | Auth | Purpose | Notes |
|---|---|---|---|
| `GET /api/oauth/:provider/callback` | OAuth state param | Exchange code → encrypted tokens | Validates `state` (CSRF); stores in `integrations` |
| `POST /api/webhooks/jira` | Signature/JWT verify | Inbound Jira events → normalize → `activity_events` | Verify Atlassian signature; 200 fast, process async |
| `POST /api/webhooks/github` | HMAC (X-Hub-Signature-256) | Inbound GitHub events | Verify HMAC or reject |
| `POST /api/webhooks/slack` | Slack signing secret | Slack events (P1) | Verify signature + timestamp |
| `GET /api/health` | none | Liveness | For uptime checks |

**Request/response formats:** JSON throughout; webhooks respond `200 {received:true}` within ~3s and enqueue heavy work to the pg-boss queue (never process synchronously in the handler).

### 5.3 Authentication requirements per endpoint
- **tRPC procedures:** valid Supabase session required; **role gating** as noted (owner/admin/member/viewer); RLS enforces org isolation even if app logic errs.
- **OAuth callback:** authenticated via signed `state` tied to the initiating user/org; reject on mismatch.
- **Webhooks:** provider signature verification is **mandatory** — an unverified webhook is rejected (401). No other auth (they're machine-to-machine).
- **Health:** unauthenticated, no data.

### 5.4 Rate limiting considerations
- **Outbound (to providers):** the worker must be **quota-aware** for Jira's points-based limits (enforced March 2, 2026 — viability §1). Prefer webhooks over polling; batch; exponential backoff on 429; per-integration token-bucket so one noisy tenant can't exhaust shared quota.
- **Inbound (our APIs):** rate-limit webhook receivers and tRPC mutations per org (e.g., via Upstash or app middleware) to blunt abuse/ret_storms.
- **LLM (Anthropic):** cap concurrent generations; queue and backoff on provider limits; hard per-org daily generation cap to protect COGS.
- **Idempotency:** webhook processing keyed on the `activity_events` UNIQUE tuple so provider re-deliveries don't duplicate.

---

## 6. Non-Functional Requirements

### Performance targets
- Dashboard/report **read** views: p95 < 500 ms (server) for a project with ≤5k recent events.
- **Ingest lag:** webhook event → queryable in `activity_events` p95 < 15 min.
- **Report generation:** end-to-end (enqueue → draft ready) p95 < 60 s for a typical project; user is notified async, so this is not a blocking UI wait.
- **Cost-per-report:** tracked per report; alert if the rolling average exceeds a set threshold (margin guardrail).

### Security requirements
- **Tenant isolation:** RLS default-deny on every tenant table; verified by automated tests that assert cross-org reads return zero rows.
- **Token handling:** integration tokens encrypted at rest (column-level); never logged, never returned to the client. Plaintext persistence is a build-time lint/CI failure.
- **Webhook integrity:** signature verification mandatory; reject unsigned/invalid.
- **Least-privilege OAuth scopes:** request the minimum scopes per provider (read-focused for ingest).
- **Data minimization (chat/calendar):** ingest flagged signals and metadata, not wholesale message/meeting archives (§3 A4). Document what is and isn't stored.
- **Audit:** all sensitive actions (sends, disconnects, deletes, role changes) recorded in `audit_log`.
- **Transport:** HTTPS only; HSTS.
- **Compliance posture:** architect toward **SOC 2** from day one (viability §1); PII inventory maintained; deletion path purges tenant data on request.
- **Secrets:** in platform env stores (Netlify/Railway/Supabase), never in the repo.

### Accessibility standards
- Target **WCAG 2.1 AA**: keyboard-navigable throughout (the editor especially), visible focus states, sufficient color contrast, semantic headings/landmarks, ARIA on interactive components, form labels/error messaging.
- Risk severity never conveyed by color alone (icon/text label too).
- shadcn/ui + Radix primitives (tech-stack §1) give accessible component baselines — don't regress them.

### Mobile responsiveness requirements
- **Responsive web, desktop-first, mobile-usable** (tech-stack §1 — no React Native at MVP).
- Must be fully functional at 375px width for the core **read + approve** flow (a PM approving a report from their phone).
- Heavy editing is optimized for ≥768px; small screens get a clean read/approve/light-edit experience, not a broken desktop layout.
- No horizontal page scroll; tables/diagrams scroll within their own containers.

---

## 7. Out of Scope

### Explicitly NOT building in MVP
- **Native mobile apps** (React Native/iOS/Android) — responsive web only.
- **Replacing or writing back into Jira** — we read and sit on top; we do not manage tickets. (Non-negotiable positioning — viability §0/§2.)
- **Fully autonomous sending** — nothing goes out without human approval; no "set it and forget it" unreviewed delivery.
- **Calendar ingest** (P2) and **Teams/MS calendar** — Jira + GitHub + Slack are the MVP integration set.
- **Custom audience template builder** — two built-in audiences (exec, eng) at MVP; custom is P1.
- **Billing/subscriptions/paywall** — design partners are free during MVP; billing is P2.
- **Advanced analytics / portfolio roll-up dashboards** — the PMO multi-project roll-up is a v2 differentiator, not MVP.
- **Semantic de-dup via embeddings (pgvector)** — deterministic correlation first; embeddings when volume justifies.
- **On-prem / Jira Data Center** — Jira **Cloud** only.
- **Non-Jira PM tools** (Asana, Linear, Monday) — Jira-first; others are future expansion.

### Future considerations (v2+)
- **Cross-tool "truth layer" fully realized** across Jira + repo + chat + calendar (the durable moat — viability §4).
- **Portfolio/PMO roll-up** for the buyer above the individual PM.
- **Custom audiences + brand/tone controls.**
- **Auto-delivery integrations** (Slack, email, Confluence) — human-gated.
- **Historical trend analytics** on risk/velocity.
- **Billing, team tiers, SSO/SAML, SOC 2 attestation** for enterprise.
- **Additional PM tools** (Linear/Asana) once the wedge is proven on Jira.

---

## 8. Success Metrics

**North-star metric:** **Approved reports sent per active PM per week** — it captures the whole loop (generated → trusted enough to edit → approved → sent). A tool that generates reports nobody sends has failed regardless of usage.

### Guardrail / trust metrics (these decide whether the wedge is real)
- **Edit ratio:** median % of the draft changed before approval. **Target < 20%** (light edits). If this is high, the value prop is failing (viability §4 trust threshold) — this is the single most important early signal.
- **"Caught something" rate:** % of reports where a surfaced risk was acknowledged/acted on. This is the word-of-mouth driver (§2).
- **Time-to-approve:** median minutes from draft-ready to approved. **Target < 15 min** vs. the hours-long status quo.
- **Cost-per-report** (COGS guardrail): stays within margin target as usage scales.

### Adoption / retention
- **Integration connect rate:** % of signups who connect Jira and create ≥1 project.
- **Activation:** % who approve+send ≥1 report in their first week.
- **Weekly retention:** % of activated PMs who send a report again the following week.

### Targets

| Metric | Launch week | Month 1 | Month 3 |
|---|---|---|---|
| Design-partner PMs onboarded | 5–10 | 15–25 | 40–60 |
| Connected Jira + ≥1 project | ≥ 70% of signups | ≥ 75% | ≥ 80% |
| Activation (approved+sent ≥1 report) | ≥ 50% of onboarded | ≥ 65% | ≥ 70% |
| **Edit ratio (median)** | ≤ 35% (learning) | ≤ 25% | **≤ 20%** |
| Time-to-approve (median) | ≤ 25 min | ≤ 20 min | ≤ 15 min |
| "Caught something" rate | qualitative anecdotes | ≥ 25% of reports | ≥ 40% |
| Weekly retention (activated) | — | ≥ 50% | ≥ 60% |
| GitHub connected (cross-tool wedge live) | — | ≥ 40% | ≥ 60% |

**Kill/pivot signals (from viability §4):** if by Month 1 the **edit ratio stays high** (drafts need heavy rewriting) or PMs **don't return** to send a second report, the trust threshold is failing — stop scaling and fix accuracy before spending on growth. Conversely, a rising **"caught something" rate** with low edit ratio is the green light to invest in the cross-tool differentiation and the PMO roll-up.

---

*End of PRD v1.0. Sections 3–6 are the build contract; 7 is the boundary; 8 is the scorecard. When in doubt about scope, default to the narrower P0 and validate the trust metrics before adding surface area.*
