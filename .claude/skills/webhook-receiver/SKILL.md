---
name: webhook-receiver
description: Implement a public webhook endpoint that verifies the provider signature, responds fast, and enqueues heavy processing. Use when wiring inbound real-time events from Jira/GitHub/Slack.
argument-hint: [provider]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Implement a signed webhook receiver (PRD §5, §6).

Steps:
1. Create the route handler `/api/webhooks/<provider>`.
2. VERIFY the provider signature (GitHub HMAC `X-Hub-Signature-256`, Slack signing secret + timestamp, Atlassian signature). Reject invalid/unsigned with 401.
3. Respond `200 {received:true}` within ~3s; enqueue the real work to pg-boss (`/scheduled-job`). Never process synchronously.
4. Rely on the `activity_events` unique tuple for idempotent re-delivery.

Route to security-review.

Docs: https://docs.github.com/webhooks/using-webhooks/validating-webhook-deliveries · https://api.slack.com/authentication/verifying-requests-from-slack · https://developer.atlassian.com/cloud/jira/platform/webhooks/
