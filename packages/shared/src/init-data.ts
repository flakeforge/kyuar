import { validate } from "@tma.js/init-data-node";
import * as z from "zod";

const MAX_CLOCK_SKEW_SECONDS = 60;

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
  startParam?: string;
}

export class InitDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InitDataError";
  }
}

function parseUser(raw: string | null): TelegramUser {
  if (!raw) throw new InitDataError("initData has no user");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new InitDataError("initData user payload is malformed");
  }

  const parsed = telegramUserSchema.safeParse(json);
  if (!parsed.success) throw new InitDataError("initData user payload is malformed");
  return parsed.data;
}

/**
 * Verifies Telegram Mini App `initData` against the bot token and returns the
 * signed fields. Throws `InitDataError` for a missing or bad signature, an
 * expired or future `auth_date`, or a malformed user.
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 3600,
): InitDataResult {
  if (!initData) throw new InitDataError("initData is empty");

  const params = new URLSearchParams(initData);
  for (const key of new Set(params.keys())) {
    if (params.getAll(key).length > 1) throw new InitDataError(`initData repeats "${key}"`);
  }

  try {
    validate(params, botToken, { expiresIn: maxAgeSeconds });
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "initData is invalid";
    throw new InitDataError(reason);
  }

  const authDate = new Date(Number(params.get("auth_date")) * 1000);
  if (authDate.getTime() - Date.now() > MAX_CLOCK_SKEW_SECONDS * 1000) {
    throw new InitDataError("initData auth_date is in the future");
  }

  return {
    user: parseUser(params.get("user")),
    authDate,
    queryId: params.get("query_id") ?? undefined,
    chatType: params.get("chat_type") ?? undefined,
    chatInstance: params.get("chat_instance") ?? undefined,
    startParam: params.get("start_param") ?? undefined,
  };
}
