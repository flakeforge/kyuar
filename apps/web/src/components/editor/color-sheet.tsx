"use client";

import {
  applyPalette,
  contrastRatio,
  derivePalette,
  MIN_SCAN_CONTRAST,
  paintColors,
  solid,
  THEMES,
  type Paint,
  type QrStyle,
} from "@kyuar/qr";
import { Badge } from "@kyuar/ui/components/badge";
import { Button } from "@kyuar/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@kyuar/ui/components/field";
import { Slider } from "@kyuar/ui/components/slider";
import { Switch } from "@kyuar/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kyuar/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";
import { ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

import { useMessages, useThemeNames } from "~/i18n";
import { single } from "~/lib/slider";
import { haptic } from "~/lib/telegram";

import { ColorPicker } from "./color-picker";
import type { EditorModel } from "./use-editor";

type Part = "background" | "pixels" | "eyes" | "pupils" | "markers" | "timing";
type Stop = "from" | "to";
type SheetTab = "themes" | "custom";

const PARTS: Part[] = ["background", "pixels", "eyes", "pupils", "markers", "timing"];

const DISTINCT_CONTRAST = 1.15;

const SWATCHES: string[] = [];
for (const color of THEMES.flatMap((theme) => [theme.background, theme.foreground])) {
  if (!SWATCHES.some((kept) => contrastRatio(kept, color) < DISTINCT_CONTRAST))
    SWATCHES.push(color);
}

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
  const darkId = useId();
  const [part, setPart] = useState<Part>("pixels");
  const [stop, setStop] = useState<Stop>("from");
  const [advanced, setAdvanced] = useState(false);
  const [tab, setTab] = useState<SheetTab>(() => (themeId ? "themes" : "custom"));
  const { base, dark, partsEdited } = editor.customColor;
  const themeNames = useThemeNames();
  const palette = derivePalette(base, dark);

  const paint = readPaint(style, part);
  const activeStop: Stop = paint.type === "solid" ? "from" : stop;
  const color = stopColor(paint, activeStop);
  const against =
    part === "background"
      ? stopColor(style.data.paint, "from")
      : stopColor(style.background, "from");
  const ratio = contrastRatio(color, against);
  const scans = ratio >= MIN_SCAN_CONTRAST;

  const setPaint = (next: Paint) => {
    update(writePaint(style, part, next), false);
    editor.setCustomColor((current) => ({ ...current, partsEdited: true }));
  };
  const setAuto = (nextBase: string, nextDark: boolean) => {
    editor.setCustomColor({ base: nextBase, dark: nextDark, partsEdited: false });
    update(applyPalette(style, derivePalette(nextBase, nextDark)), false);
  };

  return (
    <Tabs value={tab} onValueChange={(next) => setTab(next as SheetTab)}>
      <TabsList className="mb-5 w-full">
        <TabsTrigger value="themes">{t.color.themes}</TabsTrigger>
        <TabsTrigger value="custom">{t.color.customTab}</TabsTrigger>
      </TabsList>

      <TabsContent value="themes">
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
          className="grid w-full grid-cols-4 gap-4"
        >
          {THEMES.map((theme) => (
            <ToggleGroupItem
              key={theme.id}
              value={theme.id}
              aria-label={themeNames[theme.id] ?? theme.name}
              title={themeNames[theme.id] ?? theme.name}
              className="aspect-square h-auto w-full"
              style={{
                background: `linear-gradient(135deg, ${theme.background} 50%, ${theme.foreground} 50%)`,
              }}
            />
          ))}
        </ToggleGroup>
      </TabsContent>

      <TabsContent value="custom" className="flex flex-col gap-5">
        {!advanced && (
          <Field>
            <FieldLabel>{t.color.base}</FieldLabel>
            <ColorPicker value={base} onChange={(hex) => setAuto(hex, dark)} />
            <FieldDescription>
              {partsEdited ? t.color.editedParts : t.color.autoHint}
            </FieldDescription>
          </Field>
        )}

        <div className="flex items-center gap-2" aria-hidden="true">
          {(["background", "modules", "frames", "centers"] as const).map((key) => (
            <span
              key={key}
              className="h-8 flex-1 rounded-lg shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
              style={{ background: palette[key] }}
            />
          ))}
        </div>

        <Field orientation="horizontal" className="min-h-11">
          <FieldLabel htmlFor={darkId}>{t.color.darkBackground}</FieldLabel>
          <Switch
            id={darkId}
            checked={dark}
            onCheckedChange={(checked) => setAuto(base, checked)}
          />
        </Field>

        <Button
          variant="ghost"
          size="xl"
          aria-expanded={advanced}
          onClick={() => setAdvanced((open) => !open)}
          className="w-full"
        >
          {advanced ? t.color.fewer : t.color.advanced}
          <ChevronDownIcon data-icon="inline-end" className={advanced ? "rotate-180" : undefined} />
        </Button>

        {advanced && (
          <div className="flex flex-col gap-5">
            <ToggleGroup
              aria-label={t.color.element}
              value={[part]}
              onValueChange={(next) => {
                const [value] = next as Part[];
                if (value) setPart(value);
              }}
              variant="tile"
              size="touch"
              className="flex w-full flex-wrap"
            >
              {PARTS.map((item) => (
                <ToggleGroupItem key={item} value={item}>
                  {t.color[item]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <ToggleGroup
              aria-label={t.color.fill}
              value={[paint.type]}
              onValueChange={(next) => {
                const [type] = next as Paint["type"][];
                if (type) setPaint(convert(paint, type));
              }}
              variant="outline"
              size="touch"
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
                size="touch"
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

            <div className="flex items-center gap-3">
              <span
                className="size-11 shrink-0 rounded-(--radius) shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
                style={{ background: color }}
              />
              <span className="font-mono text-sm uppercase">{color}</span>
              <Badge variant={scans ? "secondary" : "destructive"} className="ml-auto tabular-nums">
                {ratio.toFixed(1)}:1 · {scans ? t.color.scans : t.color.tooLow}
              </Badge>
            </div>

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
              className="grid w-full grid-cols-6 gap-3"
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

            <ColorPicker
              key={`${part}-${activeStop}`}
              value={color}
              onChange={(hex) => setPaint(withStop(paint, activeStop, hex))}
            />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
