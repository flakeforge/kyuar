import { randomUUID } from "node:crypto";

import { paintColors, renderQr, toGrayImage, type GrayImage } from "@kyuar/qr";
import type { RenderRequest } from "@kyuar/shared";
import { RESP_TYPES } from "@redis/client";
import sharp from "sharp";

import { toJpeg, toPng } from "./raster";
import { getRedis } from "./redis";

const TTL_SECONDS = 600;
const LOGO_SIZE = 256;
const HALFTONE_SIZE = 256;
const MAX_INPUT_PIXELS = 4096 * 4096;
const RENDER_ID = /^[0-9a-f-]{36}$/;

export type RasterFormat = "png" | "jpg";

function fromDataUrl(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
}

async function sanitizeLogo(dataUrl: string): Promise<string> {
  const png = await sharp(fromDataUrl(dataUrl), { limitInputPixels: MAX_INPUT_PIXELS })
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: "inside" })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function grayImage(dataUrl: string): Promise<GrayImage> {
  const { data, info } = await sharp(fromDataUrl(dataUrl), { limitInputPixels: MAX_INPUT_PIXELS })
    .resize(HALFTONE_SIZE, HALFTONE_SIZE, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return toGrayImage(data, info.width, info.height);
}

/**
 * Renders a request that may carry user images. Images are decoded and
 * re-encoded by sharp before they reach the SVG, so nothing the client sent is
 * embedded as is.
 */
export async function renderImages(request: RenderRequest): Promise<{ png: Buffer; jpeg: Buffer }> {
  const [logoHref, image] = await Promise.all([
    request.logo ? sanitizeLogo(request.logo) : undefined,
    request.halftone ? grayImage(request.halftone.image) : undefined,
  ]);

  const { svg } = renderQr({
    data: request.data,
    style: request.style,
    logoHref,
    halftone:
      image && request.halftone
        ? {
            image,
            centerRatio: request.halftone.centerRatio,
            contrast: request.halftone.contrast,
          }
        : undefined,
  });

  const png = toPng(svg);
  const [background = "#ffffff"] = paintColors(request.style.background);
  return { png, jpeg: await toJpeg(png, background) };
}

/**
 * Stores a rendered code for ten minutes so Telegram can fetch it by URL for
 * downloads and shared messages. Returns `undefined` without Redis.
 */
export async function storeRender(images: {
  png: Buffer;
  jpeg: Buffer;
}): Promise<string | undefined> {
  const connection = getRedis();
  if (!connection) return undefined;

  const redis = await connection;
  const id = randomUUID();
  await redis
    .multi()
    .set(`render:${id}:png`, images.png, { expiration: { type: "EX", value: TTL_SECONDS } })
    .set(`render:${id}:jpg`, images.jpeg, { expiration: { type: "EX", value: TTL_SECONDS } })
    .exec();
  return id;
}

export async function loadRender(id: string, format: RasterFormat): Promise<Buffer | undefined> {
  if (!RENDER_ID.test(id)) return undefined;
  const connection = getRedis();
  if (!connection) return undefined;

  const redis = await connection;
  const value = await redis
    .withTypeMapping({ [RESP_TYPES.BLOB_STRING]: Buffer })
    .get(`render:${id}:${format}`);
  return value ?? undefined;
}
