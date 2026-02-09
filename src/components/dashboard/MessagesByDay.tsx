"use client";

import { BarChart } from "@tremor/react";
import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import { formatNumber } from "@/lib/formatters";
import { api } from "../../../convex/_generated/api";

interface MessagesByDayProps {
	startDate?: string;
	endDate?: string;
}

export function MessagesByDay({ startDate, endDate }: MessagesByDayProps) {
	const data = useQuery(api.queries.timeseries.getMessagesByDay, {
		startDate,
		endDate,
	});

	const totalMessages = data?.reduce((sum, d) => sum + d.Messages, 0) ?? 0;

	return (
		<GlassCard delay={0.25}>
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-text-primary">
					Messages per Day
				</h3>
				{data && data.length > 0 && (
					<span className="text-xs text-text-tertiary">
						Total:{" "}
						<span className="text-indigo-400 font-medium">
							{formatNumber(totalMessages)}
						</span>
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
					index="date"
					categories={["Messages"]}
					colors={["indigo"]}
					showLegend={false}
					showAnimation
					showGridLines={false}
					valueFormatter={(v) => formatNumber(v)}
				/>
			)}
		</GlassCard>
	);
}
