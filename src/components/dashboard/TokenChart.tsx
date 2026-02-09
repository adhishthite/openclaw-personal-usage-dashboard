"use client";

import { AreaChart } from "@tremor/react";
import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import { api } from "../../../convex/_generated/api";

interface TokenChartProps {
	startDate?: string;
	endDate?: string;
}

export function TokenChart({ startDate, endDate }: TokenChartProps) {
	const data = useQuery(api.queries.timeseries.getTokenTimeseries, {
		startDate,
		endDate,
	});

	return (
		<GlassCard delay={0.15} className="col-span-1 lg:col-span-2">
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-text-primary">
					Token Usage Over Time
				</h3>
				{data && data.length > 0 && (
					<span className="text-xs text-text-tertiary">{data.length} days</span>
				)}
			</div>
			{!data ? (
				<div className="h-72 sm:h-80 skeleton-shimmer rounded-lg" />
			) : data.length === 0 ? (
				<div className="h-72 sm:h-80 flex items-center justify-center text-sm text-text-tertiary">
					No data available
				</div>
			) : (
				<AreaChart
					className="h-72 sm:h-80"
					data={data}
					index="date"
					categories={[
						"Input Tokens",
						"Output Tokens",
						"Cache Read",
						"Cache Write",
					]}
					colors={["indigo", "emerald", "amber", "violet"]}
					showLegend
					showAnimation
					stack
					curveType="monotone"
					showGridLines={false}
					valueFormatter={(v) =>
						v >= 1_000_000
							? `${(v / 1_000_000).toFixed(1)}M`
							: v >= 1_000
								? `${(v / 1_000).toFixed(1)}K`
								: v.toString()
					}
				/>
			)}
		</GlassCard>
	);
}
