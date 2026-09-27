import env from "@kyuar/env";
import { decodeImage } from "@kyuar/qr/scan";
import { checkLink, parseScanned } from "@kyuar/shared";
import { InlineKeyboard } from "grammy";
import type { Api, Bot, Context } from "grammy";
import type { Message } from "grammy/types";
import sharp from "sharp";

import { scannerMiniAppUrl, scannerStartAppUrl, startAppUrl } from "../config";
import { botMessages } from "../i18n";

const MAX_SIDE = 1600;
const MAX_BYTES = 10 * 1024 * 1024;
const MESSAGE_LIMIT = 4096;

type BotText = ReturnType<typeof botMessages>;

function imageFileId(message: Message | undefined): string | undefined {
  if (!message) return undefined;
  const photo = message.photo?.at(-1);
  if (photo) return photo.file_id;
  if (message.document?.mime_type?.startsWith("image/")) return message.document.file_id;
  return undefined;
}

function findImage(message: Message): string | undefined {
  return imageFileId(message) ?? imageFileId(message.reply_to_message);
}

async function readCode(api: Api, fileId: string): Promise<string | null | undefined> {
  const file = await api.getFile(fileId);
  if (!file.file_path || (file.file_size ?? 0) > MAX_BYTES) return null;
  const response = await fetch(
    `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path}`,
  );
  if (!response.ok) return null;

  const { data, info } = await sharp(Buffer.from(await response.arrayBuffer()), {
    limitInputPixels: 8000 * 8000,
  })
    .rotate()
    .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return decodeImage({ width: info.width, height: info.height, data });
}

interface ScanReply {
  text: string;
  title: string;
  keyboard: InlineKeyboard;
}

async function scan(api: Api, fileId: string, t: BotText): Promise<ScanReply> {
  let text: string | null | undefined;
  try {
    text = await readCode(api, fileId);
  } catch {
    text = null;
  }

  if (text === null)
    return { text: t.scanFailed, title: t.scanFailed, keyboard: new InlineKeyboard() };
  if (text === undefined)
    return { text: t.scanNotFound, title: t.scanNotFound, keyboard: new InlineKeyboard() };

  const content = parseScanned(text);
  const warnings = content.kind === "url" ? checkLink(content.href) : [];
  const keyboard = new InlineKeyboard();
  if (content.kind === "url" && !warnings.includes("unsafe-scheme"))
    keyboard.url(t.openLink, content.href).row();
  keyboard.url(t.styleIt, startAppUrl(text));

  const lines = [
    t.scanKinds[content.kind],
    "",
    text,
    ...warnings.map((warning) => `⚠ ${t.scanWarnings[warning]}`),
  ];
  return {
    text: lines.join("\n").slice(0, MESSAGE_LIMIT),
    title: t.scanKinds[content.kind],
    keyboard,
  };
}

async function replyWithScan(ctx: Context, message: Message, fileId: string) {
  const t = botMessages(ctx.from?.language_code);
  const result = await scan(ctx.api, fileId, t);
  await ctx.reply(result.text, {
    reply_markup: result.keyboard,
    link_preview_options: { is_disabled: true },
    reply_parameters: { message_id: message.message_id, allow_sending_without_reply: true },
  });
}

function mentions(message: Message, username: string): boolean {
  const text = message.text ?? message.caption ?? "";
  const entities = message.entities ?? message.caption_entities ?? [];
  const handle = `@${username}`.toLowerCase();
  return entities.some((entity) => {
    const value = text.slice(entity.offset, entity.offset + entity.length).toLowerCase();
    if (entity.type === "mention") return value === handle;
    if (entity.type === "bot_command") return value === "/scan" || value === `/scan${handle}`;
    return false;
  });
}

/**
 * QR reading in every place the bot can be reached: any image in a private
 * chat, images in groups only when the bot is mentioned or /scan is used, and
 * guest mode in chats where the bot is not a member. Replies are plain text so
 * scanned content cannot inject formatting.
 */
export function registerScan(bot: Bot) {
  bot.command("scan", async (ctx) => {
    const t = botMessages(ctx.from?.language_code);
    const fileId = findImage(ctx.msg);
    if (fileId) {
      await replyWithScan(ctx, ctx.msg, fileId);
      return;
    }

    if (ctx.chat.type === "private") {
      await ctx.reply(t.scanHelpPrivate, {
        reply_markup: new InlineKeyboard().webApp(t.openScanner, scannerMiniAppUrl),
      });
      return;
    }
    await ctx.reply(t.scanHelpGroup(ctx.me.username), {
      reply_markup: new InlineKeyboard().url(t.openScanner, scannerStartAppUrl),
      reply_parameters: { message_id: ctx.msg.message_id, allow_sending_without_reply: true },
    });
  });

  bot.chatType("private").on(["message:photo", "message:document"], async (ctx) => {
    const fileId = imageFileId(ctx.msg);
    if (fileId) await replyWithScan(ctx, ctx.msg, fileId);
  });

  bot.chatType(["group", "supergroup"]).on("message", async (ctx) => {
    if (!mentions(ctx.msg, ctx.me.username)) return;
    const fileId = findImage(ctx.msg);
    if (fileId) await replyWithScan(ctx, ctx.msg, fileId);
  });

  bot.on("guest_message", async (ctx) => {
    const message = ctx.update.guest_message;
    if (!message) return;
    const t = botMessages(ctx.from?.language_code);
    const fileId = findImage(message);
    const result = fileId
      ? await scan(ctx.api, fileId, t)
      : {
          text: t.scanHelpGroup(ctx.me.username),
          title: t.openScanner,
          keyboard: new InlineKeyboard(),
        };

    await ctx.answerGuestQuery({
      type: "article",
      id: `scan-${message.message_id}`,
      title: result.title,
      input_message_content: {
        message_text: result.text,
        link_preview_options: { is_disabled: true },
      },
      reply_markup: result.keyboard,
    });
  });
}
