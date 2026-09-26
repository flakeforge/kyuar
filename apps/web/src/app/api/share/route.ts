import { defaultRequest, getBot, imageUrl, miniAppUrl } from "@kyuar/bot";
import env from "@kyuar/env";
import { shareRequestSchema } from "@kyuar/shared";
import { InitDataError, verifyInitData } from "@kyuar/shared/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Prepares an inline message so the mini app can call
 * `WebApp.shareMessage(id)`. Telegram requires the bot, not the client, to
 * create the message, which is why this round trip exists.
 */
export async function POST(request: Request) {
  const initData = request.headers.get("x-telegram-init-data");
  if (!initData) {
    return NextResponse.json({ error: "Missing init data" }, { status: 401 });
  }

  let userId: number;
  try {
    userId = verifyInitData(initData, env.BOT_TOKEN).user.id;
  } catch (error: unknown) {
    const message = error instanceof InitDataError ? error.message : "Invalid init data";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = shareRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid QR options" }, { status: 400 });
  }

  const { title, ...options } = parsed.data;
  const qrRequest = defaultRequest(options.data, { ...options, format: "png" });
  const url = imageUrl(qrRequest);

  try {
    const prepared = await getBot().api.savePreparedInlineMessage(
      userId,
      {
        type: "photo",
        id: `share-${Date.now().toString(36)}`,
        photo_url: url,
        thumbnail_url: url,
        photo_width: 1024,
        photo_height: 1024,
        title: title ?? "QR code",
        caption: options.data.slice(0, 900),
        reply_markup: {
          inline_keyboard: [[{ text: "Make your own", web_app: { url: miniAppUrl() } }]],
        },
      },
      { allow_user_chats: true, allow_group_chats: true, allow_channel_chats: true },
    );

    return NextResponse.json({ id: prepared.id });
  } catch (error) {
    console.error("Failed to prepare inline message", error);
    return NextResponse.json({ error: "Could not prepare the message" }, { status: 502 });
  }
}
