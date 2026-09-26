import type { FigureBox } from "./types";

export interface Point {
  x: number;
  y: number;
}

export type CornerRadii = readonly [number, number, number, number];

type Segment =
  | { kind: "line"; to: Point }
  | { kind: "arc"; to: Point; radius: number; large: boolean; sweep: boolean }
  | { kind: "cubic"; c1: Point; c2: Point; to: Point };

interface Subpath {
  start: Point;
  segments: Segment[];
  closed: boolean;
}

const PRECISION = 3;
const CUBIC_SAMPLES = 16;

function format(value: number): string {
  return String(Number(value.toFixed(PRECISION)));
}

function pair(point: Point): string {
  return `${format(point.x)},${format(point.y)}`;
}

function samePoint(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
}

function cross(a: Point, b: Point): number {
  return a.x * b.y - b.x * a.y;
}

function cubicPoint(from: Point, c1: Point, c2: Point, to: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * from.x + b * c1.x + c * c2.x + d * to.x,
    y: a * from.y + b * c1.y + c * c2.y + d * to.y,
  };
}

function segmentArea(from: Point, segment: Segment): number {
  if (segment.kind === "line") return cross(from, segment.to) / 2;

  if (segment.kind === "arc") {
    const chord = Math.hypot(segment.to.x - from.x, segment.to.y - from.y);
    const radius = Math.max(segment.radius, chord / 2);
    const small = 2 * Math.asin(Math.min(1, chord / (2 * radius)));
    const angle = segment.large ? 2 * Math.PI - small : small;
    const bulge = ((radius * radius) / 2) * (angle - Math.sin(angle));
    return cross(from, segment.to) / 2 + (segment.sweep ? bulge : -bulge);
  }

  let area = 0;
  let previous = from;
  for (let step = 1; step <= CUBIC_SAMPLES; step += 1) {
    const next = cubicPoint(from, segment.c1, segment.c2, segment.to, step / CUBIC_SAMPLES);
    area += cross(previous, next) / 2;
    previous = next;
  }
  return area;
}

function explicitSegments(subpath: Subpath): Segment[] {
  const last = subpath.segments.at(-1)?.to ?? subpath.start;
  if (subpath.closed && !samePoint(last, subpath.start)) {
    return [...subpath.segments, { kind: "line", to: subpath.start }];
  }
  return subpath.segments;
}

function signedArea(subpath: Subpath): number {
  let area = 0;
  let from = subpath.start;
  for (const segment of explicitSegments(subpath)) {
    area += segmentArea(from, segment);
    from = segment.to;
  }
  return area;
}

function reverse(subpath: Subpath): Subpath {
  const segments = explicitSegments(subpath);
  const starts = [subpath.start, ...segments.map((segment) => segment.to)];
  const reversed: Segment[] = [];

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    const to = starts[index];
    if (!segment || !to) continue;

    if (segment.kind === "line") reversed.push({ kind: "line", to });
    else if (segment.kind === "arc") reversed.push({ ...segment, to, sweep: !segment.sweep });
    else reversed.push({ kind: "cubic", c1: segment.c2, c2: segment.c1, to });
  }

  return { start: starts.at(-1) ?? subpath.start, segments: reversed, closed: subpath.closed };
}

function serialize(subpath: Subpath): string {
  const parts = [`M${pair(subpath.start)}`];
  for (const segment of subpath.segments) {
    if (segment.kind === "line") parts.push(`L${pair(segment.to)}`);
    else if (segment.kind === "arc") {
      const radius = format(segment.radius);
      const flags = `0 ${segment.large ? 1 : 0} ${segment.sweep ? 1 : 0}`;
      parts.push(`A${radius},${radius} ${flags} ${pair(segment.to)}`);
    } else {
      parts.push(`C${pair(segment.c1)} ${pair(segment.c2)} ${pair(segment.to)}`);
    }
  }
  if (subpath.closed) parts.push("Z");
  return parts.join("");
}

/**
 * Collects SVG path commands in absolute coordinates. Every point passes
 * through an optional rotation about `center` (radians, clockwise in SVG
 * y-down space), so figures can be drawn upright and turned without a
 * `transform` attribute. Relative helpers (`lineBy`, `arcBy`, `cubicBy`)
 * work in the unrotated frame, like lowercase SVG commands.
 */
export class PathBuilder {
  private readonly subpaths: Subpath[] = [];
  private readonly cos: number;
  private readonly sin: number;
  private cursor: Point = { x: 0, y: 0 };
  private origin: Point = { x: 0, y: 0 };

  constructor(
    private readonly rotation = 0,
    private readonly center: Point = { x: 0, y: 0 },
  ) {
    this.cos = Math.cos(rotation);
    this.sin = Math.sin(rotation);
  }

  private turn(point: Point): Point {
    if (this.rotation === 0) return point;
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    return {
      x: this.center.x + dx * this.cos - dy * this.sin,
      y: this.center.y + dx * this.sin + dy * this.cos,
    };
  }

  private push(segment: Segment, cursor: Point): this {
    const current = this.subpaths.at(-1);
    if (!current || current.closed) {
      this.subpaths.push({ start: this.turn(this.cursor), segments: [], closed: false });
    }
    this.subpaths.at(-1)?.segments.push(segment);
    this.cursor = cursor;
    return this;
  }

  moveTo(x: number, y: number): this {
    this.cursor = { x, y };
    this.origin = { x, y };
    this.subpaths.push({ start: this.turn(this.cursor), segments: [], closed: false });
    return this;
  }

  lineTo(x: number, y: number): this {
    if (samePoint(this.cursor, { x, y })) return this;
    return this.push({ kind: "line", to: this.turn({ x, y }) }, { x, y });
  }

  lineBy(dx: number, dy: number): this {
    return this.lineTo(this.cursor.x + dx, this.cursor.y + dy);
  }

  /** `sweep: true` bends clockwise, matching the SVG sweep flag. */
  arcTo(x: number, y: number, radius: number, sweep: boolean, large = false): this {
    if (radius <= 0) return this.lineTo(x, y);
    return this.push({ kind: "arc", to: this.turn({ x, y }), radius, large, sweep }, { x, y });
  }

  arcBy(dx: number, dy: number, radius: number, sweep: boolean, large = false): this {
    return this.arcTo(this.cursor.x + dx, this.cursor.y + dy, radius, sweep, large);
  }

  cubicTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this {
    return this.push(
      {
        kind: "cubic",
        c1: this.turn({ x: c1x, y: c1y }),
        c2: this.turn({ x: c2x, y: c2y }),
        to: this.turn({ x, y }),
      },
      { x, y },
    );
  }

  cubicBy(c1x: number, c1y: number, c2x: number, c2y: number, dx: number, dy: number): this {
    const { x, y } = this.cursor;
    return this.cubicTo(x + c1x, y + c1y, x + c2x, y + c2y, x + dx, y + dy);
  }

  close(): this {
    const current = this.subpaths.at(-1);
    if (current) current.closed = true;
    this.cursor = this.origin;
    return this;
  }

  polygon(points: readonly Point[]): this {
    points.forEach((point, index) => {
      if (index === 0) this.moveTo(point.x, point.y);
      else this.lineTo(point.x, point.y);
    });
    return this.close();
  }

  rect(x: number, y: number, width: number, height: number): this {
    return this.roundedRect(x, y, width, height, [0, 0, 0, 0]);
  }

  /** Radii go clockwise from the top-left corner and are clamped to half the short side. */
  roundedRect(x: number, y: number, width: number, height: number, radii: CornerRadii): this {
    const limit = Math.min(width, height) / 2;
    const [tl = 0, tr = 0, br = 0, bl = 0] = radii.map((radius) =>
      Math.max(0, Math.min(radius, limit)),
    );
    const right = x + width;
    const bottom = y + height;

    return this.moveTo(x + tl, y)
      .lineTo(right - tr, y)
      .arcTo(right, y + tr, tr, true)
      .lineTo(right, bottom - br)
      .arcTo(right - br, bottom, br, true)
      .lineTo(x + bl, bottom)
      .arcTo(x, bottom - bl, bl, true)
      .lineTo(x, y + tl)
      .arcTo(x + tl, y, tl, true)
      .close();
  }

  circle(cx: number, cy: number, radius: number): this {
    return this.moveTo(cx, cy - radius)
      .arcTo(cx, cy + radius, radius, true)
      .arcTo(cx, cy - radius, radius, true)
      .close();
  }

  toString(): string {
    return this.subpaths.map(serialize).join("");
  }

  /**
   * Serializes the first subpath clockwise and the rest counter-clockwise.
   * A ring drawn as outer contour plus inner contour then keeps its hole
   * under both `evenodd` and `nonzero`.
   */
  toOutline(): string {
    return this.subpaths
      .map((subpath, index) => {
        const clockwise = signedArea(subpath) >= 0;
        return clockwise === (index === 0) ? subpath : reverse(subpath);
      })
      .map(serialize)
      .join("");
  }

  /** Serializes with every closed subpath turned to wind clockwise, for `fill-rule: nonzero` unions. */
  toClockwise(): string {
    return this.subpaths
      .map((subpath) => (subpath.closed && signedArea(subpath) < 0 ? reverse(subpath) : subpath))
      .map(serialize)
      .join("");
  }
}

/** Starts a path whose rotation pivots on the center of `box`. */
export function createPath(box?: FigureBox, rotation = 0): PathBuilder {
  if (!box) return new PathBuilder();
  return new PathBuilder(rotation, { x: box.x + box.size / 2, y: box.y + box.size / 2 });
}
