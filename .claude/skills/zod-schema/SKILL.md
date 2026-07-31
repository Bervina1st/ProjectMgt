---
name: zod-schema
description: Author a shared Zod schema in packages/shared used for validation at every FE/BE boundary and as the tRPC contract. Use whenever a new data shape crosses a boundary.
argument-hint: [schema name]
allowed-tools: Read, Write, Edit, Grep, Glob
---

Author a reusable, shared validation schema.

Steps:
1. Define the Zod schema in `packages/shared` with explicit constraints.
2. Export the inferred TS type alongside it.
3. Reuse it for tRPC input/output, form validation, and adapter parsing — one source of truth, validate at every boundary.

Docs: https://zod.dev/
