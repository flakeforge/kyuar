import { renderQr } from "@kyuar/qr";
import { decodeQrQuery } from "@kyuar/shared";
import { Resvg } from "@resvg/resvg-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PNG_WIDTH = 1024;
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  let options;
  try {
    options = decodeQrQuery(searchParams);
  } catch {
    return NextResponse.json({ error: "Invalid QR options" }, { status: 400 });
  }

  const { svg } = renderQr(options);

  if (options.format === "svg") {
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": CACHE_CONTROL,
      },
    });
  }

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: PNG_WIDTH },
    background: options.background,
  })
    .render()
    .asPng();

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
