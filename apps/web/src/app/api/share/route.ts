import { APP_URL, getBot, imageUrl, startAppUrl } from "@kyuar/bot";
import { qrRequestSchema, shareRequestSchema, type ShareRequest } from "@kyuar/shared";
import { NextResponse } from "next/server";

import { authenticate } from "~/lib/auth";
import { rateLimit } from "~/lib/rate-limit";
import { renderImages, storeRender } from "~/lib/render-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function photoUrl(request: ShareRequest): Promise<string | undefined> {
  if (!request.logo && !request.halftone) {
    return imageUrl(
      qrRequestSchema.parse({ data: request.data, style: request.style, format: "jpg" }),
    );
  }

  const id = await storeRender(await renderImages(request));
  return id ? `${APP_URL}/api/render/${id}` : undefined;
}

/**
 * Prepares an inline message so the Mini App can call `shareMessage(id)`.
 * Telegram requires the bot, not the client, to create the message, which is
 * why this round trip exists.
 */
export async function POST(request: Request) {
  const auth = authenticate(request);
  if (auth instanceof NextResponse) return auth;

  const limit = await rateLimit("share", request);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = shareRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid QR options" }, { status: 400 });

  const { title, data } = parsed.data;

  try {
    const url = await photoUrl(parsed.data);
    if (!url) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

    const prepared = await getBot().api.savePreparedInlineMessage(
      auth.user.id,
      {
        type: "photo",
        id: `share-${Date.now().toString(36)}`,
        photo_url: url,
        thumbnail_url: url,
        photo_width: 1024,
        photo_height: 1024,
        title: title ?? "QR code",
        caption: data.slice(0, 900),
        reply_markup: {
          inline_keyboard: [[{ text: "Make your own", url: startAppUrl() }]],
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
