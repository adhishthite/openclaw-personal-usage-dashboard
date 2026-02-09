# AGENTS.md

Agent playbook for this repository.

## Mission
- Build and maintain the OpenClaw usage dashboard with a premium dark glassmorphism UI.
- Keep work aligned with product requirements in `RESEARCH.md`.

## Read First
- `CLAUDE.md` (project requirements and non-negotiable rules)
- `RESEARCH.md` (architecture, schema, design tokens, and structure)

## Required Stack
- Next.js 15 (App Router) + TypeScript (strict)
- Bun package/runtime tooling (`bun add`, `bun run`)
- Biome (not ESLint/Prettier)
- Convex backend/database
- Tremor charts (`@tremor/react`)
- Tailwind CSS v4
- Framer Motion
- Lucide React

## Data Source
- Usage ledger: `~/.openclaw/usage-ledger.jsonl` (JSONL records with token and cost metrics).

## Repository Conventions
- Dashboard components live in `src/components/dashboard/`.
- Convex backend code lives in `convex/`.
- Use `"use client"` only when hooks/browser APIs are required.
- Avoid `any`; keep strict typing throughout.

## Quality Gates (before finishing work)
- Run: `bun run biome check --fix .`
- Run: `bun run build`
- Ensure changes are production-safe and consistent with existing patterns.

