export const ModuleKind = {
  Data: 0,
  FinderRing: 1,
  FinderGap: 2,
  FinderEye: 3,
  Separator: 4,
  AlignmentRing: 5,
  AlignmentGap: 6,
  AlignmentEye: 7,
  Timing: 8,
  Format: 9,
  Version: 10,
  DarkModule: 11,
} as const;

export type ModuleKind = (typeof ModuleKind)[keyof typeof ModuleKind];

export interface QrMatrix {
  size: number;
  version: number;
  mask: number;
  ecc: "L" | "M" | "Q" | "H";
  isDark: (row: number, col: number) => boolean;
  kind: (row: number, col: number) => ModuleKind;
  finders: ReadonlyArray<{ row: number; col: number; rotation: number }>;
  alignments: ReadonlyArray<{ row: number; col: number }>;
}
