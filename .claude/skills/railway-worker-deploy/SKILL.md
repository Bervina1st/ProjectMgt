---
name: railway-worker-deploy
description: Deploy the always-on Node worker (ingest + generation) to Railway with a Dockerfile and env vars, keeping it portable. Use for worker deploy config.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Deploy the worker to Railway (tech-stack §4).

Steps:
1. Write a Dockerfile for `apps/worker`; keep it portable (Render/Fly interchangeable).
2. Configure the start command, env var NAMES (`/env-management`), and resources.
3. Connect to Postgres/pg-boss.

Keep the two-process split — never fold worker jobs into serverless. Production deploy escalates for approval.

Docs: https://docs.railway.com/ · https://docs.railway.com/guides/dockerfiles
