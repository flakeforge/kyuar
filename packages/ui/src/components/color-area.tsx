"use client";

import { cn } from "cn";
import * as React from "react";

interface ColorAreaProps {
  hue: number;
  saturation: number;
  value: number;
  onChange: (saturation: number, value: number) => void;
  thumbColor: string;
  "aria-label": string;
  className?: string;
}

const KEY_STEP = 0.01;
const PAGE_STEP = 0.1;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

/**
 * Two-dimensional saturation and brightness picker for one hue, driven by
 * pointer drag or arrow keys. Saturation runs left to right, brightness bottom
 * to top.
 */
function ColorArea({
  hue,
  saturation,
  value,
  onChange,
  thumbColor,
  "aria-label": ariaLabel,
  className,
}: ColorAreaProps) {
  const area = React.useRef<HTMLDivElement>(null);

  const pick = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = area.current?.getBoundingClientRect();
    if (!box) return;
    onChange(
      clamp((event.clientX - box.left) / box.width),
      clamp(1 - (event.clientY - box.top) / box.height),
    );
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? PAGE_STEP : KEY_STEP;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onChange(clamp(saturation + move[0]), clamp(value + move[1]));
  };

  return (
    <div
      ref={area}
      data-slot="color-area"
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(saturation * 100)}
      aria-valuetext={`${Math.round(saturation * 100)}%, ${Math.round(value * 100)}%`}
      className={cn(
        "focus-visible:ring-ring/50 relative aspect-[8/5] w-full touch-none rounded-(--radius) outline-none select-none focus-visible:ring-3",
        className,
      )}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue} 100% 50%))`,
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) pick(event);
      }}
      onKeyDown={onKeyDown}
    >
      <span
        aria-hidden="true"
        className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_2px_6px_rgb(0_0_0/0.3)]"
        style={{
          left: `${saturation * 100}%`,
          top: `${(1 - value) * 100}%`,
          background: thumbColor,
        }}
      />
    </div>
  );
}

export { ColorArea };
