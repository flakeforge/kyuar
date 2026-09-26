import { describe, expect, it } from "vitest";

import { ModuleKind, type QrMatrix } from "../matrix-types";

import { type GrayImage, halftoneGrid, halftonePath, toGrayImage } from "./index";

function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function finderKind(row: number, col: number): ModuleKind | undefined {
  const origins = [
    [0, 0],
    [0, 14],
    [14, 0],
  ] as const;
  for (const [top, left] of origins) {
    const r = row - top;
    const c = col - left;
    if (r >= -1 && r <= 7 && c >= -1 && c <= 7) {
      if (r === -1 || r === 7 || c === -1 || c === 7) return ModuleKind.Separator;
      const ring = Math.min(r, c, 6 - r, 6 - c);
      if (ring === 0) return ModuleKind.FinderRing;
      if (ring === 1) return ModuleKind.FinderGap;
      return ModuleKind.FinderEye;
    }
  }
  return undefined;
}

function fakeMatrix(seed = 1): QrMatrix {
  const size = 21;
  const next = random(seed);
  const dark = Array.from({ length: size * size }, () => next() < 0.5);
  const kind = (row: number, col: number): ModuleKind => {
    const finder = finderKind(row, col);
    if (finder !== undefined) return finder;
    if (row === 6 || col === 6) return ModuleKind.Timing;
    if (row === 8 || col === 8) return ModuleKind.Format;
    return ModuleKind.Data;
  };
  return {
    size,
    version: 1,
    mask: 0,
    ecc: "M",
    isDark: (row, col) => {
      const k = kind(row, col);
      if (k === ModuleKind.FinderRing || k === ModuleKind.FinderEye) return true;
      if (k === ModuleKind.FinderGap || k === ModuleKind.Separator) return false;
      if (k === ModuleKind.Timing) return (row + col) % 2 === 0;
      return dark[row * size + col] ?? false;
    },
    kind,
    finders: [
      { row: 0, col: 0, rotation: 0 },
      { row: 0, col: 14, rotation: 90 },
      { row: 14, col: 0, rotation: 270 },
    ],
    alignments: [],
  };
}

function solidImage(value: number, width = 10, height = 10): GrayImage {
  return { width, height, data: new Uint8Array(width * height).fill(value) };
}

function randomImage(seed: number, width: number, height: number): GrayImage {
  const next = random(seed);
  return {
    width,
    height,
    data: Uint8Array.from({ length: width * height }, () => Math.floor(next() * 256)),
  };
}

function eachModule(matrix: QrMatrix, visit: (row: number, col: number) => void): void {
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) visit(row, col);
  }
}

describe("halftoneGrid", () => {
  it("keeps the center sub-module equal to the module for random images", () => {
    for (let seed = 1; seed <= 8; seed++) {
      const matrix = fakeMatrix(seed);
      const grid = halftoneGrid(matrix, {
        image: randomImage(seed * 31, 17 + seed * 5, 40 - seed * 3),
        contrast: 0.5 + seed * 0.2,
        brightness: (seed - 4) / 10,
      });
      const cells = matrix.size * 3;
      expect(grid.length).toBe(cells * cells);
      eachModule(matrix, (row, col) => {
        if (matrix.kind(row, col) !== ModuleKind.Data) return;
        expect(grid[(row * 3 + 1) * cells + col * 3 + 1]).toBe(matrix.isDark(row, col) ? 1 : 0);
      });
    }
  });

  it("draws function pattern modules as full modules", () => {
    const matrix = fakeMatrix();
    const grid = halftoneGrid(matrix, { image: randomImage(5, 30, 30) });
    const cells = matrix.size * 3;
    eachModule(matrix, (row, col) => {
      if (matrix.kind(row, col) === ModuleKind.Data) return;
      const expected = matrix.isDark(row, col) ? 1 : 0;
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
          expect(grid[(row * 3 + dy) * cells + col * 3 + dx]).toBe(expected);
        }
      }
    });
  });

  it("makes surrounding sub-modules light for a white image and dark for a black one", () => {
    const matrix = fakeMatrix();
    const cells = matrix.size * 3;
    const white = halftoneGrid(matrix, { image: solidImage(255) });
    const black = halftoneGrid(matrix, { image: solidImage(0) });
    eachModule(matrix, (row, col) => {
      if (matrix.kind(row, col) !== ModuleKind.Data) return;
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
          if (dy === 1 && dx === 1) continue;
          const i = (row * 3 + dy) * cells + col * 3 + dx;
          expect(white[i]).toBe(0);
          expect(black[i]).toBe(1);
        }
      }
    });
  });

  it("is deterministic", () => {
    const matrix = fakeMatrix(3);
    const options = { image: randomImage(9, 64, 48), contrast: 1.4, centerRatio: 0.5 };
    expect(halftoneGrid(matrix, options)).toEqual(halftoneGrid(matrix, options));
    expect(halftonePath(matrix, options, 4, { x: 8, y: 8 })).toEqual(
      halftonePath(matrix, options, 4, { x: 8, y: 8 }),
    );
  });

  it("rejects an image with missing data", () => {
    expect(() =>
      halftoneGrid(fakeMatrix(), { image: { width: 4, height: 4, data: new Uint8Array(3) } }),
    ).toThrow(RangeError);
  });
});

describe("halftonePath", () => {
  const rectPattern = /^M(-?[\d.]+) (-?[\d.]+)h(-?[\d.]+)v(-?[\d.]+)h(-?[\d.]+)z$/;

  function rects(path: string): number[][] {
    return (path.match(/M[^M]+/g) ?? []).map((part) => {
      const match = rectPattern.exec(part);
      expect(match).not.toBeNull();
      return (match ?? []).slice(1).map(Number);
    });
  }

  it("emits nothing for function pattern modules", () => {
    const matrix = fakeMatrix();
    const moduleSize = 10;
    const { dark } = halftonePath(matrix, { image: solidImage(0) }, moduleSize, { x: 0, y: 0 });
    for (const [x = 0, y = 0, width = 0, height = 0] of rects(dark)) {
      const row = Math.floor((y + height / 2) / moduleSize);
      const firstCol = Math.floor((x + 0.001) / moduleSize);
      const lastCol = Math.floor((x + width - 0.001) / moduleSize);
      for (let col = firstCol; col <= lastCol; col++) {
        expect(matrix.kind(row, col)).toBe(ModuleKind.Data);
      }
    }
  });

  it("is empty for a white image with all data modules light", () => {
    const base = fakeMatrix();
    const matrix: QrMatrix = {
      ...base,
      isDark: (row, col) => base.kind(row, col) !== ModuleKind.Data && base.isDark(row, col),
    };
    expect(halftonePath(matrix, { image: solidImage(255) }, 5, { x: 0, y: 0 }).dark).toBe("");
  });

  it("writes clockwise rects without NaN and honors centerRatio", () => {
    const matrix = fakeMatrix(7);
    const { dark } = halftonePath(matrix, { image: randomImage(2, 50, 70), centerRatio: 0.5 }, 6, {
      x: 12,
      y: 12,
    });
    expect(dark).not.toMatch(/NaN|Infinity/);
    const parsed = rects(dark);
    expect(parsed.length).toBeGreaterThan(0);
    for (const [, , width = 0, height = 0, back = 0] of parsed) {
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(back).toBe(-width);
    }
    const heights = new Set(parsed.map(([, , , height]) => height));
    expect([...heights].toSorted((a = 0, b = 0) => a - b)).toEqual([1.5, 3]);
  });

  it("merges horizontal runs across modules", () => {
    const matrix = fakeMatrix();
    const { dark } = halftonePath(matrix, { image: solidImage(0) }, 3, { x: 0, y: 0 });
    const widths = rects(dark).map(([, , width = 0]) => width);
    expect(Math.max(...widths)).toBeGreaterThan(3);
  });
});

describe("toGrayImage", () => {
  it("uses Rec. 709 luma", () => {
    const rgba = Uint8Array.from([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
    ]);
    expect([...toGrayImage(rgba, 4, 1).data]).toEqual([54, 182, 18, 255]);
  });

  it("composites alpha over white by default and over a given background", () => {
    const rgba = Uint8ClampedArray.from([0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 255]);
    expect([...toGrayImage(rgba, 3, 1).data]).toEqual([255, 127, 0]);
    expect([...toGrayImage(rgba, 3, 1, [0, 0, 0]).data]).toEqual([0, 0, 0]);
  });

  it("rejects short buffers", () => {
    expect(() => toGrayImage(new Uint8Array(4), 2, 1)).toThrow(RangeError);
  });
});
