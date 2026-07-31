---
name: netlify-deploy
description: Configure and deploy the Next.js web app to Netlify (OpenNext runtime, build settings, env vars, Deploy Previews). Use for web-app deploy/preview config. Mind the 300 free build-minute budget.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Deploy the web app to Netlify (tech-stack §4).

Steps:
1. Configure the build (OpenNext Next.js runtime), env var NAMES (`/env-management`), and branch/preview settings.
2. Enable Deploy Previews on PRs.
3. Cache dependencies and avoid deploy-on-every-commit — the free tier caps at 300 build minutes/mo.

A production deploy is side-effecting — escalate for approval first. Never commit secrets.

Docs: https://docs.netlify.com/ · https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
