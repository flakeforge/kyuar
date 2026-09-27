import { InlineKeyboard } from "grammy";
import type { Bot } from "grammy";
import type { Chat } from "grammy/types";

import { defaultRequest, imageUrl, miniAppUrl, startAppUrl } from "../config";
import { botMessages } from "../i18n";

/**
 * Telegram rejects `web_app` buttons outside private chats, so groups and
 * channels get a `startapp` link that opens the same Mini App.
 */
export function startKeyboard(chatType: Chat["type"], label: string, input?: string) {
  if (chatType === "private") return new InlineKeyboard().webApp(label, miniAppUrl(input));
  return new InlineKeyboard().url(label, startAppUrl(input));
}

export function registerCommands(bot: Bot) {
  bot.command("start", async (ctx) => {
    const t = botMessages(ctx.from?.language_code);
    await ctx.reply(t.welcome, { reply_markup: startKeyboard(ctx.chat.type, t.openEditor) });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(botMessages(ctx.from?.language_code).help(ctx.me.username));
  });

  bot.chatType("private").on("message:text", async (ctx, next) => {
    const input = ctx.message.text.trim();
    if (!input || input.startsWith("/")) {
      await next();
      return;
    }

    const t = botMessages(ctx.from?.language_code);
    const request = defaultRequest(input);
    if (!request) {
      await ctx.reply(t.tooLong);
      return;
    }

    await ctx.replyWithPhoto(imageUrl(request), {
      caption: input.length > 900 ? undefined : input,
      reply_markup: startKeyboard(ctx.chat.type, t.openEditor, input),
    });
  });
}
