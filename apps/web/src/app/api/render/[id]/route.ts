import { NextResponse } from "next/server";

import { loadRender, RENDER_FORMATS, type RenderFormat } from "~/lib/render-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<RenderFormat, string> = {
  png: "image/png",
  png2048: "image/png",
  jpg: "image/jpeg",
  svg: "image/svg+xml; charset=utf-8",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requested = new URL(request.url).searchParams.get("t");
  const format: RenderFormat = RENDER_FORMATS.find((item) => item === requested) ?? "jpg";

  const image = await loadRender(id, format).catch(() => undefined);
  if (!image) return NextResponse.json({ error: "Not found or expired" }, { status: 404 });

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Cache-Control": "private, max-age=600",
      "Content-Disposition": `inline; filename="kyuar.${format === "png2048" ? "png" : format}"`,
    },
  });
}
