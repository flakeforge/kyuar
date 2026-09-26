import { InlineKeyboard } from "grammy";
import type { Bot } from "grammy";

import { defaultRequest, imageUrl, miniAppUrl } from "../config";

const WELCOME = [
  "Send me anything and I will turn it into a QR code.",
  "",
  "A link, some text, a phone number, an email address. It all works.",
  "",
  "Open the editor to pick colors and styles, or use me inline in any chat.",
].join("\n");

const HELP = [
  "How to use kyuar:",
  "",
  "1. Send text here and get a QR code back.",
  "2. Tap Open editor for colors, styles and downloads.",
  "3. Type @{username} followed by a link in any chat to share a code without leaving the conversation.",
].join("\n");

function startKeyboard(input?: string) {
  return new InlineKeyboard().webApp("Open editor", miniAppUrl(input));
}

export function registerCommands(bot: Bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(WELCOME, { reply_markup: startKeyboard() });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP.replace("{username}", ctx.me.username));
  });

  bot.on("message:text", async (ctx) => {
    const input = ctx.message.text.trim();
    if (!input || input.startsWith("/")) return;

    const request = defaultRequest(input);

    await ctx.replyWithPhoto(imageUrl(request), {
      caption: input.length > 900 ? undefined : input,
      reply_markup: startKeyboard(input),
    });
  });
}
