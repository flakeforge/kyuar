import { renderQr, type RenderInput } from "@kyuar/qr";

export interface QrJob {
  id: number;
  input: RenderInput;
}

export type QrJobResult =
  | { id: number; ok: true; src: string; size: number; warnings: string[] }
  | { id: number; ok: false };

self.addEventListener("message", (event: MessageEvent<QrJob>) => {
  const { id, input } = event.data;
  try {
    const rendered = renderQr(input);
    const result: QrJobResult = {
      id,
      ok: true,
      src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`,
      size: rendered.size,
      warnings: rendered.warnings,
    };
    self.postMessage(result);
  } catch {
    self.postMessage({ id, ok: false } satisfies QrJobResult);
  }
});
