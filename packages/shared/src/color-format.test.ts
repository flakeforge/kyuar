import { describe, expect, it } from "vitest";

import { formatColor, hexToHsv, hsvToHex, parseColor, type ColorFormat } from "./color-format";

const COLORS = ["#1014cf", "#ff6b00", "#000000", "#ffffff", "#14c4bd", "#808080"];
const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl", "oklch"];

function channels(color: string) {
  return [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));
}

describe("color formats", () => {
  it.each(COLORS)("round-trips %s through every format", (hex) => {
    for (const format of FORMATS) {
      const back = parseColor(formatColor(hex, format));
      expect(back, format).toBeDefined();
      const expected = channels(hex);
      const actual = channels(back ?? "#000000");
      const drift = Math.max(
        ...expected.map((channel, index) => Math.abs(channel - (actual[index] ?? 0))),
      );
      expect(drift, format).toBeLessThanOrEqual(3);
    }
  });

  it.each(COLORS)("round-trips %s through HSV", (hex) => {
    expect(hsvToHex(hexToHsv(hex))).toBe(hex);
  });

  it("accepts hex without a hash and rejects garbage", () => {
    expect(parseColor("1014CF")).toBe("#1014cf");
    expect(parseColor("banana")).toBeUndefined();
  });
});
