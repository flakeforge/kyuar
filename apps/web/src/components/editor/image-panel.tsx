"use client";

import { Button } from "@kyuar/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@kyuar/ui/components/field";
import { Slider } from "@kyuar/ui/components/slider";
import { toast } from "@kyuar/ui/lib/toast";
import { ImageIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";

import { useMessages } from "~/i18n";
import { loadImage, type LoadedImage } from "~/lib/images";
import { single } from "~/lib/slider";

import type { EditorModel } from "./use-editor";

function ImagePicker({
  label,
  hasImage,
  onPick,
  onRemove,
}: {
  label: string;
  hasImage: boolean;
  onPick: (image: LoadedImage) => void;
  onRemove: () => void;
}) {
  const t = useMessages();
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2">
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label={label}
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            onPick(await loadImage(file));
          } catch {
            toast.add({ title: t.image.unreadable, type: "error" });
          }
        }}
      />
      <Button variant="outline" size="lg" className="flex-1" onClick={() => input.current?.click()}>
        <ImageIcon data-icon="inline-start" />
        {hasImage ? t.image.replace : t.image.choose}
      </Button>
      {hasImage && (
        <Button variant="ghost" size="lg" onClick={onRemove}>
          <Trash2Icon data-icon="inline-start" />
          {t.image.remove}
        </Button>
      )}
    </div>
  );
}

export function ImagePanel({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { style, update, logo, setLogo, halftone, setHalftone } = editor;

  return (
    <div className="flex flex-col gap-6">
      <FieldSet>
        <FieldLegend variant="label">{t.image.logo}</FieldLegend>
        <FieldDescription>{t.image.logoHint}</FieldDescription>
        <ImagePicker
          label={t.image.logo}
          hasImage={Boolean(logo)}
          onPick={(image) => setLogo(image.dataUrl)}
          onRemove={() => setLogo(null)}
        />
        {logo && (
          <Field>
            <FieldLabel>
              {t.image.logoSize}
              <span className="text-muted-foreground ml-auto tabular-nums">
                {Math.round(style.logo.ratio * 100)}%
              </span>
            </FieldLabel>
            <Slider
              aria-label={t.image.logoSize}
              value={style.logo.ratio}
              min={0.1}
              max={0.3}
              step={0.02}
              onValueChange={(value) => update({ logo: { ratio: single(value) } })}
            />
          </Field>
        )}
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{t.image.halftone}</FieldLegend>
        <FieldDescription>{t.image.halftoneHint}</FieldDescription>
        <ImagePicker
          label={t.image.halftone}
          hasImage={Boolean(halftone)}
          onPick={(image) =>
            setHalftone({
              dataUrl: image.dataUrl,
              image: image.gray,
              centerRatio: halftone?.centerRatio ?? 0.45,
              contrast: halftone?.contrast ?? 1,
            })
          }
          onRemove={() => setHalftone(null)}
        />
        {halftone && (
          <>
            <Field>
              <FieldLabel>{t.image.centerSize}</FieldLabel>
              <Slider
                aria-label={t.image.centerSize}
                value={halftone.centerRatio}
                min={0.3}
                max={0.7}
                step={0.05}
                onValueChange={(value) => setHalftone({ ...halftone, centerRatio: single(value) })}
              />
            </Field>
            <Field>
              <FieldLabel>{t.image.contrast}</FieldLabel>
              <Slider
                aria-label={t.image.contrast}
                value={halftone.contrast}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(value) => setHalftone({ ...halftone, contrast: single(value) })}
              />
            </Field>
          </>
        )}
      </FieldSet>
    </div>
  );
}
