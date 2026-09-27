export type ScannedContent =
  | { kind: "url"; raw: string; href: string; host: string }
  | {
      kind: "wifi";
      raw: string;
      ssid: string;
      password?: string;
      security: string;
      hidden: boolean;
    }
  | {
      kind: "contact";
      raw: string;
      name: string;
      phones: string[];
      emails: string[];
      organization?: string;
      url?: string;
    }
  | { kind: "email"; raw: string; address: string; subject?: string; body?: string }
  | { kind: "phone"; raw: string; number: string }
  | { kind: "sms"; raw: string; number: string; body?: string }
  | { kind: "geo"; raw: string; latitude: number; longitude: number }
  | { kind: "text"; raw: string; text: string };

function unescape(value: string) {
  return value.replaceAll(/\\([\\;,:"])/g, "$1");
}

function splitFields(body: string): [string, string][] {
  const fields: [string, string][] = [];
  let current = "";
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === "\\" && index + 1 < body.length) {
      current += char + body[index + 1];
      index += 1;
    } else if (char === ";") {
      const at = current.indexOf(":");
      if (at > 0)
        fields.push([current.slice(0, at).toUpperCase(), unescape(current.slice(at + 1))]);
      current = "";
    } else {
      current += char;
    }
  }
  const at = current.indexOf(":");
  if (at > 0) fields.push([current.slice(0, at).toUpperCase(), unescape(current.slice(at + 1))]);
  return fields;
}

function parseWifi(raw: string): ScannedContent {
  const fields = new Map(splitFields(raw.slice("WIFI:".length)));
  return {
    kind: "wifi",
    raw,
    ssid: fields.get("S") ?? "",
    password: fields.get("P") || undefined,
    security: fields.get("T") || "nopass",
    hidden: fields.get("H")?.toLowerCase() === "true",
  };
}

function parseMecard(raw: string): ScannedContent {
  const fields = splitFields(raw.slice("MECARD:".length));
  const values = (key: string) => fields.filter(([name]) => name === key).map(([, value]) => value);
  return {
    kind: "contact",
    raw,
    name: (values("N")[0] ?? "").split(",").toReversed().join(" ").trim(),
    phones: values("TEL"),
    emails: values("EMAIL"),
    organization: values("ORG")[0],
    url: values("URL")[0],
  };
}

function parseVcard(raw: string): ScannedContent {
  const lines = raw.replaceAll(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const values = (key: string) =>
    lines
      .filter((line) => line.toUpperCase().split(/[;:]/)[0] === key)
      .map((line) => unescape(line.slice(line.indexOf(":") + 1).trim()));
  const structured = (values("N")[0] ?? "").split(";");
  return {
    kind: "contact",
    raw,
    name: values("FN")[0] ?? [structured[1], structured[0]].filter(Boolean).join(" "),
    phones: values("TEL"),
    emails: values("EMAIL"),
    organization: values("ORG")[0]?.split(";")[0],
    url: values("URL")[0],
  };
}

function parseUrlLike(raw: string): ScannedContent | undefined {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol === "http:" || protocol === "https:") {
    return { kind: "url", raw, href: url.href, host: url.hostname };
  }
  if (protocol === "mailto:") {
    return {
      kind: "email",
      raw,
      address: decodeURIComponent(url.pathname),
      subject: url.searchParams.get("subject") ?? undefined,
      body: url.searchParams.get("body") ?? undefined,
    };
  }
  if (protocol === "tel:") return { kind: "phone", raw, number: decodeURIComponent(url.pathname) };
  if (protocol === "sms:" || protocol === "smsto:") {
    const [number = "", inlineBody] = decodeURIComponent(url.pathname).split(":");
    return { kind: "sms", raw, number, body: url.searchParams.get("body") ?? inlineBody };
  }
  if (protocol === "geo:") {
    const [latitude, longitude] = url.pathname.split(",").map(Number);
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return { kind: "geo", raw, latitude, longitude };
    }
  }
  return undefined;
}

/**
 * Turns the text read from a QR code into a typed value, so the scan result
 * can offer the right action: open, join Wi-Fi, save a contact, call.
 * Anything unrecognised, including links with unusual schemes, stays text.
 */
export function parseScanned(input: string): ScannedContent {
  const raw = input.trim();
  const upper = raw.toUpperCase();

  if (upper.startsWith("WIFI:")) return parseWifi(raw);
  if (upper.startsWith("MECARD:")) return parseMecard(raw);
  if (upper.startsWith("BEGIN:VCARD")) return parseVcard(raw);
  if (upper.startsWith("MATMSG:")) {
    const fields = new Map(splitFields(raw.slice("MATMSG:".length)));
    return {
      kind: "email",
      raw,
      address: fields.get("TO") ?? "",
      subject: fields.get("SUB"),
      body: fields.get("BODY"),
    };
  }
  if (upper.startsWith("SMSTO:")) {
    const [, number = "", ...body] = raw.split(":");
    return { kind: "sms", raw, number, body: body.join(":") || undefined };
  }

  return parseUrlLike(raw) ?? { kind: "text", raw, text: raw };
}
