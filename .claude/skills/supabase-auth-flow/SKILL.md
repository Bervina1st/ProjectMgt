---
name: supabase-auth-flow
description: Implement or extend Supabase magic-link auth and propagate the session into tRPC context. Use for login, session refresh, sign-out, or wiring the authenticated caller (user + org) into the API.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Wire Supabase magic-link auth into the app (PRD Epic E).

Steps:
1. Implement magic-link login / sign-out pages with `@supabase/ssr`.
2. Build a session-aware tRPC context that resolves the caller's `user` and `org` (via `memberships`).
3. Expose a `protectedProcedure`; hand role gating to `/role-authz`.
4. Handle expired sessions with a clean re-auth path.

Docs: https://supabase.com/docs/guides/auth · https://supabase.com/docs/guides/auth/server-side/nextjs
