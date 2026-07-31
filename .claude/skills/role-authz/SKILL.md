---
name: role-authz
description: Enforce role-based authorization (owner/admin/member/viewer) on tRPC procedures via reusable middleware. Use when a procedure must be restricted to a minimum role.
argument-hint: [procedure] [min role]
allowed-tools: Read, Write, Edit, Grep, Glob
---

Apply consistent role gating on tRPC procedures (PRD §5).

Steps:
1. Define role-checking middleware that reads the caller's role from `memberships`.
2. Compose it into a role-gated procedure (e.g. `adminProcedure`).
3. Apply the minimum required role per the PRD §5 endpoint table; deny otherwise with a typed error.

RLS remains the backstop even if app-layer gating errs — never rely on this alone for tenant isolation.

Docs: https://trpc.io/docs/server/middlewares
