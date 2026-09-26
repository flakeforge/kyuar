import { buildMatrix, FINDER_SIZE, isInsideFinder, type QrMatrix } from "./lib/matrix";
import { circlePath, circleRingPath, escapeXml, ringPath, roundedRectPath } from "./lib/svg";
import type { CornerRadii } from "./lib/svg";
import type { FinderStyle, ModuleStyle, QrInput, QrOptions, RenderedQr } from "./types";

export const DEFAULT_OPTIONS: Omit<QrOptions, "data"> = {
  ecc: "M",
  moduleStyle: "fluid",
  finderStyle: "ring",
  foreground: "#ffffff",
  background: "#2547ff",
  margin: 3,
  moduleSize: 16,
  cornerRadius: 0.5,
  logoRatio: 0,
};

const MODULE_RADIUS: Record<ModuleStyle, number> = {
  square: 0,
  rounded: 0.28,
  dot: 0.5,
  fluid: 0.5,
};

function resolve(input: QrInput): QrOptions {
  return { ...DEFAULT_OPTIONS, ...input };
}

function moduleCorners(matrix: QrMatrix, row: number, col: number, radius: number): CornerRadii {
  const top = matrix.isDark(row - 1, col);
  const right = matrix.isDark(row, col + 1);
  const bottom = matrix.isDark(row + 1, col);
  const left = matrix.isDark(row, col - 1);

  return [
    top || left ? 0 : radius,
    top || right ? 0 : radius,
    bottom || right ? 0 : radius,
    bottom || left ? 0 : radius,
  ];
}

function renderModules(matrix: QrMatrix, options: QrOptions): string {
  const unit = options.moduleSize;
  const radiusRatio = MODULE_RADIUS[options.moduleStyle];
  const merge = options.moduleStyle === "fluid";
  const paths: string[] = [];

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (!matrix.isDark(row, col)) continue;
      if (isInsideFinder(matrix.finderOrigins, row, col)) continue;

      const x = col * unit;
      const y = row * unit;

      if (options.moduleStyle === "dot" && !matrix.isFunctional(row, col)) {
        paths.push(circlePath(x + unit / 2, y + unit / 2, (unit / 2) * 0.86));
        continue;
      }

      const radius = options.moduleStyle === "dot" ? 0 : unit * radiusRatio;
      const corners: CornerRadii = merge
        ? moduleCorners(matrix, row, col, radius)
        : [radius, radius, radius, radius];

      paths.push(roundedRectPath(x, y, unit, unit, corners));
    }
  }

  return paths.join("");
}

function renderFinder(style: FinderStyle, originRow: number, originCol: number, unit: number) {
  const x = originCol * unit;
  const y = originRow * unit;
  const outer = FINDER_SIZE * unit;
  const thickness = unit;
  const center = outer / 2;

  if (style === "circle") {
    return [
      circleRingPath(x + center, y + center, center, thickness),
      circlePath(x + center, y + center, unit * 1.5),
    ];
  }

  if (style === "ring") {
    return [
      circleRingPath(x + center, y + center, center, thickness),
      roundedRectPath(x + unit * 2, y + unit * 2, unit * 3, unit * 3, [
        unit * 0.75,
        unit * 0.75,
        unit * 0.75,
        unit * 0.75,
      ]),
    ];
  }
  const outerRadius = style === "rounded" ? unit * 2 : 0;
  const innerRadius = style === "rounded" ? unit * 0.75 : 0;

  return [
    ringPath(x, y, outer, thickness, outerRadius),
    roundedRectPath(x + unit * 2, y + unit * 2, unit * 3, unit * 3, [
      innerRadius,
      innerRadius,
      innerRadius,
      innerRadius,
    ]),
  ];
}

function renderFinders(matrix: QrMatrix, options: QrOptions): string {
  return matrix.finderOrigins
    .flatMap(([row, col]) => renderFinder(options.finderStyle, row, col, options.moduleSize))
    .join("");
}

/**
 * Renders a QR code to a standalone SVG string. The output has no external
 * dependencies, so it can be inlined in HTML, written to a file, or rasterised
 * by resvg without further processing.
 */
export function renderQr(input: QrInput): RenderedQr {
  const options = resolve(input);
  const matrix = buildMatrix({
    data: options.data,
    ecc: options.ecc,
    margin: options.margin,
    logoRatio: options.logoRatio,
  });

  const dimension = matrix.size * options.moduleSize;
  const backgroundRadius = dimension * options.cornerRadius * 0.12;
  const modules = renderModules(matrix, options);
  const finders = renderFinders(matrix, options);

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}"`,
    ` viewBox="0 0 ${dimension} ${dimension}" shape-rendering="geometricPrecision">`,
    `<rect width="${dimension}" height="${dimension}" rx="${backgroundRadius.toFixed(2)}"`,
    ` fill="${escapeXml(options.background)}"/>`,
    `<path fill="${escapeXml(options.foreground)}" fill-rule="evenodd" d="${modules}${finders}"/>`,
    "</svg>",
  ].join("");

  return {
    svg,
    size: dimension,
    version: matrix.version,
    reservedModules: matrix.reserved.size,
  };
}
