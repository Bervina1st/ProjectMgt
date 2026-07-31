---
name: oauth-integration
description: Implement a per-tenant OAuth 2.0 (3LO) connect flow for an external provider (Jira/GitHub/Slack) — authorize URL, state/CSRF, callback token exchange, encrypted token storage, and automatic refresh. Use when connecting a provider.
argument-hint: [provider] [scopes]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Implement per-tenant OAuth for a provider (PRD Epic A, §6). Most security-sensitive plumbing in the app.

Steps:
1. Build the authorize URL with a signed `state` (CSRF) tied to the initiating user/org, requesting LEAST-privilege scopes.
2. Implement the `/api/oauth/:provider/callback` handler: validate `state`, exchange code, store tokens **encrypted** (Supabase Vault/KMS) in `integrations`.
3. Implement automatic refresh; on failure set `status = needs_reauth` and surface a reconnect prompt.
4. Implement disconnect (revoke + stop ingest).

Hard rules: never log, return to the client, or persist a token in plaintext. Registering a production OAuth app or changing scopes is side-effecting — escalate first. Route all output to security-review.

Docs: https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/ · https://docs.github.com/apps/oauth-apps/building-oauth-apps · https://api.slack.com/authentication/oauth-v2 · https://supabase.com/docs/guides/database/vault
