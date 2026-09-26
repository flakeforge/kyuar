"use client";

import {
  DOT_FIGURES,
  FINDER_INNER_FIGURES,
  FINDER_OUTER_FIGURES,
  type AlignmentMode,
  type DotShape,
  type FinderInnerShape,
  type FinderOuterShape,
} from "@kyuar/qr";
import { FieldLegend, FieldSet } from "@kyuar/ui/components/field";
import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";

import { useMessages } from "~/i18n";

import { ShapeIcon, type ShapeIconProps } from "./shape-icon";
import type { EditorModel } from "./use-editor";

function label(shape: string) {
  return shape.replaceAll("-", " ");
}

interface ShapeGridProps<Shape extends string> {
  legend: string;
  kind: ShapeIconProps["kind"];
  shapes: Shape[];
  value: Shape;
  onChange: (shape: Shape) => void;
}

function ShapeGrid<Shape extends string>({
  legend,
  kind,
  shapes,
  value,
  onChange,
}: ShapeGridProps<Shape>) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <ToggleGroup
        value={[value]}
        onValueChange={(next) => {
          const [shape] = next as Shape[];
          if (shape) onChange(shape);
        }}
        variant="outline"
        spacing={1}
        className="grid w-full grid-cols-6 gap-1.5"
      >
        {shapes.map((shape) => (
          <ToggleGroupItem
            key={shape}
            value={shape}
            aria-label={label(shape)}
            title={label(shape)}
            className="aspect-square h-auto w-full"
          >
            <ShapeIcon {...({ kind, shape } as ShapeIconProps)} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FieldSet>
  );
}

export function ShapePanel({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { style, update } = editor;

  return (
    <div className="flex flex-col gap-6">
      <ShapeGrid
        legend={t.shape.data}
        kind="dot"
        shapes={Object.keys(DOT_FIGURES) as DotShape[]}
        value={style.data.shape}
        onChange={(shape) => update({ data: { ...style.data, shape } })}
      />
      <ShapeGrid
        legend={t.shape.finderOuter}
        kind="outer"
        shapes={Object.keys(FINDER_OUTER_FIGURES) as FinderOuterShape[]}
        value={style.finderOuter.shape}
        onChange={(shape) => update({ finderOuter: { ...style.finderOuter, shape } })}
      />
      <ShapeGrid
        legend={t.shape.finderInner}
        kind="inner"
        shapes={Object.keys(FINDER_INNER_FIGURES) as FinderInnerShape[]}
        value={style.finderInner.shape}
        onChange={(shape) => update({ finderInner: { ...style.finderInner, shape } })}
      />
      <FieldSet>
        <FieldLegend variant="label">{t.shape.alignment}</FieldLegend>
        <ToggleGroup
          value={[style.alignment.mode]}
          onValueChange={(next) => {
            const [mode] = next as AlignmentMode[];
            if (mode) update({ alignment: { ...style.alignment, mode } });
          }}
          variant="outline"
          className="w-full"
        >
          <ToggleGroupItem value="data" className="flex-1">
            {t.shape.alignmentData}
          </ToggleGroupItem>
          <ToggleGroupItem value="finder" className="flex-1">
            {t.shape.alignmentFinder}
          </ToggleGroupItem>
        </ToggleGroup>
      </FieldSet>
    </div>
  );
}
