import { describe, expect, it } from "vitest";

import { contrastRatio, MIN_SCAN_CONTRAST } from "./lib/contrast";
import { hexToOklch } from "./lib/oklch";
import { derivePalette, PALETTE_TARGET_CONTRAST } from "./palette";

const BASES = [
  "#1014cf",
  "#ff6b00",
  "#ffe600",
  "#14c4bd",
  "#808080",
  "#000000",
  "#ffffff",
  "#c81824",
];

describe("derivePalette", () => {
  it.each(BASES)("keeps %s scannable on light and dark", (base) => {
    for (const dark of [false, true]) {
      const palette = derivePalette(base, dark);
      expect(contrastRatio(palette.modules, palette.background)).toBeGreaterThanOrEqual(
        PALETTE_TARGET_CONTRAST - 0.05,
      );
      expect(contrastRatio(palette.frames, palette.background)).toBeGreaterThanOrEqual(
        PALETTE_TARGET_CONTRAST - 0.05,
      );
      expect(contrastRatio(palette.centers, palette.background)).toBeGreaterThanOrEqual(
        MIN_SCAN_CONTRAST,
      );
    }
  });

  it("keeps the base hue", () => {
    const palette = derivePalette("#1014cf");
    expect(Math.abs(hexToOklch(palette.modules).h - hexToOklch("#1014cf").h)).toBeLessThan(8);
  });

  it("uses a light background by default and a dark one on request", () => {
    expect(hexToOklch(derivePalette("#1014cf").background).l).toBeGreaterThan(0.9);
    expect(hexToOklch(derivePalette("#1014cf", true).background).l).toBeLessThan(0.3);
  });
});
