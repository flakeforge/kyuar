import env from "@kyuar/env";
import { DEFAULT_THEME } from "@kyuar/qr";
import { buildQrUrl, classifyContent, qrRequestSchema, type QrRequest } from "@kyuar/shared";

export const APP_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

export const BOT_USERNAME = env.NEXT_PUBLIC_BOT_USERNAME;

/**
 * Builds the default QR request for a piece of user input. Both the inline
 * handler and the private-chat handler go through this so a code generated in
 * a chat looks identical to one generated in the mini app.
 */
export function defaultRequest(input: string, overrides: Partial<QrRequest> = {}): QrRequest {
  const content = classifyContent(input);

  return qrRequestSchema.parse({
    data: content.value,
    foreground: DEFAULT_THEME.foreground,
    background: DEFAULT_THEME.background,
    format: "png",
    ...overrides,
  });
}

export function imageUrl(request: QrRequest): string {
  return buildQrUrl(APP_URL, request);
}

export function miniAppUrl(input?: string): string {
  if (!input) return APP_URL;
  return `${APP_URL}?data=${encodeURIComponent(input)}`;
}
