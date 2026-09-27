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
import { Field, FieldDescription, FieldLabel } from "@kyuar/ui/components/field";
import { Switch } from "@kyuar/ui/components/switch";
import { CrosshairIcon, ExpandIcon, ImageIcon, ImagePlusIcon } from "lucide-react";
import { useId } from "react";

import { useMessages } from "~/i18n";

import { ChoiceGrid, ChoiceList, type Choice } from "./choices";
import { ColorSheet } from "./color-sheet";
import { LogoSheet, PictureSheet } from "./image-sheets";
import { ShapeIcon } from "./shape-icon";
import { SheetRow } from "./sheet-row";
import type { EditorModel } from "./use-editor";

const MARGINS = [0, 2, 4, 6] as const;
const RADII = { none: 0, round: 0.5, extra: 1 } as const;
const LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

function label(shape: string) {
  return shape.replaceAll("-", " ");
}

function CornerPreview({ radius }: { radius: number }) {
  return (
    <span
      className="bg-foreground/25 block size-7"
      style={{ borderRadius: `${Math.round(radius * 12)}px` }}
    />
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

export function Controls({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const boostId = useId();
  const { style, update, logo, halftone } = editor;
  const [background = "#ffffff"] = paintColors(style.background);
  const [ink = "#000000"] = paintColors(style.data.paint);

  const pixelChoices: Choice<DotShape>[] = (Object.keys(DOT_FIGURES) as DotShape[]).map(
    (shape) => ({
      value: shape,
      label: label(shape),
      icon: <ShapeIcon kind="dot" shape={shape} />,
    }),
  );
  const pupilChoices: Choice<FinderInnerShape>[] = (
    Object.keys(FINDER_INNER_FIGURES) as FinderInnerShape[]
  ).map((shape) => ({
    value: shape,
    label: label(shape),
    icon: <ShapeIcon kind="inner" shape={shape} />,
  }));
  const eyeChoices: Choice<FinderOuterShape>[] = (
    Object.keys(FINDER_OUTER_FIGURES) as FinderOuterShape[]
  ).map((shape) => ({
    value: shape,
    label: label(shape),
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
  }));

  return (
    <div className="flex flex-col gap-2">
      <SheetRow
        label={t.rows.color}
        preview={
          <span
            className="block size-7 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
            style={{ background: `linear-gradient(135deg, ${background} 50%, ${ink} 50%)` }}
          />
        }
      >
        <ColorSheet editor={editor} />
      </SheetRow>

      <SheetRow label={t.rows.margin} preview={<ExpandIcon className="size-5" />}>
        <ChoiceList
          label={t.rows.margin}
          choices={marginChoices}
          value={String(style.margin)}
          onChange={(value) => update({ margin: Number(value) })}
        />
      </SheetRow>

      <SheetRow label={t.rows.corners} preview={<CornerPreview radius={style.backgroundRadius} />}>
        <ChoiceList
          label={t.rows.corners}
          choices={radiusChoices}
          value={radiusKey}
          onChange={(value) => update({ backgroundRadius: RADII[value] })}
        />
      </SheetRow>

      <SheetRow label={t.rows.pixels} preview={<ShapeIcon kind="dot" shape={style.data.shape} />}>
        <ChoiceGrid
          label={t.rows.pixels}
          choices={pixelChoices}
          value={style.data.shape}
          onChange={(shape) => update({ data: { ...style.data, shape } })}
        />
      </SheetRow>

      <SheetRow
        label={t.rows.pupils}
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
        label={t.rows.eyes}
        preview={<ShapeIcon kind="outer" shape={style.finderOuter.shape} />}
      >
        <ChoiceGrid
          label={t.rows.eyes}
          choices={eyeChoices}
          value={style.finderOuter.shape}
          onChange={(shape) => update({ finderOuter: { ...style.finderOuter, shape } })}
        />
      </SheetRow>

      <SheetRow label={t.rows.markers} preview={<CrosshairIcon className="size-5" />}>
        <ChoiceList
          label={t.rows.markers}
          choices={markerChoices}
          value={style.alignment.mode}
          onChange={(mode) => update({ alignment: { ...style.alignment, mode } })}
        />
      </SheetRow>

      <SheetRow
        label={t.rows.strength}
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
          <FieldDescription>{t.options.eccHint}</FieldDescription>
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
        label={t.rows.logo}
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
        label={t.rows.picture}
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
