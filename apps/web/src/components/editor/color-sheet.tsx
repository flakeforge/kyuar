"use client";

import { paintColors, solid, THEMES, type Paint, type QrStyle } from "@kyuar/qr";
import { FieldLegend, FieldSet } from "@kyuar/ui/components/field";
import { Separator } from "@kyuar/ui/components/separator";
import { Slider } from "@kyuar/ui/components/slider";
import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";
import { useState } from "react";

import { useMessages } from "~/i18n";
import { single } from "~/lib/slider";
import { haptic } from "~/lib/telegram";

import { OklchPicker } from "./oklch-picker";
import type { EditorModel } from "./use-editor";

type Part = "background" | "pixels" | "eyes" | "pupils" | "markers" | "timing";
type Stop = "from" | "to";

const PARTS: Part[] = ["background", "pixels", "eyes", "pupils", "markers", "timing"];

const SWATCHES = [...new Set(THEMES.flatMap((theme) => [theme.background, theme.foreground]))];

function readPaint(style: QrStyle, part: Part): Paint {
  if (part === "background") return style.background;
  if (part === "pixels") return style.data.paint;
  if (part === "eyes") return style.finderOuter.paint;
  if (part === "pupils") return style.finderInner.paint;
  if (part === "markers") return style.alignment.paint;
  return style.timing.paint;
}

function writePaint(style: QrStyle, part: Part, paint: Paint): Partial<QrStyle> {
  if (part === "background") return { background: paint };
  if (part === "pixels") return { data: { ...style.data, paint } };
  if (part === "eyes") return { finderOuter: { ...style.finderOuter, paint } };
  if (part === "pupils") return { finderInner: { ...style.finderInner, paint } };
  if (part === "markers") return { alignment: { ...style.alignment, paint } };
  return { timing: { paint } };
}

function stopColor(paint: Paint, stop: Stop) {
  const colors = paintColors(paint);
  return (stop === "from" ? colors[0] : colors.at(-1)) ?? "#000000";
}

function withStop(paint: Paint, stop: Stop, color: string): Paint {
  if (paint.type === "solid") return solid(color);
  const last = paint.stops.length - 1;
  const stops = paint.stops.map((item, index) =>
    index === (stop === "from" ? 0 : last) ? { ...item, color } : item,
  );
  return { ...paint, stops };
}

function convert(paint: Paint, type: Paint["type"]): Paint {
  const from = stopColor(paint, "from");
  const to = paint.type === "solid" ? from : stopColor(paint, "to");
  const stops = [
    { offset: 0, color: from },
    { offset: 1, color: to },
  ];
  if (type === "solid") return solid(from);
  if (type === "radial") return { type: "radial", stops };
  return { type: "linear", angle: paint.type === "linear" ? paint.angle : 45, stops };
}

export function ColorSheet({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { style, update, themeId, applyTheme } = editor;
  const [part, setPart] = useState<Part>("pixels");
  const [stop, setStop] = useState<Stop>("from");

  const paint = readPaint(style, part);
  const activeStop: Stop = paint.type === "solid" ? "from" : stop;
  const color = stopColor(paint, activeStop);
  const against =
    part === "background"
      ? stopColor(style.data.paint, "from")
      : stopColor(style.background, "from");

  const setPaint = (next: Paint) => update(writePaint(style, part, next), false);

  return (
    <div className="flex flex-col gap-6">
      <FieldSet>
        <FieldLegend variant="label">{t.color.themes}</FieldLegend>
        <ToggleGroup
          aria-label={t.color.themes}
          value={themeId ? [themeId] : []}
          onValueChange={(next) => {
            const theme = THEMES.find((item) => item.id === next[0]);
            if (!theme) return;
            applyTheme(theme);
            haptic("select");
          }}
          variant="swatch"
          spacing={2}
          className="grid w-full grid-cols-6 gap-3"
        >
          {THEMES.map((theme) => (
            <ToggleGroupItem
              key={theme.id}
              value={theme.id}
              aria-label={theme.name}
              title={theme.name}
              className="aspect-square h-auto w-full"
              style={{
                background: `linear-gradient(135deg, ${theme.background} 50%, ${theme.foreground} 50%)`,
              }}
            />
          ))}
        </ToggleGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant="label">{t.color.element}</FieldLegend>
        <ToggleGroup
          aria-label={t.color.element}
          value={[part]}
          onValueChange={(next) => {
            const [value] = next as Part[];
            if (value) setPart(value);
          }}
          variant="tile"
          size="sm"
          className="flex w-full flex-wrap"
        >
          {PARTS.map((item) => (
            <ToggleGroupItem key={item} value={item} className="shrink-0 px-3">
              {t.color[item]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          value={[paint.type]}
          onValueChange={(next) => {
            const [type] = next as Paint["type"][];
            if (type) setPaint(convert(paint, type));
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

        {paint.type !== "solid" && (
          <ToggleGroup
            value={[activeStop]}
            onValueChange={(next) => {
              const [value] = next as Stop[];
              if (value) setStop(value);
            }}
            variant="tile"
            size="sm"
            className="w-full"
          >
            <ToggleGroupItem value="from" className="flex-1 gap-2">
              <span
                className="size-3 rounded-full"
                style={{ background: stopColor(paint, "from") }}
              />
              {t.color.from}
            </ToggleGroupItem>
            <ToggleGroupItem value="to" className="flex-1 gap-2">
              <span
                className="size-3 rounded-full"
                style={{ background: stopColor(paint, "to") }}
              />
              {t.color.to}
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        {paint.type === "linear" && (
          <Slider
            aria-label={t.color.angle}
            value={paint.angle}
            min={0}
            max={360}
            step={15}
            onValueChange={(value) => setPaint({ ...paint, angle: single(value) })}
          />
        )}
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{t.color.swatches}</FieldLegend>
        <ToggleGroup
          aria-label={t.color.swatches}
          value={[color]}
          onValueChange={(next) => {
            const [value] = next;
            if (!value) return;
            setPaint(withStop(paint, activeStop, value));
            haptic("select");
          }}
          variant="swatch"
          spacing={2}
          className="grid w-full grid-cols-8 gap-2.5"
        >
          {SWATCHES.map((swatch) => (
            <ToggleGroupItem
              key={swatch}
              value={swatch}
              aria-label={swatch}
              className="aspect-square h-auto w-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
              style={{ background: swatch }}
            />
          ))}
        </ToggleGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{t.color.custom}</FieldLegend>
        <OklchPicker
          key={`${part}-${activeStop}`}
          value={color}
          against={against}
          onChange={(hex) => setPaint(withStop(paint, activeStop, hex))}
        />
      </FieldSet>
    </div>
  );
}
