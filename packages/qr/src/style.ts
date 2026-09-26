import type { DotShape, FinderInnerShape, FinderOuterShape } from "./figures";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface GradientStop {
  offset: number;
  color: string;
}

export type Paint =
  | { type: "solid"; color: string }
  | { type: "linear"; angle: number; stops: GradientStop[] }
  | { type: "radial"; stops: GradientStop[] };

export interface LayerStyle<Shape extends string> {
  shape: Shape;
  paint: Paint;
}

export type AlignmentMode = "data" | "finder";

export interface QrStyle {
  ecc: ErrorCorrectionLevel;
  boostEcc: boolean;
  minVersion: number;
  mask: number | null;
  margin: number;
  background: Paint;
  backgroundRadius: number;
  data: LayerStyle<DotShape>;
  finderOuter: LayerStyle<FinderOuterShape>;
  finderInner: LayerStyle<FinderInnerShape>;
  alignment: { mode: AlignmentMode; paint: Paint };
  timing: { paint: Paint };
  logo: { ratio: number };
}

export const DEFAULT_FOREGROUND = "#ffffff";
export const DEFAULT_BACKGROUND = "#2547ff";

export function solid(color: string): Paint {
  return { type: "solid", color };
}

export const DEFAULT_STYLE: QrStyle = {
  ecc: "M",
  boostEcc: true,
  minVersion: 1,
  mask: null,
  margin: 4,
  background: solid(DEFAULT_BACKGROUND),
  backgroundRadius: 0.5,
  data: { shape: "fluid", paint: solid(DEFAULT_FOREGROUND) },
  finderOuter: { shape: "dot", paint: solid(DEFAULT_FOREGROUND) },
  finderInner: { shape: "extra-rounded", paint: solid(DEFAULT_FOREGROUND) },
  alignment: { mode: "data", paint: solid(DEFAULT_FOREGROUND) },
  timing: { paint: solid(DEFAULT_FOREGROUND) },
  logo: { ratio: 0 },
};

/**
 * Returns a style where every dark element uses `foreground` and the
 * background uses `background`, keeping shapes and encoding settings.
 */
export function withColors(style: QrStyle, foreground: string, background: string): QrStyle {
  const ink = solid(foreground);
  return {
    ...style,
    background: solid(background),
    data: { ...style.data, paint: ink },
    finderOuter: { ...style.finderOuter, paint: ink },
    finderInner: { ...style.finderInner, paint: ink },
    alignment: { ...style.alignment, paint: ink },
    timing: { paint: ink },
  };
}

export function paintColors(paint: Paint): string[] {
  return paint.type === "solid" ? [paint.color] : paint.stops.map((stop) => stop.color);
}
