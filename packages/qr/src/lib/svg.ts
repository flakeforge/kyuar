export type CornerRadii = readonly [number, number, number, number];

const PRECISION = 3;

function round(value: number) {
  return Number(value.toFixed(PRECISION));
}

/**
 * Builds a rectangle path where every corner radius is set independently. Data
 * modules use this to merge with their neighbours: a corner shared with an
 * adjacent dark module gets a radius of zero, so the two shapes fuse.
 */
export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radii: CornerRadii,
): string {
  const limit = Math.min(width, height) / 2;
  const [tl, tr, br, bl] = radii.map((radius) =>
    Math.max(0, Math.min(radius, limit)),
  ) as unknown as CornerRadii;

  const left = round(x);
  const top = round(y);
  const right = round(x + width);
  const bottom = round(y + height);

  const parts = [
    `M${round(left + tl)},${top}`,
    `H${round(right - tr)}`,
    tr > 0 ? `A${round(tr)},${round(tr)} 0 0 1 ${right},${round(top + tr)}` : "",
    `V${round(bottom - br)}`,
    br > 0 ? `A${round(br)},${round(br)} 0 0 1 ${round(right - br)},${bottom}` : "",
    `H${round(left + bl)}`,
    bl > 0 ? `A${round(bl)},${round(bl)} 0 0 1 ${left},${round(bottom - bl)}` : "",
    `V${round(top + tl)}`,
    tl > 0 ? `A${round(tl)},${round(tl)} 0 0 1 ${round(left + tl)},${top}` : "",
    "Z",
  ];

  return parts.filter(Boolean).join("");
}

export function circlePath(centerX: number, centerY: number, radius: number): string {
  const cx = round(centerX);
  const r = round(radius);
  const top = round(centerY - radius);
  const bottom = round(centerY + radius);

  return `M${cx},${top}A${r},${r} 0 1 1 ${cx},${bottom}A${r},${r} 0 1 1 ${cx},${top}Z`;
}

/**
 * Produces a ring by walking the outer shape clockwise and the inner shape
 * counter-clockwise, which leaves the middle hollow under `fill-rule: evenodd`.
 */
export function ringPath(
  x: number,
  y: number,
  size: number,
  thickness: number,
  outerRadius: number,
): string {
  const inset = thickness;
  const innerRadius = Math.max(0, outerRadius - thickness);

  const outer = roundedRectPath(x, y, size, size, [
    outerRadius,
    outerRadius,
    outerRadius,
    outerRadius,
  ]);
  const inner = roundedRectPath(x + inset, y + inset, size - inset * 2, size - inset * 2, [
    innerRadius,
    innerRadius,
    innerRadius,
    innerRadius,
  ]);

  return `${outer}${inner}`;
}

export function circleRingPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  thickness: number,
): string {
  return `${circlePath(centerX, centerY, outerRadius)}${circlePath(
    centerX,
    centerY,
    Math.max(0, outerRadius - thickness),
  )}`;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
