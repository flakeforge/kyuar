import { THEMES } from "@kyuar/qr";
import { InlineKeyboard } from "grammy";
import type { Bot, InlineQueryResultBuilder } from "grammy";

import { defaultRequest, imageUrl, miniAppUrl, startAppUrl } from "../config";

const CACHE_SECONDS = 60;
const RESULT_LIMIT = 8;

/**
 * Telegram renders inline results from public image URLs and cannot display
 * SVG, so every result points at the PNG endpoint. One result per theme gives
 * the user a color picker without any round trip to our server.
 */
export function registerInline(bot: Bot) {
  bot.on("inline_query", async (ctx) => {
    const input = ctx.inlineQuery.query.trim();

    if (!input) {
      await ctx.answerInlineQuery([], {
        cache_time: CACHE_SECONDS,
        button: {
          text: "Open the kyuar editor",
          web_app: { url: miniAppUrl() },
        },
      });
      return;
    }

    const results = THEMES.slice(0, RESULT_LIMIT).map((theme) => {
      const request = defaultRequest(input, theme);
      const url = imageUrl(request);

      return {
        type: "photo" as const,
        id: `${theme.id}-${Date.now().toString(36)}`,
        photo_url: url,
        thumbnail_url: url,
        photo_width: 512,
        photo_height: 512,
        title: theme.name,
        caption: input,
        reply_markup: new InlineKeyboard().url("Edit in kyuar", startAppUrl(input)),
      };
    });

    await ctx.answerInlineQuery(results, {
      cache_time: CACHE_SECONDS,
      is_personal: false,
    });
  });
}

export type { InlineQueryResultBuilder };
