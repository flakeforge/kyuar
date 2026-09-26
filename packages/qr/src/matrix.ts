import { encodeSymbol, type ErrorCorrection } from "@kyuar/qr-encoder";

import { ModuleKind, type QrMatrix } from "./matrix-types";
import type { ErrorCorrectionLevel } from "./style";

const TO_ENCODER: Record<ErrorCorrectionLevel, ErrorCorrection> = {
  L: "low",
  M: "medium",
  Q: "quartile",
  H: "high",
};

const FROM_ENCODER: Record<ErrorCorrection, ErrorCorrectionLevel> = {
  low: "L",
  medium: "M",
  quartile: "Q",
  high: "H",
};

export interface MatrixInput {
  data: string;
  ecc: ErrorCorrectionLevel;
  boostEcc: boolean;
  minVersion: number;
  mask: number | null;
  logoRatio: number;
}

export interface BuiltMatrix extends QrMatrix {
  reserved: { start: number; span: number } | null;
}

function reservedArea(size: number, ratio: number) {
  if (ratio <= 0) return null;
  const span = Math.max(1, Math.round(size * ratio) | 1);
  return { start: Math.floor((size - span) / 2), span };
}

/**
 * Encodes the data and exposes modules with their kinds. A logo forces ECC H
 * and clears a centered square of data modules; function patterns inside the
 * square are never cleared.
 */
export function buildMatrix(input: MatrixInput): BuiltMatrix {
  const hasLogo = input.logoRatio > 0;
  const symbol = encodeSymbol(input.data, {
    ecc: hasLogo ? "high" : TO_ENCODER[input.ecc],
    boostEcc: input.boostEcc,
    minVersion: input.minVersion,
    mask: input.mask ?? undefined,
  });
  const { size } = symbol;
  const reserved = reservedArea(size, input.logoRatio);

  const inside = (row: number, col: number) => row >= 0 && col >= 0 && row < size && col < size;

  const kind = (row: number, col: number): ModuleKind =>
    inside(row, col) ? ((symbol.kinds[row * size + col] ?? 0) as ModuleKind) : ModuleKind.Data;

  const isCleared = (row: number, col: number) =>
    reserved !== null &&
    kind(row, col) === ModuleKind.Data &&
    row >= reserved.start &&
    row < reserved.start + reserved.span &&
    col >= reserved.start &&
    col < reserved.start + reserved.span;

  const isDark = (row: number, col: number) =>
    inside(row, col) && symbol.modules[row * size + col] === 1 && !isCleared(row, col);

  const alignments: { row: number; col: number }[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (kind(row, col) === ModuleKind.AlignmentEye) alignments.push({ row, col });
    }
  }

  return {
    size,
    version: symbol.version,
    mask: symbol.mask,
    ecc: FROM_ENCODER[symbol.ecc],
    isDark,
    kind,
    finders: [
      { row: 0, col: 0, rotation: 0 },
      { row: 0, col: size - 7, rotation: Math.PI / 2 },
      { row: size - 7, col: 0, rotation: -Math.PI / 2 },
    ],
    alignments,
    reserved,
  };
}
