export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type ModuleStyle = "square" | "rounded" | "dot" | "fluid";

export type FinderStyle = "square" | "rounded" | "circle" | "ring";

export interface QrTheme {
  id: string;
  name: string;
  foreground: string;
  background: string;
  surface: string;
}

export interface QrOptions {
  data: string;
  ecc: ErrorCorrectionLevel;
  moduleStyle: ModuleStyle;
  finderStyle: FinderStyle;
  foreground: string;
  background: string;
  margin: number;
  moduleSize: number;
  cornerRadius: number;
  logoRatio: number;
}

export type QrInput = Partial<Omit<QrOptions, "data">> & Pick<QrOptions, "data">;

export interface RenderedQr {
  svg: string;
  size: number;
  version: number;
  reservedModules: number;
}
