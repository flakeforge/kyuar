import env from "@kyuar/env";
import { createClient } from "@redis/client";

function connect(url: string) {
  return createClient({ url })
    .on("error", (error: unknown) => console.error("Redis error", error))
    .connect();
}

let client: ReturnType<typeof connect> | undefined;

/**
 * Shared Redis connection, or `undefined` when `REDIS_URL` is not set. A failed
 * connection is dropped so the next call retries.
 */
export function getRedis() {
  if (!env.REDIS_URL) return undefined;
  const pending =
    client ??
    connect(env.REDIS_URL).catch((error: unknown) => {
      client = undefined;
      throw error;
    });
  client = pending;
  return pending;
}
