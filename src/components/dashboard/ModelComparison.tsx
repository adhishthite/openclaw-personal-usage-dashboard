"use client";

import { BarChart } from "@tremor/react";
import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import { formatCurrency } from "@/lib/formatters";
import { api } from "../../../convex/_generated/api";

interface ModelComparisonProps {
	startDate?: string;
	endDate?: string;
}

export function ModelComparison({ startDate, endDate }: ModelComparisonProps) {
	const data = useQuery(api.queries.models.getModelComparison, {
		startDate,
		endDate,
	});

	return (
		<GlassCard delay={0.25}>
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-text-primary">
					Model Comparison
				</h3>
				{data && data.length > 0 && (
					<span className="text-xs text-text-tertiary">
						{data.length} models
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
				<BarChart
					className="h-72 sm:h-80"
					data={data}
					index="model"
					categories={["Total Cost", "Avg Cost/Message"]}
					colors={["indigo", "amber"]}
					showLegend
					showAnimation
					showGridLines={false}
					valueFormatter={(v) => formatCurrency(v)}
				/>
			)}
		</GlassCard>
	);
}
