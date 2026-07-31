---
name: provider-adapter
description: Build a provider adapter (Jira/GitHub/Slack) that backfills and receives activity and maps it to the provider-NORMALIZED activity_events shape. Use when adding or extending ingestion for a tool.
argument-hint: [provider] [event kinds]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Build a normalized ingestion adapter (PRD Epic A). This normalization layer is where cross-tool value lives.

Steps:
1. Implement backfill (configurable window, default 30 days) + ongoing delta ingest using `/rate-limit-aware-client`.
2. Map every event to the normalized `activity_events` shape (event_type, entity_type, entity_ref, occurred_at, payload). Provider-specific parsing stays INSIDE the adapter.
3. Make ingest idempotent (unique tuple + `ON CONFLICT DO NOTHING`).
4. Resolve actors/issue-keys via `/identity-resolution`.
5. Add `/unit-test` for the normalization mapping.

Live in `packages/integrations/<provider>/`. No Jira write-back — read only.

Docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/ · https://github.com/octokit/octokit.js · https://api.slack.com/web
