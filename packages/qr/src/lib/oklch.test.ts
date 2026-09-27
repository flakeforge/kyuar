import { describe, expect, it } from "vitest";

import { hexToOklch, oklchToHex } from "./oklch";

describe("oklch", () => {
  it.each(["#000000", "#ffffff", "#2547ff", "#ff6b00", "#6a1b9a", "#14c4bd", "#808080"])(
    "round-trips %s",
    (hex) => {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    },
  );

  it("matches known OKLCH values", () => {
    const white = hexToOklch("#ffffff");
    expect(white.l).toBeCloseTo(1, 3);
    expect(white.c).toBeCloseTo(0, 3);
    expect(hexToOklch("#ff0000").h).toBeCloseTo(29.23, 1);
  });

  it("reduces chroma instead of clipping channels", () => {
    const hex = oklchToHex({ l: 0.7, c: 0.4, h: 150 });
    const back = hexToOklch(hex);
    expect(back.l).toBeCloseTo(0.7, 1);
    expect(Math.abs(back.h - 150)).toBeLessThan(3);
  });
});
