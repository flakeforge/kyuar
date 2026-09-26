"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getWebApp, isInsideTelegram, type TelegramWebApp } from "./telegram";

interface TelegramState {
  app: TelegramWebApp | undefined;
  isReady: boolean;
  isTelegram: boolean;
}

/**
 * Initialises the Telegram Mini App SDK once and reports whether the page is
 * actually running inside Telegram. Outside Telegram the app still works as a
 * plain web page, which is what makes local development bearable.
 */
export function useTelegram(): TelegramState & { setAccent: (color: string) => void } {
  const [state, setState] = useState<TelegramState>({
    app: undefined,
    isReady: false,
    isTelegram: false,
  });
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const app = getWebApp();
    if (app) {
      app.ready();
      app.expand();
      app.disableVerticalSwipes?.();
    }

    setState({ app, isReady: true, isTelegram: isInsideTelegram() });
  }, []);

  const setAccent = useCallback(
    (color: string) => {
      const app = state.app;
      if (!app) return;
      app.setHeaderColor(color);
      app.setBackgroundColor(color);
      app.setBottomBarColor?.(color);
    },
    [state.app],
  );

  return { ...state, setAccent };
}
