"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

interface ColorSliderProps extends Omit<
  SliderPrimitive.Root.Props<number>,
  "value" | "onValueChange"
> {
  value: number;
  onValueChange: (value: number) => void;
  track: string;
  thumbColor: string;
}

/**
 * Single-thumb slider whose track shows the color range it controls. The
 * thumb is filled with the color at its position.
 */
function ColorSlider({
  className,
  value,
  onValueChange,
  track,
  thumbColor,
  "aria-label": ariaLabel,
  ...props
}: ColorSliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="color-slider"
      className={cn("w-full", className)}
      value={value}
      onValueChange={(next) => onValueChange(Array.isArray(next) ? (next[0] ?? 0) : next)}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-11 w-full touch-none items-center select-none">
        <SliderPrimitive.Track
          className="relative h-3 w-full rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
          style={{ background: track }}
        />
        <SliderPrimitive.Thumb
          getAriaLabel={ariaLabel ? () => ariaLabel : undefined}
          className="border-background ring-ring/50 block size-7 rounded-full border-[3px] shadow-md outline-none focus-visible:ring-3"
          style={{ background: thumbColor }}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { ColorSlider };
