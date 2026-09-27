"use client";

import { Button } from "@kyuar/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@kyuar/ui/components/field";
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
      <Button
        variant="secondary"
        size="xl"
        className="flex-1"
        onClick={() => input.current?.click()}
      >
        <ImageIcon data-icon="inline-start" />
        {hasImage ? t.image.replace : t.image.choose}
      </Button>
      {hasImage && (
        <Button variant="ghost" size="icon-xl" aria-label={t.image.remove} onClick={onRemove}>
          <Trash2Icon />
        </Button>
      )}
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <Field>
      <FieldLabel>
        {label}
        <span className="text-muted-foreground ml-auto tabular-nums">{format(value)}</span>
      </FieldLabel>
      <Slider
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange(single(next))}
      />
    </Field>
  );
}

const percent = (value: number) => `${Math.round(value * 100)}%`;

export function LogoSheet({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { logo, setLogo, style, update } = editor;

  return (
    <div className="flex flex-col gap-5">
      <FieldDescription>{t.image.logoHint}</FieldDescription>
      <ImagePicker
        label={t.rows.logo}
        hasImage={Boolean(logo)}
        onPick={(image) => setLogo(image.dataUrl)}
        onRemove={() => setLogo(null)}
      />
      {logo && (
        <RangeField
          label={t.image.logoSize}
          value={style.logo.ratio || 0.22}
          min={0.1}
          max={0.3}
          step={0.02}
          format={percent}
          onChange={(ratio) => update({ logo: { ratio } })}
        />
      )}
    </div>
  );
}

export function PictureSheet({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { halftone, setHalftone } = editor;

  return (
    <div className="flex flex-col gap-5">
      <FieldDescription>{t.image.pictureHint}</FieldDescription>
      <ImagePicker
        label={t.rows.picture}
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
          <RangeField
            label={t.image.centerSize}
            value={halftone.centerRatio}
            min={0.3}
            max={0.7}
            step={0.05}
            format={percent}
            onChange={(centerRatio) => setHalftone({ ...halftone, centerRatio })}
          />
          <RangeField
            label={t.image.contrast}
            value={halftone.contrast}
            min={0.5}
            max={2}
            step={0.1}
            format={(value) => `${value.toFixed(1)}×`}
            onChange={(contrast) => setHalftone({ ...halftone, contrast })}
          />
        </>
      )}
    </div>
  );
}
