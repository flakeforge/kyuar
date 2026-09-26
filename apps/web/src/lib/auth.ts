import env from "@kyuar/env";
import { InitDataError, verifyInitData, type InitDataResult } from "@kyuar/shared/server";
import { NextResponse } from "next/server";

export const INIT_DATA_HEADER = "x-telegram-init-data";

/**
 * Verifies the Telegram `initData` header. Returns the verified data, or a
 * 401 response to send back as is.
 */
export function authenticate(request: Request): InitDataResult | NextResponse {
  const initData = request.headers.get(INIT_DATA_HEADER);
  if (!initData) return NextResponse.json({ error: "Missing init data" }, { status: 401 });

  try {
    return verifyInitData(initData, env.BOT_TOKEN);
  } catch (error: unknown) {
    const message = error instanceof InitDataError ? error.message : "Invalid init data";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
