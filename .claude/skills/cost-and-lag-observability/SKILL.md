---
name: cost-and-lag-observability
description: Instrument the two guardrail metrics — cost-per-report (COGS) and ingest lag — and alert when thresholds are exceeded. Use when wiring generation and ingest monitoring.
allowed-tools: Read, Write, Edit, Grep, Glob
---

Track the margin/quality guardrails (PRD §6/§8).

Steps:
1. Emit cost-per-report from `reports.cost_cents`; alert if the rolling average exceeds target.
2. Emit ingest lag = `ingested_at − occurred_at`; alert if p95 > 15 min.
3. Send metrics to a low-cost sink; keep dashboards simple.

Docs: https://opentelemetry.io/docs/languages/js/
