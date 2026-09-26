import { escapeXml } from "./lib/xml";
import type { Paint } from "./style";

export interface PaintBox {
  x: number;
  y: number;
  size: number;
}

function round(value: number) {
  return Number(value.toFixed(3));
}

function stopsMarkup(paint: Exclude<Paint, { type: "solid" }>) {
  return paint.stops
    .map(
      (stop) =>
        `<stop offset="${round(Math.min(1, Math.max(0, stop.offset)))}" stop-color="${escapeXml(stop.color)}"/>`,
    )
    .join("");
}

/**
 * Resolves a paint to a `fill` value. Gradients are defined in user space over
 * `box`, so one gradient runs continuously across every module of a layer
 * instead of restarting in each shape.
 */
export function resolvePaint(
  paint: Paint,
  id: string,
  box: PaintBox,
): { fill: string; def: string } {
  if (paint.type === "solid") return { fill: escapeXml(paint.color), def: "" };

  const cx = box.x + box.size / 2;
  const cy = box.y + box.size / 2;

  if (paint.type === "radial") {
    const radius = round((box.size / 2) * Math.SQRT2);
    return {
      fill: `url(#${id})`,
      def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${round(cx)}" cy="${round(cy)}" r="${radius}">${stopsMarkup(paint)}</radialGradient>`,
    };
  }

  const radians = (paint.angle * Math.PI) / 180;
  const half = box.size / 2;
  const dx = Math.cos(radians) * half;
  const dy = Math.sin(radians) * half;

  return {
    fill: `url(#${id})`,
    def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${round(cx - dx)}" y1="${round(cy - dy)}" x2="${round(cx + dx)}" y2="${round(cy + dy)}">${stopsMarkup(paint)}</linearGradient>`,
  };
}
