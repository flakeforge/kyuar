"use client";

import type { ErrorCorrectionLevel } from "@kyuar/qr";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@kyuar/ui/components/field";
import { Slider } from "@kyuar/ui/components/slider";
import { Switch } from "@kyuar/ui/components/switch";
import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";
import { useId } from "react";

import { useMessages } from "~/i18n";
import { single } from "~/lib/slider";

import type { EditorModel } from "./use-editor";

const LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

export function LayoutPanel({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { style, update, logo } = editor;
  const boostId = useId();

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel>
          {t.layout.margin}
          <span className="text-muted-foreground ml-auto tabular-nums">{style.margin}</span>
        </FieldLabel>
        <Slider
          aria-label={t.layout.margin}
          value={style.margin}
          min={0}
          max={8}
          step={1}
          onValueChange={(value) => update({ margin: single(value) })}
        />
        <FieldDescription>{t.layout.marginHint}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>
          {t.layout.corners}
          <span className="text-muted-foreground ml-auto tabular-nums">
            {Math.round(style.backgroundRadius * 100)}%
          </span>
        </FieldLabel>
        <Slider
          aria-label={t.layout.corners}
          value={style.backgroundRadius}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(value) => update({ backgroundRadius: single(value) })}
        />
      </Field>

      <FieldSet>
        <FieldLegend variant="label">{t.layout.ecc}</FieldLegend>
        <ToggleGroup
          value={[logo ? "H" : style.ecc]}
          onValueChange={(next) => {
            const [ecc] = next as ErrorCorrectionLevel[];
            if (ecc) update({ ecc });
          }}
          disabled={Boolean(logo)}
          variant="outline"
          className="w-full"
        >
          {LEVELS.map((level) => (
            <ToggleGroupItem key={level} value={level} className="flex-1 tabular-nums">
              {level}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription>{t.layout.eccHint}</FieldDescription>
      </FieldSet>

      <Field orientation="horizontal">
        <FieldLabel htmlFor={boostId}>{t.layout.boost}</FieldLabel>
        <Switch
          id={boostId}
          checked={style.boostEcc}
          onCheckedChange={(boostEcc) => update({ boostEcc })}
        />
      </Field>
    </div>
  );
}
