import { cloudStorage, copyTextToClipboard, openLink, qrScanner } from "@tma.js/sdk-react";

import type { ScanJobResult } from "~/workers/scan.worker";

import { isTelegramStarted } from "./telegram";

const MAX_SIDE = 2000;
const HISTORY_KEY = "scan-history";
const HISTORY_LIMIT = 20;
const TELEGRAM_VALUE_LIMIT = 4096;

let worker: Worker | undefined;
let nextJob = 0;

function getWorker() {
  worker ??= new Worker(new URL("../workers/scan.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

export function cameraAvailable(): boolean {
  return isTelegramStarted() && qrScanner.capture.isAvailable();
}

export async function scanWithCamera(prompt: string): Promise<string | undefined> {
  if (!cameraAvailable()) return undefined;
  return (await qrScanner.capture({ text: prompt, capture: () => true })) ?? undefined;
}

/**
 * Decodes a picked photo or screenshot in a Web Worker. The image is capped at
 * 2000 px so a phone photo does not stall decoding.
 */
export async function scanFile(file: File): Promise<string | undefined> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const { data } = context.getImageData(0, 0, width, height);

  nextJob += 1;
  const id = nextJob;
  const target = getWorker();
  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent<ScanJobResult>) => {
      if (event.data.id !== id) return;
      target.removeEventListener("message", onMessage);
      resolve(event.data.text);
    };
    target.addEventListener("message", onMessage);
    target.postMessage({ id, image: { width, height, data } }, [data.buffer]);
  });
}

export interface HistoryEntry {
  text: string;
  at: number;
}

function parseHistory(value: string | null | undefined): HistoryEntry[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is HistoryEntry =>
            typeof item === "object" &&
            item !== null &&
            typeof item.text === "string" &&
            typeof item.at === "number",
        )
      : [];
  } catch {
    return [];
  }
}

function useCloud() {
  return isTelegramStarted() && cloudStorage.getItem.isAvailable();
}

/**
 * Scan history lives in Telegram CloudStorage, which syncs across the user's
 * devices and never reaches our server. Outside Telegram it falls back to
 * localStorage.
 */
export async function loadHistory(): Promise<HistoryEntry[]> {
  if (useCloud()) return parseHistory(await cloudStorage.getItem(HISTORY_KEY).catch(() => ""));
  try {
    return parseHistory(window.localStorage.getItem(HISTORY_KEY));
  } catch {
    return [];
  }
}

export async function saveToHistory(text: string): Promise<HistoryEntry[]> {
  const entries = [
    { text, at: Date.now() },
    ...(await loadHistory()).filter((entry) => entry.text !== text),
  ];
  let kept = entries.slice(0, HISTORY_LIMIT);
  while (kept.length > 1 && JSON.stringify(kept).length > TELEGRAM_VALUE_LIMIT)
    kept = kept.slice(0, -1);
  const value = JSON.stringify(kept);

  if (useCloud()) await cloudStorage.setItem(HISTORY_KEY, value).catch(() => undefined);
  else {
    try {
      window.localStorage.setItem(HISTORY_KEY, value);
    } catch {
      return kept;
    }
  }
  return kept;
}

export async function clearHistory(): Promise<void> {
  if (useCloud()) await cloudStorage.setItem(HISTORY_KEY, "[]").catch(() => undefined);
  else {
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      return;
    }
  }
}

export async function copyText(text: string): Promise<void> {
  if (isTelegramStarted()) {
    await copyTextToClipboard(text);
    return;
  }
  await navigator.clipboard.writeText(text);
}

export function openExternal(href: string) {
  if (isTelegramStarted() && openLink.isAvailable()) {
    openLink(href);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}
