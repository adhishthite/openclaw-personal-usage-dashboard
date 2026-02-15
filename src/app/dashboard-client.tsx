"use client";

import {
	Activity,
	Bot,
	CircleDollarSign,
	CircleHelp,
	Clock,
	Cpu,
	Database,
	Gauge,
	MessageSquare,
	MoonStar,
	RefreshCw,
	Rocket,
	ShieldCheck,
	Sun,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	formatCurrency,
	formatDate,
	formatNumber,
	formatPercent,
	formatShortDate,
	formatTokens,
	maskName,
} from "@/lib/formatters";

type RangeKey = "1d" | "7d" | "30d" | "90d" | "all";

const RANGE_OPTIONS: Array<{ key: RangeKey; label: string; days?: number }> = [
	{ key: "1d", label: "1D", days: 1 },
	{ key: "7d", label: "7D", days: 7 },
	{ key: "30d", label: "30D", days: 30 },
	{ key: "90d", label: "90D", days: 90 },
	{ key: "all", label: "All Time" },
];

const MODEL_COLORS = [
	"#0ea5e9",
	"#14b8a6",
	"#84cc16",
	"#f59e0b",
	"#f97316",
	"#ef4444",
];

const CURRENCY = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const ALL_SLUGS = [
	"overview",
	"sessions",
	"session-count",
	"daily-costs",
	"token-timeseries",
	"messages-by-day",
	"cost-by-model",
	"model-comparison",
	"cache-metrics",
] as const;

function isoDate(daysAgo = 0) {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	return date.toISOString().slice(0, 10);
}

function buildQueryString(params: Record<string, unknown>): string {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== null) sp.set(k, String(v));
	}
	return sp.toString();
}

function useApiQuery<T>(slug: string, params: Record<string, unknown>, refreshKey = 0): T | undefined {
	const [data, setData] = useState<T | undefined>(undefined);
	const qs = useMemo(() => buildQueryString(params), [params]);
	const stableParams = `${slug}?${qs}`;

	useEffect(() => {
		let cancelled = false;
		setData(undefined);
		const bustParam = refreshKey > 0 ? "&bust=true" : "";
		fetch(`/api/stats/${slug}?${qs}${bustParam}`)
			.then((r) => r.json())
			.then((d) => {
				if (!cancelled) setData(d as T);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [stableParams, refreshKey, slug, qs]);

	return data;
}

/** Bust all 9 API caches by calling each with ?bust=true */
async function bustAllApiCaches(rangeArgs: Record<string, unknown>) {
	const promises = ALL_SLUGS.map((slug) => {
		const params =
			slug === "sessions"
				? { limit: "10" }
				: rangeArgs;
		const qs = buildQueryString(params);
		return fetch(`/api/stats/${slug}?${qs}&bust=true`).catch(() => {});
	});
	await Promise.all(promises);
}

function MetricCard({
	label,
	value,
	description,
	hint,
	icon: Icon,
}: {
	label: string;
	value: string;
	description: string;
	hint: string;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<Card className="metric-card gap-3 py-4">
			<CardHeader className="px-4 pb-0">
				<div className="text-muted-foreground flex items-center justify-between">
					<p className="text-[11px] font-medium tracking-[0.12em] uppercase">
						{label}
					</p>
					<div className="flex items-center gap-1.5">
						<InfoHint content={hint} />
						<Icon className="h-4 w-4" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-1 px-4 pt-0">
				<p className="text-2xl font-semibold tracking-tight">{value}</p>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	);
}

function InfoHint({ content }: { content: string }) {
	return (
		<div className="group/info relative inline-flex">
			<button
				type="button"
				aria-label="More information"
				className="text-muted-foreground hover:text-foreground inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors"
			>
				<CircleHelp className="h-3.5 w-3.5" />
			</button>
			<div className="pointer-events-none absolute top-6 right-0 z-30 w-56 translate-y-1 rounded-md border bg-popover p-2 text-xs text-popover-foreground opacity-0 shadow-md transition-all group-hover/info:translate-y-0 group-hover/info:opacity-100 group-focus-within/info:translate-y-0 group-focus-within/info:opacity-100">
				{content}
			</div>
		</div>
	);
}

function EmptyState({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
			<p className="font-semibold">{title}</p>
			<p className="text-muted-foreground mt-1 max-w-sm text-sm">
				{description}
			</p>
		</div>
	);
}

function DashboardSkeleton() {
	const skeletonIds = ["a", "b", "c", "d", "e"] as const;

	return (
		<div className="space-y-6">
			<Skeleton className="h-40 rounded-2xl" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
				{skeletonIds.map((id) => (
					<Skeleton key={`metric-${id}`} className="h-28 rounded-xl" />
				))}
			</div>
			<div className="grid gap-4 xl:grid-cols-3">
				<Skeleton className="h-96 rounded-xl xl:col-span-2" />
				<Skeleton className="h-96 rounded-xl" />
			</div>
			<Skeleton className="h-[420px] rounded-xl" />
		</div>
	);
}

function CacheFreshnessIndicator({
	onRefresh,
	lastFetchedAt,
}: {
	onRefresh: () => void;
	lastFetchedAt: number | null;
}) {
	const [now, setNow] = useState(Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 30_000);
		return () => clearInterval(id);
	}, []);
	const minutesAgo = lastFetchedAt
		? Math.floor((now - lastFetchedAt) / 60_000)
		: null;
	return (
		<div className="flex items-center gap-2 text-xs text-muted-foreground">
			<Clock className="h-3.5 w-3.5" />
			<span>
				{minutesAgo !== null
					? minutesAgo < 1
						? "Data: just now"
						: `Data: ${minutesAgo}m ago`
					: "Data: loading…"}
			</span>
			<Button
				size="sm"
				variant="ghost"
				className="h-6 px-2"
				onClick={onRefresh}
			>
				<RefreshCw className="mr-1 h-3 w-3" />
				Refresh
			</Button>
		</div>
	);
}

export function DashboardClient() {
	const [range, setRange] = useState<RangeKey>("30d");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
	const [refreshCounter, setRefreshCounter] = useState(0);

	useEffect(() => {
		const stored =
			typeof window !== "undefined"
				? window.localStorage.getItem("openclaw-theme")
				: null;
		const systemPrefersDark =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		const initialTheme =
			stored === "dark" || stored === "light"
				? stored
				: systemPrefersDark
					? "dark"
					: "light";

		setTheme(initialTheme);
		document.documentElement.classList.toggle("dark", initialTheme === "dark");
	}, []);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		window.localStorage.setItem("openclaw-theme", theme);
	}, [theme]);

	const rangeArgs = useMemo(() => {
		const option = RANGE_OPTIONS.find((item) => item.key === range);
		if (!option || option.days === undefined) return {};
		return {
			startDate: isoDate(option.days - 1),
			endDate: isoDate(0),
		};
	}, [range]);

	const overview = useApiQuery<{
		totalCost: number;
		totalTokens: number;
		totalMessages: number;
		modelsUsed: number;
	}>("overview", rangeArgs, refreshCounter);
	const sessions = useApiQuery<
		Array<{
			sessionId: string;
			agent: string;
			model: string;
			messageCount: number;
			totalTokens: number;
			totalCost: number;
			lastTimestamp: string;
		}>
	>("sessions", { limit: 10 }, refreshCounter);
	const dailyCosts = useApiQuery<Array<{ date: string; Cost: number }>>(
		"daily-costs",
		rangeArgs,
		refreshCounter,
	);
	const tokenTimeseries = useApiQuery<
		Array<{
			date: string;
			"Input Tokens": number;
			"Output Tokens": number;
			"Cache Read": number;
			"Cache Write": number;
		}>
	>("token-timeseries", rangeArgs, refreshCounter);
	const messagesByDay = useApiQuery<Array<{ date: string; Messages: number }>>(
		"messages-by-day",
		rangeArgs,
		refreshCounter,
	);
	const costByModel = useApiQuery<Array<{ name: string; value: number }>>(
		"cost-by-model",
		rangeArgs,
		refreshCounter,
	);
	const modelComparison = useApiQuery<
		Array<{
			model: string;
			"Total Cost": number;
			"Avg Cost/Message": number;
			"Total Tokens": number;
			Messages: number;
		}>
	>("model-comparison", rangeArgs, refreshCounter);
	const cacheMetrics = useApiQuery<{
		hitRate: number;
		totalCacheRead: number;
		totalCacheWrite: number;
		byModel: Array<{ name: string; "Cache Read": number; "Cache Write": number }>;
	}>("cache-metrics", rangeArgs, refreshCounter);
	const sessionCount = useApiQuery<number>("session-count", rangeArgs, refreshCounter);

	// Track when data arrives
	useEffect(() => {
		if (overview !== undefined) {
			setLastFetchedAt(Date.now());
		}
	}, [overview]);

	const handleRefresh = useCallback(async () => {
		await bustAllApiCaches(rangeArgs);
		setRefreshCounter((c) => c + 1);
	}, [rangeArgs]);

	const isLoading =
		overview === undefined ||
		sessions === undefined ||
		dailyCosts === undefined ||
		tokenTimeseries === undefined ||
		messagesByDay === undefined ||
		costByModel === undefined ||
		modelComparison === undefined ||
		cacheMetrics === undefined ||
		sessionCount === undefined;

	if (isLoading) {
		return (
			<main className="obs-shell min-h-screen p-4 sm:p-6 md:p-10">
				<div className="mx-auto max-w-7xl">
					<DashboardSkeleton />
				</div>
			</main>
		);
	}

	const avgCostPerMessage =
		overview.totalMessages > 0
			? overview.totalCost / overview.totalMessages
			: 0;
	const avgTokensPerMessage =
		overview.totalMessages > 0
			? overview.totalTokens / overview.totalMessages
			: 0;
	const mostRecentDate = dailyCosts.at(-1)?.date;
	const latestSessionAt = sessions[0]?.lastTimestamp
		? new Date(sessions[0].lastTimestamp)
		: null;
	const minutesSinceLastSync = latestSessionAt
		? Math.max(0, Math.floor((Date.now() - latestSessionAt.getTime()) / 60_000))
		: null;
	const syncHealth =
		minutesSinceLastSync === null
			? "unknown"
			: minutesSinceLastSync <= 70
				? "healthy"
				: minutesSinceLastSync <= 180
					? "delayed"
					: "stale";

	return (
		<main className="obs-shell min-h-screen p-4 sm:p-6 md:p-10">
			<div className="mx-auto max-w-7xl">
				<header className="hero-shell mb-5 rounded-2xl border p-4 sm:p-5 md:mb-6 md:p-7">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
						<div className="space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="outline" className="command-badge">
									OpenClaw Command Deck
								</Badge>
								<Badge variant="outline" className="live-badge gap-1">
									<Activity className="h-3 w-3" />
									Redis-Cached Feed
								</Badge>
							</div>
							<h1 className="font-heading text-3xl leading-none tracking-tight sm:text-4xl md:text-5xl">
								Usage Flight Control
							</h1>
							<p className="text-muted-foreground max-w-2xl text-sm md:text-base">
								Professional spend and token intelligence across models,
								sessions, and cache behavior.
							</p>
						</div>

						<div className="w-full space-y-4 lg:w-auto">
							<div className="flex flex-wrap justify-start gap-2 lg:justify-end">
								{RANGE_OPTIONS.map((option) => (
									<Button
										key={option.key}
										size="sm"
										variant={range === option.key ? "default" : "outline"}
										className="rounded-full"
										onClick={() => setRange(option.key)}
									>
										{option.label}
									</Button>
								))}
								<Button
									size="sm"
									variant="outline"
									className="rounded-full"
									onClick={() =>
										setTheme((prev) => (prev === "dark" ? "light" : "dark"))
									}
								>
									{theme === "dark" ? (
										<Sun className="mr-1.5 h-3.5 w-3.5" />
									) : (
										<MoonStar className="mr-1.5 h-3.5 w-3.5" />
									)}
									{theme === "dark" ? "Light" : "Dark"}
								</Button>
							</div>
							<div className="rounded-xl border px-4 py-2.5 text-xs">
								<div className="flex items-center justify-between">
									<p className="text-muted-foreground">Sync Status</p>
									<Badge
										variant={
											syncHealth === "healthy"
												? "success"
												: syncHealth === "delayed"
													? "warning"
													: "outline"
										}
									>
										{syncHealth === "healthy"
											? "Healthy"
											: syncHealth === "delayed"
												? "Delayed"
												: syncHealth === "stale"
													? "Stale"
													: "Unknown"}
									</Badge>
								</div>
								<p className="text-muted-foreground mt-1">
									{latestSessionAt
										? `Last sync data at ${formatDate(latestSessionAt.toISOString())} (${minutesSinceLastSync}m ago).`
										: "No recent session data yet."}
								</p>
							</div>
						</div>
					</div>
				</header>

				<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
					<MetricCard
						label="Total Cost"
						value={formatCurrency(overview.totalCost)}
						description="Cumulative spend in current window"
						hint="Total dollars spent during the active date range."
						icon={CircleDollarSign}
					/>
					<MetricCard
						label="Total Tokens"
						value={formatTokens(overview.totalTokens)}
						description="Input + output + cache token volume"
						hint="Combined token volume including input, output, and cache token counts."
						icon={Database}
					/>
					<MetricCard
						label="Messages"
						value={formatNumber(overview.totalMessages)}
						description="Assistant + user completion events"
						hint="Number of completion/message events recorded in this range."
						icon={MessageSquare}
					/>
					<MetricCard
						label="Models Used"
						value={formatNumber(overview.modelsUsed)}
						description={`Across ${formatNumber(sessionCount)} sessions`}
						hint="How many distinct models appeared in the selected period."
						icon={Cpu}
					/>
					<MetricCard
						label="Avg Cost / Message"
						value={CURRENCY.format(avgCostPerMessage)}
						description={`~${formatNumber(Math.round(avgTokensPerMessage))} tokens per message`}
						hint="Average spend per message, useful for tracking efficiency changes."
						icon={Rocket}
					/>
				</section>

				<section className="mt-5 grid gap-4 xl:grid-cols-3">
					<Card className="xl:col-span-2">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								Daily Cost Acceleration
							</CardTitle>
							<CardDescription>
								Spend velocity by day with the active range filter
							</CardDescription>
						</CardHeader>
						<CardContent className="h-[280px] pt-2 md:h-80">
							{dailyCosts.length === 0 ? (
								<EmptyState
									title="No cost timeline yet"
									description="Ingest usage data to populate daily spend charts."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={dailyCosts}>
										<defs>
											<linearGradient
												id="costGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="0%"
													stopColor="#0ea5e9"
													stopOpacity={0.45}
												/>
												<stop
													offset="100%"
													stopColor="#0ea5e9"
													stopOpacity={0.03}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="4 4" vertical={false} />
										<XAxis
											dataKey="date"
											tickFormatter={formatShortDate}
											tickLine={false}
											axisLine={false}
										/>
										<YAxis tickLine={false} axisLine={false} width={74} />
										<Tooltip
											formatter={(value) => CURRENCY.format(Number(value ?? 0))}
											labelFormatter={(label) => formatShortDate(String(label))}
										/>
										<Area
											type="monotone"
											dataKey="Cost"
											stroke="#0284c7"
											fill="url(#costGradient)"
											strokeWidth={2.2}
										/>
									</AreaChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle>Model Spend Distribution</CardTitle>
							<CardDescription>
								Which model families dominate spend
							</CardDescription>
						</CardHeader>
						<CardContent className="h-[280px] pt-2 md:h-80">
							{costByModel.length === 0 ? (
								<EmptyState
									title="No model split yet"
									description="Model cost allocation appears after ingestion."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={costByModel}
											dataKey="value"
											nameKey="name"
											innerRadius={60}
											outerRadius={96}
											paddingAngle={2}
										>
											{costByModel.map((entry, index) => (
												<Cell
													key={`${entry.name}-${index}`}
													fill={MODEL_COLORS[index % MODEL_COLORS.length]}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value) => CURRENCY.format(Number(value ?? 0))}
										/>
									</PieChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>
				</section>

				<section className="mt-4 grid gap-4 xl:grid-cols-3">
					<Card className="xl:col-span-2">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2">
								<Database className="h-4 w-4" />
								Token Throughput Matrix
							</CardTitle>
							<CardDescription>
								Input, output, and cache token dynamics per day
							</CardDescription>
						</CardHeader>
						<CardContent className="h-[280px] pt-2 md:h-80">
							{tokenTimeseries.length === 0 ? (
								<EmptyState
									title="No token throughput yet"
									description="Token bars will render as soon as timeseries data exists."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={tokenTimeseries.slice(-24)}>
										<CartesianGrid strokeDasharray="4 4" vertical={false} />
										<XAxis
											dataKey="date"
											tickFormatter={formatShortDate}
											tickLine={false}
											axisLine={false}
										/>
										<YAxis tickLine={false} axisLine={false} width={86} />
										<Tooltip
											formatter={(value) => formatTokens(Number(value ?? 0))}
											labelFormatter={(label) => formatShortDate(String(label))}
										/>
										<Bar
											dataKey="Input Tokens"
											stackId="tokens"
											fill="#14b8a6"
										/>
										<Bar
											dataKey="Output Tokens"
											stackId="tokens"
											fill="#0ea5e9"
										/>
										<Bar dataKey="Cache Read" stackId="tokens" fill="#84cc16" />
										<Bar
											dataKey="Cache Write"
											stackId="tokens"
											fill="#f59e0b"
										/>
									</BarChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShieldCheck className="h-4 w-4" />
								Cache Reliability
							</CardTitle>
							<CardDescription>
								Hit rate profile and high-impact models
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<div className="flex items-center justify-between text-sm">
									<p className="flex items-center gap-1">
										<Gauge className="h-3.5 w-3.5" />
										Overall hit rate
									</p>
									<p className="font-semibold">
										{formatPercent(cacheMetrics.hitRate)}
									</p>
								</div>
								<Progress value={cacheMetrics.hitRate} />
							</div>
							<div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
								<div className="cache-stat-card rounded-lg border p-3">
									<p className="cache-stat-label text-xs">Cache Read</p>
									<p className="cache-stat-value font-semibold">
										{formatTokens(cacheMetrics.totalCacheRead)}
									</p>
								</div>
								<div className="cache-stat-card rounded-lg border p-3">
									<p className="cache-stat-label text-xs">Cache Write</p>
									<p className="cache-stat-value font-semibold">
										{formatTokens(cacheMetrics.totalCacheWrite)}
									</p>
								</div>
							</div>
							<Separator />
							<div className="space-y-2">
								<p className="text-muted-foreground text-[11px] tracking-[0.12em] uppercase">
									Top cache-intensive models
								</p>
								{cacheMetrics.byModel.slice(0, 4).map((item) => (
									<div
										key={item.name}
										className="flex items-center justify-between gap-2 text-sm"
									>
										<p className="truncate">{item.name}</p>
										<p className="text-muted-foreground">
											{formatTokens(item["Cache Read"] + item["Cache Write"])}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</section>

				<section className="mt-4 grid gap-4 xl:grid-cols-3">
					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle>Model Comparison</CardTitle>
							<CardDescription>
								Efficiency and economics per model in this range
							</CardDescription>
						</CardHeader>
						<CardContent>
							{modelComparison.length === 0 ? (
								<EmptyState
									title="No model metrics yet"
									description="Run ingest and pick a larger range if this period is empty."
								/>
							) : (
								<>
									<div className="space-y-2 md:hidden">
										{modelComparison.slice(0, 10).map((row, index) => (
											<div key={row.model} className="rounded-lg border p-3">
												<p className="truncate text-sm font-medium">
													#{index + 1} {row.model}
												</p>
												<div className="mt-2 grid grid-cols-2 gap-2 text-xs">
													<div>
														<p className="text-muted-foreground">Total Cost</p>
														<p className="font-semibold">
															{CURRENCY.format(row["Total Cost"])}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Avg / Msg</p>
														<p className="font-semibold">
															{CURRENCY.format(row["Avg Cost/Message"])}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Tokens</p>
														<p className="font-semibold">
															{formatTokens(row["Total Tokens"])}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Messages</p>
														<p className="font-semibold">
															{formatNumber(row.Messages)}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
									<div className="hidden md:block">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Model</TableHead>
													<TableHead className="text-right">
														Total Cost
													</TableHead>
													<TableHead className="text-right">
														Avg / Message
													</TableHead>
													<TableHead className="text-right">Tokens</TableHead>
													<TableHead className="text-right">Messages</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{modelComparison.slice(0, 10).map((row, index) => (
													<TableRow key={row.model}>
														<TableCell className="max-w-[240px] truncate font-medium">
															<span className="mr-2 rounded-full border px-2 py-0.5 text-[10px]">
																#{index + 1}
															</span>
															{row.model}
														</TableCell>
														<TableCell className="text-right">
															{CURRENCY.format(row["Total Cost"])}
														</TableCell>
														<TableCell className="text-right">
															{CURRENCY.format(row["Avg Cost/Message"])}
														</TableCell>
														<TableCell className="text-right">
															{formatTokens(row["Total Tokens"])}
														</TableCell>
														<TableCell className="text-right">
															{formatNumber(row.Messages)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Daily Message Velocity</CardTitle>
							<CardDescription>Conversation traffic over time</CardDescription>
						</CardHeader>
						<CardContent className="h-[280px] md:h-80">
							{messagesByDay.length === 0 ? (
								<EmptyState
									title="No message trend yet"
									description="Messages timeline appears when daily activity is available."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={messagesByDay.slice(-30)}>
										<defs>
											<linearGradient
												id="messageGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="0%"
													stopColor="#14b8a6"
													stopOpacity={0.45}
												/>
												<stop
													offset="100%"
													stopColor="#14b8a6"
													stopOpacity={0.06}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="4 4" vertical={false} />
										<XAxis
											dataKey="date"
											tickFormatter={formatShortDate}
											tickLine={false}
											axisLine={false}
										/>
										<YAxis tickLine={false} axisLine={false} />
										<Tooltip
											formatter={(value) => formatNumber(Number(value ?? 0))}
											labelFormatter={(label) => formatShortDate(String(label))}
										/>
										<Area
											type="monotone"
											dataKey="Messages"
											stroke="#0f766e"
											fill="url(#messageGradient)"
											strokeWidth={2}
										/>
									</AreaChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>
				</section>

				<section className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bot className="h-4 w-4" />
								Recent Sessions
							</CardTitle>
							<CardDescription>
								Latest session activity across your command stream
							</CardDescription>
						</CardHeader>
						<CardContent>
							{sessions.length === 0 ? (
								<EmptyState
									title="No sessions yet"
									description="Run `bun run ingest` and refresh to view recent sessions."
								/>
							) : (
								<>
									<div className="space-y-2 md:hidden">
										{sessions.map((session) => (
											<div
												key={session.sessionId}
												className="rounded-lg border p-3"
											>
												<p className="truncate font-mono text-xs">
													{session.sessionId}
												</p>
												<p className="mt-1 truncate text-sm font-medium">
													{session.model}
												</p>
												<p className="text-muted-foreground text-xs">
													{maskName(session.agent)}
												</p>
												<div className="mt-2 grid grid-cols-2 gap-2 text-xs">
													<div>
														<p className="text-muted-foreground">Messages</p>
														<p className="font-semibold">
															{formatNumber(session.messageCount)}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Tokens</p>
														<p className="font-semibold">
															{formatTokens(session.totalTokens)}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Cost</p>
														<p className="font-semibold">
															{CURRENCY.format(session.totalCost)}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Last Active</p>
														<p className="font-semibold">
															{formatDate(session.lastTimestamp)}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
									<div className="hidden md:block">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Session</TableHead>
													<TableHead>Agent</TableHead>
													<TableHead>Model</TableHead>
													<TableHead className="text-right">Messages</TableHead>
													<TableHead className="text-right">Tokens</TableHead>
													<TableHead className="text-right">Cost</TableHead>
													<TableHead className="text-right">
														Last Active
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{sessions.map((session) => (
													<TableRow key={session.sessionId}>
														<TableCell className="max-w-[150px] truncate font-mono text-xs">
															{session.sessionId}
														</TableCell>
														<TableCell>{maskName(session.agent)}</TableCell>
														<TableCell className="max-w-[250px] truncate">
															{session.model}
														</TableCell>
														<TableCell className="text-right">
															{formatNumber(session.messageCount)}
														</TableCell>
														<TableCell className="text-right">
															{formatTokens(session.totalTokens)}
														</TableCell>
														<TableCell className="text-right">
															{CURRENCY.format(session.totalCost)}
														</TableCell>
														<TableCell className="text-right text-xs">
															{formatDate(session.lastTimestamp)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</section>

				<footer className="mt-6 flex flex-col items-start gap-1 px-1 pb-1 text-xs sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<p className="text-muted-foreground">
							Latest data: {mostRecentDate ?? "N/A"}
						</p>
						<CacheFreshnessIndicator
							onRefresh={handleRefresh}
							lastFetchedAt={lastFetchedAt}
						/>
					</div>
					<p className="text-muted-foreground">
						Range: {RANGE_OPTIONS.find((option) => option.key === range)?.label}
					</p>
				</footer>
			</div>
		</main>
	);
}
