import { DOT_FIGURES, FINDER_INNER_FIGURES, FINDER_OUTER_FIGURES } from "@kyuar/qr";
import type { DotShape, FinderInnerShape, FinderOuterShape } from "@kyuar/qr";

const UNIT = 10;
const SAMPLE = [
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
];

const isDark = (row: number, col: number) => SAMPLE[row]?.[col] === 1;

function dotSample(shape: DotShape) {
  const figure = DOT_FIGURES[shape];
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  return SAMPLE.flatMap((line, row) =>
    line.map((_, col) =>
      isDark(row, col)
        ? figure({
            x: col * UNIT,
            y: row * UNIT,
            size: UNIT,
            neighbor: (dx, dy) => isDark(row + dy, col + dx),
            random,
          })
        : "",
    ),
  ).join("");
}

export type ShapeIconProps =
  | { kind: "dot"; shape: DotShape }
  | { kind: "outer"; shape: FinderOuterShape }
  | { kind: "inner"; shape: FinderInnerShape };

export function ShapeIcon(props: ShapeIconProps) {
  const box = props.kind === "dot" ? 3 * UNIT : props.kind === "outer" ? 7 * UNIT : 3 * UNIT;
  const d =
    props.kind === "dot"
      ? dotSample(props.shape)
      : props.kind === "outer"
        ? FINDER_OUTER_FIGURES[props.shape]({ x: 0, y: 0, size: box, rotation: 0 })
        : FINDER_INNER_FIGURES[props.shape]({ x: 0, y: 0, size: box, rotation: 0 });

  return (
    <svg viewBox={`-2 -2 ${box + 4} ${box + 4}`} className="size-7" aria-hidden="true">
      <path d={d} fill="currentColor" fillRule={props.kind === "outer" ? "evenodd" : "nonzero"} />
    </svg>
  );
}
