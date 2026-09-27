"use client";

import {
  DOT_FIGURES,
  FINDER_INNER_FIGURES,
  FINDER_OUTER_FIGURES,
  paintColors,
  type AlignmentMode,
  type DotShape,
  type ErrorCorrectionLevel,
  type FinderInnerShape,
  type FinderOuterShape,
} from "@kyuar/qr";
import { Alert, AlertDescription } from "@kyuar/ui/components/alert";
import { Field, FieldDescription, FieldLabel } from "@kyuar/ui/components/field";
import { Switch } from "@kyuar/ui/components/switch";
import { CrosshairIcon, ImageIcon, ImagePlusIcon, TriangleAlertIcon } from "lucide-react";
import { useId } from "react";

import { useMessages, useShapeNames, useThemeNames } from "~/i18n";

import { ChoiceGrid, ChoiceList, type Choice } from "./choices";
import { ColorSheet } from "./color-sheet";
import { LogoSheet, PictureSheet } from "./image-sheets";
import { ShapeIcon } from "./shape-icon";
import { SheetRow } from "./sheet-row";
import type { EditorModel } from "./use-editor";

const MARGINS = [0, 2, 4, 6] as const;
const RECOMMENDED_PIXELS: readonly DotShape[] = [
  "fluid",
  "square",
  "dot",
  "rounded",
  "extra-rounded",
  "classy",
  "classy-rounded",
  "diamond",
  "blobs",
  "soft",
  "heart",
  "vertical-line",
];
const RADII = { none: 0, round: 0.5, extra: 1 } as const;
const LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

function CornerPreview({ radius }: { radius: number }) {
  return (
    <span
      className="bg-foreground/25 block size-7"
      style={{ borderRadius: `${Math.round(radius * 12)}px` }}
    />
  );
}

function BorderPreview({ margin }: { margin: number }) {
  return (
    <span className="border-foreground/40 flex size-7 items-center justify-center rounded-[5px] border">
      <span
        className="bg-foreground block rounded-[2px]"
        style={{ width: `${26 - margin * 2}px`, height: `${26 - margin * 2}px` }}
      />
    </span>
  );
}

function Thumbnail({ src }: { src: string }) {
  return (
    <span
      className="block size-8 rounded-lg bg-cover bg-center shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}

export function Controls({
  editor,
  itemClassName,
}: {
  editor: EditorModel;
  itemClassName?: string;
}) {
  const t = useMessages();
  const names = useShapeNames();
  const themeNames = useThemeNames();
  const boostId = useId();
  const { style, update, logo, halftone } = editor;
  const [background = "#ffffff"] = paintColors(style.background);
  const [ink = "#000000"] = paintColors(style.data.paint);

  const pixelChoices: Choice<DotShape>[] = (Object.keys(DOT_FIGURES) as DotShape[]).map(
    (shape) => ({
      value: shape,
      label: names.dots[shape],
      icon: <ShapeIcon kind="dot" shape={shape} />,
    }),
  );
  const pupilChoices: Choice<FinderInnerShape>[] = (
    Object.keys(FINDER_INNER_FIGURES) as FinderInnerShape[]
  ).map((shape) => ({
    value: shape,
    label: names.centers[shape],
    icon: <ShapeIcon kind="inner" shape={shape} />,
  }));
  const eyeChoices: Choice<FinderOuterShape>[] = (
    Object.keys(FINDER_OUTER_FIGURES) as FinderOuterShape[]
  ).map((shape) => ({
    value: shape,
    label: names.frames[shape],
    icon: <ShapeIcon kind="outer" shape={shape} />,
  }));

  const marginLabels = [t.options.none, t.options.small, t.options.standard, t.options.large];
  const marginChoices: Choice<string>[] = MARGINS.map((margin, index) => ({
    value: String(margin),
    label: marginLabels[index] ?? String(margin),
  }));

  const radiusKey =
    (Object.keys(RADII) as (keyof typeof RADII)[]).find(
      (key) => RADII[key] === style.backgroundRadius,
    ) ?? "round";
  const radiusChoices: Choice<keyof typeof RADII>[] = [
    { value: "none", label: t.options.none, icon: <CornerPreview radius={RADII.none} /> },
    { value: "round", label: t.options.round, icon: <CornerPreview radius={RADII.round} /> },
    { value: "extra", label: t.options.extraRound, icon: <CornerPreview radius={RADII.extra} /> },
  ];

  const markerChoices: Choice<AlignmentMode>[] = [
    { value: "data", label: t.options.markersPixels },
    { value: "finder", label: t.options.markersEyes },
  ];

  const eccLabels = { L: t.options.eccL, M: t.options.eccM, Q: t.options.eccQ, H: t.options.eccH };
  const ecc = logo ? "H" : style.ecc;
  const eccChoices: Choice<ErrorCorrectionLevel>[] = LEVELS.map((level) => ({
    value: level,
    label: eccLabels[level],
    disabled: Boolean(logo) && level !== "H",
  }));
  const marginLabel = marginChoices.find((choice) => choice.value === String(style.margin))?.label;
  const radiusLabel = radiusChoices.find((choice) => choice.value === radiusKey)?.label;
  const markerLabel = markerChoices.find((choice) => choice.value === style.alignment.mode)?.label;
  const themeLabel = editor.themeId ? themeNames[editor.themeId] : t.color.customTab;

  return (
    <div className="flex flex-col gap-2">
      <SheetRow
        className={itemClassName}
        label={t.rows.color}
        value={themeLabel}
        preview={
          <span
            className="block size-7 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
            style={{ background: `linear-gradient(135deg, ${background} 50%, ${ink} 50%)` }}
          />
        }
      >
        <ColorSheet editor={editor} />
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.margin}
        value={marginLabel}
        preview={<BorderPreview margin={style.margin} />}
      >
        <div className="flex flex-col gap-4">
          <ChoiceList
            label={t.rows.margin}
            choices={marginChoices}
            value={String(style.margin)}
            onChange={(value) => update({ margin: Number(value) })}
          />
          {style.margin < 2 && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertDescription>{t.preview.tightMargin}</AlertDescription>
            </Alert>
          )}
        </div>
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.corners}
        value={style.margin === 0 ? t.options.needsBorder : radiusLabel}
        disabled={style.margin === 0}
        preview={<CornerPreview radius={style.backgroundRadius} />}
      >
        <ChoiceList
          label={t.rows.corners}
          choices={radiusChoices}
          value={radiusKey}
          onChange={(value) => update({ backgroundRadius: RADII[value] })}
        />
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.pixels}
        value={names.dots[style.data.shape]}
        preview={<ShapeIcon kind="dot" shape={style.data.shape} />}
      >
        <ChoiceGrid
          label={t.rows.pixels}
          choices={pixelChoices}
          recommended={RECOMMENDED_PIXELS}
          value={style.data.shape}
          onChange={(shape) => update({ data: { ...style.data, shape } })}
        />
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.pupils}
        value={names.centers[style.finderInner.shape]}
        preview={<ShapeIcon kind="inner" shape={style.finderInner.shape} />}
      >
        <ChoiceGrid
          label={t.rows.pupils}
          choices={pupilChoices}
          value={style.finderInner.shape}
          onChange={(shape) => update({ finderInner: { ...style.finderInner, shape } })}
        />
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.eyes}
        value={names.frames[style.finderOuter.shape]}
        preview={<ShapeIcon kind="outer" shape={style.finderOuter.shape} />}
      >
        <ChoiceGrid
          label={t.rows.eyes}
          choices={eyeChoices}
          value={style.finderOuter.shape}
          onChange={(shape) => update({ finderOuter: { ...style.finderOuter, shape } })}
        />
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.markers}
        value={markerLabel}
        preview={<CrosshairIcon className="size-5" />}
      >
        <ChoiceList
          label={t.rows.markers}
          choices={markerChoices}
          value={style.alignment.mode}
          onChange={(mode) => update({ alignment: { ...style.alignment, mode } })}
        />
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.strength}
        value={eccLabels[ecc]}
        preview={
          <span className="text-muted-foreground text-base font-semibold tabular-nums">{ecc}</span>
        }
      >
        <div className="flex flex-col gap-4">
          <ChoiceList
            label={t.rows.strength}
            choices={eccChoices}
            value={ecc}
            onChange={(level) => update({ ecc: level })}
          />
          <FieldDescription>{logo ? t.options.logoLocksEcc : t.options.eccHint}</FieldDescription>
          <Field orientation="horizontal">
            <FieldLabel htmlFor={boostId}>{t.options.boost}</FieldLabel>
            <Switch
              id={boostId}
              checked={style.boostEcc}
              onCheckedChange={(boostEcc) => update({ boostEcc })}
            />
          </Field>
        </div>
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.logo}
        value={logo ? undefined : t.image.off}
        preview={
          logo ? (
            <Thumbnail src={logo} />
          ) : (
            <ImagePlusIcon className="text-muted-foreground size-5" />
          )
        }
      >
        <LogoSheet editor={editor} />
      </SheetRow>

      <SheetRow
        className={itemClassName}
        label={t.rows.picture}
        value={halftone ? undefined : t.image.off}
        preview={
          halftone ? (
            <Thumbnail src={halftone.dataUrl} />
          ) : (
            <ImageIcon className="text-muted-foreground size-5" />
          )
        }
      >
        <PictureSheet editor={editor} />
      </SheetRow>
    </div>
  );
}
