import env from "@kyuar/env";
import { createClient } from "@redis/client";

const WINDOW_SECONDS = 60;

function connect(url: string) {
  return createClient({ url })
    .on("error", (error: unknown) => console.error("Redis error", error))
    .connect();
}

let client: ReturnType<typeof connect> | undefined;

function getClient(url: string) {
  const pending =
    client ??
    connect(url).catch((error: unknown) => {
      client = undefined;
      throw error;
    });
  client = pending;
  return pending;
}

export function clientIp(request: Request): string {
  const raw = request.headers.get(env.CLIENT_IP_HEADER) ?? "";
  return raw.split(",")[0]?.trim() || "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

/**
 * Fixed-window limit per client per minute, stored in Redis. Without
 * `REDIS_URL`, or when Redis is down, every request is allowed: an outage of
 * the limiter must not take the QR endpoint down with it.
 */
export async function rateLimit(scope: string, request: Request): Promise<RateLimitResult> {
  if (!env.REDIS_URL) return { allowed: true, retryAfter: 0 };

  const window = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `rate:${scope}:${clientIp(request)}:${window}`;

  try {
    const redis = await getClient(env.REDIS_URL);
    const [count] = await redis.multi().incr(key).expire(key, WINDOW_SECONDS, "NX").exec();
    const allowed = Number(count) <= env.RATE_LIMIT_PER_MINUTE;
    const retryAfter = WINDOW_SECONDS - (Math.floor(Date.now() / 1000) % WINDOW_SECONDS);
    return { allowed, retryAfter: allowed ? 0 : retryAfter };
  } catch (error: unknown) {
    console.error("Rate limit check failed, allowing the request", error);
    return { allowed: true, retryAfter: 0 };
  }
}
