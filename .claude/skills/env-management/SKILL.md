---
name: env-management
description: Manage environment variables consistently across Netlify/Railway/Supabase — names only, values in platform stores, never in the repo. Use when adding or renaming any env var.
argument-hint: [var name] [services]
allowed-tools: Read, Write, Edit, Grep, Glob
---

Manage env vars by NAME only (CLAUDE.md §6).

Steps:
1. Add the variable NAME to `.env.example` with a comment; never a real value.
2. Note which platform stores need it (Netlify web / Railway worker / Supabase).
3. Confirm nothing secret is committed.

Known vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `TOKEN_ENCRYPTION_KEY`, `JIRA_OAUTH_CLIENT_ID/SECRET`, `GITHUB_OAUTH_CLIENT_ID/SECRET`, `SLACK_CLIENT_ID/SECRET`, `SLACK_SIGNING_SECRET`.

Docs: https://docs.netlify.com/environment-variables/overview/ · https://docs.railway.com/guides/variables
