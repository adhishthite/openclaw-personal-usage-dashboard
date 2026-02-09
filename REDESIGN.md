# COMPLETE UI REDESIGN BRIEF

## Context
This is an OpenClaw (AI assistant) usage dashboard. It visualizes LLM API token usage, costs, model breakdowns, cache performance, and session activity. The backend (Convex) and data ingestion are DONE and working. We're only rewriting the frontend.

## DO NOT TOUCH
- `convex/` directory (schema, queries, mutations — all working)
- `scripts/ingest.ts` (working)
- `.env.local` (Convex config)
- `src/lib/formatters.ts` (keep the masking functions)

## REWRITE EVERYTHING ELSE IN `src/`

## Design Direction: "Observatory" 
Think Bloomberg Terminal meets Apple's design language. A dark, data-dense command center that feels like you're monitoring something important. Not generic dashboard — a crafted instrument.

### Typography
- **Display/Numbers:** Use a distinctive monospace or tabular font for data — NOT Inter/Roboto/Arial. Consider: JetBrains Mono, IBM Plex Mono, or Space Mono for numbers. Or a sharp sans like Geist, Satoshi, or General Sans for headings.
- **Body:** Clean readable sans — Geist, Inter is OK here for body only.
- **Big numbers should FEEL big** — 48-64px, font-weight 200-300 (thin/light), with letter-spacing.
- **Labels:** 11-12px uppercase tracking-widest in muted color.

### Color Palette
NOT generic purple gradient. Think:
- **Base:** True black (#000) or near-black (#0a0a0a) — NOT zinc-950
- **Surface:** Subtle elevation via very faint borders, not background color changes
- **Primary accent:** Electric cyan (#06b6d4) or vivid green (#22c55e) — ONE dominant accent
- **Secondary:** Warm amber (#f59e0b) for warnings/costs
- **Data colors:** Cyan, green, amber, rose, violet, sky — bright and saturated on dark
- **Text:** Pure white (#fff) for primary, #666 for muted — high contrast

### Layout & Composition
- **Bento grid** — asymmetric card sizes, not uniform rows. Hero KPI card spans 2 cols. Some cards are tall, some wide.
- **Mobile-first** — single column on mobile, bento on desktop
- **Dense but breathable** — 12px gaps between cards, 16px internal padding, generous whitespace within
- **No section headers like "USAGE BREAKDOWN"** — let the cards speak. Subtle visual grouping via proximity.

### Cards & Surfaces
- **NO heavy glassmorphism** — it looked cheap. Instead: 
  - Cards: `bg-white/[0.03]` with `border border-white/[0.06]` — barely there
  - On hover: subtle `border-white/[0.12]` transition
  - Rounded corners: `rounded-xl` (12px)
  - NO backdrop-blur (performance killer on mobile)

### Charts
- **REMOVE @tremor/react** — it's fighting the dark theme. Replace with:
  - **Recharts** directly (already a Tremor dependency, so it's installed)
  - OR lightweight alternatives: use plain SVG for simple charts
- **Chart styling:**
  - No grid lines, no axes decorations — clean and minimal
  - Thin lines (strokeWidth 1.5-2), area fills at 10-20% opacity
  - Dots only on hover, not always visible
  - Custom tooltip: dark bg, small text, subtle border
  - Responsive: charts fill their container

### Animations
- **Subtle, not flashy:**
  - Cards fade in with 30ms stagger, translateY(8px) → 0
  - Numbers count up using framer-motion `useMotionValue` + `useTransform`
  - Charts animate in with Recharts' built-in `animationDuration={800}`
  - NO aurora background, NO noise overlay — clean

### KPI Cards (Hero Section)
6 metrics in a bento layout:
1. **Total Cost** (hero, 2-col span) — huge number, spark line underneath
2. **Total Tokens** — with input/output/cache breakdown mini bar
3. **Messages** — count with daily average subtitle
4. **Cache Hit Rate** — circular progress (custom SVG, not Tremor)
5. **Active Models** — count with top model name
6. **Sessions** — count with most recent timestamp

### Charts Section
- **Token Usage Over Time** — stacked area (Recharts AreaChart)
- **Cost by Model** — horizontal bar chart, sorted desc (NOT donut — donut is hard to read)
- **Daily Cost Trend** — line chart with gradient fill
- **Model Comparison** — grouped bar chart
- **Cache Performance** — custom viz: stacked bar per model showing read vs write
- **Messages per Day** — bar chart

### Activity Heatmap
- GitHub-style contribution grid (custom component, NOT Tremor Tracker)
- Small squares, 7 rows (days of week), colored by intensity
- Or: simple horizontal bar per day if only ~8 days of data

### Sessions Table
- Compact, well-aligned table
- Monospace for IDs and numbers
- Agent names masked (use existing maskName())
- Subtle row hover with border highlight
- Sort by cost desc

## Technical Requirements
- Next.js 15 App Router, TypeScript strict
- Bun, Biome (NOT npm, NOT ESLint)
- Tailwind v4
- Recharts for charts (remove @tremor/react dependency)
- Framer Motion for entry animations
- Lucide React for icons
- Google Fonts: load via next/font
- `bun run build` MUST pass with zero errors
- Mobile-first responsive (test mentally at 375px, 768px, 1280px)

## Files to Create/Rewrite
```
src/
  app/
    layout.tsx          — root layout, font loading, dark theme
    page.tsx            — dashboard composition, bento grid
    globals.css         — CSS variables, base styles, scrollbar
  components/
    dashboard/
      KPICard.tsx       — single KPI card (reusable)
      KPISection.tsx    — 6 KPI cards in bento layout
      AreaChart.tsx     — token usage over time
      BarChart.tsx      — cost by model (horizontal bars)
      LineChart.tsx     — daily cost trend
      ComparisonChart.tsx — model comparison
      CacheChart.tsx    — cache read/write per model
      MessagesChart.tsx — messages per day
      ActivityGrid.tsx  — heatmap/contribution grid
      SessionsTable.tsx — recent sessions
      DateFilter.tsx    — date range selector
      ChartCard.tsx     — wrapper for chart cards
    ui/
      AnimatedNumber.tsx — count-up animation
      CircularProgress.tsx — SVG circular progress
      SparkLine.tsx     — tiny inline spark chart
  lib/
    formatters.ts       — KEEP existing (add any new formatters)
    convex.tsx          — KEEP existing
    chart-theme.ts      — shared chart colors/config
```
