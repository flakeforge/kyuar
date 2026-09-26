export const MAX_START_PARAM_LENGTH = 512;

const START_PARAM = /^[A-Za-z0-9_-]+$/;

/**
 * Encodes text as a Telegram `startapp` parameter: base64url over UTF-8.
 * Returns `undefined` when the result would exceed Telegram's 512 character
 * limit, so callers fall back to opening the editor empty.
 */
export function encodeStartParam(text: string): string | undefined {
  if (!text) return undefined;

  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCodePoint(byte);

  const encoded = btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return encoded.length <= MAX_START_PARAM_LENGTH ? encoded : undefined;
}

export function decodeStartParam(param: string | null | undefined): string | undefined {
  if (!param || param.length > MAX_START_PARAM_LENGTH || !START_PARAM.test(param)) {
    return undefined;
  }

  try {
    const binary = atob(param.replaceAll("-", "+").replaceAll("_", "/"));
    const bytes = Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return undefined;
  }
}
