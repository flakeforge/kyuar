import { qrRequestSchema, type QrRequest } from "./schema";

const SHORT_KEYS = {
  data: "d",
  ecc: "e",
  moduleStyle: "m",
  finderStyle: "f",
  foreground: "fg",
  background: "bg",
  margin: "b",
  moduleSize: "s",
  cornerRadius: "r",
  logoRatio: "l",
  format: "t",
} as const satisfies Record<keyof QrRequest, string>;

/**
 * Serialises QR options into the compact query string used by `/api/qr`.
 * Colors drop their leading `#` so the URL stays readable when Telegram
 * renders it as a link preview.
 */
export function encodeQrQuery(request: QrRequest): string {
  const params = new URLSearchParams();

  for (const [key, short] of Object.entries(SHORT_KEYS) as [keyof QrRequest, string][]) {
    const value = request[key];
    if (value === undefined) continue;
    params.set(short, typeof value === "string" ? value.replace(/^#/, "") : String(value));
  }

  return params.toString();
}

export function decodeQrQuery(params: URLSearchParams): QrRequest {
  const raw: Record<string, string> = {};

  for (const [key, short] of Object.entries(SHORT_KEYS) as [keyof QrRequest, string][]) {
    const value = params.get(short) ?? params.get(key);
    if (value === null) continue;
    raw[key] = key === "foreground" || key === "background" ? `#${value.replace(/^#/, "")}` : value;
  }

  return qrRequestSchema.parse(raw);
}

export function buildQrUrl(origin: string, request: QrRequest): string {
  return `${origin.replace(/\/$/, "")}/api/qr?${encodeQrQuery(request)}`;
}
