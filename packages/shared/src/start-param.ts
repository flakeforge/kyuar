import { fromBase64Url, toBase64Url } from "./base64url";

export const MAX_START_PARAM_LENGTH = 512;

/**
 * Encodes text as a Telegram `startapp` parameter: base64url over UTF-8.
 * Returns `undefined` when the result would exceed Telegram's 512 character
 * limit, so callers fall back to opening the editor empty.
 */
export function encodeStartParam(text: string): string | undefined {
  if (!text) return undefined;
  const encoded = toBase64Url(text);
  return encoded.length <= MAX_START_PARAM_LENGTH ? encoded : undefined;
}

export function decodeStartParam(param: string | null | undefined): string | undefined {
  if (!param || param.length > MAX_START_PARAM_LENGTH) return undefined;
  return fromBase64Url(param);
}
