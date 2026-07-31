---
name: unit-test
description: Write fast Vitest unit tests for pure logic — risk rules, digest builder, normalization, identity matching. Use after implementing any pure-logic unit.
argument-hint: [unit under test]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Cover pure logic with fast, deterministic tests.

Steps:
1. Test the happy path plus edge/boundary cases (risk thresholds, empty digest, idempotent re-ingest).
2. No live external API calls; keep tests fast and deterministic.
3. Assert against the skill's acceptance criteria in `research/skills.md`.

Do not modify implementation to make a test pass — return failures to the owning agent.

Docs: https://vitest.dev/
