import { createHmac, timingSafeEqual } from "node:crypto";

import * as z from "zod";

const telegramUserSchema = z.object({
  id: z.number().int(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  is_premium: z.boolean().optional(),
  photo_url: z.string().optional(),
});

export type TelegramUser = z.infer<typeof telegramUserSchema>;

export interface InitDataResult {
  user: TelegramUser;
  authDate: Date;
  queryId?: string;
  chatType?: string;
  chatInstance?: string;
}

export class InitDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InitDataError";
  }
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

/**
 * Verifies Telegram Mini App `initData` against the bot token, following
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Never trust any field from the client without running this first: the raw
 * string is attacker-controlled and the signature is the only thing binding it
 * to a real Telegram user.
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 3600,
): InitDataResult {
  if (!initData) throw new InitDataError("initData is empty");

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new InitDataError("initData has no hash");

  params.delete("hash");
  params.delete("signature");

  const checkString = [...params.entries()]
    .toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = createHmac("sha256", secretKey).update(checkString).digest("hex");

  if (!safeEqual(computed, hash)) {
    throw new InitDataError("initData signature does not match");
  }

  const authDateRaw = params.get("auth_date");
  if (!authDateRaw) throw new InitDataError("initData has no auth_date");

  const authDate = new Date(Number(authDateRaw) * 1000);
  if (Number.isNaN(authDate.getTime())) throw new InitDataError("initData auth_date is invalid");

  const ageSeconds = (Date.now() - authDate.getTime()) / 1000;
  if (maxAgeSeconds > 0 && ageSeconds > maxAgeSeconds) {
    throw new InitDataError("initData has expired");
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new InitDataError("initData has no user");

  const parsed = telegramUserSchema.safeParse(JSON.parse(userRaw));
  if (!parsed.success) throw new InitDataError("initData user payload is malformed");

  return {
    user: parsed.data,
    authDate,
    queryId: params.get("query_id") ?? undefined,
    chatType: params.get("chat_type") ?? undefined,
    chatInstance: params.get("chat_instance") ?? undefined,
  };
}
