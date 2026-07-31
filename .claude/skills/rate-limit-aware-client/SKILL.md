---
name: rate-limit-aware-client
description: Wrap a provider HTTP client with quota awareness — batching, exponential backoff on 429, per-integration token buckets — sized for Jira's points-based limits. Use for any outbound provider API traffic.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Build the shared quota-aware client used by all adapters (PRD §1, §5.4).

Steps:
1. Wrap fetch/undici with a concurrency limiter (p-queue/bottleneck).
2. Prefer webhooks over polling; batch requests.
3. Exponential backoff + retry on 429; honor `Retry-After`.
4. Per-integration token bucket so one noisy tenant can't exhaust shared quota. Assume Jira points-based limits (enforced 2 Mar 2026).
5. Log throttling events via `/structured-logging-audit`.

Docs: https://developer.atlassian.com/cloud/jira/platform/rate-limiting/ · https://www.atlassian.com/blog/developer/evolving-api-rate-limits
