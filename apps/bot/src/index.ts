import env from "@kyuar/env";
import { Bot } from "grammy";

import { registerCommands } from "./handlers/commands";
import { registerInline } from "./handlers/inline";
import { registerScan } from "./handlers/scan";
import { botMessages } from "./i18n";

let instance: Bot | undefined;

function create() {
  const bot = new Bot(env.BOT_TOKEN);

  registerCommands(bot);
  registerInline(bot);
  registerScan(bot);

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
const COMMAND_LOCALES = ["en", "uz", "ru"] as const;

/**
 * Publishes the command menu in every supported language. English is also the
 * default for users whose language kyuar does not cover.
 */
export async function registerCommandList(bot: Bot) {
  await Promise.all(
    COMMAND_LOCALES.map((locale) => {
      const t = botMessages(locale);
      const commands = [
        { command: "start", description: t.commands.start },
        { command: "scan", description: t.commands.scan },
        { command: "help", description: t.commands.help },
      ];
      return bot.api.setMyCommands(commands, locale === "en" ? {} : { language_code: locale });
    }),
  );
}

export function getBot(): Bot {
  instance ??= create();
  return instance;
}

export { botMessages } from "./i18n";
export { ALLOWED_UPDATES } from "./config";
export { APP_URL, BOT_USERNAME, defaultRequest, imageUrl, miniAppUrl, startAppUrl } from "./config";
