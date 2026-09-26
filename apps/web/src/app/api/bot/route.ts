import { getBot } from "@kyuar/bot";
import env from "@kyuar/env";
import { webhookCallback } from "grammy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let handler: ((request: Request) => Promise<Response>) | undefined;

function getHandler() {
  handler ??= webhookCallback(getBot(), "std/http", { secretToken: env.BOT_WEBHOOK_SECRET });
  return handler;
}

export async function POST(request: Request) {
  try {
    return await getHandler()(request);
  } catch (error) {
    console.error("Webhook handler failed", error);
    return new Response("error", { status: 500 });
  }
}
