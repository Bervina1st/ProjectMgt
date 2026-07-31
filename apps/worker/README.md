# @pmstatus/worker — DEFERRED

Reserved workspace for the always-on Node worker (Railway) that runs scheduled ingest +
LLM report generation via pg-boss. **Intentionally empty for the frontend MVP** — the current
prototype computes reports client-side with no backend.

Lands in **roadmap M2–M3**. See `research/tech-stack.md` §2 (two-process split) and
`research/PRD.md` Epic B.
