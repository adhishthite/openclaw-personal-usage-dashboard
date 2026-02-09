"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";

interface DateRangePickerProps {
	startDate: string | undefined;
	endDate: string | undefined;
	onDateChange: (start: string | undefined, end: string | undefined) => void;
}

const PRESETS = [
	{ label: "All Time", start: undefined, end: undefined },
	{ label: "7d", days: 7 },
	{ label: "14d", days: 14 },
	{ label: "30d", days: 30 },
] as const;

function getDaysAgo(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toISOString().split("T")[0];
}

function getToday(): string {
	return new Date().toISOString().split("T")[0];
}

export function DateRangePicker({
	startDate,
	endDate,
	onDateChange,
}: DateRangePickerProps) {
	const [activePreset, setActivePreset] = useState<string>("All Time");

	return (
		<div className="flex flex-wrap items-center gap-3">
			<Calendar className="hidden h-4 w-4 text-text-tertiary sm:block" />
			<div className="flex items-center gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/[0.06]">
				{PRESETS.map((preset) => {
					const isActive = activePreset === preset.label;
					return (
						<button
							key={preset.label}
							type="button"
							onClick={() => {
								setActivePreset(preset.label);
								if ("days" in preset) {
									onDateChange(getDaysAgo(preset.days), getToday());
								} else {
									onDateChange(undefined, undefined);
								}
							}}
							className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
								isActive
									? "bg-accent-primary text-white shadow-md shadow-accent-primary/25"
									: "text-text-secondary hover:text-text-primary hover:bg-white/[0.06]"
							}`}
						>
							{preset.label}
						</button>
					);
				})}
			</div>
			<div className="hidden items-center gap-2 sm:flex">
				<input
					type="date"
					value={startDate ?? ""}
					onChange={(e) => {
						setActivePreset("");
						onDateChange(e.target.value || undefined, endDate);
					}}
					className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all"
				/>
				<span className="text-text-tertiary text-xs font-medium">to</span>
				<input
					type="date"
					value={endDate ?? ""}
					onChange={(e) => {
						setActivePreset("");
						onDateChange(startDate, e.target.value || undefined);
					}}
					className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all"
				/>
			</div>
		</div>
	);
}
