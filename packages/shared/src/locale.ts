export const LOCALES = ["en", "uz", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

function match(code: string): Locale | undefined {
  const base = code.trim().toLowerCase().split(/[-_]/)[0];
  return LOCALES.find((locale) => locale === base);
}

/**
 * Picks a supported locale from a Telegram `language_code` or an
 * `Accept-Language` header. Falls back to English.
 */
export function resolveLocale(input: string | null | undefined): Locale {
  if (!input) return DEFAULT_LOCALE;
  for (const part of input.split(",")) {
    const found = match(part.split(";")[0] ?? "");
    if (found) return found;
  }
  return DEFAULT_LOCALE;
}
