import { hexToOklch, oklchToHex } from "@kyuar/qr";

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export interface Hsv {
  h: number;
  s: number;
  v: number;
}

function channels(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function hexToHsv(hex: string): Hsv {
  const [r, g, b] = channels(hex).map((channel) => channel / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : delta / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return toHex(f(5) * 255, f(3) * 255, f(1) * 255);
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = channels(hex).map((channel) => channel / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [hexToHsv(hex).h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return toHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export function formatColor(hex: string, format: ColorFormat): string {
  if (format === "hex") return hex.toUpperCase();
  if (format === "rgb") return `rgb(${channels(hex).join(" ")})`;
  if (format === "hsl") {
    const [h, s, l] = hexToHsl(hex);
    return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
  }
  const { l, c, h } = hexToOklch(hex);
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${Math.round(h)})`;
}

function numbers(input: string) {
  return (input.match(/-?\d*\.?\d+/g) ?? []).map(Number);
}

/**
 * Parses a color typed in any supported format. Returns `undefined` for
 * anything it cannot read, so the field can fall back to the last good value.
 */
export function parseColor(input: string): string | undefined {
  const text = input.trim().toLowerCase();
  const hex = /^#?([0-9a-f]{6})$/.exec(text);
  if (hex?.[1]) return `#${hex[1]}`;

  const [a, b, c] = numbers(text);
  if (a === undefined || b === undefined || c === undefined) return undefined;
  if (text.startsWith("rgb")) return toHex(a, b, c);
  if (text.startsWith("hsl")) return hslToHex(a, b, c);
  if (text.startsWith("oklch")) {
    const lightness = text.includes("%") ? a / 100 : a;
    return oklchToHex({ l: lightness, c: b, h: c });
  }
  return undefined;
}
