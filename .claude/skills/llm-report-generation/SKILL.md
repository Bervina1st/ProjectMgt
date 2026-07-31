---
name: llm-report-generation
description: Call the Anthropic API to render the digest into audience-variant narratives (executive, engineering) with anti-hallucination validation and per-report cost capture. Use to produce report drafts from a digest.
argument-hint: [digest id] [audiences]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Skill
---

Generate audience-variant narratives from the digest (PRD Epic B, §8).

Steps:
1. Before calling the API, consult the project `claude-api` skill for current model IDs / SDK usage; default to the latest Claude model.
2. Send ONLY the compact digest. Produce structured output (summary, highlights, risks, next steps).
3. Anti-hallucination: every ticket/PR/person referenced MUST exist in the digest — validate and regenerate/reject otherwise.
4. Render executive (≤3 sentences) and engineering (detailed) variants from ONE source of truth; store in `report_versions`; map each risk claim to a `risk_flag`.
5. Record `cost_cents`; flag if the rolling average drifts above target (`/cost-and-lag-observability`).

Do not send/deliver — that is human-gated in the UI.

Docs: https://docs.anthropic.com/en/api · https://docs.anthropic.com/en/api/client-sdks
