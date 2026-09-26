import { encode, QrCodeDataType } from "uqr";

import type { ErrorCorrectionLevel } from "../types";

export const FINDER_SIZE = 7;

export interface QrMatrix {
  size: number;
  version: number;
  isDark: (row: number, col: number) => boolean;
  isFunctional: (row: number, col: number) => boolean;
  finderOrigins: ReadonlyArray<readonly [number, number]>;
  reserved: ReadonlySet<number>;
}

interface BuildMatrixInput {
  data: string;
  ecc: ErrorCorrectionLevel;
  margin: number;
  logoRatio: number;
}

/**
 * Locates the three finder patterns from uqr's module type map rather than
 * from coordinate arithmetic, so a non-zero border shifts them correctly.
 */
function findFinderOrigins(types: QrCodeDataType[][], size: number) {
  let rowMin = size;
  let rowMax = -1;
  let colMin = size;
  let colMax = -1;

  for (let row = 0; row < size; row += 1) {
    const line = types[row];
    if (!line) continue;
    for (let col = 0; col < size; col += 1) {
      if (line[col] !== QrCodeDataType.Position) continue;
      if (row < rowMin) rowMin = row;
      if (row > rowMax) rowMax = row;
      if (col < colMin) colMin = col;
      if (col > colMax) colMax = col;
    }
  }

  if (rowMax < 0) return [];

  const last = FINDER_SIZE - 1;
  return [
    [rowMin, colMin],
    [rowMin, colMax - last],
    [rowMax - last, colMin],
  ] as const;
}

/**
 * Computes the centered square of modules blanked out for a logo. The area is
 * kept odd-sized so it stays symmetric around the QR centre.
 */
function buildReservedArea(size: number, logoRatio: number) {
  const reserved = new Set<number>();
  if (logoRatio <= 0) return reserved;

  const span = Math.max(1, Math.round(size * logoRatio) | 1);
  const start = Math.floor((size - span) / 2);

  for (let row = start; row < start + span; row += 1) {
    for (let col = start; col < start + span; col += 1) {
      reserved.add(row * size + col);
    }
  }

  return reserved;
}

export function buildMatrix({ data, ecc, margin, logoRatio }: BuildMatrixInput): QrMatrix {
  const result = encode(data, { ecc, border: margin });
  const { size, version } = result;

  const finderOrigins = findFinderOrigins(result.types, size);
  const reserved = buildReservedArea(size, logoRatio);

  const isDark = (row: number, col: number) => {
    if (row < 0 || col < 0 || row >= size || col >= size) return false;
    if (reserved.has(row * size + col)) return false;
    return result.data[row]?.[col] === true;
  };

  const isFunctional = (row: number, col: number) => {
    const type = result.types[row]?.[col];
    return (
      type === QrCodeDataType.Timing ||
      type === QrCodeDataType.Alignment ||
      type === QrCodeDataType.Function
    );
  };

  return { size, version, isDark, isFunctional, finderOrigins, reserved };
}

export function isInsideFinder(
  finderOrigins: QrMatrix["finderOrigins"],
  row: number,
  col: number,
): boolean {
  return finderOrigins.some(
    ([originRow, originCol]) =>
      row >= originRow &&
      row < originRow + FINDER_SIZE &&
      col >= originCol &&
      col < originCol + FINDER_SIZE,
  );
}
