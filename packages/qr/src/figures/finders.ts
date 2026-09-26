/*!
 * Figures ported from liquid-js/qr-code-styling (MIT).
 * Copyright (c) 2019 Denys Kozak. Copyright (c) 2023 Liquid-JS.
 * See THIRD_PARTY_NOTICES.md.
 */

import {
  circle,
  classy,
  drawElement,
  heart,
  inpoint,
  polygon,
  roundedSquare,
  square,
  type Element,
} from "./elements";
import { createPath, type CornerRadii, type PathBuilder } from "./path";
import type { FigureBox, FinderFigure } from "./types";

function ring(
  outer: (path: PathBuilder, box: FigureBox, unit: number) => PathBuilder,
  inner: (path: PathBuilder, box: FigureBox, unit: number) => PathBuilder,
  rotates = false,
): FinderFigure {
  return ({ x, y, size, rotation }) => {
    const unit = size / 7;
    const path = createPath({ x, y, size }, rotates ? rotation : 0);
    outer(path, { x, y, size }, unit);
    inner(path, { x: x + unit, y: y + unit, size: size - 2 * unit }, unit);
    return path.toOutline();
  };
}

function corners(radii: (unit: number) => CornerRadii) {
  return (path: PathBuilder, { x, y, size }: FigureBox, unit: number) =>
    path.roundedRect(x, y, size, size, radii(unit));
}

const inpointRing = ring(
  corners((unit) => [2.5 * unit, 2.5 * unit, 0, 2.5 * unit]),
  corners((unit) => [1.5 * unit, 1.5 * unit, 0, 1.5 * unit]),
  true,
);

/**
 * Outer finder rings, drawn into a 7x7 module box. Each returns an outer
 * contour and an inner contour, meant for `fill-rule="evenodd"`.
 *
 * `rotation` follows liquid-js: 0 for the top-left finder, `Math.PI / 2` for
 * top-right and `-Math.PI / 2` for bottom-left, clockwise about the box
 * center. Only `classy`, `inpoint` and `outpoint` use it; the rest are
 * symmetric. `rounded` is kyuar's former `rounded` finder; kyuar's `circle`
 * and `ring` finders use `dot` here.
 */
export const FINDER_OUTER_FIGURES = {
  dot: ring(circle, circle),
  square: ring(
    (path, box) => square(path, box),
    (path, box) => square(path, box),
  ),
  "extra-rounded": ring(
    corners((unit) => [2.5 * unit, 2.5 * unit, 2.5 * unit, 2.5 * unit]),
    corners((unit) => [1.5 * unit, 1.5 * unit, 1.5 * unit, 1.5 * unit]),
  ),
  classy: ring(
    corners((unit) => [0, 2.5 * unit, 0, 2.5 * unit]),
    corners((unit) => [0, 1.5 * unit, 0, 1.5 * unit]),
    true,
  ),
  inpoint: inpointRing,
  outpoint: (args) => inpointRing({ ...args, rotation: args.rotation + Math.PI }),
  "center-circle": ({ x, y, size }) =>
    createPath()
      .rect(x, y, size, size)
      .circle(x + size / 2, y + size / 2, size / 2.5)
      .toOutline(),
  rounded: ring(
    corners((unit) => [2 * unit, 2 * unit, 2 * unit, 2 * unit]),
    corners((unit) => [unit, unit, unit, unit]),
  ),
} as const satisfies Record<string, FinderFigure>;

export type FinderOuterShape = keyof typeof FINDER_OUTER_FIGURES;

function fixed(element: Element): FinderFigure {
  return ({ x, y, size }) => drawElement(element, { x, y, size });
}

function turned(element: Element, offset = 0): FinderFigure {
  return ({ x, y, size, rotation }) => drawElement(element, { x, y, size }, rotation + offset);
}

/**
 * Inner finder eyes, drawn into a 3x3 module box, one contour each, for
 * `fill-rule="nonzero"`. `rotation` follows the same convention as
 * {@link FINDER_OUTER_FIGURES}. `classy`, `inpoint` and `outpoint` turn with
 * it; `diamond` is always turned by 45 degrees; `heart` and the polygons
 * stay upright, as in liquid-js. `extra-rounded` is also kyuar's former
 * rounded eye. liquid-js `star` is left out because decoders fail to find a
 * finder with a star eye.
 */
export const FINDER_INNER_FIGURES = {
  dot: fixed(circle),
  square: fixed(square),
  heart: fixed(heart),
  "extra-rounded": fixed((path, box) => roundedSquare(path, box, box.size / 4)),
  classy: turned(classy),
  inpoint: turned(inpoint),
  outpoint: turned(inpoint, Math.PI),
  pentagon: fixed(polygon(5)),
  hexagon: fixed(polygon(6)),
  octagon: fixed(polygon(8)),
  diamond: ({ x, y, size }) =>
    drawElement(
      (path, box) => square(path, box, box.size * 0.85, box.size * 0.85),
      { x, y, size },
      Math.PI / 4,
    ),
} as const satisfies Record<string, FinderFigure>;

export type FinderInnerShape = keyof typeof FINDER_INNER_FIGURES;
