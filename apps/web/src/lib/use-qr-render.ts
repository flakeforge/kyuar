"use client";

import type { RenderInput } from "@kyuar/qr";
import { useEffect, useRef, useState } from "react";

import type { QrJobResult } from "~/workers/qr.worker";

const DEBOUNCE_MS = 50;

export type QrRenderState =
  | { status: "pending" }
  | { status: "ready"; src: string; size: number; warnings: string[] }
  | { status: "failed" };

let worker: Worker | undefined;

function getWorker() {
  worker ??= new Worker(new URL("../workers/qr.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

/**
 * Renders the code in a Web Worker so dragging a color or slider never blocks
 * the main thread. Rapid changes are debounced, and only the newest job's
 * result is applied.
 */
export function useQrRender(input: RenderInput): QrRenderState {
  const [state, setState] = useState<QrRenderState>({ status: "pending" });
  const latest = useRef(0);

  useEffect(() => {
    const target = getWorker();
    const onMessage = (event: MessageEvent<QrJobResult>) => {
      const result = event.data;
      if (result.id !== latest.current) return;
      setState(
        result.ok
          ? { status: "ready", src: result.src, size: result.size, warnings: result.warnings }
          : { status: "failed" },
      );
    };
    target.addEventListener("message", onMessage);
    return () => target.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const id = latest.current + 1;
    latest.current = id;
    const timer = window.setTimeout(() => getWorker().postMessage({ id, input }), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [input]);

  return state;
}
