"use client";

import { useQuery } from "convex/react";
import { type FunctionReference, type FunctionArgs, type FunctionReturnType } from "convex/server";
import { useCallback, useEffect, useRef, useState } from "react";

const CACHE_TTL_MS = 3_600_000; // 1 hour
const CACHE_PREFIX = "oc-dash-cache:";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCacheKey(queryName: string, args: Record<string, unknown>): string {
  return `${CACHE_PREFIX}${queryName}:${JSON.stringify(args)}`;
}

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (typeof entry.timestamp !== "number" || entry.data === undefined) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() } satisfies CacheEntry<T>));
  } catch {
    // Silently fail (private browsing, quota exceeded)
  }
}

/** Global cache-bust counter. Incrementing forces all hooks to refetch. */
let globalBustCounter = 0;
const listeners = new Set<() => void>();

export function bustAllCaches(): void {
  // Clear all our keys from localStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
    }
    for (const key of keysToRemove) localStorage.removeItem(key);
  } catch {
    // ignore
  }
  globalBustCounter++;
  for (const listener of listeners) listener();
}

/** Returns the timestamp of the oldest cache entry currently used, or null. */
export function getOldestCacheTimestamp(): number | null {
  try {
    let oldest: number | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
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
 * Serves from localStorage when cache is fresh (<1h), skips the Convex subscription.
 */
export function useCachedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query> | "skip",
): FunctionReturnType<Query> | undefined {
  // Subscribe to bust events
  const [bustCount, setBustCount] = useState(globalBustCounter);
  useEffect(() => {
    const handler = () => setBustCount(globalBustCounter);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const queryName = typeof query === "object" && query !== null
    ? ((query as Record<string, unknown>)._name as string | undefined) ?? JSON.stringify(query)
    : String(query);
  const argsObj = args === "skip" ? null : (args as Record<string, unknown>);
  const cacheKey = argsObj !== null ? getCacheKey(queryName, argsObj) : null;

  const cached = cacheKey ? readCache<FunctionReturnType<Query>>(cacheKey) : null;
  const isFresh = cached !== null && Date.now() - cached.timestamp < CACHE_TTL_MS;

  // Skip Convex subscription when cache is fresh
  const convexResult = useQuery(query, isFresh ? "skip" : args);

  // Persist fresh Convex results
  const prevResultRef = useRef(convexResult);
  useEffect(() => {
    if (convexResult !== undefined && convexResult !== prevResultRef.current && cacheKey) {
      writeCache(cacheKey, convexResult);
      prevResultRef.current = convexResult;
    }
  }, [convexResult, cacheKey]);

  if (args === "skip") return undefined;
  if (isFresh) return cached!.data;
  return convexResult;
}
