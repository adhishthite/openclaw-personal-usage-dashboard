import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const BATCH_SIZE = 50;
const JSONL_PATH = join(homedir(), ".openclaw", "usage-ledger.jsonl");

interface RawRecord {
	messageId: string;
	timestamp: string;
	agent: string;
	sessionId: string;
	model: string;
	provider: string;
	role: string;
	inputTokens: number;
	outputTokens: number;
	cacheRead: number;
	cacheWrite: number;
	totalTokens: number;
	costInput: number;
	costOutput: number;
	costCacheRead: number;
	costCacheWrite: number;
	costTotal: number;
}

async function main() {
	const deploymentUrl = process.env.CONVEX_URL;
	if (!deploymentUrl) {
		console.error("CONVEX_URL environment variable is required.");
		console.error("Set it in .env.local or pass it directly.");
		process.exit(1);
	}

	const client = new ConvexHttpClient(deploymentUrl);

	console.log("Reading JSONL file:", JSONL_PATH);
	const content = readFileSync(JSONL_PATH, "utf-8");
	const lines = content.trim().split("\n");
	console.log(`Total lines in file: ${lines.length}`);

	// Get current ingestion state
	const state = await client.query(api.completions.getIngestionState);
	const startLine = state?.lastProcessedLine ?? 0;
	console.log(`Last processed line: ${startLine}`);

	if (startLine >= lines.length) {
		console.log("No new records to ingest.");
		return;
	}

	const newLines = lines.slice(startLine);
	console.log(`New records to ingest: ${newLines.length}`);

	// Parse all new records
	const records = newLines.map((line) => {
		const raw: RawRecord = JSON.parse(line);
		return {
			messageId: raw.messageId,
			timestamp: new Date(raw.timestamp).getTime(),
			timestampISO: raw.timestamp,
			agent: raw.agent,
			sessionId: raw.sessionId,
			model: raw.model,
			provider: raw.provider,
			role: raw.role,
			inputTokens: raw.inputTokens,
			outputTokens: raw.outputTokens,
			cacheRead: raw.cacheRead,
			cacheWrite: raw.cacheWrite,
			totalTokens: raw.totalTokens,
			costInput: raw.costInput,
			costOutput: raw.costOutput,
			costCacheRead: raw.costCacheRead,
			costCacheWrite: raw.costCacheWrite,
			costTotal: raw.costTotal,
		};
	});

	// Batch insert completions
	for (let i = 0; i < records.length; i += BATCH_SIZE) {
		const batch = records.slice(i, i + BATCH_SIZE);
		await client.mutation(api.completions.batchInsert, { records: batch });
		const progress = Math.min(i + BATCH_SIZE, records.length);
		console.log(`Inserted ${progress}/${records.length} records`);
	}

	// Compute daily stats from new records
	const dailyMap = new Map<
		string,
		{
			date: string;
			agent: string;
			model: string;
			provider: string;
			totalCost: number;
			totalTokens: number;
			totalInputTokens: number;
			totalOutputTokens: number;
			totalCacheRead: number;
			totalCacheWrite: number;
			messageCount: number;
			sessions: Set<string>;
		}
	>();

	for (const r of records) {
		const date = r.timestampISO.split("T")[0];
		const key = `${date}|${r.agent}|${r.model}`;
		const existing = dailyMap.get(key);

		if (existing) {
			existing.totalCost += r.costTotal;
			existing.totalTokens += r.totalTokens;
			existing.totalInputTokens += r.inputTokens;
			existing.totalOutputTokens += r.outputTokens;
			existing.totalCacheRead += r.cacheRead;
			existing.totalCacheWrite += r.cacheWrite;
			existing.messageCount += 1;
			existing.sessions.add(r.sessionId);
		} else {
			dailyMap.set(key, {
				date,
				agent: r.agent,
				model: r.model,
				provider: r.provider,
				totalCost: r.costTotal,
				totalTokens: r.totalTokens,
				totalInputTokens: r.inputTokens,
				totalOutputTokens: r.outputTokens,
				totalCacheRead: r.cacheRead,
				totalCacheWrite: r.cacheWrite,
				messageCount: 1,
				sessions: new Set([r.sessionId]),
			});
		}
	}

	const dailyStats = Array.from(dailyMap.values()).map((s) => ({
		date: s.date,
		agent: s.agent,
		model: s.model,
		provider: s.provider,
		totalCost: s.totalCost,
		totalTokens: s.totalTokens,
		totalInputTokens: s.totalInputTokens,
		totalOutputTokens: s.totalOutputTokens,
		totalCacheRead: s.totalCacheRead,
		totalCacheWrite: s.totalCacheWrite,
		messageCount: s.messageCount,
		sessionCount: s.sessions.size,
	}));

	// Batch upsert daily stats
	for (let i = 0; i < dailyStats.length; i += BATCH_SIZE) {
		const batch = dailyStats.slice(i, i + BATCH_SIZE);
		await client.mutation(api.completions.upsertDailyStats, { stats: batch });
		console.log(
			`Upserted daily stats ${Math.min(i + BATCH_SIZE, dailyStats.length)}/${dailyStats.length}`,
		);
	}

	// Compute session aggregates from new records
	const sessionMap = new Map<
		string,
		{
			sessionId: string;
			agent: string;
			models: Set<string>;
			providers: Set<string>;
			totalCost: number;
			totalTokens: number;
			totalInputTokens: number;
			totalOutputTokens: number;
			totalCacheRead: number;
			totalCacheWrite: number;
			messageCount: number;
			firstTimestamp: string;
			lastTimestamp: string;
		}
	>();

	for (const r of records) {
		const existing = sessionMap.get(r.sessionId);
		if (existing) {
			existing.models.add(r.model);
			existing.providers.add(r.provider);
			existing.totalCost += r.costTotal;
			existing.totalTokens += r.totalTokens;
			existing.totalInputTokens += r.inputTokens;
			existing.totalOutputTokens += r.outputTokens;
			existing.totalCacheRead += r.cacheRead;
			existing.totalCacheWrite += r.cacheWrite;
			existing.messageCount += 1;
			if (r.timestampISO < existing.firstTimestamp) {
				existing.firstTimestamp = r.timestampISO;
			}
			if (r.timestampISO > existing.lastTimestamp) {
				existing.lastTimestamp = r.timestampISO;
			}
		} else {
			sessionMap.set(r.sessionId, {
				sessionId: r.sessionId,
				agent: r.agent,
				models: new Set([r.model]),
				providers: new Set([r.provider]),
				totalCost: r.costTotal,
				totalTokens: r.totalTokens,
				totalInputTokens: r.inputTokens,
				totalOutputTokens: r.outputTokens,
				totalCacheRead: r.cacheRead,
				totalCacheWrite: r.cacheWrite,
				messageCount: 1,
				firstTimestamp: r.timestampISO,
				lastTimestamp: r.timestampISO,
			});
		}
	}

	const sessionStats = Array.from(sessionMap.values()).map((s) => ({
		sessionId: s.sessionId,
		agent: s.agent,
		models: [...s.models],
		providers: [...s.providers],
		totalCost: s.totalCost,
		totalTokens: s.totalTokens,
		totalInputTokens: s.totalInputTokens,
		totalOutputTokens: s.totalOutputTokens,
		totalCacheRead: s.totalCacheRead,
		totalCacheWrite: s.totalCacheWrite,
		messageCount: s.messageCount,
		firstTimestamp: s.firstTimestamp,
		lastTimestamp: s.lastTimestamp,
	}));

	// Batch upsert sessions
	for (let i = 0; i < sessionStats.length; i += BATCH_SIZE) {
		const batch = sessionStats.slice(i, i + BATCH_SIZE);
		await client.mutation(api.completions.upsertSessions, {
			sessions: batch,
		});
		console.log(
			`Upserted sessions ${Math.min(i + BATCH_SIZE, sessionStats.length)}/${sessionStats.length}`,
		);
	}

	// Update ingestion state
	const lastRecord = records[records.length - 1];
	await client.mutation(api.completions.updateIngestionState, {
		lastProcessedLine: startLine + records.length,
		lastProcessedTimestamp: lastRecord.timestampISO,
		totalIngested: (state?.totalIngested ?? 0) + records.length,
	});

	console.log("Ingestion complete!");
	console.log(
		`Total records ingested: ${(state?.totalIngested ?? 0) + records.length}`,
	);
}

main().catch(console.error);
