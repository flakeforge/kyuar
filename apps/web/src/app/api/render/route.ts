import { renderRequestSchema } from "@kyuar/shared";
import { NextResponse } from "next/server";

import { authenticate } from "~/lib/auth";
import { rateLimit } from "~/lib/rate-limit";
import { renderImages, storeRender } from "~/lib/render-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Renders a code with user images and keeps it for ten minutes, so the Mini
 * App can hand Telegram a URL for `downloadFile`.
 */
export async function POST(request: Request) {
  const auth = authenticate(request);
  if (auth instanceof NextResponse) return auth;

  const limit = await rateLimit("render", request);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = renderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid QR options" }, { status: 400 });

  let images;
  try {
    images = await renderImages(parsed.data);
  } catch {
    return NextResponse.json({ error: "Could not render this code" }, { status: 422 });
  }

  const id = await storeRender(images);
  if (!id) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  return NextResponse.json({ id });
}
