# OpenClaw Usage Dashboard — Research Report

**Date:** 2026-02-09  
**Status:** Research complete, ready to build

---

## 1. Data Source Analysis

### Usage Ledger (`~/.openclaw/usage-ledger.jsonl`)
- **~3,900 records** — one per LLM completion call
- **Fields per record:**

| Field | Type | Example |
|-------|------|---------|
| `messageId` | string | `"a4a4ba02"` |
| `timestamp` | ISO 8601 | `"2026-02-07T22:30:06.260Z"` |
| `agent` | string | `"kashyap"`, `"elastic_bot"` |
| `sessionId` | UUID | `"71292064-..."` |
| `model` | string | `"claude-opus-4-6"` |
| `provider` | string | `"azure-anthropic"` |
| `role` | string | `"assistant"` |
| `inputTokens` | number | `3` |
| `outputTokens` | number | `111` |
| `cacheRead` | number | `0` |
| `cacheWrite` | number | `24412` |
| `totalTokens` | number | `24526` |
| `costInput` | number | `0.000045` |
| `costOutput` | number | `0.008325` |
| `costCacheRead` | number | `0` |
| `costCacheWrite` | number | `0.457725` |
| `costTotal` | number | `0.466095` |

### Session Logs (`~/.openclaw/agents/{agent}/sessions/{id}.jsonl`)
- Each session file has typed JSONL events: `session`, `model_change`, `thinking_level_change`, plus message events
- Multiple agents: `kashyap` (primary), `elastic_bot`

---

## 2. UI Libraries Research

### 2.1 ReactBits (reactbits.dev) — ⭐ HIGHLY RECOMMENDED

110+ animated React components, 35.4K GitHub stars. Free & open source. **Perfect for the premium dashboard aesthetic.**

#### Dashboard-Relevant Components:

| Component | Category | Dashboard Use |
|-----------|----------|--------------|
| **Count Up** | Text Animations | Animated KPI counters (total cost, tokens) |
| **Gradient Text** | Text Animations | Dashboard title/headers |
| **Shiny Text** | Text Animations | Highlight important metrics |
| **Blur Text** | Text Animations | Section reveals on scroll |
| **Rotating Text** | Text Animations | Cycling through stats |
| **Counter** | Components | Animated number displays |
| **Animated List** | Components | Real-time session feed |
| **Spotlight Card** | Components | KPI stat cards with hover glow |
| **Glass Surface** | Components | Glassmorphism panels ← KEY |
| **Fluid Glass** | Components | Premium glass containers |
| **Pixel Card** | Components | Unique card hover effects |
| **Tilted Card** | Components | Interactive stat cards |
| **Reflective Card** | Components | Premium metric cards |
| **Decay Card** | Components | Stylized info cards |
| **Dock** | Components | macOS-style nav bar |
| **Stepper** | Components | Date range selector UI |
| **Electric Border** | Animations | Highlight active panels |
| **Star Border** | Animations | Accent borders on cards |
| **Animated Content** | Animations | Page transitions |
| **Fade Content** | Animations | Smooth section loading |
| **Noise** | Animations | Subtle texture overlay |

#### Dashboard-Relevant Backgrounds:

| Background | Why |
|-----------|-----|
| **Aurora** | Subtle animated gradient — perfect dark dashboard bg |
| **Particles** | Tech feel, light performance |
| **Dark Veil** | Purpose-built dark overlay |
| **Liquid Ether** | Premium ambient effect |
| **Waves** | Subtle motion |
| **Grid Scan** | Data/tech aesthetic |
| **Dot Grid** | Clean minimal grid bg |

### 2.2 useLayouts (uselayouts.com) — GOOD SUPPLEMENT

Free animated React components built on **shadcn/ui + Framer Motion**. TypeScript, Tailwind, 60fps.

- Copy-paste components (no package install)
- Extends shadcn/ui with motion
- Good for: animated modals, transitions, layout animations
- Use for: page transitions, animated sidebars, smooth tab switches

### 2.3 Tremor (tremor.so) — ⭐ PRIMARY CHART LIBRARY

**Purpose-built for dashboards.** Copy-paste Tailwind components, Recharts-based.

#### Available Chart Types (all needed for this dashboard):

| Chart | Dashboard Use |
|-------|--------------|
| **Area Chart** | Token usage over time |
| **Area Chart (stacked)** | Token breakdown (input/output/cache) |
| **Bar Chart** | Cost breakdown by model |
| **Bar Chart (grouped)** | Model comparison |
| **Donut Chart** | Cost distribution by provider |
| **Line Chart** | Cost per session trend |
| **Spark Chart** | Inline mini-charts in KPI cards |
| **Progress Circle** | Cache hit rate |
| **Category Bar** | Budget usage |
| **Tracker** | Daily activity heatmap |
| **Bar List** | Top models/agents by usage |

**Tremor also provides:** KPI cards, tables, badges, and number formatters — all Tailwind-native with dark mode.

### 2.4 Other Libraries Considered

| Library | Verdict |
|---------|---------|
| **Recharts** | Already included via Tremor — no need to add separately |
| **shadcn/ui** | Use as base component system (Tremor extends it) |
| **Framer Motion** | Use for page transitions, already dep of useLayouts patterns |
| **Nivo** | Overkill, Tremor covers all needs |
| **Victory** | Unnecessary given Tremor |

### 2.5 ClawHub (clawhub.ai)

Redirects to clawhub.ai — appears to be an OpenClaw skill hub. No relevant frontend/design skills found at time of research.

---

## 3. Recommended Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 15 (App Router) | Standard, SSR for initial load |
| **Language** | TypeScript (strict) | Per project conventions |
| **Runtime/PM** | Bun | Per project conventions |
| **Lint/Format** | Biome | Per project conventions |
| **Backend/DB** | Convex (`polished-cassowary-254`) | Real-time subscriptions, no REST needed |
| **Charts** | Tremor (Recharts-based) | Dashboard-native, Tailwind, dark mode |
| **Base UI** | shadcn/ui | Foundation for Tremor + custom components |
| **Animations** | ReactBits (select components) | Premium feel, glassmorphism |
| **Motion** | Framer Motion | Page transitions, micro-interactions |
| **Styling** | Tailwind CSS v4 | Utility-first, dark mode built-in |
| **Icons** | Lucide React | Clean, consistent |

---

## 4. Architecture Plan

### 4.1 Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Each LLM completion call
  completions: defineTable({
    messageId: v.string(),
    timestamp: v.number(), // Unix ms for indexing
    timestampISO: v.string(),
    agent: v.string(),
    sessionId: v.string(),
    model: v.string(),
    provider: v.string(),
    role: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cacheRead: v.number(),
    cacheWrite: v.number(),
    totalTokens: v.number(),
    costInput: v.float64(),
    costOutput: v.float64(),
    costCacheRead: v.float64(),
    costCacheWrite: v.float64(),
    costTotal: v.float64(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_model", ["model", "timestamp"])
    .index("by_agent", ["agent", "timestamp"])
    .index("by_session", ["sessionId", "timestamp"])
    .index("by_messageId", ["messageId"]),

  // Pre-aggregated daily stats (for fast dashboard loads)
  dailyStats: defineTable({
    date: v.string(), // "2026-02-07"
    agent: v.string(),
    model: v.string(),
    provider: v.string(),
    totalCost: v.float64(),
    totalTokens: v.number(),
    totalInputTokens: v.number(),
    totalOutputTokens: v.number(),
    totalCacheRead: v.number(),
    totalCacheWrite: v.number(),
    messageCount: v.number(),
    sessionCount: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_date_model", ["date", "model"]),

  // Ingestion tracking
  ingestionState: defineTable({
    lastProcessedLine: v.number(),
    lastProcessedTimestamp: v.string(),
    totalIngested: v.number(),
  }),
});
```

### 4.2 Ingestion Flow

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────┐
│ usage-ledger.jsonl   │────▶│ ingest script     │────▶│ Convex DB   │
│ (~/.openclaw/)       │     │ (bun script)      │     │             │
└─────────────────────┘     │                    │     │ completions │
                            │ 1. Read JSONL      │     │ dailyStats  │
                            │ 2. Track offset    │     │             │
                            │ 3. Batch mutations │     └─────────────┘
                            │ 4. Aggregate daily │
                            └──────────────────┘
```

**Ingestion script** (`scripts/ingest.ts`):
1. Read `~/.openclaw/usage-ledger.jsonl`
2. Query Convex for last ingested line number
3. Parse new lines, batch into Convex mutations (50 per batch)
4. Compute daily aggregates via Convex action
5. Can run as cron or manual `bun run ingest`

### 4.3 Convex Queries (Key)

```typescript
// Queries needed:
- getTotalCost(dateRange) → number
- getTokenUsageOverTime(dateRange, granularity) → timeseries
- getCostByModel(dateRange) → { model, cost }[]
- getCostBySession(dateRange, limit) → { sessionId, cost, messageCount }[]
- getCacheHitRate(dateRange) → { hitRate, totalRead, totalWrite }
- getMessagesPerDay(dateRange) → timeseries
- getModelComparison(dateRange) → { model, avgCost, avgTokens, count }[]
- getRecentCompletions(limit) → completion[]
- getDailyStats(dateRange) → dailyStats[]
```

### 4.4 Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  🌊 Aurora/Dark Veil Background (ReactBits)             │
│                                                          │
│  ┌─ Header ──────────────────────────────────────────┐  │
│  │  OpenClaw Usage Dashboard    [Date Range Picker]   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ KPI Row (Glass Surface cards) ───────────────────┐  │
│  │ 💰 Total Cost  │ 🔤 Total Tokens │ 📊 Messages   │  │
│  │ (CountUp anim) │ (CountUp anim)  │ (CountUp)     │  │
│  │ +Spark Chart   │ +Spark Chart    │ +Spark Chart  │  │
│  ├────────────────┼─────────────────┼────────────────┤  │
│  │ 🎯 Cache Rate  │ 🤖 Models Used  │ 📂 Sessions   │  │
│  │ (ProgressCirc) │ (Counter)       │ (Counter)     │  │
│  └────────────────┴─────────────────┴────────────────┘  │
│                                                          │
│  ┌─ Charts Row 1 ───────────────────────────────────┐   │
│  │  Token Usage Over Time    │  Cost by Model        │   │
│  │  (Stacked Area Chart)     │  (Donut + Bar List)   │   │
│  └───────────────────────────┴───────────────────────┘   │
│                                                          │
│  ┌─ Charts Row 2 ───────────────────────────────────┐   │
│  │  Daily Cost Trend         │  Model Comparison     │   │
│  │  (Line Chart)             │  (Grouped Bar Chart)  │   │
│  └───────────────────────────┴───────────────────────┘   │
│                                                          │
│  ┌─ Charts Row 3 ───────────────────────────────────┐   │
│  │  Cache Performance        │  Messages per Day     │   │
│  │  (Category Bar + Circle)  │  (Bar Chart)          │   │
│  └───────────────────────────┴───────────────────────┘   │
│                                                          │
│  ┌─ Activity Tracker ───────────────────────────────┐   │
│  │  Daily Activity Heatmap (Tremor Tracker)          │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Recent Sessions (Animated List) ────────────────┐   │
│  │  Session ID | Agent | Model | Cost | Messages     │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.5 File Structure

```
openclaw-usage-dashboard/
├── convex/
│   ├── schema.ts
│   ├── completions.ts          # CRUD mutations
│   ├── queries/
│   │   ├── overview.ts         # KPI queries
│   │   ├── timeseries.ts       # Time-based charts
│   │   ├── models.ts           # Model breakdown
│   │   └── sessions.ts         # Session analysis
│   ├── actions/
│   │   └── aggregate.ts        # Daily aggregation action
│   └── _generated/
├── scripts/
│   └── ingest.ts               # JSONL → Convex ingestion
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + Convex provider
│   │   ├── page.tsx            # Dashboard page
│   │   └── globals.css         # Tailwind + glassmorphism vars
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base
│   │   ├── dashboard/
│   │   │   ├── KPICards.tsx
│   │   │   ├── TokenChart.tsx
│   │   │   ├── CostBreakdown.tsx
│   │   │   ├── ModelComparison.tsx
│   │   │   ├── CacheMetrics.tsx
│   │   │   ├── ActivityTracker.tsx
│   │   │   ├── SessionTable.tsx
│   │   │   └── DateRangePicker.tsx
│   │   ├── reactbits/          # Copied ReactBits components
│   │   │   ├── CountUp.tsx
│   │   │   ├── GlassSurface.tsx
│   │   │   ├── GradientText.tsx
│   │   │   ├── AnimatedList.tsx
│   │   │   ├── ShinyText.tsx
│   │   │   └── backgrounds/
│   │   │       └── Aurora.tsx
│   │   └── layout/
│   │       └── GlassCard.tsx   # Reusable glass container
│   └── lib/
│       ├── convex.ts           # Convex client setup
│       └── formatters.ts       # Currency, token formatters
├── biome.json
├── bun.lock
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 5. Design Tokens (Glassmorphism Dark Theme)

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 16px;
  --surface-0: #09090b;        /* zinc-950 */
  --surface-1: #18181b;        /* zinc-900 */
  --surface-2: #27272a;        /* zinc-800 */
  --accent-primary: #818cf8;   /* indigo-400 */
  --accent-secondary: #34d399; /* emerald-400 */
  --accent-warning: #fbbf24;   /* amber-400 */
  --accent-danger: #f87171;    /* red-400 */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
}
```

**Glass card pattern:**
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
}
```

---

## 6. Key Decisions Summary

| Decision | Choice | Why |
|----------|--------|-----|
| Chart lib | **Tremor** | Purpose-built for dashboards, Tailwind-native, has every chart type needed |
| Glass components | **ReactBits Glass Surface + Fluid Glass** | Pre-built glassmorphism, no custom CSS |
| Animated numbers | **ReactBits Count Up + Counter** | Smooth KPI animations |
| Background | **ReactBits Aurora** | Subtle, performant, dark-theme native |
| DB | **Convex** (existing project) | Real-time subscriptions = live dashboard |
| Aggregation | **Pre-computed dailyStats** | 3,900+ records too many for client-side aggregation |
| Ingestion | **Bun script, incremental** | Track offset, only process new lines |

---

## 7. Implementation Priority

1. **Phase 1:** Convex schema + ingestion script (get data in)
2. **Phase 2:** KPI cards with animated counters (quick win)
3. **Phase 3:** Token + cost charts (core value)
4. **Phase 4:** Model comparison + cache metrics
5. **Phase 5:** Polish — backgrounds, transitions, glass effects
6. **Phase 6:** Auto-refresh via Convex subscriptions + periodic re-ingestion
