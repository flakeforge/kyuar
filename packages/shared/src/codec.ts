import { DEFAULT_STYLE, type QrStyle } from "@kyuar/qr";

import { fromBase64Url, toBase64Url } from "./base64url";
import { qrRequestSchema, type QrRequest } from "./schema";

function changedSections(style: QrStyle): Partial<QrStyle> {
  const changed: Partial<Record<keyof QrStyle, unknown>> = {};
  for (const key of Object.keys(style) as (keyof QrStyle)[]) {
    if (JSON.stringify(style[key]) !== JSON.stringify(DEFAULT_STYLE[key])) {
      changed[key] = style[key];
    }
  }
  return changed as Partial<QrStyle>;
}

/**
 * Serialises a QR request into the query string used by `/api/qr`: `d` is the
 * data, `t` the format and `s` the style sections that differ from the
 * defaults, as base64url JSON. Unchanged styles produce short, cacheable URLs.
 */
export function encodeQrQuery(request: QrRequest): string {
  const params = new URLSearchParams({ d: request.data, t: request.format });
  if (request.px !== 1024) params.set("w", String(request.px));
  const changed = changedSections(request.style);
  if (Object.keys(changed).length > 0) params.set("s", toBase64Url(JSON.stringify(changed)));
  return params.toString();
}

export function decodeQrQuery(params: URLSearchParams): QrRequest {
  const encodedStyle = params.get("s");
  let style: unknown;

  if (encodedStyle) {
    const json = fromBase64Url(encodedStyle);
    if (json === undefined) throw new Error("Style is not valid base64url");
    style = JSON.parse(json);
  }

  return qrRequestSchema.parse({
    data: params.get("d") ?? undefined,
    format: params.get("t") ?? undefined,
    px: params.get("w") ?? undefined,
    style,
  });
}

export function buildQrUrl(origin: string, request: QrRequest): string {
  return `${origin.replace(/\/$/, "")}/api/qr?${encodeQrQuery(request)}`;
}
