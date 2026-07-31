# PM Status Autopilot — Monorepo

[![CI](https://github.com/Bervina1st/ProjectMgt/actions/workflows/ci.yml/badge.svg)](https://github.com/Bervina1st/ProjectMgt/actions/workflows/ci.yml)

Turborepo monorepo for PM Status Autopilot. Full context lives in [`research/`](./research)
and [`.claude/CLAUDE.md`](./.claude/CLAUDE.md).

## Current state: frontend MVP
The shippable piece today is **`apps/web` — Statuscope**: a functional, database-free
Next.js frontend where a PM enters work items and gets an audience-ready status report with the
risks already flagged (deterministic), editable and exportable. The heavier pieces of the planned
architecture are reserved as empty workspaces and deferred per the roadmap.

## Layout
```
apps/
  web/            # ✅ Next.js frontend (Netlify) — the MVP
  worker/         # ⏳ deferred (M2–M3): Railway worker, ingest + generation
packages/
  shared/         # ✅ Zod schemas + types + deterministic risk/report logic
  db/             # ⏳ deferred (M1): Supabase schema, migrations, RLS
  integrations/   # ⏳ deferred (M2): Jira/GitHub/Slack adapters
```

## Develop
```bash
npm install          # installs all workspaces (root)
npm run dev          # turbo runs the web app (http://localhost:3000)
npm run build        # turbo builds everything
npm run typecheck    # type-checks all workspaces
```

## Deploy `apps/web` to Netlify
This is a monorepo, so install must happen at the repo **root** (to resolve the `@pmstatus/shared`
workspace). `netlify.toml` is configured for that. In the Netlify UI when importing the repo:

- **Base directory:** *(leave empty — repo root)*
- **Build command:** `npm run build`
- **Publish directory:** `apps/web/.next`
- **No environment variables needed** (no secrets, no database).

Netlify auto-installs the official Next.js runtime. If Netlify's monorepo detection asks for a
package directory, point it at `apps/web`.

## Notes
- Package manager is **npm workspaces** (project memory mentions pnpm; swap later if desired — the
  Turborepo structure is identical either way).
- The frontend is intentionally **client-side only**: no tRPC/Supabase/LLM yet. Those attach at
  roadmap M1–M3 without restructuring — the shared Zod schemas are already the contract.

## Credits
Designed & developed by **Christina Bervin**.
