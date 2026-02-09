"use client";

import { useQuery } from "convex/react";
import { GlassCard } from "@/components/layout/GlassCard";
import {
	formatCurrency,
	formatDate,
	formatTokens,
	maskName,
	maskSessionId,
} from "@/lib/formatters";
import { api } from "../../../convex/_generated/api";

export function SessionTable() {
	const sessions = useQuery(api.queries.sessions.getRecentSessions, {
		limit: 15,
	});

	return (
		<GlassCard delay={0.15}>
			<div className="mb-4 flex items-center justify-between">
				{sessions && sessions.length > 0 && (
					<span className="text-xs text-text-tertiary">
						Showing {sessions.length} most recent
					</span>
				)}
			</div>
			{!sessions ? (
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={`skeleton-${i.toString()}`}
							className="h-12 skeleton-shimmer rounded-lg"
						/>
					))}
				</div>
			) : sessions.length === 0 ? (
				<div className="h-64 flex items-center justify-center text-sm text-text-tertiary">
					No sessions available
				</div>
			) : (
				<>
					{/* Desktop table */}
					<div className="hidden sm:block overflow-x-auto -mx-5 px-5">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-white/[0.06]">
									<th className="text-left py-3 px-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
										Session
									</th>
									<th className="text-left py-3 px-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
										Agent
									</th>
									<th className="text-left py-3 px-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
										Model
									</th>
									<th className="text-right py-3 px-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
										Cost
									</th>
									<th className="text-right py-3 px-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
										Tokens
									</th>
									<th className="text-right py-3 px-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
										Msgs
									</th>
									<th className="text-right py-3 px-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
										Last Active
									</th>
								</tr>
							</thead>
							<tbody>
								{sessions.map((session) => (
									<tr
										key={session.sessionId}
										className="group border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors"
									>
										<td className="py-3 px-3 text-text-primary font-mono text-xs">
											<span className="rounded bg-white/[0.06] px-1.5 py-0.5">
												{maskSessionId(session.sessionId.slice(0, 8))}
											</span>
										</td>
										<td className="py-3 px-3">
											<span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2.5 py-1 text-[0.6875rem] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20">
												{maskName(session.agent)}
											</span>
										</td>
										<td className="py-3 px-3 text-text-secondary text-xs">
											{session.model}
										</td>
										<td className="py-3 px-3 text-right font-medium text-xs">
											<span className="text-emerald-400">
												{formatCurrency(session.totalCost)}
											</span>
										</td>
										<td className="py-3 px-3 text-right text-text-secondary text-xs tabular-nums">
											{formatTokens(session.totalTokens)}
										</td>
										<td className="py-3 px-3 text-right text-text-secondary text-xs tabular-nums">
											{session.messageCount}
										</td>
										<td className="py-3 px-3 text-right text-text-tertiary text-xs">
											{formatDate(session.lastTimestamp)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Mobile card list */}
					<div className="sm:hidden space-y-2">
						{sessions.slice(0, 10).map((session) => (
							<div
								key={session.sessionId}
								className="rounded-xl bg-white/[0.04] p-3.5 space-y-2.5 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
							>
								<div className="flex items-center justify-between">
									<span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-0.5 text-[0.6875rem] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20">
										{maskName(session.agent)}
									</span>
									<span className="text-emerald-400 font-semibold text-sm">
										{formatCurrency(session.totalCost)}
									</span>
								</div>
								<div className="flex items-center justify-between text-xs text-text-secondary">
									<span className="font-mono text-text-tertiary rounded bg-white/[0.06] px-1.5 py-0.5">
										{maskSessionId(session.sessionId.slice(0, 8))}
									</span>
									<span>{session.model}</span>
								</div>
								<div className="flex items-center justify-between text-xs text-text-tertiary">
									<span>
										{formatTokens(session.totalTokens)} tokens /{" "}
										{session.messageCount} msgs
									</span>
									<span>{formatDate(session.lastTimestamp)}</span>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</GlassCard>
	);
}
