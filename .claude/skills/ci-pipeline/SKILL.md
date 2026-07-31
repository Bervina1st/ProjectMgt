---
name: ci-pipeline
description: Author a GitHub Actions workflow — install, lint, typecheck, unit + integration tests, RLS isolation tests, and apply migrations on merge. Use to set up or extend CI.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Gate merges with CI (tech-stack §4).

Steps:
1. Workflow steps: install → lint → typecheck → unit tests → integration tests → RLS isolation tests.
2. On merge to main, apply DB migrations.
3. A red pipeline blocks merge. Use Turborepo task caching.

Docs: https://docs.github.com/actions · https://turbo.build/repo/docs/guides/ci-vendors/github-actions
