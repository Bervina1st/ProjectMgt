---
name: trpc-endpoint
description: Add an end-to-end tRPC procedure — router + Zod input/output + role gating, wired to a typed frontend hook. Use when the UI needs a new read/write operation.
argument-hint: [procedure name]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Add a typed, role-gated tRPC procedure end-to-end (PRD §5).

Steps:
1. Define input/output with shared Zod schemas (`/zod-schema`) — no duplication.
2. Implement the procedure as `query` or `mutation`; apply role gating via `/role-authz`.
3. Expose a typed client hook (TanStack Query) for the frontend.
4. Map errors with `/error-handling`.

Internal API is tRPC only — no untyped fetches, no GraphQL.

Docs: https://trpc.io/docs · https://trpc.io/docs/client/react
