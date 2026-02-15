"use client";

import { useQuery } from "convex/react";
import type {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server";
import { useEffect, useRef, useState } from "react";

const CACHE_TTL_MS = 3_600_000; // 1 hour
const CACHE_PREFIX = "oc-dash-cache:";

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

function safeLocalStorage() {
	try {
		return typeof window !== "undefined" ? window.localStorage : null;
	} catch {
		return null;
	}
}

function getCacheKey(queryName: string, args: Record<string, unknown>): string {
	return `${CACHE_PREFIX}${queryName}:${JSON.stringify(args)}`;
}

function readCache<T>(key: string): CacheEntry<T> | null {
	try {
		const storage = safeLocalStorage();
		if (!storage) return null;
		const raw = storage.getItem(key);
		if (!raw) return null;
		const entry = JSON.parse(raw) as CacheEntry<T>;
		if (typeof entry.timestamp !== "number" || entry.data === undefined)
			return null;
		return entry;
	} catch {
		return null;
	}
}

function writeCache<T>(key: string, data: T): void {
	try {
		const storage = safeLocalStorage();
		if (!storage) return;
		storage.setItem(
			key,
			JSON.stringify({ data, timestamp: Date.now() } satisfies CacheEntry<T>),
		);
	} catch {
		// Silently fail (private browsing, quota exceeded)
	}
}

/** Global cache-bust counter. Incrementing forces all hooks to refetch. */
let globalBustCounter = 0;
const listeners = new Set<() => void>();

export function bustAllCaches(): void {
	try {
		const storage = safeLocalStorage();
		if (!storage) return;
		const keysToRemove: string[] = [];
		for (let i = 0; i < storage.length; i++) {
			const key = storage.key(i);
			if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
		}
		for (const key of keysToRemove) storage.removeItem(key);
	} catch {
		// ignore
	}
	globalBustCounter++;
	for (const listener of listeners) listener();
}

/** Returns the timestamp of the oldest cache entry currently used, or null. */
export function getOldestCacheTimestamp(): number | null {
	try {
		const storage = safeLocalStorage();
		if (!storage) return null;
		let oldest: number | null = null;
		for (let i = 0; i < storage.length; i++) {
			const key = storage.key(i);
			if (!key?.startsWith(CACHE_PREFIX)) continue;
			const entry = readCache(key);
			if (entry && (oldest === null || entry.timestamp < oldest)) {
				oldest = entry.timestamp;
			}
		}
		return oldest;
	} catch {
		return null;
	}
}

/**
 * Drop-in cached wrapper around Convex useQuery.
 * Always subscribes to Convex, but returns cached data instantly if fresh.
 * Updates cache when Convex returns new data.
 */
export function useCachedQuery<Query extends FunctionReference<"query">>(
	query: Query,
	args: FunctionArgs<Query> | "skip",
): FunctionReturnType<Query> | undefined {
	// Subscribe to bust events
	const [, setBustCount] = useState(globalBustCounter);
	useEffect(() => {
		const handler = () => setBustCount(globalBustCounter);
		listeners.add(handler);
		return () => {
			listeners.delete(handler);
		};
	}, []);

	// Build a stable cache key from the query function name
	const queryName = useRef(
		(() => {
			try {
				if (typeof query === "string") return query;
				if (typeof query === "object" && query !== null) {
					// Convex function references have an internal structure
					const q = query as Record<string, unknown>;
					if (typeof q._name === "string") return q._name;
					// Try functionName or other known fields
					if (typeof q.functionName === "string") return q.functionName;
				}
				// Fallback: use a hash of the stringified ref
				return `q_${String(query)}`;
			} catch {
				return `q_fallback_${Math.random().toString(36).slice(2)}`;
			}
		})(),
	).current;

	const argsObj = args === "skip" ? null : (args as Record<string, unknown>);
	const cacheKey = argsObj !== null ? getCacheKey(queryName, argsObj) : null;

	// Read cache
	const cached = cacheKey
		? readCache<FunctionReturnType<Query>>(cacheKey)
		: null;
	const isFresh =
		cached !== null && Date.now() - cached.timestamp < CACHE_TTL_MS;

	// Always subscribe to Convex (no skip trick — it's unreliable)
	const convexResult = useQuery(query, args);

	// Persist fresh Convex results
	const prevResultRef = useRef(convexResult);
	useEffect(() => {
		if (
			convexResult !== undefined &&
			convexResult !== prevResultRef.current &&
			cacheKey
		) {
			writeCache(cacheKey, convexResult);
			prevResultRef.current = convexResult;
		}
	}, [convexResult, cacheKey]);

	if (args === "skip") return undefined;

	// Return cached data while Convex loads, or Convex data if available
	if (convexResult !== undefined) return convexResult;
	if (isFresh) return cached!.data;
	return undefined;
}
