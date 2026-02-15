import { Redis } from "@upstash/redis";

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(
	key: string,
	ttlSeconds: number,
	fetcher: () => Promise<T>,
): Promise<T> {
	const cached = await redis.get<T>(key);
	if (cached !== null && cached !== undefined) {
		return cached;
	}
	const fresh = await fetcher();
	await redis.set(key, fresh, { ex: ttlSeconds });
	return fresh;
}
