"use client";

import {
  formatColor,
  hexToHsv,
  hsvToHex,
  parseColor,
  type ColorFormat,
  type Hsv,
} from "@kyuar/shared";
import { Button } from "@kyuar/ui/components/button";
import { ColorArea } from "@kyuar/ui/components/color-area";
import { ColorSlider } from "@kyuar/ui/components/color-slider";
import { Input } from "@kyuar/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kyuar/ui/components/select";
import { PipetteIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { useMessages } from "~/i18n";

const FORMATS: { value: ColorFormat; label: string }[] = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "oklch", label: "OKLCH" },
];

const HUE_TRACK =
  "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))";

interface EyeDropperResult {
  sRGBHex: string;
}

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<EyeDropperResult> };
  }
}

const noSubscribe = () => () => undefined;

function useEyeDropper() {
  return useSyncExternalStore(
    noSubscribe,
    () => (typeof window.EyeDropper === "function" ? window.EyeDropper : null),
    () => null,
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

/**
 * Saturation and brightness area, hue slider, eyedropper where the browser
 * has one, and a text field in HEX, RGB, HSL or OKLCH.
 */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const t = useMessages();
  const EyeDropper = useEyeDropper();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [seen, setSeen] = useState(value);
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [draft, setDraft] = useState(() => formatColor(value, "hex"));

  if (value !== seen) {
    setSeen(value);
    setHsv(hexToHsv(value));
    setDraft(formatColor(value, format));
  }

  const emit = (next: Hsv) => {
    const hex = hsvToHex(next);
    setHsv(next);
    setSeen(hex);
    setDraft(formatColor(hex, format));
    onChange(hex);
  };

  const commit = (hex: string | undefined) => {
    if (!hex) {
      setDraft(formatColor(value, format));
      return;
    }
    setSeen(hex);
    setHsv(hexToHsv(hex));
    setDraft(formatColor(hex, format));
    onChange(hex);
  };

  return (
    <div className="flex flex-col gap-4">
      <ColorArea
        aria-label={t.color.area}
        hue={hsv.h}
        saturation={hsv.s}
        value={hsv.v}
        thumbColor={value}
        onChange={(s, v) => emit({ ...hsv, s, v })}
      />
      <ColorSlider
        aria-label={t.color.hue}
        min={0}
        max={360}
        step={1}
        value={hsv.h}
        onValueChange={(h) => emit({ ...hsv, h })}
        track={HUE_TRACK}
        thumbColor={hsvToHex({ h: hsv.h, s: 1, v: 1 })}
      />
      <div className="flex items-center gap-2">
        {EyeDropper && (
          <Button
            variant="outline"
            size="icon-xl"
            aria-label={t.color.eyedropper}
            onClick={async () => {
              try {
                const { sRGBHex } = await new EyeDropper().open();
                commit(parseColor(sRGBHex));
              } catch {
                return;
              }
            }}
          >
            <PipetteIcon />
          </Button>
        )}
        <Select
          value={format}
          onValueChange={(next) => {
            const nextFormat = next as ColorFormat;
            setFormat(nextFormat);
            setDraft(formatColor(value, nextFormat));
          }}
        >
          <SelectTrigger aria-label={t.color.format} className="h-12 w-28 shrink-0">
            <SelectValue>{FORMATS.find((item) => item.value === format)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {FORMATS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          aria-label={t.color.value}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(parseColor(draft))}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(parseColor(draft));
          }}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          className="h-12 min-w-0 flex-1 font-mono text-base"
        />
      </div>
    </div>
  );
}
