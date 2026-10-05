import { Redis } from "@upstash/redis";

/**
 * Server-side cache for API routes.
 *
 * master_prompt.md §REDIS CACHING: React Query already caches in the browser, so
 * this layer exists for a different job — it offloads the database query itself,
 * so two clients hitting the same list in the same second cost one query rather
 * than two, and the result survives a page refresh.
 *
 * ── Degrades to "no cache" when Upstash is not configured ────────────────
 * The Redis keys are optional in .env.example, and JBC has to run before anyone
 * has signed up for a free Upstash account. Every function here treats a missing
 * or broken Redis as a cache miss rather than an error: reads go straight to the
 * database and writes quietly do nothing. The app is correct without Redis, just
 * slower — which is the right trade for a cache, and the wrong one for a
 * dependency the app cannot boot without.
 *
 * Keys are namespaced `tag:{entity}:{scope}:…` so invalidateTag() can wipe every
 * page of one client's list without scanning the whole keyspace.
 */

/** Default TTL in seconds. Callers pass their own; this is the fallback. */
const DEFAULT_TTL = 60;

const url = process.env.UPSTASH_REDIS_URL;
const token = process.env.UPSTASH_REDIS_TOKEN;

/**
 * Null when Redis is unconfigured. A single module-level flag means we construct
 * the client once and stop paying for failed HTTP calls on every request.
 */
const redis: Redis | null = url && token ? new Redis({ url, token }) : null;

/** True when a real cache is available. Useful for logging, not for branching. */
export const cacheEnabled = redis !== null;

/** Cache buckets. One per entity type so invalidation never over-reaches. */
export const tags = {
  /** A client's own price requests. */
  requests: "requests",
} as const;

/**
 * Return the cached value for `key`, or run `fetchFn`, cache it and return it.
 *
 * `fetchFn` is always scoped by the caller — the cache key is derived from the
 * signed-in user's id, so two clients can never read each other's cached rows.
 */
export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  if (!redis) return fetchFn();

  try {
    const cached = await redis.get<T>(key);
    // Upstash returns null for a miss. `undefined` is treated as a miss too so a
    // value cached as undefined never sticks around as a permanent false hit.
    if (cached !== null && cached !== undefined) return cached;

    const data = await fetchFn();
    await redis.set(key, data, { ex: ttl });
    return data;
  } catch {
    // A cache that is down, full, or misconfigured must never fail the request.
    return fetchFn();
  }
}

/**
 * Drop every cached entry for one bucket, whatever page or filter produced it.
 *
 * Called on POST/PATCH/DELETE so the next GET cannot serve a stale list.
 */
export async function invalidateTag(tag: string): Promise<void> {
  if (!redis) return;

  try {
    let cursor = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: `tag:${tag}:*`,
        count: 100,
      });

      if (keys.length > 0) await redis.del(...keys);
      cursor = Number(nextCursor);
    } while (cursor !== 0);
  } catch {
    // Same reasoning as above: a stale cache self-heals on its TTL. Failing the
    // write because the cache could not be cleared would be strictly worse.
  }
}

/**
 * Build a cache key. Always build these with this function rather than by hand,
 * so every key in the app has the same shape and invalidateTag() can find it.
 */
export function cacheKey(tag: string, scope: string, parts: Record<string, string | number> = {}) {
  const suffix = Object.entries(parts)
    .map(([k, v]) => `${k}:${v}`)
    .join(":");
  return suffix ? `tag:${tag}:${scope}:${suffix}` : `tag:${tag}:${scope}`;
}