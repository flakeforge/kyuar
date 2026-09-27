"use client";

import { hexToOklch, oklchToHex, type Oklch } from "@kyuar/qr";
import { ColorSlider } from "@kyuar/ui/components/color-slider";
import { Field, FieldLabel } from "@kyuar/ui/components/field";
import { Input } from "@kyuar/ui/components/input";
import { useId, useState } from "react";

import { useMessages } from "~/i18n";

const MAX_CHROMA = 0.37;
const STEPS = 12;
const HEX = /^#?[0-9a-f]{6}$/i;

function gradient(make: (t: number) => Oklch) {
  const stops = Array.from({ length: STEPS + 1 }, (_, index) => oklchToHex(make(index / STEPS)));
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

interface OklchPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

/**
 * Color picker on the OKLCH axes: equal slider steps look like equal color
 * steps, and moving lightness never shifts the hue.
 */
export function OklchPicker({ value, onChange }: OklchPickerProps) {
  const t = useMessages();
  const hexId = useId();
  const [color, setColor] = useState<Oklch>(() => hexToOklch(value));
  const [seen, setSeen] = useState(value);
  const [draft, setDraft] = useState(value);

  if (value !== seen) {
    setSeen(value);
    setColor(hexToOklch(value));
    setDraft(value);
  }

  const emit = (next: Oklch) => {
    const hex = oklchToHex(next);
    setColor(next);
    setSeen(hex);
    setDraft(hex);
    onChange(hex);
  };

  const commitDraft = () => {
    if (!HEX.test(draft)) {
      setDraft(value);
      return;
    }
    const hex = `#${draft.replace("#", "").toLowerCase()}`;
    setSeen(hex);
    setColor(hexToOklch(hex));
    onChange(hex);
  };

  const vivid = Math.max(color.c, 0.12);

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel>{t.color.lightness}</FieldLabel>
        <ColorSlider
          aria-label={t.color.lightness}
          min={0}
          max={1}
          step={0.005}
          value={color.l}
          onValueChange={(l) => emit({ ...color, l })}
          track={gradient((step) => ({ ...color, l: step }))}
          thumbColor={value}
        />
      </Field>
      <Field>
        <FieldLabel>{t.color.chroma}</FieldLabel>
        <ColorSlider
          aria-label={t.color.chroma}
          min={0}
          max={MAX_CHROMA}
          step={0.002}
          value={color.c}
          onValueChange={(c) => emit({ ...color, c })}
          track={gradient((step) => ({ ...color, c: step * MAX_CHROMA }))}
          thumbColor={value}
        />
      </Field>
      <Field>
        <FieldLabel>{t.color.hue}</FieldLabel>
        <ColorSlider
          aria-label={t.color.hue}
          min={0}
          max={360}
          step={1}
          value={color.h}
          onValueChange={(h) => emit({ ...color, h })}
          track={gradient((step) => ({
            l: Math.min(Math.max(color.l, 0.55), 0.8),
            c: vivid,
            h: step * 360,
          }))}
          thumbColor={value}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={hexId}>{t.color.hex}</FieldLabel>
        <Input
          id={hexId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") commitDraft();
          }}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          className="h-11 font-mono uppercase"
        />
      </Field>
    </div>
  );
}
