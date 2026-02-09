import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const batchInsert = mutation({
	args: {
		records: v.array(
			v.object({
				messageId: v.string(),
				timestamp: v.number(),
				timestampISO: v.string(),
				agent: v.string(),
				sessionId: v.string(),
				model: v.string(),
				provider: v.string(),
				role: v.string(),
				inputTokens: v.number(),
				outputTokens: v.number(),
				cacheRead: v.number(),
				cacheWrite: v.number(),
				totalTokens: v.number(),
				costInput: v.float64(),
				costOutput: v.float64(),
				costCacheRead: v.float64(),
				costCacheWrite: v.float64(),
				costTotal: v.float64(),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const record of args.records) {
			await ctx.db.insert("completions", record);
		}
	},
});

export const upsertDailyStats = mutation({
	args: {
		stats: v.array(
			v.object({
				date: v.string(),
				agent: v.string(),
				model: v.string(),
				provider: v.string(),
				totalCost: v.float64(),
				totalTokens: v.number(),
				totalInputTokens: v.number(),
				totalOutputTokens: v.number(),
				totalCacheRead: v.number(),
				totalCacheWrite: v.number(),
				messageCount: v.number(),
				sessionCount: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const stat of args.stats) {
			const existing = await ctx.db
				.query("dailyStats")
				.withIndex("by_date", (q) => q.eq("date", stat.date))
				.filter((q) =>
					q.and(
						q.eq(q.field("model"), stat.model),
						q.eq(q.field("agent"), stat.agent),
					),
				)
				.first();

			if (existing) {
				await ctx.db.patch(existing._id, {
					totalCost: existing.totalCost + stat.totalCost,
					totalTokens: existing.totalTokens + stat.totalTokens,
					totalInputTokens: existing.totalInputTokens + stat.totalInputTokens,
					totalOutputTokens:
						existing.totalOutputTokens + stat.totalOutputTokens,
					totalCacheRead: existing.totalCacheRead + stat.totalCacheRead,
					totalCacheWrite: existing.totalCacheWrite + stat.totalCacheWrite,
					messageCount: existing.messageCount + stat.messageCount,
					sessionCount: stat.sessionCount,
				});
			} else {
				await ctx.db.insert("dailyStats", stat);
			}
		}
	},
});

export const updateIngestionState = mutation({
	args: {
		lastProcessedLine: v.number(),
		lastProcessedTimestamp: v.string(),
		totalIngested: v.number(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.query("ingestionState").first();
		if (existing) {
			await ctx.db.patch(existing._id, args);
		} else {
			await ctx.db.insert("ingestionState", args);
		}
	},
});

export const getIngestionState = mutation({
	handler: async (ctx) => {
		return await ctx.db.query("ingestionState").first();
	},
});

export const clearAll = mutation({
	handler: async (ctx) => {
		const completions = await ctx.db.query("completions").collect();
		for (const c of completions) {
			await ctx.db.delete(c._id);
		}
		const stats = await ctx.db.query("dailyStats").collect();
		for (const s of stats) {
			await ctx.db.delete(s._id);
		}
		const states = await ctx.db.query("ingestionState").collect();
		for (const s of states) {
			await ctx.db.delete(s._id);
		}
	},
});
