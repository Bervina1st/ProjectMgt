---
name: report-editor
description: Integrate the TipTap editor for the report review/edit surface — load the AI draft, per-audience tabs, expandable evidence per risk flag, and the draft→edited→approved→sent state machine. Use for the report review screen.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Build the trust-critical review surface (PRD Epic C).

Steps:
1. Load the draft into a TipTap editor with executive/engineering tabs from `report_versions`.
2. For each risk, show click-to-expand EVIDENCE (the tickets/PRs behind it) — never a black box.
3. Drive the state machine `draft → edited → approved → sent`; persist edits.
4. Require an explicit human "approve" action before any delivery. NOTHING sends unreviewed.
5. Ensure the read+approve flow works at 375px (`/responsive-a11y-check`).

Changing the state machine or approval gate is a product-invariant change — escalate first.

Docs: https://tiptap.dev/docs · https://prosemirror.net/docs/
