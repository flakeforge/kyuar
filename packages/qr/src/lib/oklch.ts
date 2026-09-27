export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const HEX = /^#([0-9a-f]{6})$/i;

function toLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number) {
  const encoded = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
}

function linearRgb(color: Oklch): [number, number, number] {
  const radians = (color.h * Math.PI) / 180;
  const a = color.c * Math.cos(radians);
  const b = color.c * Math.sin(radians);

  const l = (color.l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function inGamut(rgb: [number, number, number]) {
  return rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);
}

export function hexToOklch(hex: string): Oklch {
  const match = HEX.exec(hex);
  const value = match?.[1] ? Number.parseInt(match[1], 16) : 0;
  const r = toLinear((value >> 16) & 255);
  const g = toLinear((value >> 8) & 255);
  const b = toLinear(value & 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.hypot(a, bAxis);
  const hue = chroma < 1e-4 ? 0 : ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360;
  return { l: lightness, c: chroma, h: hue };
}

/**
 * Converts OKLCH to sRGB hex. Colors outside sRGB keep their lightness and
 * hue and lose chroma until they fit, so a slider never jumps to another hue.
 */
export function oklchToHex(color: Oklch): string {
  let low = 0;
  let high = color.c;
  let rgb = linearRgb(color);

  if (!inGamut(rgb)) {
    for (let step = 0; step < 24; step += 1) {
      const mid = (low + high) / 2;
      if (inGamut(linearRgb({ ...color, c: mid }))) low = mid;
      else high = mid;
    }
    rgb = linearRgb({ ...color, c: low });
  }

  return `#${rgb.map((channel) => fromLinear(channel).toString(16).padStart(2, "0")).join("")}`;
}
