import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

export function toPng(svg: string, width = 1024): Buffer {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
}

export function toJpeg(png: Buffer, background: string): Promise<Buffer> {
  return sharp(png).flatten({ background }).jpeg({ quality: 92 }).toBuffer();
}
