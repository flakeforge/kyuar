/*!
 * Figures ported from liquid-js/qr-code-styling (MIT).
 * Copyright (c) 2019 Denys Kozak. Copyright (c) 2023 Liquid-JS.
 * See THIRD_PARTY_NOTICES.md.
 */

import { createPath, type PathBuilder } from "./path";
import type { FigureBox } from "./types";

export type Element = (path: PathBuilder, box: FigureBox) => PathBuilder;

type BlobCorner = "round" | "out" | "square";

export interface BlobCorners {
  tl: BlobCorner;
  tr: BlobCorner;
  br: BlobCorner;
  bl: BlobCorner;
}

/** Draws `element` into `box`, turned by `rotation` about the center of `pivot`. */
export function drawElement(
  element: Element,
  box: FigureBox,
  rotation = 0,
  pivot: FigureBox = box,
): string {
  return element(createPath(pivot, rotation), box).toClockwise();
}

export function circle(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  return path.circle(x + size / 2, y + size / 2, size / 2);
}

export function square(
  path: PathBuilder,
  { x, y, size }: FigureBox,
  width = size,
  height = size,
): PathBuilder {
  return path.rect(x + (size - width) / 2, y + (size - height) / 2, width, height);
}

export function roundedSquare(
  path: PathBuilder,
  { x, y, size }: FigureBox,
  radius: number,
): PathBuilder {
  return path.roundedRect(x, y, size, size, [radius, radius, radius, radius]);
}

export function sideRounded(
  path: PathBuilder,
  { x, y, size }: FigureBox,
  height = size,
): PathBuilder {
  return path
    .moveTo(x, y + (size - height) / 2)
    .lineBy(0, height)
    .lineBy(size / 2, 0)
    .arcBy(0, -height, height / 2, false)
    .close();
}

export function cornerRounded(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  return path
    .moveTo(x, y)
    .lineBy(0, size)
    .lineBy(size, 0)
    .lineBy(0, -size / 2)
    .arcBy(-size / 2, -size / 2, size / 2, false)
    .close();
}

export function cornerExtraRounded(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  return path.moveTo(x, y).lineBy(0, size).lineBy(size, 0).arcBy(-size, -size, size, false).close();
}

export function classyDot(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  return path
    .moveTo(x, y)
    .lineBy(0, size / 2)
    .arcBy(size / 2, size / 2, size / 2, false)
    .lineBy(size / 2, 0)
    .lineBy(0, -size / 2)
    .arcBy(-size / 2, -size / 2, size / 2, false)
    .close();
}

export function wave(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  const a1 = (5 * Math.PI) / 180;
  const a2 = (65 * Math.PI) / 180;
  const s1 = 0.95;
  const s2 = 0.65;

  const c23x = size * (1 - s2 * Math.sin(a1));
  const c23y = -size * (s1 - s2 * Math.cos(a1));
  const c31x = (-size * Math.sin(a2)) / 2;
  const c31y = (size * Math.cos(a2)) / 2;

  return path
    .moveTo(x, y + size)
    .cubicBy(size * s2, 0, c23x, c23y, size, -size * s1)
    .cubicBy(c31x, c31y, -size / 2, size * (s1 - 1), -size, size * (s1 - 1))
    .close();
}

const HEART_CURVES = [
  [-0.00086, 0.15702, -0.10534, 0.26323, -0.21876, 0.38123],
  [-0.06736, 0.06834, -0.18938, 0.17948, -0.28124, 0.26126],
  [-0.09188, -0.08178, -0.2139, -0.19292, -0.28124, -0.26126],
  [-0.11344, -0.118, -0.2179, -0.22422, -0.21876, -0.38123],
  [-0.00096, -0.27136, 0.33154, -0.36842, 0.5, -0.17],
  [0.16844, -0.19842, 0.50094, -0.10136, 0.5, 0.17],
] as const;

export function heart(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  path.moveTo(x + size, y + 0.31629 * size);
  for (const [c1x, c1y, c2x, c2y, dx, dy] of HEART_CURVES) {
    path.cubicBy(c1x * size, c1y * size, c2x * size, c2y * size, dx * size, dy * size);
  }
  return path.close();
}

export interface StarOptions {
  spikes?: number;
  outerRadius?: number;
  innerRadius?: number;
}

export function star(
  path: PathBuilder,
  { x, y, size }: FigureBox,
  { spikes = 5, outerRadius = size / 2, innerRadius = size / 4 }: StarOptions = {},
): PathBuilder {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const angle = Math.PI / spikes;
  const points = Array.from({ length: Math.floor(2 * spikes) }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    return {
      x: cx + radius * Math.sin(index * angle),
      y: cy - radius * Math.cos(index * angle),
    };
  });
  return path.polygon(points);
}

export function polygon(sides: number): Element {
  const spikes = sides / 2;
  const radiusRatio = sides === 8 ? Math.cos(Math.PI / 8) / 2 : 1 / 2;
  return (path, box) =>
    star(path, box, {
      spikes,
      outerRadius: box.size * radiusRatio,
      innerRadius: box.size * radiusRatio,
    });
}

export function weave(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  const thickness = size * 0.6;
  const notch = (size - thickness) / 2;

  return path
    .moveTo(x + notch, y)
    .lineBy(thickness, 0)
    .lineBy(0, notch)
    .lineBy(notch, 0)
    .lineBy(0, thickness)
    .lineBy(-notch, 0)
    .lineBy(0, notch)
    .lineBy(-thickness, 0)
    .lineBy(0, -notch)
    .lineBy(-notch, 0)
    .lineBy(0, -thickness)
    .lineBy(notch, 0)
    .close();
}

export function blob(
  path: PathBuilder,
  { x, y, size }: FigureBox,
  corners: BlobCorners,
): PathBuilder {
  const unit = size / 7;
  const radius = 2.5 * unit;
  path.moveTo(x, y + radius);

  let length = 2 * unit;

  if (corners.bl === "round") {
    path.lineBy(0, length).arcBy(radius, radius, radius, false);
    length = 2 * unit;
  } else if (corners.bl === "out") {
    path.lineBy(0, 5 * unit + length).arcBy(radius, -radius, radius, true);
    length = 2 * unit;
  } else {
    path.lineBy(0, radius + length);
    length = 4.5 * unit;
  }

  if (corners.br === "round") {
    path.lineBy(length, 0).arcBy(radius, -radius, radius, false);
    length = -2 * unit;
  } else if (corners.br === "out") {
    path.lineBy(5 * unit + length, 0).arcBy(-radius, -radius, radius, true);
    length = -2 * unit;
  } else {
    path.lineBy(radius + length, 0);
    length = -4.5 * unit;
  }

  if (corners.tr === "round") {
    path.lineBy(0, length).arcBy(-radius, -radius, radius, false);
    length = -2 * unit;
  } else if (corners.tr === "out") {
    path.lineBy(0, -5 * unit + length).arcBy(-radius, radius, radius, true);
    length = -2 * unit;
  } else {
    path.lineBy(0, -radius + length);
    length = -4.5 * unit;
  }

  if (corners.tl === "round") {
    path.lineBy(length, 0).arcBy(-radius, radius, radius, false);
  } else if (corners.tl === "out") {
    path.lineBy(-5 * unit + length, 0).arcBy(radius, radius, radius, true);
  } else {
    path.lineBy(-radius + length, 0);
  }

  return path.close();
}

export function circuit(path: PathBuilder, { x, y, size }: FigureBox, left = false): PathBuilder {
  const offset = 0.17 ** 0.5 * size;
  const radius = 0.4 * size;

  path
    .moveTo(x + size * 0.4, y + size * 0.5 - offset)
    .arcBy(
      left ? size * 0.1 - offset : -0.3 * size,
      left ? offset - 0.1 * size : offset,
      radius,
      false,
    );

  if (left) {
    path
      .lineBy(-0.65 * size, 0)
      .lineBy(0, 0.2 * size)
      .lineBy(0.65 * size, 0)
      .arcBy(offset, 0.3 * size, radius, false);
  } else {
    path.arcBy(0.4 * size, 0.4 * size, radius, false);
  }

  return path
    .arcBy(0.4 * size, -0.4 * size, radius, false)
    .arcBy(-0.3 * size, -offset, radius, false)
    .lineBy(0, -0.65 * size)
    .lineBy(-0.2 * size, 0)
    .close();
}

export function classy(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  const radius = (size * 2.5) / 7;
  return path.roundedRect(x, y, size, size, [0, radius, 0, radius]);
}

export function inpoint(path: PathBuilder, { x, y, size }: FigureBox): PathBuilder {
  const radius = size / 4;
  return path.roundedRect(x, y, size, size, [radius, radius, 0, radius]);
}
