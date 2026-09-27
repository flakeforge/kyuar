import { decodeQR } from "qr/decode.js";

export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

function downscale(image: RgbaImage, factor: number): RgbaImage {
  const width = Math.max(1, Math.floor(image.width / factor));
  const height = Math.max(1, Math.floor(image.height / factor));
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = (Math.floor(y * factor) * image.width + Math.floor(x * factor)) * 4;
      data.set(image.data.subarray(source, source + 4), (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

/**
 * Reads the first QR code in an RGBA image. Large photos are also tried at
 * smaller sizes, which helps the decoder with noisy camera shots. Returns
 * `undefined` when no code is found.
 */
export function decodeImage(image: RgbaImage): string | undefined {
  const attempts = [image];
  const longest = Math.max(image.width, image.height);
  for (const target of [1200, 800, 500]) {
    if (longest > target * 1.2) attempts.push(downscale(image, longest / target));
  }

  for (const attempt of attempts) {
    try {
      return decodeQR(attempt);
    } catch {
      continue;
    }
  }
  return undefined;
}
