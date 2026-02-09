import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	completions: defineTable({
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
	})
		.index("by_timestamp", ["timestamp"])
		.index("by_model", ["model", "timestamp"])
		.index("by_agent", ["agent", "timestamp"])
		.index("by_session", ["sessionId", "timestamp"])
		.index("by_messageId", ["messageId"]),

	dailyStats: defineTable({
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
	})
		.index("by_date", ["date"])
		.index("by_date_model", ["date", "model"]),

	ingestionState: defineTable({
		lastProcessedLine: v.number(),
		lastProcessedTimestamp: v.string(),
		totalIngested: v.number(),
	}),
});
