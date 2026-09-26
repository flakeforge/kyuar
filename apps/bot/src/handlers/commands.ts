import { InlineKeyboard } from "grammy";
import type { Bot } from "grammy";

import { defaultRequest, imageUrl, miniAppUrl } from "../config";
import { botMessages } from "../i18n";

function startKeyboard(label: string, input?: string) {
  return new InlineKeyboard().webApp(label, miniAppUrl(input));
}

export function registerCommands(bot: Bot) {
  bot.command("start", async (ctx) => {
    const t = botMessages(ctx.from?.language_code);
    await ctx.reply(t.welcome, { reply_markup: startKeyboard(t.openEditor) });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(botMessages(ctx.from?.language_code).help(ctx.me.username));
  });

  bot.on("message:text", async (ctx) => {
    const input = ctx.message.text.trim();
    if (!input || input.startsWith("/")) return;

    const t = botMessages(ctx.from?.language_code);
    const request = defaultRequest(input);
    if (!request) {
      await ctx.reply(t.tooLong);
      return;
    }

    await ctx.replyWithPhoto(imageUrl(request), {
      caption: input.length > 900 ? undefined : input,
      reply_markup: startKeyboard(t.openEditor, input),
    });
  });
}
