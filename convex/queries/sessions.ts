import { v } from "convex/values";
import { query } from "../_generated/server";

export const getRecentSessions = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;

		const completions = await ctx.db
			.query("completions")
			.withIndex("by_timestamp")
			.order("desc")
			.take(1000);

		const sessionMap = new Map<
			string,
			{
				sessionId: string;
				agent: string;
				model: string;
				totalCost: number;
				messageCount: number;
				totalTokens: number;
				firstTimestamp: string;
				lastTimestamp: string;
			}
		>();

		for (const c of completions) {
			const existing = sessionMap.get(c.sessionId);
			if (existing) {
				existing.totalCost += c.costTotal;
				existing.messageCount += 1;
				existing.totalTokens += c.totalTokens;
				if (c.timestampISO < existing.firstTimestamp) {
					existing.firstTimestamp = c.timestampISO;
				}
				if (c.timestampISO > existing.lastTimestamp) {
					existing.lastTimestamp = c.timestampISO;
				}
			} else {
				sessionMap.set(c.sessionId, {
					sessionId: c.sessionId,
					agent: c.agent,
					model: c.model,
					totalCost: c.costTotal,
					messageCount: 1,
					totalTokens: c.totalTokens,
					firstTimestamp: c.timestampISO,
					lastTimestamp: c.timestampISO,
				});
			}
		}

		return Array.from(sessionMap.values())
			.sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp))
			.slice(0, limit)
			.map((s) => ({
				...s,
				totalCost: Number(s.totalCost.toFixed(4)),
			}));
	},
});
