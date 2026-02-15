import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
		let skipped = 0;
		for (const record of args.records) {
			const existing = await ctx.db
				.query("completions")
				.withIndex("by_messageId", (q) => q.eq("messageId", record.messageId))
				.first();
			if (existing) {
				skipped++;
				continue;
			}
			await ctx.db.insert("completions", record);
		}
		return { inserted: args.records.length - skipped, skipped };
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
					sessionCount: existing.sessionCount + stat.sessionCount,
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

export const getIngestionState = query({
	handler: async (ctx) => {
		return await ctx.db.query("ingestionState").first();
	},
});

export const clearBatch = mutation({
	args: {
		table: v.union(
			v.literal("completions"),
			v.literal("dailyStats"),
			v.literal("ingestionState"),
		),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const batchSize = args.limit ?? 500;
		const rows = await ctx.db.query(args.table).take(batchSize);
		for (const row of rows) {
			await ctx.db.delete(row._id);
		}
		return { deleted: rows.length, done: rows.length < batchSize };
	},
});
