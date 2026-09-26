/*!
 * Figures ported from liquid-js/qr-code-styling (MIT).
 * Copyright (c) 2019 Denys Kozak. Copyright (c) 2023 Liquid-JS.
 * See THIRD_PARTY_NOTICES.md.
 */

import {
  blob,
  circle,
  circuit,
  classyDot,
  cornerExtraRounded,
  cornerRounded,
  drawElement,
  heart,
  polygon,
  roundedSquare,
  sideRounded,
  square,
  star,
  wave,
  weave,
  type BlobCorners,
  type Element,
} from "./elements";
import { createPath, type PathBuilder } from "./path";
import type { DotFigure, DotFigureArgs, FigureBox } from "./types";

type Neighbor = DotFigureArgs["neighbor"];

type StripeEnd = (path: PathBuilder, box: FigureBox, stripe: number) => PathBuilder;

interface StripeOptions {
  stripe?: number;
  rotation?: number;
  endpoint?: StripeEnd;
  dot?: Element;
}

function box({ x, y, size }: FigureBox): FigureBox {
  return { x, y, size };
}

function transposed(neighbor: Neighbor): Neighbor {
  return (dx, dy) => neighbor(dy, dx);
}

function roundedCorners(
  args: DotFigureArgs,
  corner: Element = cornerRounded,
  end: Element = sideRounded,
): string {
  const cell = box(args);
  const left = args.neighbor(-1, 0);
  const right = args.neighbor(1, 0);
  const top = args.neighbor(0, -1);
  const bottom = args.neighbor(0, 1);
  const count = Number(left) + Number(right) + Number(top) + Number(bottom);

  if (count === 0) return drawElement(circle, cell);
  if (count > 2 || (left && right) || (top && bottom)) return drawElement(square, cell);

  if (count === 2) {
    let rotation = 0;
    if (left && top) rotation = Math.PI / 2;
    else if (top && right) rotation = Math.PI;
    else if (right && bottom) rotation = -Math.PI / 2;
    return drawElement(corner, cell, rotation);
  }

  let rotation = 0;
  if (top) rotation = Math.PI / 2;
  else if (right) rotation = Math.PI;
  else if (bottom) rotation = -Math.PI / 2;
  return drawElement(end, cell, rotation);
}

function classy(args: DotFigureArgs, corner: Element = cornerRounded): string {
  const cell = box(args);
  const left = args.neighbor(-1, 0);
  const right = args.neighbor(1, 0);
  const top = args.neighbor(0, -1);
  const bottom = args.neighbor(0, 1);

  if (!left && !right && !top && !bottom) return drawElement(classyDot, cell, Math.PI / 2);
  if (!left && !top) return drawElement(corner, cell, -Math.PI / 2);
  if (!right && !bottom) return drawElement(corner, cell, Math.PI / 2);
  return drawElement(square, cell);
}

function stripes(
  cell: FigureBox,
  neighbor: Neighbor,
  {
    stripe = cell.size,
    rotation = 0,
    endpoint = (path, target, height) => sideRounded(path, target, height),
    dot = circle,
  }: StripeOptions = {},
): string {
  const top = neighbor(0, -1);
  const bottom = neighbor(0, 1);

  if (top && bottom) {
    return drawElement((path, target) => square(path, target, stripe), cell, rotation);
  }
  if (top) {
    return drawElement(
      (path, target) => endpoint(path, target, stripe),
      cell,
      rotation + Math.PI / 2,
    );
  }
  if (bottom) {
    return drawElement(
      (path, target) => endpoint(path, target, stripe),
      cell,
      rotation - Math.PI / 2,
    );
  }

  const inset = (cell.size - stripe) / 2;
  return drawElement(dot, { x: cell.x + inset, y: cell.y + inset, size: stripe }, rotation, cell);
}

function blocks(args: DotFigureArgs, neighbor: Neighbor, rotation: number): string {
  const { size, random } = args;

  const endpoint: StripeEnd = (path, target, stripe) => {
    const width = size * (1 - random() * 0.25);
    return square(path, { ...target, x: target.x - (target.size - width) / 2 }, width, stripe);
  };

  const dot: Element = (path, target) => {
    const height = size * (1 - random() * 0.25);
    const y = args.y + (size - height) * random();
    return square(path, { ...target, y }, target.size, height);
  };

  return stripes(box(args), neighbor, { stripe: size * 0.8, rotation, endpoint, dot });
}

function neighborhood(neighbor: Neighbor) {
  return {
    tl: neighbor(-1, -1),
    t: neighbor(0, -1),
    tr: neighbor(1, -1),
    r: neighbor(1, 0),
    br: neighbor(1, 1),
    b: neighbor(0, 1),
    bl: neighbor(-1, 1),
    l: neighbor(-1, 0),
  };
}

function blobs(args: DotFigureArgs): string {
  const { tl, t, tr, r, br, b, bl, l } = neighborhood(args.neighbor);
  const corners: BlobCorners = { tl: "square", tr: "square", br: "square", bl: "square" };

  if (!l && tl) corners.tl = "out";
  if (!t && tr) corners.tr = "out";
  if (!r && br) corners.br = "out";
  if (!b && bl) corners.bl = "out";

  if (!l && !tl && !t) corners.tl = "round";
  if (!t && !tr && !r) corners.tr = "round";
  if (!r && !br && !b) corners.br = "round";
  if (!b && !bl && !l) corners.bl = "round";

  return drawElement((path, target) => blob(path, target, corners), box(args));
}

function soft(args: DotFigureArgs): string {
  const { tl, t, tr, r, br, b, bl, l } = neighborhood(args.neighbor);
  const corners: BlobCorners = { tl: "square", tr: "square", br: "square", bl: "square" };

  if (!l && tl && t) corners.tl = "out";
  if (!t && tr && r) corners.tr = "out";
  if (!r && br && b) corners.br = "out";
  if (!b && bl && l) corners.bl = "out";

  if (!l && !t) corners.tl = "round";
  if (!t && !r) corners.tr = "round";
  if (!r && !b) corners.br = "round";
  if (!b && !l) corners.bl = "round";

  return drawElement((path, target) => blob(path, target, corners), box(args));
}

const withBranch: Element = (path, target) => circuit(path, target, true);

function circuitFigure(args: DotFigureArgs): string {
  const { neighbor, random } = args;
  const cell = box(args);
  const left = random() < 2 / 3 && neighbor(-1, 0);
  const top = random() < 2 / 3 && neighbor(0, -1);
  const topLeft = random() < 2 / 3 && neighbor(-1, -1) && !neighbor(-1, 0) && !neighbor(0, -1);
  const topRight = random() < 2 / 3 && neighbor(1, -1) && !neighbor(1, 0) && !neighbor(0, -1);

  if (topLeft && topRight) return drawElement(withBranch, cell, Math.PI / 4);
  if (topRight) return drawElement(circuit, cell, Math.PI / 4);
  if (topLeft) return drawElement(circuit, cell, -Math.PI / 4);
  if (top && left) return drawElement(withBranch, cell);
  if (top) return drawElement(circuit, cell);
  if (left) return drawElement(circuit, cell, -Math.PI / 2);

  const inset = cell.size * 0.1;
  return drawElement(circle, { x: cell.x + inset, y: cell.y + inset, size: cell.size * 0.8 });
}

function fluid(args: DotFigureArgs): string {
  const radius = args.size / 2;
  const top = args.neighbor(0, -1);
  const right = args.neighbor(1, 0);
  const bottom = args.neighbor(0, 1);
  const left = args.neighbor(-1, 0);

  return createPath()
    .roundedRect(args.x, args.y, args.size, args.size, [
      top || left ? 0 : radius,
      top || right ? 0 : radius,
      bottom || right ? 0 : radius,
      bottom || left ? 0 : radius,
    ])
    .toClockwise();
}

function scaledSquare(ratio: number): DotFigure {
  return (args) => {
    const inset = (args.size * (1 - ratio)) / 2;
    return drawElement(square, { x: args.x + inset, y: args.y + inset, size: args.size * ratio });
  };
}

function scaledCircle(ratio: number): DotFigure {
  return (args) => {
    const inset = (args.size * (1 - ratio)) / 2;
    return drawElement(circle, { x: args.x + inset, y: args.y + inset, size: args.size * ratio });
  };
}

/**
 * Data module figures. Each one draws a single module into its box and may
 * reach into neighbouring cells (`circuit`, `blobs`, `soft`) to join them.
 * All subpaths wind clockwise, so many figures can share one path filled
 * with `fill-rule="nonzero"`.
 *
 * `fluid`, `rounded-square` and `small-dot` are kyuar's former `fluid`,
 * `rounded` and `dot` module styles. `fluid` draws the same shapes as
 * `rounded`.
 */
export const DOT_FIGURES = {
  dot: (args) => drawElement(circle, box(args)),
  "random-dot": (args) => {
    const { size, random } = args;
    const factor = random() * (1 - 0.75) + 0.75;
    return drawElement(circle, {
      size: size * factor,
      x: args.x + size * random() * (1 - factor),
      y: args.y + size * random() * (1 - factor),
    });
  },
  rounded: (args) => roundedCorners(args),
  "extra-rounded": (args) => roundedCorners(args, cornerExtraRounded),
  "vertical-line": (args) => stripes(box(args), args.neighbor),
  "horizontal-line": (args) =>
    stripes(box(args), transposed(args.neighbor), { rotation: -Math.PI / 2 }),
  classy: (args) => classy(args),
  "classy-rounded": (args) => classy(args, cornerExtraRounded),
  square: (args) => drawElement(square, box(args)),
  "small-square": scaledSquare(0.7),
  "tiny-square": scaledSquare(0.3),
  diamond: (args) =>
    drawElement(
      (path, target) => square(path, target, target.size * 0.85, target.size * 0.85),
      box(args),
      Math.PI / 4,
    ),
  wave: (args) => roundedCorners(args, cornerExtraRounded, wave),
  heart: (args) => drawElement(heart, box(args)),
  star: (args) => drawElement(star, box(args)),
  weave: (args) => drawElement(weave, box(args)),
  pentagon: (args) => drawElement(polygon(5), box(args)),
  hexagon: (args) => drawElement(polygon(6), box(args)),
  octagon: (args) => drawElement(polygon(8), box(args)),
  circuit: circuitFigure,
  "zebra-horizontal": (args) =>
    stripes(box(args), transposed(args.neighbor), {
      stripe: args.size * 0.8,
      rotation: -Math.PI / 2,
    }),
  "zebra-vertical": (args) => stripes(box(args), args.neighbor, { stripe: args.size * 0.8 }),
  "blocks-horizontal": (args) => blocks(args, transposed(args.neighbor), -Math.PI / 2),
  "blocks-vertical": (args) => blocks(args, args.neighbor, 0),
  blobs,
  soft,
  "rounded-square": (args) =>
    drawElement((path, target) => roundedSquare(path, target, target.size * 0.28), box(args)),
  "small-dot": scaledCircle(0.86),
  fluid,
} as const satisfies Record<string, DotFigure>;

export type DotShape = keyof typeof DOT_FIGURES;
