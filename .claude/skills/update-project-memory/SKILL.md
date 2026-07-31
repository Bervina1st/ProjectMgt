---
name: update-project-memory
description: Keep .claude/CLAUDE.md (especially the Current State section) and the research/ docs consistent as work lands. Use after a change is merged.
argument-hint: [what changed]
allowed-tools: Read, Edit, Grep, Glob
---

Keep memory truthful (CLAUDE.md §3).

Steps:
1. Update CLAUDE.md "Current State": move items across built / in-progress / known-issues; update the immediate next step.
2. Keep the file tight (< ~200 lines) and accurate — link to research docs, don't duplicate them.
3. If a merged change altered a research doc's assumptions, note it there.
4. Report only what actually landed — no aspirational "done".

Docs: https://code.claude.com/docs/en/memory
