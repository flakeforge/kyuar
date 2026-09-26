import { describe, expect, it } from "vitest";

import { DOT_FIGURES, type DotShape } from "./dots";
import { FINDER_INNER_FIGURES, FINDER_OUTER_FIGURES } from "./finders";
import { createPath } from "./path";
import type { DotFigureArgs, FigureBox, FinderFigure } from "./types";

interface Point {
  x: number;
  y: number;
}

interface Contour {
  points: Point[];
  closed: boolean;
}

const VALID_PATH = /^(?:[MLACZ]|-?\d+(?:\.\d+)?|[ ,])+$/;
const ARC_STEPS = 24;
const CUBIC_STEPS = 24;

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function arcPoints(from: Point, to: Point, radius: number, large: boolean, sweep: boolean) {
  const hx = (from.x - to.x) / 2;
  const hy = (from.y - to.y) / 2;
  const half = Math.hypot(hx, hy);
  const r = Math.max(radius, half);
  const factor =
    (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, (r * r - half * half) / (half * half)));
  const cx = factor * hy + (from.x + to.x) / 2;
  const cy = -factor * hx + (from.y + to.y) / 2;
  const start = Math.atan2(from.y - cy, from.x - cx);
  let delta = Math.atan2(to.y - cy, to.x - cx) - start;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  if (!sweep && delta > 0) delta -= 2 * Math.PI;

  return Array.from({ length: ARC_STEPS }, (_, index) => {
    const angle = start + (delta * (index + 1)) / ARC_STEPS;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

function flatten(d: string): Contour[] {
  const tokens = d.match(/[MLACZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const contours: Contour[] = [];
  let index = 0;
  let current: Contour | undefined;
  let cursor: Point = { x: 0, y: 0 };
  const read = () => Number(tokens[index++]);

  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === "M") {
      cursor = { x: read(), y: read() };
      current = { points: [cursor], closed: false };
      contours.push(current);
    } else if (command === "L") {
      cursor = { x: read(), y: read() };
      current?.points.push(cursor);
    } else if (command === "A") {
      const radius = read();
      read();
      read();
      const large = read() === 1;
      const sweep = read() === 1;
      const to = { x: read(), y: read() };
      current?.points.push(...arcPoints(cursor, to, radius, large, sweep));
      cursor = to;
    } else if (command === "C") {
      const c1 = { x: read(), y: read() };
      const c2 = { x: read(), y: read() };
      const to = { x: read(), y: read() };
      const from = cursor;
      for (let step = 1; step <= CUBIC_STEPS; step += 1) {
        const t = step / CUBIC_STEPS;
        const u = 1 - t;
        current?.points.push({
          x: u ** 3 * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * to.x,
          y: u ** 3 * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * to.y,
        });
      }
      cursor = to;
    } else if (command === "Z" && current) {
      current.closed = true;
      cursor = current.points[0] ?? cursor;
    } else {
      throw new Error(`Unexpected token ${command}`);
    }
  }

  return contours;
}

function area({ points }: Contour): number {
  let sum = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length] ?? point;
    sum += point.x * next.y - next.x * point.y;
  });
  return sum / 2;
}

function bounds(contours: Contour[]) {
  const points = contours.flatMap((contour) => contour.points);
  return {
    left: Math.min(...points.map((point) => point.x)),
    right: Math.max(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    bottom: Math.max(...points.map((point) => point.y)),
  };
}

function expectValid(d: string) {
  expect(d.length).toBeGreaterThan(0);
  expect(d).toMatch(VALID_PATH);
  expect(d).not.toMatch(/NaN|Infinity/);
  const contours = flatten(d);
  expect(contours.length).toBeGreaterThan(0);
  for (const contour of contours) expect(contour.closed).toBe(true);
  return contours;
}

function expectInside(contours: Contour[], box: FigureBox, tolerance: number) {
  const limit = box.size * tolerance + 0.01;
  const { left, right, top, bottom } = bounds(contours);
  expect(left).toBeGreaterThanOrEqual(box.x - limit);
  expect(top).toBeGreaterThanOrEqual(box.y - limit);
  expect(right).toBeLessThanOrEqual(box.x + box.size + limit);
  expect(bottom).toBeLessThanOrEqual(box.y + box.size + limit);
}

const OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

function dotArgs(mask: number, box: FigureBox = { x: 20, y: 40, size: 10 }): DotFigureArgs {
  return {
    ...box,
    neighbor: (dx, dy) => {
      const bit = OFFSETS.findIndex(([ox, oy]) => ox === dx && oy === dy);
      return bit >= 0 && (mask & (1 << bit)) !== 0;
    },
    random: seeded(mask * 7919 + 13),
  };
}

const REACHING_SHAPES = new Set<DotShape>(["circuit", "blobs", "soft"]);
const DOT_SHAPES = Object.keys(DOT_FIGURES) as DotShape[];
const MASKS = Array.from({ length: 256 }, (_, mask) => mask);

describe("dot figures", () => {
  it("covers every liquid-js dot type and kyuar's module styles", () => {
    expect(DOT_SHAPES).toHaveLength(29);
  });

  it.each(DOT_SHAPES)("%s is valid, clockwise and inside its box", (shape) => {
    const figure = DOT_FIGURES[shape];
    for (const mask of MASKS) {
      const args = dotArgs(mask);
      const contours = expectValid(figure(args));
      for (const contour of contours) expect(area(contour)).toBeGreaterThan(0);
      expectInside(contours, args, REACHING_SHAPES.has(shape) ? 0.7 : 0.15);
    }
  });

  it.each(DOT_SHAPES)("%s is deterministic for a fixed random", (shape) => {
    const figure = DOT_FIGURES[shape];
    for (const mask of MASKS) {
      expect(figure(dotArgs(mask))).toBe(figure(dotArgs(mask)));
    }
  });

  it("uses random for random-dot", () => {
    const outputs = new Set(MASKS.map((mask) => DOT_FIGURES["random-dot"](dotArgs(mask))));
    expect(outputs.size).toBeGreaterThan(1);
  });

  it("draws fluid with the same area as rounded", () => {
    for (const mask of MASKS) {
      const fluid = flatten(DOT_FIGURES.fluid(dotArgs(mask)));
      const rounded = flatten(DOT_FIGURES.rounded(dotArgs(mask)));
      const sum = (contours: Contour[]) => contours.reduce((total, c) => total + area(c), 0);
      expect(Math.abs(sum(fluid) - sum(rounded))).toBeLessThan(sum(rounded) * 0.01);
    }
  });

  it("joins horizontal lines along rows", () => {
    const args = dotArgs(0b00011000);
    expect(bounds(flatten(DOT_FIGURES["horizontal-line"](args)))).toEqual(
      bounds(flatten(DOT_FIGURES.square(args))),
    );
  });
});

const ROTATIONS = [0, Math.PI / 2, -Math.PI / 2];
const OUTER_BOX: FigureBox = { x: 7, y: 14, size: 70 };
const INNER_BOX: FigureBox = { x: 27, y: 34, size: 30 };

function checkFinders(
  figures: Record<string, FinderFigure>,
  box: FigureBox,
  asymmetric: readonly string[],
  tolerance: number,
) {
  it.each(Object.keys(figures))("%s is valid and inside its box", (shape) => {
    const figure = figures[shape];
    if (!figure) throw new Error(shape);
    for (const rotation of ROTATIONS) {
      const contours = expectValid(figure({ ...box, rotation }));
      expectInside(contours, box, tolerance);
    }
  });

  it.each(asymmetric)("%s turns with rotation", (shape) => {
    const figure = figures[shape];
    if (!figure) throw new Error(shape);
    const upright = figure({ ...box, rotation: 0 });
    const turned = figure({ ...box, rotation: Math.PI / 2 });
    expect(turned).not.toBe(upright);
    const a = bounds(flatten(upright));
    const b = bounds(flatten(turned));
    expect(b.left).toBeCloseTo(a.left, 1);
    expect(b.bottom).toBeCloseTo(a.bottom, 1);
  });
}

describe("finder outer figures", () => {
  checkFinders(FINDER_OUTER_FIGURES, OUTER_BOX, ["classy", "inpoint", "outpoint"], 0.01);

  it.each(Object.keys(FINDER_OUTER_FIGURES))("%s is a clockwise outline with a hole", (shape) => {
    const figure = FINDER_OUTER_FIGURES[shape as keyof typeof FINDER_OUTER_FIGURES];
    const [outer, inner, ...rest] = flatten(figure({ ...OUTER_BOX, rotation: 0 }));
    expect(rest).toHaveLength(0);
    if (!outer || !inner) throw new Error(shape);
    expect(area(outer)).toBeGreaterThan(0);
    expect(area(inner)).toBeLessThan(0);
  });

  it("points outpoint away from inpoint", () => {
    const inpoint = FINDER_OUTER_FIGURES.inpoint({ ...OUTER_BOX, rotation: Math.PI });
    const outpoint = FINDER_OUTER_FIGURES.outpoint({ ...OUTER_BOX, rotation: 0 });
    expect(outpoint).toBe(inpoint);
  });
});

describe("finder inner figures", () => {
  checkFinders(FINDER_INNER_FIGURES, INNER_BOX, ["classy", "inpoint", "outpoint"], 0.11);

  it("keeps heart and polygons upright", () => {
    for (const shape of ["heart", "pentagon", "octagon"] as const) {
      const figure = FINDER_INNER_FIGURES[shape];
      expect(figure({ ...INNER_BOX, rotation: Math.PI / 2 })).toBe(
        figure({ ...INNER_BOX, rotation: 0 }),
      );
    }
  });
});

describe("path builder", () => {
  it("rotates clockwise about the box center and rounds to 3 decimals", () => {
    const d = createPath({ x: 0, y: 0, size: 2 }, Math.PI / 2)
      .moveTo(2, 1)
      .lineTo(1.23456, 1)
      .toString();
    expect(d).toBe("M1,2L1,1.235");
  });

  it("reverses counter-clockwise contours on request", () => {
    const d = createPath().moveTo(0, 0).lineTo(0, 1).lineTo(1, 1).close().toClockwise();
    const [contour] = flatten(d);
    if (!contour) throw new Error("empty");
    expect(area(contour)).toBeGreaterThan(0);
  });
});
