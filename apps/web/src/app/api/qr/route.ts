import { paintColors, renderQr } from "@kyuar/qr";
import { decodeQrQuery, type QrRequest } from "@kyuar/shared";
import { Resvg } from "@resvg/resvg-js";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { rateLimit } from "~/lib/rate-limit";

export const runtime = "nodejs";

const RASTER_WIDTH = 1024;
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function rasterize(svg: string) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: RASTER_WIDTH },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
}

async function encode(svg: string, request: QrRequest) {
  if (request.format === "svg") {
    return { body: svg, type: "image/svg+xml; charset=utf-8" };
  }

  const png = rasterize(svg);
  if (request.format === "png") return { body: new Uint8Array(png), type: "image/png" };

  const [background = "#ffffff"] = paintColors(request.style.background);
  const jpeg = await sharp(png).flatten({ background }).jpeg({ quality: 92 }).toBuffer();
  return { body: new Uint8Array(jpeg), type: "image/jpeg" };
}

export async function GET(request: Request) {
  const limit = await rateLimit("qr", request);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let options: QrRequest;
  try {
    options = decodeQrQuery(new URL(request.url).searchParams);
  } catch {
    return NextResponse.json({ error: "Invalid QR options" }, { status: 400 });
  }

  let svg: string;
  try {
    svg = renderQr({ data: options.data, style: options.style }).svg;
  } catch {
    return NextResponse.json({ error: "Too much data for one QR code" }, { status: 413 });
  }

  const { body, type } = await encode(svg, options);
  return new NextResponse(body, {
    headers: { "Content-Type": type, "Cache-Control": CACHE_CONTROL },
  });
}
