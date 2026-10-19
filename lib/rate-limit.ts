import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-route rate limiting backed by Upstash, keyed by whatever the caller
 * passes — a session user id on write routes, an IP on auth routes.
 *
 *   import { rateLimit } from "@/lib/rate-limit";
 *
 *   const { success, reset } = await rateLimit.limit(`requests:${userId}`, {
 *     tokens: 10,
 *     window: "10 m",
 *   });
 *   if (!success) {
 *     return NextResponse.json(
 *       { error: "Too many requests. Please slow down and try again." },
 *       { status: 429, headers: { "Retry-After": String(secondsUntil(reset)) } },
 *     );
 *   }
 *
 * ── Degrades to "no limit" when Upstash is not configured ──────────────────
 * Same contract as lib/cache.ts: a missing or broken Redis is treated as a
 * pass, never as an error. The app must not depend on a throttle to boot or to
 * serve a legitimate request — a stale cache self-heals on TTL, and a rate
 * limit that throws would turn a Redis outage into a full outage. The
 * protection is real when Redis is up; when it is not, availability wins.
 *
 * Uses UPSTASH_REDIS_URL / UPSTASH_REDIS_TOKEN — the names master_prompt.md
 * §REDIS CACHING locks in for this project (not the UPSTASH_REDIS_REST_*
 * names Redis.fromEnv() looks for).
 */

const url = process.env.UPSTASH_REDIS_URL;
const token = process.env.UPSTASH_REDIS_TOKEN;

/**
 * Constructed once, lazily. Stays null when the env vars are missing, so an
 * app without Upstash never makes a failing HTTP call just to learn that.
 */
const redis: Redis | null = url && token ? new Redis({ url, token }) : null;

/** Result of a pass — either a real one from Upstash, or a fail-open stand-in. */
export interface RateLimitResult {
  success: boolean;
  /** Unix seconds when the window resets (0 when failing open). */
  reset: number;
}

export type RateWindow =
  | `${number} ms`
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

interface RateLimitOptions {
  tokens: number;
  window: RateWindow;
  /** Optional analytics flag — Upstash dashboard shows the events. Default: true. */
  analytics?: boolean;
  /** Optional prefix to namespace this limiter in Redis. Default: 'ratelimit'. */
  prefix?: string;
}

/** Limiters are cached per (prefix, tokens, window) — one Redis client, many routes. */
const limiters = new Map<string, Ratelimit>();

function getLimiter({ tokens, window, analytics = true, prefix = "ratelimit" }: RateLimitOptions) {
  const key = `${prefix}:${tokens}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(tokens, window),
      analytics,
      prefix,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

export const rateLimit = {
  /**
   * Check + consume a token. `identifier` uniquely names the actor —
   * `requests:{userId}`, `admin-pricing:{userId}`, and so on.
   *
   * Fails open: returns `success: true` when Redis is unconfigured or the
   * call throws, exactly like lib/cache.ts treats a cache outage.
   */
  async limit(identifier: string, options: RateLimitOptions): Promise<RateLimitResult> {
    if (!redis) return { success: true, reset: 0 };

    try {
      const result = await getLimiter(options).limit(identifier);
      return { success: result.success, reset: result.reset };
    } catch {
      return { success: true, reset: 0 };
    }
  },
};
