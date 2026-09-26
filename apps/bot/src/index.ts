import env from "@kyuar/env";
import { Bot } from "grammy";

import { registerCommands } from "./handlers/commands";
import { registerInline } from "./handlers/inline";

let instance: Bot | undefined;

function create() {
  const bot = new Bot(env.BOT_TOKEN);

  registerCommands(bot);
  registerInline(bot);

  bot.catch((error) => {
    console.error("Bot error while handling update", error.ctx.update.update_id, error.error);
  });

  return bot;
}

/**
 * Returns the shared bot instance. The webhook route runs in a serverless-style
 * context that may be re-entered, so the instance is cached and initialised at
 * most once per process.
 */
export function getBot(): Bot {
  instance ??= create();
  return instance;
}

export { registerCommands, registerInline };
export { APP_URL, BOT_USERNAME, defaultRequest, imageUrl, miniAppUrl, startAppUrl } from "./config";
