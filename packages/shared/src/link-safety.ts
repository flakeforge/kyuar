export type LinkWarning =
  | "unsafe-scheme"
  | "insecure"
  | "shortener"
  | "lookalike"
  | "ip-address"
  | "credentials";

const SAFE_SCHEMES = new Set(["http:", "https:"]);

const SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rb.gy",
  "shorturl.at",
  "tiny.cc",
  "rebrand.ly",
  "s.id",
  "clck.ru",
  "qrco.de",
  "lnkd.in",
]);

const LATIN = /[a-z]/i;
const NON_ASCII = /[^\p{ASCII}]/u;

function hasMixedScripts(label: string) {
  return LATIN.test(label) && NON_ASCII.test(label);
}

/**
 * Checks a link before the user opens it. Returns every reason to be careful,
 * or an empty list when nothing looks wrong. It flags patterns, not verdicts:
 * a warning means "look twice", not "this is malicious".
 */
export function checkLink(href: string): LinkWarning[] {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return ["unsafe-scheme"];
  }

  if (!SAFE_SCHEMES.has(url.protocol)) return ["unsafe-scheme"];

  const warnings: LinkWarning[] = [];
  const host = url.hostname.toLowerCase();
  const labels = host.split(".");

  if (url.protocol === "http:") warnings.push("insecure");
  if (SHORTENERS.has(host.replace(/^www\./, ""))) warnings.push("shortener");
  if (labels.some((label) => label.startsWith("xn--")) || hasMixedScripts(host)) {
    warnings.push("lookalike");
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) warnings.push("ip-address");
  if (url.username || url.password) warnings.push("credentials");

  return warnings;
}
