import { v } from "convex/values";
import { query } from "../_generated/server";

export const getRecentSessions = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;

		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_lastTimestamp")
			.order("desc")
			.take(limit);

		return sessions.map((s) => ({
			sessionId: s.sessionId,
			agent: s.agent,
			model: s.models.join(", "),
			totalCost: Number(s.totalCost.toFixed(4)),
			messageCount: s.messageCount,
			totalTokens: s.totalTokens,
			firstTimestamp: s.firstTimestamp,
			lastTimestamp: s.lastTimestamp,
		}));
	},
});

export const getSessionCount = query({
	args: {
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { startDate, endDate } = args;

		// Use lastTimestamp index for range filtering
		// Sessions are included if their lastTimestamp falls within the range
		const q = ctx.db.query("sessions");
		const indexed =
			startDate && endDate
				? q.withIndex("by_lastTimestamp", (r) =>
						r
							.gte("lastTimestamp", startDate)
							.lte("lastTimestamp", `${endDate}T23:59:59.999Z`),
					)
				: startDate
					? q.withIndex("by_lastTimestamp", (r) =>
							r.gte("lastTimestamp", startDate),
						)
					: endDate
						? q.withIndex("by_lastTimestamp", (r) =>
								r.lte("lastTimestamp", `${endDate}T23:59:59.999Z`),
							)
						: q.withIndex("by_lastTimestamp");

		const sessions = await indexed.collect();
		return sessions.length;
	},
});
