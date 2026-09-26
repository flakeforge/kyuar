"use client";

import { useEffect, useSyncExternalStore } from "react";

import { isTelegramStarted, startTelegram, subscribeTelegram } from "./telegram";

/**
 * Starts the Telegram SDK after hydration and reports whether the page runs
 * inside Telegram.
 */
export function useTelegram(): boolean {
  useEffect(() => {
    startTelegram();
  }, []);

  return useSyncExternalStore(subscribeTelegram, isTelegramStarted, () => false);
}
