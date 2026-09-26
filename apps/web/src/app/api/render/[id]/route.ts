import { NextResponse } from "next/server";

import { loadRender } from "~/lib/render-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("t") === "png" ? "png" : "jpg";

  const image = await loadRender(id, format).catch(() => undefined);
  if (!image) return NextResponse.json({ error: "Not found or expired" }, { status: 404 });

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": format === "png" ? "image/png" : "image/jpeg",
      "Cache-Control": "private, max-age=600",
      "Content-Disposition": `inline; filename="kyuar.${format}"`,
    },
  });
}
