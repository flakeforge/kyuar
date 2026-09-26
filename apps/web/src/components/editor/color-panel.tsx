"use client";

import { THEMES } from "@kyuar/qr";
import { FieldLegend, FieldSet } from "@kyuar/ui/components/field";
import { Separator } from "@kyuar/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";

import { useMessages } from "~/i18n";

import { PaintField } from "./paint-field";
import type { EditorModel } from "./use-editor";

export function ColorPanel({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { style, update, themeId, applyTheme } = editor;

  return (
    <div className="flex flex-col gap-6">
      <FieldSet>
        <FieldLegend variant="label">{t.color.themes}</FieldLegend>
        <ToggleGroup
          value={themeId ? [themeId] : []}
          onValueChange={(next) => {
            const theme = THEMES.find((item) => item.id === next[0]);
            if (theme) applyTheme(theme);
          }}
          spacing={1}
          className="grid w-full grid-cols-8 gap-2"
        >
          {THEMES.map((theme) => (
            <ToggleGroupItem
              key={theme.id}
              value={theme.id}
              aria-label={theme.name}
              title={theme.name}
              className="ring-offset-background data-pressed:ring-foreground aspect-square h-auto w-full rounded-full p-0 ring-offset-2 data-pressed:ring-2"
              style={{ background: theme.background, color: theme.foreground }}
            >
              <span className="size-2.5 rounded-full bg-current" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FieldSet>

      <Separator />

      <PaintField
        legend={t.color.background}
        paint={style.background}
        onChange={(background) => update({ background }, false)}
      />
      <PaintField
        legend={t.color.data}
        paint={style.data.paint}
        onChange={(paint) => update({ data: { ...style.data, paint } }, false)}
      />
      <PaintField
        legend={t.color.finderOuter}
        paint={style.finderOuter.paint}
        onChange={(paint) => update({ finderOuter: { ...style.finderOuter, paint } }, false)}
      />
      <PaintField
        legend={t.color.finderInner}
        paint={style.finderInner.paint}
        onChange={(paint) => update({ finderInner: { ...style.finderInner, paint } }, false)}
      />
      <PaintField
        legend={t.color.alignment}
        paint={style.alignment.paint}
        onChange={(paint) => update({ alignment: { ...style.alignment, paint } }, false)}
      />
      <PaintField
        legend={t.color.timing}
        paint={style.timing.paint}
        onChange={(paint) => update({ timing: { paint } }, false)}
      />
    </div>
  );
}
