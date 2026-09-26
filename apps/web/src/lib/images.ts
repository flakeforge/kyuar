import { toGrayImage, type GrayImage } from "@kyuar/qr";

const MAX_SIDE = 256;

export interface LoadedImage {
  dataUrl: string;
  gray: GrayImage;
}

/**
 * Downscales a picked file to at most 256 px, returns it as a PNG data URL and
 * as a grayscale image for halftone rendering. Rejects files that are not
 * images.
 */
export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const pixels = context.getImageData(0, 0, width, height).data;
  return { dataUrl: canvas.toDataURL("image/png"), gray: toGrayImage(pixels, width, height) };
}

export async function svgToPngBlob(svg: string, size: number): Promise<Blob> {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(image, 0, 0, size, size);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      "image/png",
    );
  });
}
