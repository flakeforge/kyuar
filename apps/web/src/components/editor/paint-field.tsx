"use client";

import { solid, type Paint } from "@kyuar/qr";
import { Field, FieldLabel, FieldSet, FieldLegend } from "@kyuar/ui/components/field";
import { Input } from "@kyuar/ui/components/input";
import { Slider } from "@kyuar/ui/components/slider";
import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";
import { useId } from "react";

import { useMessages } from "~/i18n";
import { single } from "~/lib/slider";

type PaintType = Paint["type"];

function firstColor(paint: Paint) {
  return paint.type === "solid" ? paint.color : (paint.stops[0]?.color ?? "#000000");
}

function lastColor(paint: Paint) {
  return paint.type === "solid" ? paint.color : (paint.stops.at(-1)?.color ?? "#000000");
}

function convert(paint: Paint, type: PaintType): Paint {
  const from = firstColor(paint);
  const to = lastColor(paint);
  const stops = [
    { offset: 0, color: from },
    { offset: 1, color: to === from ? "#000000" : to },
  ];
  if (type === "solid") return solid(from);
  if (type === "radial") return { type: "radial", stops };
  return { type: "linear", angle: paint.type === "linear" ? paint.angle : 45, stops };
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  const id = useId();
  return (
    <Field orientation="horizontal" className="w-auto">
      <FieldLabel htmlFor={id} className="text-muted-foreground">
        {label}
      </FieldLabel>
      <Input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-12 cursor-pointer p-1"
      />
    </Field>
  );
}

interface PaintFieldProps {
  legend: string;
  paint: Paint;
  onChange: (paint: Paint) => void;
}

export function PaintField({ legend, paint, onChange }: PaintFieldProps) {
  const t = useMessages();

  const setStop = (index: 0 | 1, color: string) => {
    if (paint.type === "solid") return;
    const stops = paint.stops.map((stop, position) =>
      position === (index === 0 ? 0 : paint.stops.length - 1) ? { ...stop, color } : stop,
    );
    onChange({ ...paint, stops });
  };

  return (
    <FieldSet className="gap-3">
      <FieldLegend variant="label">{legend}</FieldLegend>
      <ToggleGroup
        value={[paint.type]}
        onValueChange={(next) => {
          const [type] = next as PaintType[];
          if (type) onChange(convert(paint, type));
        }}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <ToggleGroupItem value="solid" className="flex-1">
          {t.color.solid}
        </ToggleGroupItem>
        <ToggleGroupItem value="linear" className="flex-1">
          {t.color.linear}
        </ToggleGroupItem>
        <ToggleGroupItem value="radial" className="flex-1">
          {t.color.radial}
        </ToggleGroupItem>
      </ToggleGroup>

      {paint.type === "solid" ? (
        <ColorInput
          label={t.color.solid}
          value={paint.color}
          onChange={(color) => onChange(solid(color))}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <ColorInput
            label={t.color.from}
            value={firstColor(paint)}
            onChange={(color) => setStop(0, color)}
          />
          <ColorInput
            label={t.color.to}
            value={lastColor(paint)}
            onChange={(color) => setStop(1, color)}
          />
        </div>
      )}

      {paint.type === "linear" && (
        <Field>
          <FieldLabel className="text-muted-foreground">
            {t.color.angle} <span className="ml-auto tabular-nums">{paint.angle}°</span>
          </FieldLabel>
          <Slider
            aria-label={t.color.angle}
            value={paint.angle}
            min={0}
            max={360}
            step={15}
            onValueChange={(value) => onChange({ ...paint, angle: single(value) })}
          />
        </Field>
      )}
    </FieldSet>
  );
}
