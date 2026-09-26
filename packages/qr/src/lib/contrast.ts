const CHANNEL = /^#([0-9a-f]{6})$/i;

function channels(hex: string): [number, number, number] {
  const match = CHANNEL.exec(hex);
  if (!match?.[1]) return [0, 0, 0];
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function linearize(component: number) {
  const channel = component / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * WCAG contrast ratio between two colors, from 1 (identical) to 21.
 *
 * QR scanners need a strong luminance difference between modules and
 * background. Anything below `MIN_SCAN_CONTRAST` decodes unreliably on real
 * camera input even when a software decoder still manages to read the image.
 */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

export const MIN_SCAN_CONTRAST = 4.5;
