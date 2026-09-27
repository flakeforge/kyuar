import {
  DOT_FIGURES,
  FINDER_INNER_FIGURES,
  FINDER_OUTER_FIGURES,
  type DotFigure,
  type FinderFigure,
} from "./figures";
import { halftonePath, type HalftoneOptions } from "./halftone";
import { contrastRatio, MIN_SCAN_CONTRAST } from "./lib/contrast";
import { cellRandom } from "./lib/random";
import { escapeXml } from "./lib/xml";
import { buildMatrix, type BuiltMatrix } from "./matrix";
import { ModuleKind } from "./matrix-types";
import { resolvePaint, type PaintBox } from "./paint";
import { DEFAULT_STYLE, paintColors, type Paint, type QrStyle } from "./style";

export const DEFAULT_MODULE_SIZE = 16;

const DATA_KINDS: ReadonlySet<ModuleKind> = new Set([
  ModuleKind.Data,
  ModuleKind.Format,
  ModuleKind.Version,
  ModuleKind.DarkModule,
]);

const ALIGNMENT_KINDS: ReadonlySet<ModuleKind> = new Set([
  ModuleKind.AlignmentRing,
  ModuleKind.AlignmentGap,
  ModuleKind.AlignmentEye,
]);

const LOGO_HREF = /^data:image\/(?:png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/;

export interface RenderInput {
  data: string;
  style?: QrStyle;
  moduleSize?: number;
  halftone?: HalftoneOptions;
  logoHref?: string;
  idPrefix?: string;
}

export interface RenderedQr {
  svg: string;
  size: number;
  modules: number;
  version: number;
  ecc: BuiltMatrix["ecc"];
  mask: number;
  warnings: string[];
}

interface Geometry {
  unit: number;
  offset: number;
}

function drawModules(
  matrix: BuiltMatrix,
  geometry: Geometry,
  figure: DotFigure,
  belongs: (row: number, col: number) => boolean,
): string {
  const parts: string[] = [];
  const { unit, offset } = geometry;
  const inLayer = (row: number, col: number) => matrix.isDark(row, col) && belongs(row, col);

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (!inLayer(row, col)) continue;
      parts.push(
        figure({
          x: offset + col * unit,
          y: offset + row * unit,
          size: unit,
          neighbor: (dx, dy) => inLayer(row + dy, col + dx),
          random: cellRandom(row, col),
        }),
      );
    }
  }

  return parts.join("");
}

function drawFigure(
  figure: FinderFigure,
  geometry: Geometry,
  row: number,
  col: number,
  span: number,
  rotation: number,
) {
  const { unit, offset } = geometry;
  return figure({ x: offset + col * unit, y: offset + row * unit, size: span * unit, rotation });
}

function scanWarnings(style: QrStyle): string[] {
  const backgrounds = paintColors(style.background);
  const inks = [
    style.data.paint,
    style.finderOuter.paint,
    style.finderInner.paint,
    style.alignment.paint,
    style.timing.paint,
  ].flatMap(paintColors);

  const worst = Math.min(
    ...inks.flatMap((ink) => backgrounds.map((background) => contrastRatio(ink, background))),
  );

  return worst < MIN_SCAN_CONTRAST
    ? [`Contrast ${worst.toFixed(2)}:1 is below ${MIN_SCAN_CONTRAST}:1, the code may not scan`]
    : [];
}

/**
 * Returns false when the data does not fit in a QR code with this style, so
 * callers can explain the problem instead of failing later.
 */
export function canEncode(data: string, style: QrStyle = DEFAULT_STYLE): boolean {
  try {
    buildMatrix({
      data,
      ecc: style.ecc,
      boostEcc: false,
      minVersion: style.minVersion,
      mask: style.mask,
      logoRatio: style.logo.ratio,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Renders a QR code to a standalone SVG string. Every element — data modules,
 * finder rings and eyes, alignment and timing patterns, background — has its
 * own shape and paint. Output has no external references, so resvg can
 * rasterize it and React can inline it.
 */
export function renderQr(input: RenderInput): RenderedQr {
  const style = input.style ?? DEFAULT_STYLE;
  const unit = input.moduleSize ?? DEFAULT_MODULE_SIZE;
  const id = input.idPrefix ?? "kq";
  const logoHref = input.logoHref && LOGO_HREF.test(input.logoHref) ? input.logoHref : undefined;

  const matrix = buildMatrix({
    data: input.data,
    ecc: style.ecc,
    boostEcc: style.boostEcc,
    minVersion: style.minVersion,
    mask: style.mask,
    logoRatio: style.logo.ratio,
  });

  const offset = style.margin * unit;
  const geometry: Geometry = { unit, offset };
  const dimension = (matrix.size + style.margin * 2) * unit;
  const symbolBox: PaintBox = { x: offset, y: offset, size: matrix.size * unit };
  const fullBox: PaintBox = { x: 0, y: 0, size: dimension };

  const defs: string[] = [];
  const layer = (name: string, paint: Paint, d: string, fillRule = "nonzero") => {
    if (!d) return "";
    const resolved = resolvePaint(paint, `${id}-${name}`, symbolBox);
    if (resolved.def) defs.push(resolved.def);
    return `<path fill="${resolved.fill}" fill-rule="${fillRule}" d="${d}"/>`;
  };

  const dataFigure = DOT_FIGURES[style.data.shape];
  const squareFigure = DOT_FIGURES.square;
  const kindOf = matrix.kind;

  const dataPath = input.halftone
    ? [
        halftonePath(matrix, input.halftone, unit, { x: offset, y: offset }).dark,
        drawModules(matrix, geometry, squareFigure, (row, col) => {
          const kind = kindOf(row, col);
          return DATA_KINDS.has(kind) && kind !== ModuleKind.Data;
        }),
      ].join("")
    : drawModules(matrix, geometry, dataFigure, (row, col) => DATA_KINDS.has(kindOf(row, col)));

  const timingPath = drawModules(
    matrix,
    geometry,
    input.halftone ? squareFigure : dataFigure,
    (row, col) => kindOf(row, col) === ModuleKind.Timing,
  );

  const alignmentPath =
    style.alignment.mode === "finder"
      ? matrix.alignments
          .map(
            ({ row, col }) =>
              drawFigure(
                FINDER_OUTER_FIGURES[style.finderOuter.shape],
                geometry,
                row - 2,
                col - 2,
                5,
                0,
              ) +
              drawFigure(FINDER_INNER_FIGURES[style.finderInner.shape], geometry, row, col, 1, 0),
          )
          .join("")
      : drawModules(matrix, geometry, input.halftone ? squareFigure : dataFigure, (row, col) =>
          ALIGNMENT_KINDS.has(kindOf(row, col)),
        );

  const outerPath = matrix.finders
    .map(({ row, col, rotation }) =>
      drawFigure(FINDER_OUTER_FIGURES[style.finderOuter.shape], geometry, row, col, 7, rotation),
    )
    .join("");

  const innerPath = matrix.finders
    .map(({ row, col, rotation }) =>
      drawFigure(
        FINDER_INNER_FIGURES[style.finderInner.shape],
        geometry,
        row + 2,
        col + 2,
        3,
        rotation,
      ),
    )
    .join("");

  const background = resolvePaint(style.background, `${id}-background`, fullBox);
  if (background.def) defs.push(background.def);
  const radius = Math.min(dimension * style.backgroundRadius * 0.12, offset);

  const layers = [
    layer("data", style.data.paint, dataPath),
    layer("timing", style.timing.paint, timingPath),
    layer(
      "alignment",
      style.alignment.paint,
      alignmentPath,
      style.alignment.mode === "finder" ? "evenodd" : "nonzero",
    ),
    layer("finder-outer", style.finderOuter.paint, outerPath, "evenodd"),
    layer("finder-inner", style.finderInner.paint, innerPath),
  ];

  if (logoHref && matrix.reserved) {
    const inset = unit * 0.5;
    const x = offset + matrix.reserved.start * unit + inset;
    const span = matrix.reserved.span * unit - inset * 2;
    layers.push(
      `<image href="${escapeXml(logoHref)}" x="${x}" y="${x}" width="${span}" height="${span}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}" shape-rendering="geometricPrecision">`,
    defs.length > 0 ? `<defs>${defs.join("")}</defs>` : "",
    `<rect width="${dimension}" height="${dimension}" rx="${radius.toFixed(2)}" fill="${background.fill}"/>`,
    ...layers,
    "</svg>",
  ].join("");

  return {
    svg,
    size: dimension,
    modules: matrix.size,
    version: matrix.version,
    ecc: matrix.ecc,
    mask: matrix.mask,
    warnings: scanWarnings(style),
  };
}
