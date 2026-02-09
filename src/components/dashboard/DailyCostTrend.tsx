"use client";

import { LineChart } from "@tremor/react";
import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import { formatCurrency } from "@/lib/formatters";
import { api } from "../../../convex/_generated/api";

interface DailyCostTrendProps {
	startDate?: string;
	endDate?: string;
}

export function DailyCostTrend({ startDate, endDate }: DailyCostTrendProps) {
	const data = useQuery(api.queries.timeseries.getDailyCosts, {
		startDate,
		endDate,
	});

	const maxCost = data ? Math.max(...data.map((d) => d.Cost)) : 0;

	return (
		<GlassCard delay={0.2}>
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-text-primary">
					Daily Cost Trend
				</h3>
				{data && data.length > 0 && (
					<span className="text-xs text-text-tertiary">
						Peak:{" "}
						<span className="text-amber-400">{formatCurrency(maxCost)}</span>
					</span>
				)}
			</div>
			{!data ? (
				<div className="h-72 sm:h-80 skeleton-shimmer rounded-lg" />
			) : data.length === 0 ? (
				<div className="h-72 sm:h-80 flex items-center justify-center text-sm text-text-tertiary">
					No data available
				</div>
			) : (
				<LineChart
					className="h-72 sm:h-80"
					data={data}
					index="date"
					categories={["Cost"]}
					colors={["emerald"]}
					showLegend={false}
					showAnimation
					curveType="monotone"
					showGridLines={false}
					valueFormatter={(v) => formatCurrency(v)}
				/>
			)}
		</GlassCard>
	);
}
