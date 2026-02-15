import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { getCached, redis } from "@/lib/redis";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.CONVEX_URL ?? "");

const CACHE_TTL = 3600; // 1 hour

type SlugConfig = {
	// biome-ignore lint/suspicious/noExplicitAny: dynamic query mapping
	query: any;
	params: (sp: URLSearchParams) => Record<string, unknown>;
};

const SLUG_MAP: Record<string, SlugConfig> = {
	overview: {
		query: api.queries.overview.getOverviewStats,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
	sessions: {
		query: api.queries.sessions.getRecentSessions,
		params: (sp) => ({
			limit: Number(sp.get("limit") ?? 10),
		}),
	},
	"session-count": {
		query: api.queries.sessions.getSessionCount,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
	"daily-costs": {
		query: api.queries.timeseries.getDailyCosts,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
	"token-timeseries": {
		query: api.queries.timeseries.getTokenTimeseries,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
	"messages-by-day": {
		query: api.queries.timeseries.getMessagesByDay,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
	"cost-by-model": {
		query: api.queries.models.getCostByModel,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
	"model-comparison": {
		query: api.queries.models.getModelComparison,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
	"cache-metrics": {
		query: api.queries.models.getCacheMetrics,
		params: (sp) => {
			const p: Record<string, unknown> = {};
			if (sp.get("startDate")) p.startDate = sp.get("startDate");
			if (sp.get("endDate")) p.endDate = sp.get("endDate");
			return p;
		},
	},
};

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const config = SLUG_MAP[slug];
	if (!config) {
		return NextResponse.json({ error: "Unknown endpoint" }, { status: 404 });
	}

	const sp = request.nextUrl.searchParams;
	const queryParams = config.params(sp);
	const bust = sp.get("bust") === "true";

	const cacheKey = `dash:${slug}:${JSON.stringify(queryParams)}`;

	if (bust) {
		await redis.del(cacheKey);
	}

	const data = await getCached(cacheKey, CACHE_TTL, () =>
		convex.query(config.query, queryParams),
	);

	return NextResponse.json(data);
}
