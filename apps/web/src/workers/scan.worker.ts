import { decodeImage, type RgbaImage } from "@kyuar/qr/scan";

export interface ScanJob {
  id: number;
  image: RgbaImage;
}

export interface ScanJobResult {
  id: number;
  text: string | undefined;
}

self.addEventListener("message", (event: MessageEvent<ScanJob>) => {
  const { id, image } = event.data;
  let text: string | undefined;
  try {
    text = decodeImage(image);
  } catch {
    text = undefined;
  }
  self.postMessage({ id, text } satisfies ScanJobResult);
});
