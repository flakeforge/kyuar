import { contrastRatio } from "./lib/contrast";
import { hexToOklch, oklchToHex, type Oklch } from "./lib/oklch";
import { solid, type QrStyle } from "./style";

export const PALETTE_TARGET_CONTRAST = 7;

export interface Palette {
  background: string;
  modules: string;
  frames: string;
  centers: string;
}

function toward(color: Oklch, direction: -1 | 1, against: string, target: number): string {
  let lightness = color.l;
  let hex = oklchToHex(color);
  for (let step = 0; step < 100 && contrastRatio(hex, against) < target; step += 1) {
    lightness = Math.min(1, Math.max(0, lightness + direction * 0.01));
    hex = oklchToHex({ ...color, l: lightness });
  }
  return hex;
}

/**
 * Derives a full, scannable palette from one base color. The background is a
 * soft tint of the base hue; modules, frames and centers keep the hue and
 * move in lightness until they reach the target contrast against it.
 * `dark` flips it: a deep background with light modules.
 */
export function derivePalette(base: string, dark = false): Palette {
  const color = hexToOklch(base);
  const background = dark
    ? oklchToHex({ l: 0.2, c: Math.min(color.c, 0.08), h: color.h })
    : oklchToHex({ l: 0.95, c: Math.min(color.c * 0.3, 0.04), h: color.h });
  const direction = dark ? 1 : -1;

  const modules = toward(color, direction, background, PALETTE_TARGET_CONTRAST);
  const centers = contrastRatio(base, background) >= 4.5 ? base.toLowerCase() : modules;
  const frames = toward(
    { ...hexToOklch(modules), l: hexToOklch(modules).l + direction * 0.04 },
    direction,
    background,
    PALETTE_TARGET_CONTRAST,
  );

  return { background, modules, frames, centers };
}

export function applyPalette(style: QrStyle, palette: Palette): QrStyle {
  return {
    ...style,
    background: solid(palette.background),
    data: { ...style.data, paint: solid(palette.modules) },
    finderOuter: { ...style.finderOuter, paint: solid(palette.frames) },
    finderInner: { ...style.finderInner, paint: solid(palette.centers) },
    alignment: { ...style.alignment, paint: solid(palette.modules) },
    timing: { paint: solid(palette.modules) },
  };
}
