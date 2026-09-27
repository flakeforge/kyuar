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

export const RENDER_FORMATS = ["png", "png2048", "jpg", "svg"] as const;

export type RenderFormat = (typeof RENDER_FORMATS)[number];

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
export interface RenderedImages {
  png: Buffer;
  png2048: Buffer;
  jpg: Buffer;
  svg: Buffer;
}

export async function renderImages(request: RenderRequest): Promise<RenderedImages> {
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
  return {
    png,
    png2048: toPng(svg, 2048),
    jpg: await toJpeg(png, background),
    svg: Buffer.from(svg),
  };
}

/**
 * Stores a rendered code for ten minutes so Telegram can fetch it by URL for
 * downloads and shared messages. Returns `undefined` without Redis.
 */
export async function storeRender(images: RenderedImages): Promise<string | undefined> {
  const connection = getRedis();
  if (!connection) return undefined;

  const redis = await connection;
  const id = randomUUID();
  const expiration = { expiration: { type: "EX", value: TTL_SECONDS } } as const;
  await redis
    .multi()
    .set(`render:${id}:png`, images.png, expiration)
    .set(`render:${id}:png2048`, images.png2048, expiration)
    .set(`render:${id}:jpg`, images.jpg, expiration)
    .set(`render:${id}:svg`, images.svg, expiration)
    .exec();
  return id;
}

export async function loadRender(id: string, format: RenderFormat): Promise<Buffer | undefined> {
  if (!RENDER_ID.test(id)) return undefined;
  const connection = getRedis();
  if (!connection) return undefined;

  const redis = await connection;
  const value = await redis
    .withTypeMapping({ [RESP_TYPES.BLOB_STRING]: Buffer })
    .get(`render:${id}:${format}`);
  return value ?? undefined;
}
