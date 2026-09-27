import env from "@kyuar/env";
import { decodeImage } from "@kyuar/qr/scan";
import { checkLink, parseScanned } from "@kyuar/shared";
import { InlineKeyboard } from "grammy";
import type { Bot, Context } from "grammy";
import sharp from "sharp";

import { startAppUrl } from "../config";
import { botMessages } from "../i18n";

const MAX_SIDE = 1600;
const MAX_BYTES = 10 * 1024 * 1024;

async function download(ctx: Context): Promise<Buffer | undefined> {
  const file = await ctx.getFile();
  if (!file.file_path || (file.file_size ?? 0) > MAX_BYTES) return undefined;
  const response = await fetch(
    `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path}`,
  );
  if (!response.ok) return undefined;
  return Buffer.from(await response.arrayBuffer());
}

async function decode(buffer: Buffer): Promise<string | undefined> {
  const { data, info } = await sharp(buffer, { limitInputPixels: 8000 * 8000 })
    .rotate()
    .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return decodeImage({ width: info.width, height: info.height, data });
}

/**
 * Reads a QR code from a photo or image file sent to the bot and replies with
 * what it contains. Replies are plain text so scanned content cannot inject
 * formatting.
 */
export function registerScan(bot: Bot) {
  bot.on(["message:photo", "message:document"], async (ctx) => {
    const t = botMessages(ctx.from?.language_code);
    const document = ctx.message.document;
    if (document && !document.mime_type?.startsWith("image/")) return;

    let text: string | undefined;
    try {
      const buffer = await download(ctx);
      if (!buffer) {
        await ctx.reply(t.scanFailed);
        return;
      }
      text = await decode(buffer);
    } catch {
      await ctx.reply(t.scanFailed);
      return;
    }

    if (!text) {
      await ctx.reply(t.scanNotFound);
      return;
    }

    const content = parseScanned(text);
    const warnings = content.kind === "url" ? checkLink(content.href) : [];
    const lines = [
      t.scanKinds[content.kind],
      "",
      text,
      ...warnings.map((warning) => `⚠ ${t.scanWarnings[warning]}`),
    ];

    const keyboard = new InlineKeyboard();
    if (content.kind === "url" && !warnings.includes("unsafe-scheme"))
      keyboard.url(t.openLink, content.href).row();
    keyboard.url(t.styleIt, startAppUrl(text));

    await ctx.reply(lines.join("\n").slice(0, 4096), {
      reply_markup: keyboard,
      link_preview_options: { is_disabled: true },
    });
  });
}
