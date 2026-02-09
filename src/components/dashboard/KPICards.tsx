"use client";

import { useQuery } from "convex/react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
	Cpu,
	DollarSign,
	FolderOpen,
	Hash,
	MessageSquare,
	Zap,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { GlassCard } from "@/components/layout/GlassCard";
import {
	formatCurrency,
	formatNumber,
	formatPercent,
	formatTokens,
} from "@/lib/formatters";
import { api } from "../../../convex/_generated/api";

interface AnimatedCounterProps {
	value: number;
	formatter: (n: number) => string;
	gradientClass: string;
}

function AnimatedCounter({
	value,
	formatter,
	gradientClass,
}: AnimatedCounterProps) {
	const motionValue = useMotionValue(0);
	const display = useTransform(motionValue, (v) => formatter(v));

	useEffect(() => {
		const controls = animate(motionValue, value, {
			duration: 2,
			ease: [0.25, 0.46, 0.45, 0.94],
		});
		return () => controls.stop();
	}, [value, motionValue]);

	return (
		<motion.span
			className={`text-2xl font-semibold tracking-tight sm:text-3xl lg:text-2xl xl:text-3xl ${gradientClass}`}
		>
			{display}
		</motion.span>
	);
}

interface KPICardProps {
	icon: ReactNode;
	label: string;
	value: number;
	formatter: (n: number) => string;
	accentColor: string;
	accentGlow: string;
	gradientClass: string;
	borderColor: string;
	delay: number;
}

function KPICard({
	icon,
	label,
	value,
	formatter,
	accentColor,
	accentGlow,
	gradientClass,
	borderColor,
	delay,
}: KPICardProps) {
	return (
		<GlassCard
			delay={delay}
			variant="hero"
			className="flex flex-col gap-3 relative"
		>
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-text-secondary">{label}</span>
				<div className={`p-2 rounded-xl ${accentColor} ${accentGlow}`}>
					{icon}
				</div>
			</div>
			<AnimatedCounter
				value={value}
				formatter={formatter}
				gradientClass={gradientClass}
			/>
			<div
				className={`absolute bottom-0 left-4 right-4 h-px ${borderColor} opacity-50`}
			/>
		</GlassCard>
	);
}

interface KPICardsProps {
	startDate?: string;
	endDate?: string;
}

export function KPICards({ startDate, endDate }: KPICardsProps) {
	const stats = useQuery(api.queries.overview.getOverviewStats, {
		startDate,
		endDate,
	});

	if (!stats) {
		return (
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
				{["cost", "tokens", "messages", "cache", "models", "sessions"].map(
					(id) => (
						<div
							key={id}
							className="glass-card-hero p-5 h-24 skeleton-shimmer rounded-2xl"
						/>
					),
				)}
			</div>
		);
	}

	const cards: Omit<KPICardProps, "delay">[] = [
		{
			icon: <DollarSign className="h-5 w-5 text-indigo-400" />,
			label: "Total Cost",
			value: stats.totalCost,
			formatter: formatCurrency,
			accentColor: "bg-indigo-400/15",
			accentGlow: "shadow-[0_0_12px_rgba(129,140,248,0.2)]",
			gradientClass: "gradient-text-indigo",
			borderColor:
				"bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent",
		},
		{
			icon: <Hash className="h-5 w-5 text-emerald-400" />,
			label: "Total Tokens",
			value: stats.totalTokens,
			formatter: formatTokens,
			accentColor: "bg-emerald-400/15",
			accentGlow: "shadow-[0_0_12px_rgba(52,211,153,0.2)]",
			gradientClass: "gradient-text-emerald",
			borderColor:
				"bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent",
		},
		{
			icon: <MessageSquare className="h-5 w-5 text-amber-400" />,
			label: "Messages",
			value: stats.totalMessages,
			formatter: formatNumber,
			accentColor: "bg-amber-400/15",
			accentGlow: "shadow-[0_0_12px_rgba(251,191,36,0.2)]",
			gradientClass: "gradient-text-amber",
			borderColor:
				"bg-gradient-to-r from-transparent via-amber-400/40 to-transparent",
		},
		{
			icon: <Zap className="h-5 w-5 text-red-400" />,
			label: "Cache Hit Rate",
			value: stats.cacheHitRate * 100,
			formatter: formatPercent,
			accentColor: "bg-red-400/15",
			accentGlow: "shadow-[0_0_12px_rgba(248,113,113,0.2)]",
			gradientClass: "gradient-text-red",
			borderColor:
				"bg-gradient-to-r from-transparent via-red-400/40 to-transparent",
		},
		{
			icon: <Cpu className="h-5 w-5 text-violet-400" />,
			label: "Models Used",
			value: stats.modelsUsed,
			formatter: (n) => n.toFixed(0),
			accentColor: "bg-violet-400/15",
			accentGlow: "shadow-[0_0_12px_rgba(167,139,250,0.2)]",
			gradientClass: "gradient-text-violet",
			borderColor:
				"bg-gradient-to-r from-transparent via-violet-400/40 to-transparent",
		},
		{
			icon: <FolderOpen className="h-5 w-5 text-cyan-400" />,
			label: "Sessions",
			value: stats.sessionCount,
			formatter: formatNumber,
			accentColor: "bg-cyan-400/15",
			accentGlow: "shadow-[0_0_12px_rgba(34,211,238,0.2)]",
			gradientClass: "gradient-text-cyan",
			borderColor:
				"bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
			{cards.map((card, i) => (
				<KPICard key={card.label} {...card} delay={i * 0.06} />
			))}
		</div>
	);
}
