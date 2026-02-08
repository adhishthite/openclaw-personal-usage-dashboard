# OpenClaw Usage Dashboard

Build a premium dark glassmorphism dashboard for tracking LLM API usage.

## READ FIRST
- `RESEARCH.md` — full research report with architecture, schema, component picks, design tokens, file structure

## Stack (MANDATORY)
- Next.js 15 (App Router) + TypeScript (strict)
- Bun (NOT npm/npx) — `bun add`, `bun run`
- Biome (NOT ESLint/Prettier) — `bun add -D @biomejs/biome`
- Convex for backend/DB
- Tremor for charts (via `@tremor/react`)
- Tailwind CSS v4
- Framer Motion for animations
- Lucide React for icons

## Data Source
The file `~/.openclaw/usage-ledger.jsonl` has ~3,900 records. Each line is JSON:
```json
{"messageId":"abc","timestamp":"2026-02-07T22:30:06.260Z","agent":"kashyap","sessionId":"uuid","model":"claude-opus-4-6","provider":"azure-anthropic","role":"assistant","inputTokens":3,"outputTokens":111,"cacheRead":0,"cacheWrite":24412,"totalTokens":24526,"costInput":0.000045,"costOutput":0.008325,"costCacheRead":0,"costCacheWrite":0.457725,"costTotal":0.466095}
```

## What to Build

### Phase 1: Scaffold + Convex + Ingestion
1. `bunx create-next-app@latest . --ts --tailwind --app --src-dir --import-alias "@/*"` (accept defaults)
2. `bun add convex @tremor/react framer-motion lucide-react`
3. `bun add -D @biomejs/biome` + init biome config
4. Set up Convex: `bunx convex init` — use existing project `polished-cassowary-254`
5. Create Convex schema per RESEARCH.md (completions + dailyStats + ingestionState tables)
6. Create mutations for batch inserting completions and upserting daily stats
7. Create `scripts/ingest.ts` — reads JSONL, tracks offset via Convex ingestionState, batches 50 records per mutation

### Phase 2: Dashboard UI
1. Dark theme globals.css with glassmorphism design tokens from RESEARCH.md
2. 6 KPI cards at top: Total Cost, Total Tokens, Messages, Cache Hit Rate, Models Used, Sessions
3. Charts row 1: Token Usage Over Time (stacked area) + Cost by Model (donut + bar list)
4. Charts row 2: Daily Cost Trend (line) + Model Comparison (grouped bar)
5. Charts row 3: Cache Performance (category bar + progress circle) + Messages per Day (bar)
6. Activity heatmap (Tremor Tracker)
7. Recent sessions table at bottom

### Phase 3: Polish
1. Animated KPI counters (use framer-motion `animate` for count-up effect)
2. Glass card wrapper component with backdrop-blur
3. Subtle background gradient/aurora effect via CSS
4. Smooth page load animations
5. Date range picker for filtering

## Design
- Background: zinc-950 (#09090b) with subtle gradient
- Cards: glass effect (rgba(255,255,255,0.05) bg + backdrop-blur-xl + border rgba(255,255,255,0.1))
- Accent colors: indigo-400, emerald-400, amber-400, red-400
- All text: zinc-50 primary, zinc-400 secondary
- Font: system default (Inter if available)

## Convex Queries Needed
- `getOverviewStats(dateRange)` — totals for KPI cards
- `getTokenTimeseries(dateRange)` — for area chart
- `getCostByModel(dateRange)` — for donut/bar
- `getDailyCosts(dateRange)` — for line chart
- `getModelComparison(dateRange)` — for grouped bar
- `getCacheMetrics(dateRange)` — for cache charts
- `getMessagesByDay(dateRange)` — for bar chart
- `getDailyActivity()` — for tracker heatmap
- `getRecentSessions(limit)` — for table

## Rules
- TypeScript strict mode
- All components in `src/components/dashboard/`
- Convex files in `convex/`
- Use `"use client"` only where needed (components with hooks)
- No `any` types
- Run `bun run biome check --fix .` before finishing
- Make sure `bun run build` passes with no errors

When completely finished, run: `openclaw gateway wake --text "Dashboard build complete. Run bun run ingest then bun run dev to test." --mode now`
