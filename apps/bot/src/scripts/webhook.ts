import env from "@kyuar/env";

import { APP_URL, getBot } from "../index";

type Action = "set" | "delete" | "info";

const ALLOWED_UPDATES = [
  "message",
  "inline_query",
  "chosen_inline_result",
  "callback_query",
] as const;

async function main() {
  const action = (process.argv[2] ?? "info") as Action;
  const bot = getBot();

  if (action === "set") {
    const url = `${APP_URL}/api/bot`;
    await bot.api.setWebhook(url, {
      secret_token: env.BOT_WEBHOOK_SECRET,
      allowed_updates: ALLOWED_UPDATES,
      drop_pending_updates: true,
    });
    console.info(`Webhook set to ${url}`);
    return;
  }

  if (action === "delete") {
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    console.info("Webhook deleted");
    return;
  }

  const info = await bot.api.getWebhookInfo();
  console.info(JSON.stringify(info, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
