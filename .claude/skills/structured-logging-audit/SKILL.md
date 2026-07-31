---
name: structured-logging-audit
description: Add structured logging and write audit_log rows for sensitive actions (sends, disconnects, deletes, role/token changes). Use whenever implementing a sensitive or side-effecting action.
allowed-tools: Read, Write, Edit, Grep, Glob
---

Instrument logging + audit trail (PRD §4/§6).

Steps:
1. Emit structured logs (pino) — NEVER log secrets or tokens.
2. For sensitive actions (report sent, integration disconnected, deletes, role/token changes), write an `audit_log` row (org, user, action, target, metadata).
3. Keep audit entries append-only.

Docs: https://getpino.io/
