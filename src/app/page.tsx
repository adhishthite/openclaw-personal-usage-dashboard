"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	BarChart3,
	DollarSign,
	Gauge,
	Radio,
	Table2,
} from "lucide-react";
import { useState } from "react";
import { ActivityTracker } from "@/components/dashboard/ActivityTracker";
import { CacheMetrics } from "@/components/dashboard/CacheMetrics";
import { CostBreakdown } from "@/components/dashboard/CostBreakdown";
import { DailyCostTrend } from "@/components/dashboard/DailyCostTrend";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { KPICards } from "@/components/dashboard/KPICards";
import { MessagesByDay } from "@/components/dashboard/MessagesByDay";
import { ModelComparison } from "@/components/dashboard/ModelComparison";
import { SessionTable } from "@/components/dashboard/SessionTable";
import { TokenChart } from "@/components/dashboard/TokenChart";

function SectionHeader({
	children,
	icon: Icon,
}: {
	children: string;
	icon: LucideIcon;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -10 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ duration: 0.4 }}
			className="mb-5 flex items-center gap-3"
		>
			<div className="flex items-center justify-center rounded-lg bg-white/[0.06] p-1.5">
				<Icon className="h-3.5 w-3.5 text-text-tertiary" />
			</div>
			<h2 className="text-sm font-semibold uppercase tracking-widest text-text-tertiary">
				{children}
			</h2>
			<div className="flex-1 section-divider" />
		</motion.div>
	);
}

export default function Home() {
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);

	return (
		<>
			<div className="aurora-bg" />
			<div className="noise-overlay" />
			<div className="relative z-10 min-h-screen">
				<div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 lg:px-8">
					{/* Header */}
					<motion.header
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-10"
					>
						<div className="flex items-center gap-4">
							<div className="rounded-2xl bg-indigo-500/15 p-3 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
								<Activity className="h-7 w-7 text-indigo-400" />
							</div>
							<div>
								<h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
									OpenClaw Usage Dashboard
								</h1>
								<p className="mt-0.5 text-sm text-text-secondary">
									LLM API usage tracking and analytics
								</p>
							</div>
						</div>
						<DateRangePicker
							startDate={startDate}
							endDate={endDate}
							onDateChange={(start, end) => {
								setStartDate(start);
								setEndDate(end);
							}}
						/>
					</motion.header>

					{/* KPI Cards */}
					<section className="mb-8 lg:mb-10">
						<KPICards startDate={startDate} endDate={endDate} />
					</section>

					{/* Charts Row 1: Token Usage + Cost by Model */}
					<section className="mb-8 lg:mb-10">
						<SectionHeader icon={BarChart3}>Usage Breakdown</SectionHeader>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
							<TokenChart startDate={startDate} endDate={endDate} />
							<CostBreakdown startDate={startDate} endDate={endDate} />
						</div>
					</section>

					{/* Charts Row 2: Daily Cost Trend + Model Comparison */}
					<section className="mb-8 lg:mb-10">
						<SectionHeader icon={DollarSign}>Cost Analysis</SectionHeader>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<DailyCostTrend startDate={startDate} endDate={endDate} />
							<ModelComparison startDate={startDate} endDate={endDate} />
						</div>
					</section>

					{/* Charts Row 3: Cache Performance + Messages per Day */}
					<section className="mb-8 lg:mb-10">
						<SectionHeader icon={Gauge}>Performance</SectionHeader>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<CacheMetrics startDate={startDate} endDate={endDate} />
							<MessagesByDay startDate={startDate} endDate={endDate} />
						</div>
					</section>

					{/* Activity Tracker */}
					<section className="mb-8 lg:mb-10">
						<SectionHeader icon={Radio}>Activity</SectionHeader>
						<ActivityTracker />
					</section>

					{/* Sessions Table */}
					<section className="pb-8">
						<SectionHeader icon={Table2}>Recent Sessions</SectionHeader>
						<SessionTable />
					</section>
				</div>
			</div>
		</>
	);
}
