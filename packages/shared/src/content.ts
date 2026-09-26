const PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:", "sms:", "geo:", "matmsg:"]);

export type QrContentKind = "url" | "email" | "phone" | "wifi" | "text";

export interface QrContent {
  kind: QrContentKind;
  label: string;
  value: string;
}

function looksLikeDomain(value: string) {
  return /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value) && !value.includes(" ");
}

/**
 * Classifies raw user input so the UI can show a meaningful label and the bot
 * can pick a caption. Bare domains are promoted to https, which is what people
 * expect when they type "google.com".
 */
export function classifyContent(input: string): QrContent {
  const value = input.trim();

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { kind: "email", label: value, value: `mailto:${value}` };
  }

  if (/^\+\d[\d\s()-]{5,18}\d$/.test(value) && value.replaceAll(/\D/g, "").length <= 15) {
    return { kind: "phone", label: value, value: `tel:${value.replaceAll(/[\s()-]/g, "")}` };
  }

  if (value.startsWith("WIFI:")) {
    return { kind: "wifi", label: "Wi-Fi network", value };
  }

  if (PROTOCOL_PATTERN.test(value)) {
    try {
      const url = new URL(value);
      if (SAFE_PROTOCOLS.has(url.protocol)) {
        return { kind: "url", label: url.host || value, value };
      }
    } catch {
      return { kind: "text", label: value, value };
    }
    return { kind: "text", label: value, value };
  }

  if (looksLikeDomain(value)) {
    return { kind: "url", label: value, value: `https://${value}` };
  }

  return { kind: "text", label: value, value };
}
