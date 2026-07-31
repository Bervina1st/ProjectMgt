---
name: risk-rule
description: Implement a DETERMINISTIC risk-detection rule over activity_events that emits an evidence-backed risk_flags row. Use for any risk signal (overdue, idle, done-but-PR-open, blocked, scope-added). Never an LLM guess.
argument-hint: [rule id]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Implement a deterministic, explainable risk rule (PRD Epic B/D). This is the trust backbone.

Steps:
1. Express the rule in SQL/TS over `activity_events` (+ identity links for cross-tool rules).
2. Emit a `risk_flags` row carrying `rule_id`, `severity`, `entity_ref`, and the `evidence` (the exact rows/values that triggered it).
3. Implement the open→acknowledged→resolved/dismissed lifecycle; keep one open flag per (project, rule, entity).
4. Add `/unit-test` covering boundary cases.

The LLM never decides what is at risk. Changing thresholds/severity is a product decision — escalate if ambiguous.

Docs: https://www.postgresql.org/docs/current/queries.html
