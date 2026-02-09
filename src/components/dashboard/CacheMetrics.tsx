"use client";

import { BarChart, CategoryBar, ProgressCircle } from "@tremor/react";
import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import { formatTokens } from "@/lib/formatters";
import { api } from "../../../convex/_generated/api";

interface CacheMetricsProps {
	startDate?: string;
	endDate?: string;
}

export function CacheMetrics({ startDate, endDate }: CacheMetricsProps) {
	const data = useQuery(api.queries.models.getCacheMetrics, {
		startDate,
		endDate,
	});

	return (
		<GlassCard delay={0.2}>
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-text-primary">
					Cache Performance
				</h3>
				{data && (
					<span className="text-xs font-medium text-emerald-400">
						{data.hitRate.toFixed(1)}% hit rate
					</span>
				)}
			</div>
			{!data ? (
				<div className="h-72 sm:h-80 skeleton-shimmer rounded-lg" />
			) : (
				<div className="space-y-6">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
						<div className="relative">
							<ProgressCircle value={data.hitRate} size="lg" color="emerald">
								<span className="text-lg font-bold text-text-primary">
									{data.hitRate.toFixed(0)}%
								</span>
							</ProgressCircle>
						</div>
						<div className="flex-1 space-y-3">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium text-text-secondary">
									Cache Utilization
								</span>
								<span className="text-text-tertiary">
									{formatTokens(data.totalCacheRead + data.totalCacheWrite)}{" "}
									total
								</span>
							</div>
							<CategoryBar
								values={[data.hitRate, 100 - data.hitRate]}
								colors={["emerald", "zinc"]}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-text-tertiary">
								<span className="flex items-center gap-1.5">
									<span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
									Read: {formatTokens(data.totalCacheRead)}
								</span>
								<span className="flex items-center gap-1.5">
									<span className="inline-block h-2 w-2 rounded-full bg-zinc-500" />
									Write: {formatTokens(data.totalCacheWrite)}
								</span>
							</div>
						</div>
					</div>
					{data.byModel.length > 0 && (
						<>
							<div className="section-divider" />
							<BarChart
								className="h-36 sm:h-40"
								data={data.byModel}
								index="name"
								categories={["Cache Read", "Cache Write"]}
								colors={["emerald", "amber"]}
								showLegend
								showAnimation
								stack
								showGridLines={false}
								valueFormatter={(v) => formatTokens(v)}
							/>
						</>
					)}
				</div>
			)}
		</GlassCard>
	);
}
