import { v } from "convex/values";
import { query } from "../_generated/server";

export const getTokenTimeseries = query({
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

		const grouped = new Map<
			string,
			{ input: number; output: number; cacheRead: number; cacheWrite: number }
		>();

		for (const s of stats) {
			const existing = grouped.get(s.date) ?? {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
			};
			existing.input += s.totalInputTokens;
			existing.output += s.totalOutputTokens;
			existing.cacheRead += s.totalCacheRead;
			existing.cacheWrite += s.totalCacheWrite;
			grouped.set(s.date, existing);
		}

		return Array.from(grouped.entries())
			.map(([date, data]) => ({
				date,
				"Input Tokens": data.input,
				"Output Tokens": data.output,
				"Cache Read": data.cacheRead,
				"Cache Write": data.cacheWrite,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	},
});

export const getDailyCosts = query({
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

		const grouped = new Map<string, number>();

		for (const s of stats) {
			const existing = grouped.get(s.date) ?? 0;
			grouped.set(s.date, existing + s.totalCost);
		}

		return Array.from(grouped.entries())
			.map(([date, cost]) => ({
				date,
				Cost: Number(cost.toFixed(4)),
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	},
});

export const getMessagesByDay = query({
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

		const grouped = new Map<string, number>();

		for (const s of stats) {
			const existing = grouped.get(s.date) ?? 0;
			grouped.set(s.date, existing + s.messageCount);
		}

		return Array.from(grouped.entries())
			.map(([date, messages]) => ({
				date,
				Messages: messages,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	},
});

export const getDailyActivity = query({
	handler: async (ctx) => {
		const stats = await ctx.db
			.query("dailyStats")
			.withIndex("by_date")
			.collect();

		const grouped = new Map<string, number>();

		for (const s of stats) {
			const existing = grouped.get(s.date) ?? 0;
			grouped.set(s.date, existing + s.messageCount);
		}

		return Array.from(grouped.entries())
			.map(([date, count]) => ({
				key: date,
				tooltip: `${date}: ${count} messages`,
				color:
					count > 200
						? "emerald"
						: count > 100
							? "amber"
							: count > 50
								? "sky"
								: "zinc",
			}))
			.sort((a, b) => a.key.localeCompare(b.key));
	},
});
