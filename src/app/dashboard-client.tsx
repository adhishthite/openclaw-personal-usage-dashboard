"use client";

import { useQuery } from "convex/react";
import {
	Activity,
	Bot,
	CalendarDays,
	CircleDollarSign,
	Cpu,
	Database,
	MessageSquare,
	Rocket,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
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
import { api } from "../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/lib/formatters";

const NO_RANGE = {};
const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];
const CURRENCY = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 4,
});

function MetricCard({
	label,
	value,
	description,
	icon: Icon,
}: {
	label: string;
	value: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<Card className="gap-3 py-4">
			<CardHeader className="px-4 pb-0">
				<div className="text-muted-foreground flex items-center justify-between">
					<p className="text-xs uppercase tracking-wide">{label}</p>
					<Icon className="h-4 w-4" />
				</div>
			</CardHeader>
			<CardContent className="space-y-1 px-4 pt-0">
				<p className="text-2xl font-semibold tracking-tight">{value}</p>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	);
}

function EmptyState({ title, description }: { title: string; description: string }) {
	return (
		<div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
			<p className="font-medium">{title}</p>
			<p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-5">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
				{Array.from({ length: 5 }).map((_, idx) => (
					<Skeleton key={`metric-${idx}`} className="h-28 rounded-xl" />
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

export function DashboardClient() {
	const overview = useQuery(api.queries.overview.getOverviewStats, NO_RANGE);
	const sessions = useQuery(api.queries.sessions.getRecentSessions, {
		limit: 8,
	});
	const dailyCosts = useQuery(api.queries.timeseries.getDailyCosts, NO_RANGE);
	const tokenTimeseries = useQuery(api.queries.timeseries.getTokenTimeseries, NO_RANGE);
	const messagesByDay = useQuery(api.queries.timeseries.getMessagesByDay, NO_RANGE);
	const costByModel = useQuery(api.queries.models.getCostByModel, NO_RANGE);
	const modelComparison = useQuery(api.queries.models.getModelComparison, NO_RANGE);
	const cacheMetrics = useQuery(api.queries.models.getCacheMetrics, NO_RANGE);

	const isLoading =
		overview === undefined ||
		sessions === undefined ||
		dailyCosts === undefined ||
		tokenTimeseries === undefined ||
		messagesByDay === undefined ||
		costByModel === undefined ||
		modelComparison === undefined ||
		cacheMetrics === undefined;

	if (isLoading) {
		return (
			<main className="relative min-h-screen overflow-hidden p-6 md:p-10">
				<div className="from-primary/10 absolute inset-0 -z-20 bg-gradient-to-b via-cyan-500/5 to-transparent" />
				<div className="from-primary/20 absolute -top-28 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b blur-3xl" />
				<div className="mx-auto max-w-7xl">
					<div className="mb-6 space-y-2">
						<Skeleton className="h-8 w-72 rounded-lg" />
						<Skeleton className="h-4 w-96 rounded-lg" />
					</div>
					<DashboardSkeleton />
				</div>
			</main>
		);
	}

	const cacheHitRate = overview.cacheHitRate * 100;
	const avgCostPerMessage =
		overview.totalMessages > 0 ? overview.totalCost / overview.totalMessages : 0;
	const avgTokensPerMessage =
		overview.totalMessages > 0 ? overview.totalTokens / overview.totalMessages : 0;
	const mostRecentDate = dailyCosts.at(-1)?.date;

	return (
		<main className="relative min-h-screen overflow-hidden p-6 md:p-10">
			<div className="from-primary/10 absolute inset-0 -z-20 bg-gradient-to-b via-cyan-500/5 to-transparent" />
			<div className="from-primary/20 absolute -top-28 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b blur-3xl" />
			<div className="mx-auto max-w-7xl">
				<header className="mb-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="outline">OpenClaw Analytics</Badge>
								<Badge variant="success">
									<Activity className="mr-1 h-3 w-3" />
									Live via Convex
								</Badge>
							</div>
							<h1 className="text-4xl font-semibold tracking-tight">
								Usage Observatory
							</h1>
							<p className="text-muted-foreground max-w-2xl text-sm">
								A unified cost, token, and session intelligence view powered by
								your Convex contracts.
							</p>
						</div>
						<Card className="w-full py-4 lg:w-[380px]">
							<CardContent className="space-y-3 px-4">
								<div className="flex items-center justify-between text-sm">
									<p className="text-muted-foreground">Last data point</p>
									<p className="font-medium">
										{mostRecentDate ? formatShortDate(mostRecentDate) : "N/A"}
									</p>
								</div>
								<Separator />
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="rounded-md border p-2">
										<p className="text-muted-foreground text-xs">Cache Hit Rate</p>
										<p className="font-semibold">{formatPercent(cacheHitRate)}</p>
									</div>
									<div className="rounded-md border p-2">
										<p className="text-muted-foreground text-xs">Avg Tokens/Msg</p>
										<p className="font-semibold">
											{formatNumber(Math.round(avgTokensPerMessage))}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
					<MetricCard
						label="Total Cost"
						value={formatCurrency(overview.totalCost)}
						description="Cumulative spend across all sessions"
						icon={CircleDollarSign}
					/>
					<MetricCard
						label="Total Tokens"
						value={formatTokens(overview.totalTokens)}
						description="Input + output + cache tokens"
						icon={Database}
					/>
					<MetricCard
						label="Messages"
						value={formatNumber(overview.totalMessages)}
						description="Total message count"
						icon={MessageSquare}
					/>
					<MetricCard
						label="Models Used"
						value={formatNumber(overview.modelsUsed)}
						description={`Across ${formatNumber(overview.sessionCount)} sessions`}
						icon={Cpu}
					/>
					<MetricCard
						label="Avg Cost / Message"
						value={CURRENCY.format(avgCostPerMessage)}
						description="Efficiency indicator"
						icon={Rocket}
					/>
				</section>

				<section className="mt-5 grid gap-4 xl:grid-cols-3">
					<Card className="xl:col-span-2">
						<CardHeader className="pb-0">
							<CardTitle className="flex items-center gap-2">
								<CalendarDays className="h-4 w-4" />
								Daily Cost Trend
							</CardTitle>
							<CardDescription>
								Day-over-day spend progression from `dailyStats`
							</CardDescription>
						</CardHeader>
						<CardContent className="h-80 pt-4">
							{dailyCosts.length === 0 ? (
								<EmptyState
									title="No cost data yet"
									description="Run your ingestion job to populate daily cost metrics."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={dailyCosts}>
										<defs>
											<linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
												<stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis
											dataKey="date"
											tickFormatter={formatShortDate}
											tickLine={false}
											axisLine={false}
										/>
										<YAxis tickLine={false} axisLine={false} width={70} />
										<Tooltip
											formatter={(value) => CURRENCY.format(Number(value ?? 0))}
											labelFormatter={(label) => formatShortDate(String(label))}
										/>
										<Area
											type="monotone"
											dataKey="Cost"
											stroke="#0ea5e9"
											fill="url(#costFill)"
											strokeWidth={2}
										/>
									</AreaChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-0">
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="h-4 w-4" />
								Cost by Model
							</CardTitle>
							<CardDescription>
								Distribution across model families
							</CardDescription>
						</CardHeader>
						<CardContent className="h-80 pt-4">
							{costByModel.length === 0 ? (
								<EmptyState
									title="No model cost data"
									description="Costs by model will appear after ingestion."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={costByModel}
											dataKey="value"
											nameKey="name"
											innerRadius={58}
											outerRadius={92}
											paddingAngle={3}
										>
											{costByModel.map((entry, index) => (
												<Cell
													key={`${entry.name}-${index}`}
													fill={COLORS[index % COLORS.length]}
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
						<CardHeader className="pb-0">
							<CardTitle className="flex items-center gap-2">
								<Database className="h-4 w-4" />
								Token Throughput
							</CardTitle>
							<CardDescription>
								Input, output, and cache token movement per day
							</CardDescription>
						</CardHeader>
						<CardContent className="h-80 pt-4">
							{tokenTimeseries.length === 0 ? (
								<EmptyState
									title="No token data"
									description="Token throughput chart will render once data arrives."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={tokenTimeseries.slice(-21)}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis
											dataKey="date"
											tickFormatter={formatShortDate}
											tickLine={false}
											axisLine={false}
										/>
										<YAxis tickLine={false} axisLine={false} width={80} />
										<Tooltip
											formatter={(value) => formatTokens(Number(value ?? 0))}
											labelFormatter={(label) => formatShortDate(String(label))}
										/>
										<Bar dataKey="Input Tokens" stackId="tokens" fill="#22c55e" />
										<Bar dataKey="Output Tokens" stackId="tokens" fill="#0ea5e9" />
										<Bar dataKey="Cache Read" stackId="tokens" fill="#f59e0b" />
										<Bar dataKey="Cache Write" stackId="tokens" fill="#8b5cf6" />
									</BarChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShieldCheck className="h-4 w-4" />
								Cache Performance
							</CardTitle>
							<CardDescription>
								Hit rate and cache volume split by model
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<div className="flex items-center justify-between text-sm">
									<p>Overall hit rate</p>
									<p className="font-semibold">{formatPercent(cacheMetrics.hitRate)}</p>
								</div>
								<Progress value={cacheMetrics.hitRate} />
							</div>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div className="rounded-md border p-2">
									<p className="text-muted-foreground text-xs">Cache Read</p>
									<p className="font-semibold">
										{formatTokens(cacheMetrics.totalCacheRead)}
									</p>
								</div>
								<div className="rounded-md border p-2">
									<p className="text-muted-foreground text-xs">Cache Write</p>
									<p className="font-semibold">
										{formatTokens(cacheMetrics.totalCacheWrite)}
									</p>
								</div>
							</div>
							<Separator />
							<div className="space-y-2">
								<p className="text-muted-foreground text-xs uppercase tracking-wide">
									Top cache models
								</p>
								{cacheMetrics.byModel.slice(0, 4).map((item) => (
									<div
										key={item.name}
										className="flex items-center justify-between text-sm"
									>
										<p className="truncate pr-2">{item.name}</p>
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
								Cost and message-level efficiency across models
							</CardDescription>
						</CardHeader>
						<CardContent>
							{modelComparison.length === 0 ? (
								<EmptyState
									title="No model comparison data"
									description="Once data is available, this table will compare model efficiency."
								/>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Model</TableHead>
											<TableHead className="text-right">Total Cost</TableHead>
											<TableHead className="text-right">Avg / Message</TableHead>
											<TableHead className="text-right">Tokens</TableHead>
											<TableHead className="text-right">Messages</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{modelComparison.slice(0, 8).map((row) => (
											<TableRow key={row.model}>
												<TableCell className="max-w-[220px] truncate font-medium">
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
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Daily Message Velocity</CardTitle>
							<CardDescription>Messages trend over time</CardDescription>
						</CardHeader>
						<CardContent className="h-80">
							{messagesByDay.length === 0 ? (
								<EmptyState
									title="No message trend data"
									description="Message velocity will appear once daily activity is ingested."
								/>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={messagesByDay.slice(-30)}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
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
											stroke="#8b5cf6"
											fill="#8b5cf6"
											fillOpacity={0.18}
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
								Latest active sessions from completion logs
							</CardDescription>
						</CardHeader>
						<CardContent>
							{sessions.length === 0 ? (
								<EmptyState
									title="No sessions yet"
									description="Run `bun run ingest` and refresh this page to inspect recent sessions."
								/>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Session</TableHead>
											<TableHead>Agent</TableHead>
											<TableHead>Model</TableHead>
											<TableHead className="text-right">Messages</TableHead>
											<TableHead className="text-right">Tokens</TableHead>
											<TableHead className="text-right">Cost</TableHead>
											<TableHead className="text-right">Last Active</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sessions.map((session) => (
											<TableRow key={session.sessionId}>
												<TableCell className="max-w-[140px] truncate font-mono text-xs">
													{session.sessionId}
												</TableCell>
												<TableCell>{session.agent}</TableCell>
												<TableCell className="max-w-[240px] truncate">
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
							)}
						</CardContent>
					</Card>
				</section>
			</div>
		</main>
	);
}
