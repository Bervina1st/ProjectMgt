---
name: react-component
description: Scaffold a Next.js/React component using shadcn/ui + Tailwind and TanStack Query, with an accessibility baseline and all data states handled. Use when building any UI view.
argument-hint: [component] [purpose]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Build an accessible, typed component (PRD Epic C/E, §6).

Steps:
1. Compose from shadcn/ui + Tailwind; type all props.
2. Source data via a tRPC hook (`/trpc-endpoint`); handle loading / empty / error states.
3. Accessibility baseline: labels, visible focus, ARIA, semantic headings; severity never by color alone.
4. Responsive: usable at 375px, no horizontal page scroll; run `/responsive-a11y-check`.

Optimize for Priya: fast to skim and act. No provider/Anthropic calls from the client.

Docs: https://nextjs.org/docs · https://react.dev/ · https://ui.shadcn.com/ · https://tanstack.com/query/latest
