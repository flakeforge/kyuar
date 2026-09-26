import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

export const RASTER_WIDTH = 1024;

export function toPng(svg: string): Buffer {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: RASTER_WIDTH },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
}

export function toJpeg(png: Buffer, background: string): Promise<Buffer> {
  return sharp(png).flatten({ background }).jpeg({ quality: 92 }).toBuffer();
}
