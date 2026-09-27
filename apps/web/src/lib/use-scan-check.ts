"use client";

import { useEffect, useState } from "react";

import { decodePixels } from "./scanner";

const DELAY_MS = 700;

interface Condition {
  size: number;
  filter: string;
}

const CONDITIONS: Condition[] = [
  { size: 240, filter: "none" },
  { size: 132, filter: "none" },
  { size: 240, filter: "blur(1.6px)" },
  { size: 240, filter: "contrast(0.5) brightness(0.85)" },
];

export interface ScanCheck {
  passed: number;
  total: number;
}

async function loadImage(src: string) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

async function readsUnder(image: HTMLImageElement, condition: Condition, expected: string) {
  const canvas = document.createElement("canvas");
  canvas.width = condition.size;
  canvas.height = condition.size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, condition.size, condition.size);
  context.filter = condition.filter;
  context.drawImage(image, 0, 0, condition.size, condition.size);
  const { data } = context.getImageData(0, 0, condition.size, condition.size);
  return (await decodePixels(condition.size, condition.size, data)) === expected;
}

/**
 * Tries to read the rendered code the way a phone would struggle to: small,
 * blurred and in poor light. Runs after the preview settles, off the hot path.
 */
export function useScanCheck(src: string | undefined, expected: string): ScanCheck | undefined {
  const [check, setCheck] = useState<{ key: string; value: ScanCheck } | undefined>(undefined);
  const key = `${expected}\n${src ?? ""}`;

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const image = await loadImage(src);
        const results = await Promise.all(
          CONDITIONS.map((condition) => readsUnder(image, condition, expected)),
        );
        const passed = results.filter(Boolean).length;
        if (!cancelled) setCheck({ key, value: { passed, total: CONDITIONS.length } });
      } catch {
        return;
      }
    }, DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [expected, key, src]);

  return check?.key === key ? check.value : undefined;
}
