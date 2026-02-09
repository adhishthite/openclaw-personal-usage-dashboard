"use client";

import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import { api } from "../../../convex/_generated/api";

const COLOR_SCALE: Record<string, { bg: string; label: string }> = {
	emerald: { bg: "#34d399", label: "High (200+)" },
	amber: { bg: "#fbbf24", label: "Medium (100+)" },
	sky: { bg: "#38bdf8", label: "Low (50+)" },
	zinc: { bg: "#27272a", label: "Minimal" },
};

export function ActivityTracker() {
	const data = useQuery(api.queries.timeseries.getDailyActivity);

	return (
		<GlassCard delay={0.15}>
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-text-primary">
					Daily Activity
				</h3>
				{data && data.length > 0 && (
					<span className="text-xs text-text-tertiary">
						{data.length} days tracked
					</span>
				)}
			</div>
			{!data ? (
				<div className="h-28 skeleton-shimmer rounded-lg" />
			) : data.length === 0 ? (
				<div className="h-28 flex items-center justify-center text-sm text-text-tertiary">
					No data available
				</div>
			) : (
				<div className="space-y-4">
					<div className="overflow-x-auto -mx-5 px-5">
						<div className="flex gap-[3px] min-w-[600px]">
							{data.map((d) => {
								const colorInfo = COLOR_SCALE[d.color] ?? COLOR_SCALE.zinc;
								return (
									<div
										key={d.key}
										className="flex-1 rounded-[3px] transition-all duration-200 hover:ring-1 hover:ring-white/20 hover:scale-110 cursor-default"
										style={{
											backgroundColor: colorInfo.bg,
											height: "32px",
											minWidth: "8px",
										}}
										title={d.tooltip}
									/>
								);
							})}
						</div>
						<div className="flex justify-between mt-2 text-[11px] text-text-tertiary">
							<span>{data[0]?.key}</span>
							<span>{data[data.length - 1]?.key}</span>
						</div>
					</div>
					<div className="flex items-center gap-4 pt-1">
						<span className="text-[11px] text-text-tertiary">Less</span>
						{(["zinc", "sky", "amber", "emerald"] as const).map((color) => (
							<div
								key={color}
								className="h-3 w-3 rounded-[2px]"
								style={{ backgroundColor: COLOR_SCALE[color].bg }}
								title={COLOR_SCALE[color].label}
							/>
						))}
						<span className="text-[11px] text-text-tertiary">More</span>
					</div>
				</div>
			)}
		</GlassCard>
	);
}
