---
name: responsive-a11y-check
description: Verify a view meets WCAG 2.1 AA and works at 375px — keyboard nav, focus, contrast, no color-only meaning, no horizontal page scroll. Use after building or changing any UI view.
argument-hint: [view]
allowed-tools: Read, Bash, Grep, Glob
---

Audit a view for accessibility and responsiveness (PRD §6).

Steps:
1. Run axe-core (via Playwright) against the view; report violations.
2. Verify keyboard navigation and visible focus throughout (editor especially).
3. Check contrast and that meaning is never conveyed by color alone.
4. Confirm the core read+approve flow is fully usable at 375px with no horizontal page scroll.
5. Return pass/fail with specific fixes.

Docs: https://www.w3.org/TR/WCAG21/ · https://github.com/dequelabs/axe-core · https://www.radix-ui.com/primitives/docs/overview/accessibility
