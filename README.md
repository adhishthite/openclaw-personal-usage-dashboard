# OpenClaw Usage Dashboard

Analytics dashboard for OpenClaw usage data, built with Next.js, Convex, and Recharts.

It ingests usage ledger records from `~/.openclaw/usage-ledger.jsonl`, stores aggregates in Convex, and presents:
- Cost and token trends
- Model-level comparisons
- Session-level activity
- Cache efficiency metrics

## Stack

- Next.js (App Router)
- React + TypeScript
- Convex (queries, mutations, schema)
- Recharts (visualizations)
- Tailwind + shadcn-style UI primitives
- Biome (formatting/linting)
- Bun (runtime + scripts)

## Features

- Live dashboard sections for overview, trend charts, model comparison, and sessions
- Theme toggle (light/dark)
- Mobile-friendly layouts (cards on phone, tables on desktop)
- Masked agent names in UI (`k***p` style)
- In-app `Sync Now` action with server-side rate limiting

## Prerequisites

- Bun installed
- Convex deployment configured
- Usage ledger file at `~/.openclaw/usage-ledger.jsonl`

## Environment Setup

Create `.env.local` with Convex values:

```bash
CONVEX_URL=https://<your-deployment>.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

Optional (used by Convex tooling):

```bash
CONVEX_DEPLOYMENT=dev:<deployment-name>
NEXT_PUBLIC_CONVEX_SITE_URL=https://<your-deployment>.convex.site
```

## Install and Run

```bash
bun install
bun run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Data Ingestion

### Manual ingest (CLI)

```bash
bun run ingest
```

Script: `scripts/ingest.ts`

What it does:
- Reads new lines from `~/.openclaw/usage-ledger.jsonl`
- Inserts completion records
- Computes/upserts daily aggregates
- Updates ingestion cursor (`lastProcessedLine`) in Convex

### In-app ingest (`Sync Now`)

UI button triggers:
- `POST /api/sync-now`

API route:
- `src/app/api/sync-now/route.ts`

Behavior:
- Runs `bun run ingest` on the server
- Prevents concurrent runs
- Rate-limited to once every **15 minutes**
- Persists cooldown state in `/tmp/openclaw-sync-state.json`

## Useful Commands

```bash
# Development
bun run dev

# Build
bun run build
bun run start

# Ingest ledger data
bun run ingest

# Format + lint selected files
bunx biome check --write src/app/dashboard-client.tsx

# Type check
bunx tsc --noEmit
```

## Project Structure

```text
src/
  app/
    page.tsx
    dashboard-client.tsx
    api/sync-now/route.ts
  components/ui/
  lib/
    convex.tsx
    formatters.ts
convex/
  schema.ts
  completions.ts
  queries/
scripts/
  ingest.ts
```

## Troubleshooting

- `No new records to ingest`
  - The ingestion cursor is already at the end of `usage-ledger.jsonl`.
- `Unable to connect ... convex.cloud`
  - Check network and `CONVEX_URL` in `.env.local`.
- `Sync in Xm` on button
  - Cooldown is active (15-minute rate limit).
- Dashboard empty
  - Run `bun run ingest`, then refresh.

## Notes

- Costs are rendered to 2 decimals in UI.
- Agent names are intentionally masked in session views.
