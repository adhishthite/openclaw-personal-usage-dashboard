"use client";

import type { Color } from "@tremor/react";
import { BarList, DonutChart } from "@tremor/react";
import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import { formatCurrency } from "@/lib/formatters";
import { api } from "../../../convex/_generated/api";

const CHART_COLORS = [
	"indigo",
	"emerald",
	"amber",
	"red",
	"violet",
	"sky",
] as const;

interface CostBreakdownProps {
	startDate?: string;
	endDate?: string;
}

export function CostBreakdown({ startDate, endDate }: CostBreakdownProps) {
	const data = useQuery(api.queries.models.getCostByModel, {
		startDate,
		endDate,
	});

	const total = data?.reduce((sum, d) => sum + d.value, 0) ?? 0;

	return (
		<GlassCard delay={0.2}>
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-text-primary">
					Cost by Model
				</h3>
				{data && data.length > 0 && (
					<span className="text-xs font-medium text-emerald-400">
						{formatCurrency(total)}
					</span>
				)}
			</div>
			{!data ? (
				<div className="h-80 skeleton-shimmer rounded-lg" />
			) : data.length === 0 ? (
				<div className="h-80 flex items-center justify-center text-sm text-text-tertiary">
					No data available
				</div>
			) : (
				<div className="space-y-5">
					<DonutChart
						className="h-44"
						data={data}
						category="value"
						index="name"
						colors={["indigo", "emerald", "amber", "red", "violet", "sky"]}
						showAnimation
						valueFormatter={(v) => formatCurrency(v)}
					/>
					<div className="section-divider" />
					<BarList
						data={data.map((d, i) => ({
							name: d.name,
							value: d.value,
							color: CHART_COLORS[i % CHART_COLORS.length] as unknown as Color,
						}))}
						valueFormatter={(v: number) => formatCurrency(v)}
					/>
				</div>
			)}
		</GlassCard>
	);
}
