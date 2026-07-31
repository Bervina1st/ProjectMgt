---
name: error-handling
description: Apply the standard typed-error and consistent error-response format across tRPC and REST — user-safe messages, mapped provider/LLM failures, retry semantics. Use when adding an endpoint or job that can fail.
allowed-tools: Read, Write, Edit, Grep, Glob
---

Standardize error handling (PRD §5/§6).

Steps:
1. Define typed error classes; map provider/LLM failures to them (e.g. Jira 401 → `needs_reauth` surfaced to the PM).
2. Use a consistent tRPC error formatter; never leak internals or secrets to the client.
3. Define retry vs. fail-fast semantics per failure type.

Docs: https://trpc.io/docs/server/error-handling
