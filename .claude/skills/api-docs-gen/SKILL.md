---
name: api-docs-gen
description: Generate developer docs for tRPC procedures and REST/webhook endpoints from their Zod schemas (inputs, outputs, auth, roles). Use when endpoints change and docs are stale.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Keep API docs in sync.

Steps:
1. Enumerate tRPC routers + REST/webhook handlers.
2. Derive input/output from Zod (`zod-to-json-schema`); note auth + required role per endpoint.
3. Write/refresh `docs/api.md`.

Docs: https://github.com/StefanTerdell/zod-to-json-schema
