---
name: report-digest-builder
description: Compute the compact digest for a project+period — pre-computed facts (moved/stuck/overdue/scope) plus open risk flags with evidence — the ONLY thing sent to the LLM. Use before generating any report.
argument-hint: [project] [period]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Build the bounded, grounded digest (PRD Epic B; cost control).

Steps:
1. For the project+period, compute: items completed, in-progress, newly blocked, overdue, idle-past-threshold, scope added.
2. Attach open `risk_flags` with their evidence.
3. Produce a size-BOUNDED structured JSON digest (never the raw event firehose) and store it on the `reports` row for auditability.
4. Validate the digest against a shared Zod schema.

Docs: internal domain logic; see PRD §4 (`reports.digest`).
