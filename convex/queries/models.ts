import { v } from "convex/values";
import { query } from "../_generated/server";

export const getCostByModel = query({
	args: {
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		let stats = await ctx.db.query("dailyStats").collect();

		if (args.startDate) {
			stats = stats.filter((s) => s.date >= args.startDate!);
		}
		if (args.endDate) {
			stats = stats.filter((s) => s.date <= args.endDate!);
		}

		const grouped = new Map<string, number>();

		for (const s of stats) {
			const existing = grouped.get(s.model) ?? 0;
			grouped.set(s.model, existing + s.totalCost);
		}

		return Array.from(grouped.entries())
			.map(([model, cost]) => ({
				name: model,
				value: Number(cost.toFixed(4)),
			}))
			.sort((a, b) => b.value - a.value);
	},
});

export const getModelComparison = query({
	args: {
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		let stats = await ctx.db.query("dailyStats").collect();

		if (args.startDate) {
			stats = stats.filter((s) => s.date >= args.startDate!);
		}
		if (args.endDate) {
			stats = stats.filter((s) => s.date <= args.endDate!);
		}

		const grouped = new Map<
			string,
			{
				totalCost: number;
				totalTokens: number;
				messageCount: number;
			}
		>();

		for (const s of stats) {
			const existing = grouped.get(s.model) ?? {
				totalCost: 0,
				totalTokens: 0,
				messageCount: 0,
			};
			existing.totalCost += s.totalCost;
			existing.totalTokens += s.totalTokens;
			existing.messageCount += s.messageCount;
			grouped.set(s.model, existing);
		}

		return Array.from(grouped.entries())
			.map(([model, data]) => ({
				model,
				"Total Cost": Number(data.totalCost.toFixed(4)),
				"Avg Cost/Message": Number(
					(data.totalCost / Math.max(data.messageCount, 1)).toFixed(4),
				),
				"Total Tokens": data.totalTokens,
				Messages: data.messageCount,
			}))
			.sort((a, b) => b["Total Cost"] - a["Total Cost"]);
	},
});

export const getCacheMetrics = query({
	args: {
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		let stats = await ctx.db.query("dailyStats").collect();

		if (args.startDate) {
			stats = stats.filter((s) => s.date >= args.startDate!);
		}
		if (args.endDate) {
			stats = stats.filter((s) => s.date <= args.endDate!);
		}

		const byModel = new Map<
			string,
			{ cacheRead: number; cacheWrite: number; total: number }
		>();

		let totalCacheRead = 0;
		let totalCacheWrite = 0;

		for (const s of stats) {
			totalCacheRead += s.totalCacheRead;
			totalCacheWrite += s.totalCacheWrite;

			const existing = byModel.get(s.model) ?? {
				cacheRead: 0,
				cacheWrite: 0,
				total: 0,
			};
			existing.cacheRead += s.totalCacheRead;
			existing.cacheWrite += s.totalCacheWrite;
			existing.total += s.totalCacheRead + s.totalCacheWrite;
			byModel.set(s.model, existing);
		}

		const totalCache = totalCacheRead + totalCacheWrite;
		const hitRate = totalCache > 0 ? (totalCacheRead / totalCache) * 100 : 0;

		const byModelArray = Array.from(byModel.entries())
			.map(([model, data]) => ({
				name: model,
				"Cache Read": data.cacheRead,
				"Cache Write": data.cacheWrite,
			}))
			.sort(
				(a, b) =>
					b["Cache Read"] +
					b["Cache Write"] -
					a["Cache Read"] -
					a["Cache Write"],
			);

		return {
			hitRate: Number(hitRate.toFixed(1)),
			totalCacheRead,
			totalCacheWrite,
			byModel: byModelArray,
		};
	},
});
