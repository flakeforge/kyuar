import { encodeQR } from "qr";
import { decodeQR } from "qr/decode.js";
import { describe, expect, it } from "vitest";

import { encodeSymbol, KIND, type EncodedSymbol, type ErrorCorrection } from "./encoder";

const LEVELS: ErrorCorrection[] = ["low", "medium", "quartile", "high"];

function rasterize(symbol: EncodedSymbol, scale = 4, border = 4) {
  const width = (symbol.size + border * 2) * scale;
  const data = new Uint8Array(width * width * 4).fill(255);

  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const row = Math.floor(y / scale) - border;
      const col = Math.floor(x / scale) - border;
      const inside = row >= 0 && col >= 0 && row < symbol.size && col < symbol.size;
      if (!inside || symbol.modules[row * symbol.size + col] !== 1) continue;
      const offset = (y * width + x) * 4;
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
    }
  }

  return { width, height: width, data };
}

function countKind(symbol: EncodedSymbol, kind: number) {
  return symbol.kinds.filter((value) => value === kind).length;
}

describe("encodeSymbol", () => {
  it.each([
    "0123456789",
    "HELLO WORLD $%*+-./:",
    "https://kyuar.app/?q=1",
    "Salom, дунё! 👋 こんにちは",
    "x".repeat(900),
  ])("decodes back to %s", (text) => {
    for (const ecc of LEVELS) {
      expect(decodeQR(rasterize(encodeSymbol(text, { ecc })))).toBe(text);
    }
  });

  it("matches upstream qr for every mask", () => {
    for (let mask = 0; mask < 8; mask += 1) {
      const ours = encodeSymbol("kyuar", { ecc: "quartile", mask });
      const theirs = encodeQR("kyuar", "raw", { ecc: "quartile", mask, border: 1 });
      const inner = theirs.slice(1, -1).map((row) => row.slice(1, -1));

      expect(ours.mask).toBe(mask);
      expect([...ours.modules]).toEqual(inner.flat().map(Number));
    }
  });

  it("matches upstream qr when choosing the mask", () => {
    const ours = encodeSymbol("https://example.com/path", { ecc: "medium" });
    const theirs = encodeQR("https://example.com/path", "raw", { ecc: "medium", border: 1 });
    const inner = theirs.slice(1, -1).map((row) => row.slice(1, -1));

    expect([...ours.modules]).toEqual(inner.flat().map(Number));
  });

  it("records the kind of every function pattern", () => {
    const symbol = encodeSymbol("x".repeat(200), { ecc: "low" });
    const { size } = symbol;

    expect(symbol.version).toBeGreaterThanOrEqual(7);
    expect(countKind(symbol, KIND.FinderRing)).toBe(3 * 24);
    expect(countKind(symbol, KIND.FinderGap)).toBe(3 * 16);
    expect(countKind(symbol, KIND.FinderEye)).toBe(3 * 9);
    expect(countKind(symbol, KIND.Version)).toBe(36);
    expect(countKind(symbol, KIND.Format)).toBe(30);
    expect(countKind(symbol, KIND.DarkModule)).toBe(1);
    expect(symbol.kinds[(size - 8) * size + 8]).toBe(KIND.DarkModule);
    expect(symbol.modules[(size - 8) * size + 8]).toBe(1);
    expect(symbol.kinds[6 * size + 10]).toBe(KIND.Timing);
    expect(symbol.kinds[0]).toBe(KIND.FinderRing);
    expect(symbol.kinds[3 * size + 3]).toBe(KIND.FinderEye);
    expect(symbol.kinds[7 * size + 7]).toBe(KIND.Separator);
  });

  it("marks alignment ring, gap and eye", () => {
    const symbol = encodeSymbol("https://example.com/a-longer-path", { ecc: "high" });
    const { size } = symbol;
    const center = size - 7;

    expect(symbol.kinds[center * size + center]).toBe(KIND.AlignmentEye);
    expect(symbol.kinds[(center - 1) * size + center]).toBe(KIND.AlignmentGap);
    expect(symbol.kinds[(center - 2) * size + center]).toBe(KIND.AlignmentRing);
  });

  it("raises error correction with boostEcc when the version allows it", () => {
    const plain = encodeSymbol("hi", { ecc: "low" });
    const boosted = encodeSymbol("hi", { ecc: "low", boostEcc: true });

    expect(plain.ecc).toBe("low");
    expect(boosted.ecc).toBe("high");
    expect(boosted.version).toBe(plain.version);
  });

  it("respects minVersion and rejects oversized input", () => {
    expect(encodeSymbol("a", { minVersion: 5 }).version).toBe(5);
    expect(() => encodeSymbol("x".repeat(3000), { ecc: "high" })).toThrow(/Capacity/);
  });
});
