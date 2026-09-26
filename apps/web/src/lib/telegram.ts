import {
  downloadFile,
  hapticFeedback,
  init,
  isTMA,
  miniApp,
  retrieveLaunchParams,
  retrieveRawInitData,
  shareMessage,
  swipeBehavior,
  viewport,
} from "@tma.js/sdk-react";

const MOBILE_PLATFORMS: ReadonlySet<string> = new Set(["ios", "android", "android_x"]);

let started = false;
let headerColor: string | undefined;
const listeners = new Set<VoidFunction>();

export function subscribeTelegram(listener: VoidFunction): VoidFunction {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isTelegramStarted(): boolean {
  return started;
}

function isMobile() {
  try {
    return MOBILE_PLATFORMS.has(retrieveLaunchParams().tgWebAppPlatform);
  } catch {
    return false;
  }
}

async function enterFullscreen() {
  if (!viewport.mount.isAvailable()) return;
  await viewport.mount();
  viewport.bindCssVars.ifAvailable();
  viewport.expand.ifAvailable();
  if (viewport.requestFullscreen.isAvailable()) {
    await viewport.requestFullscreen().catch(() => undefined);
  }
}

/**
 * Starts the Mini App SDK once. On phones the app opens expanded and
 * fullscreen; desktop and web clients keep the size Telegram gives them.
 * Returns false outside Telegram, where the page works as a plain website.
 */
export function startTelegram(): boolean {
  if (!isTMA()) return false;
  if (started) return true;
  started = true;

  init();
  miniApp.mount.ifAvailable();
  miniApp.ready.ifAvailable();
  swipeBehavior.mount.ifAvailable();
  swipeBehavior.disableVertical.ifAvailable();

  applyHeaderColor();
  if (isMobile()) void enterFullscreen();
  for (const listener of listeners) listener();
  return true;
}

function applyHeaderColor() {
  if (started && headerColor) miniApp.setHeaderColor.ifAvailable(headerColor as `#${string}`);
}

export function setHeaderColor(color: string) {
  headerColor = color;
  applyHeaderColor();
}

export function rawInitData(): string | undefined {
  if (!started) return undefined;
  try {
    return retrieveRawInitData();
  } catch {
    return undefined;
  }
}

export function haptic(kind: "select" | "impact" | "success" | "error" = "select") {
  if (!started) return;
  if (kind === "select") hapticFeedback.selectionChanged.ifAvailable();
  else if (kind === "impact") hapticFeedback.impactOccurred.ifAvailable("medium");
  else hapticFeedback.notificationOccurred.ifAvailable(kind);
}

export async function download(url: string, fileName: string): Promise<boolean> {
  if (started && downloadFile.isAvailable()) {
    await downloadFile(url, fileName);
    return true;
  }
  return false;
}

export async function share(messageId: string): Promise<boolean> {
  if (started && shareMessage.isAvailable()) {
    await shareMessage(messageId);
    return true;
  }
  return false;
}
