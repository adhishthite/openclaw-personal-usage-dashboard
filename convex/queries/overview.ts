import { v } from "convex/values";
import { query } from "../_generated/server";

export const getOverviewStats = query({
	args: {
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { startDate, endDate } = args;
		const q = ctx.db.query("dailyStats");
		const indexed =
			startDate && endDate
				? q.withIndex("by_date", (r) =>
						r.gte("date", startDate).lte("date", endDate),
					)
				: startDate
					? q.withIndex("by_date", (r) => r.gte("date", startDate))
					: endDate
						? q.withIndex("by_date", (r) => r.lte("date", endDate))
						: q.withIndex("by_date");
		const stats = await indexed.collect();

		const totalCost = stats.reduce((sum, s) => sum + s.totalCost, 0);
		const totalTokens = stats.reduce((sum, s) => sum + s.totalTokens, 0);
		const totalMessages = stats.reduce((sum, s) => sum + s.messageCount, 0);

		const totalCacheRead = stats.reduce((sum, s) => sum + s.totalCacheRead, 0);
		const totalCacheWrite = stats.reduce(
			(sum, s) => sum + s.totalCacheWrite,
			0,
		);
		const cacheHitRate =
			totalCacheRead + totalCacheWrite > 0
				? totalCacheRead / (totalCacheRead + totalCacheWrite)
				: 0;

		const models = new Set(stats.map((s) => s.model));
		const sessionCount = stats.reduce((sum, s) => sum + s.sessionCount, 0);

		return {
			totalCost,
			totalTokens,
			totalMessages,
			cacheHitRate,
			modelsUsed: models.size,
			sessionCount,
			totalCacheRead,
			totalCacheWrite,
		};
	},
});
