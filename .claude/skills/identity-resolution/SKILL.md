---
name: identity-resolution
description: Correlate people and issue keys across tools (Jira assignee ↔ GitHub author ↔ Slack user; PR/branch ↔ Jira key) into identities/identity_links. Use to enable cross-tool risk detection like "done ticket, open PR".
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Resolve cross-tool identities and issue links (PRD §2, §6).

Steps:
1. Extract actor handles and issue keys from adapter events.
2. Match to an existing `identities` row or create one; record provider handles in `identity_links`.
3. Match PRs/branches/commits to Jira issue keys (from branch/PR title/commit).
4. Set `actor_identity_id` on events. Track confidence; do NOT force low-confidence matches — a wrong match produces wrong-sounding reports and erodes trust.

Docs: https://www.postgresql.org/docs/current/functions-matching.html
