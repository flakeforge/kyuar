import { ModuleKind, type QrMatrix } from "../matrix-types";

export interface GrayImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface HalftoneOptions {
  image: GrayImage;
  /** Multiplier around mid gray. 1 keeps the image, 0 flattens it. Default 1. */
  contrast?: number;
  /** Offset as a fraction of the full range, from -1 to 1. Default 0. */
  brightness?: number;
  /** Width of the center sub-module as a fraction of the module, from 0.1 to 0.9. Default 1/3. */
  centerRatio?: number;
}

const SUB = 3;
const THRESHOLD = 128;
const ERROR_LIMIT = 128;
const DEFAULT_CENTER_RATIO = 1 / 3;

interface AxisWeights {
  start: Int32Array;
  count: Int32Array;
  index: Int32Array;
  weight: Float64Array;
}

function axisWeights(cells: number, sourceLength: number, scale: number): AxisWeights {
  const visible = cells / scale;
  const origin = (sourceLength - visible) / 2;
  const start = new Int32Array(cells);
  const count = new Int32Array(cells);
  const indices: number[] = [];
  const weights: number[] = [];
  for (let cell = 0; cell < cells; cell++) {
    const from = origin + cell / scale;
    const to = origin + (cell + 1) / scale;
    start[cell] = indices.length;
    for (let pixel = Math.floor(from); pixel < to; pixel++) {
      const overlap = Math.min(to, pixel + 1) - Math.max(from, pixel);
      if (overlap <= 0) continue;
      indices.push(Math.min(sourceLength - 1, Math.max(0, pixel)));
      weights.push(overlap);
    }
    count[cell] = indices.length - (start[cell] ?? 0);
  }
  return {
    start,
    count,
    index: Int32Array.from(indices),
    weight: Float64Array.from(weights),
  };
}

function assertImage(image: GrayImage): void {
  const { width, height, data } = image;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError("Halftone image must have positive integer dimensions.");
  }
  if (data.length < width * height) {
    throw new RangeError("Halftone image data is shorter than width * height.");
  }
}

function resampleCover(image: GrayImage, cells: number): Float64Array {
  assertImage(image);
  const scale = Math.max(cells / image.width, cells / image.height);
  const columns = axisWeights(cells, image.width, scale);
  const rows = axisWeights(cells, image.height, scale);
  const out = new Float64Array(cells * cells);
  for (let y = 0; y < cells; y++) {
    const rowStart = rows.start[y] ?? 0;
    const rowCount = rows.count[y] ?? 0;
    for (let x = 0; x < cells; x++) {
      const columnStart = columns.start[x] ?? 0;
      const columnCount = columns.count[x] ?? 0;
      let sum = 0;
      let total = 0;
      for (let r = rowStart; r < rowStart + rowCount; r++) {
        const rowOffset = (rows.index[r] ?? 0) * image.width;
        const rowWeight = rows.weight[r] ?? 0;
        for (let c = columnStart; c < columnStart + columnCount; c++) {
          const weight = rowWeight * (columns.weight[c] ?? 0);
          sum += (image.data[rowOffset + (columns.index[c] ?? 0)] ?? 0) * weight;
          total += weight;
        }
      }
      out[y * cells + x] = total > 0 ? sum / total : 255;
    }
  }
  return out;
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function adjustTone(values: Float64Array, contrast: number, brightness: number): void {
  const offset = brightness * 255;
  for (let i = 0; i < values.length; i++) {
    const adjusted = ((values[i] ?? 0) - 128) * contrast + 128 + offset;
    values[i] = Math.min(255, Math.max(0, adjusted));
  }
}

function forcedValues(matrix: QrMatrix): Int8Array {
  const cells = matrix.size * SUB;
  const forced = new Int8Array(cells * cells).fill(-1);
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      const value = matrix.isDark(row, col) ? 1 : 0;
      if (matrix.kind(row, col) === ModuleKind.Data) {
        forced[(row * SUB + 1) * cells + col * SUB + 1] = value;
        continue;
      }
      for (let dy = 0; dy < SUB; dy++) {
        forced.fill(
          value,
          (row * SUB + dy) * cells + col * SUB,
          (row * SUB + dy) * cells + col * SUB + SUB,
        );
      }
    }
  }
  return forced;
}

function diffuse(values: Float64Array, forced: Int8Array, cells: number): Uint8Array {
  const out = new Uint8Array(cells * cells);
  const spread = (x: number, y: number, amount: number) => {
    if (x < 0 || x >= cells || y >= cells) return;
    const i = y * cells + x;
    const next = (values[i] ?? 0) + amount;
    values[i] = Math.min(255 + ERROR_LIMIT, Math.max(-ERROR_LIMIT, next));
  };
  for (let y = 0; y < cells; y++) {
    const forward = y % 2 === 0;
    const step = forward ? 1 : -1;
    for (let n = 0; n < cells; n++) {
      const x = forward ? n : cells - 1 - n;
      const i = y * cells + x;
      const value = values[i] ?? 0;
      const pinned = forced[i] ?? -1;
      const dark = pinned === -1 ? value < THRESHOLD : pinned === 1;
      out[i] = dark ? 1 : 0;
      const error = value - (dark ? 0 : 255);
      spread(x + step, y, (error * 7) / 16);
      spread(x - step, y + 1, (error * 3) / 16);
      spread(x, y + 1, (error * 5) / 16);
      spread(x + step, y + 1, error / 16);
    }
  }
  return out;
}

/**
 * Returns a (size * 3)^2 grid, row-major, where 1 is a dark sub-module.
 * The center sub-module of every Data module equals the module value.
 * Every sub-module of a function pattern module equals the module value.
 * The other sub-modules are an error-diffused rendering of the image.
 */
export function halftoneGrid(matrix: QrMatrix, options: HalftoneOptions): Uint8Array {
  const cells = matrix.size * SUB;
  const values = resampleCover(options.image, cells);
  adjustTone(
    values,
    Math.max(0, finiteOr(options.contrast, 1)),
    Math.min(1, Math.max(-1, finiteOr(options.brightness, 0))),
  );
  return diffuse(values, forcedValues(matrix), cells);
}

function formatNumber(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

/**
 * Builds SVG path data for the dark sub-modules of Data modules only.
 * Function pattern modules are left to the caller. Adjacent dark sub-modules in
 * the same sub-row are merged into one clockwise rectangle.
 */
export function halftonePath(
  matrix: QrMatrix,
  options: HalftoneOptions,
  moduleSize: number,
  offset: { x: number; y: number },
): { dark: string } {
  if (!Number.isFinite(moduleSize) || moduleSize <= 0) {
    throw new RangeError("moduleSize must be a positive finite number.");
  }
  const grid = halftoneGrid(matrix, options);
  const cells = matrix.size * SUB;
  const center = Math.min(0.9, Math.max(0.1, finiteOr(options.centerRatio, DEFAULT_CENTER_RATIO)));
  const side = (1 - center) / 2;
  const edges = [0, side, side + center, 1];
  const originX = finiteOr(offset.x, 0);
  const originY = finiteOr(offset.y, 0);
  const edge = (cell: number, end: 0 | 1) =>
    Math.floor(cell / SUB) * moduleSize + (edges[(cell % SUB) + end] ?? 0) * moduleSize;
  const isData = new Uint8Array(matrix.size * matrix.size);
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      isData[row * matrix.size + col] = matrix.kind(row, col) === ModuleKind.Data ? 1 : 0;
    }
  }
  const drawn = (x: number, y: number) =>
    grid[y * cells + x] === 1 &&
    isData[Math.floor(y / SUB) * matrix.size + Math.floor(x / SUB)] === 1;
  const parts: string[] = [];
  for (let y = 0; y < cells; y++) {
    const top = originY + edge(y, 0);
    const height = edge(y, 1) - edge(y, 0);
    let x = 0;
    while (x < cells) {
      if (!drawn(x, y)) {
        x++;
        continue;
      }
      const runStart = x;
      while (x < cells && drawn(x, y)) x++;
      const left = originX + edge(runStart, 0);
      const width = edge(x - 1, 1) - edge(runStart, 0);
      parts.push(
        `M${formatNumber(left)} ${formatNumber(top)}h${formatNumber(width)}v${formatNumber(height)}h${formatNumber(-width)}z`,
      );
    }
  }
  return { dark: parts.join("") };
}

/**
 * Converts RGBA pixels to Rec. 709 luma. Alpha is composited over `background`,
 * which defaults to white.
 */
export function toGrayImage(
  rgba: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  background: [number, number, number] = [255, 255, 255],
): GrayImage {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError("Image must have positive integer dimensions.");
  }
  if (rgba.length < width * height * 4) {
    throw new RangeError("RGBA data is shorter than width * height * 4.");
  }
  const [backgroundR, backgroundG, backgroundB] = background;
  const data = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i++) {
    const alpha = (rgba[i * 4 + 3] ?? 255) / 255;
    const r = (rgba[i * 4] ?? 0) * alpha + backgroundR * (1 - alpha);
    const g = (rgba[i * 4 + 1] ?? 0) * alpha + backgroundG * (1 - alpha);
    const b = (rgba[i * 4 + 2] ?? 0) * alpha + backgroundB * (1 - alpha);
    data[i] = Math.round(Math.min(255, Math.max(0, 0.2126 * r + 0.7152 * g + 0.0722 * b)));
  }
  return { width, height, data };
}
