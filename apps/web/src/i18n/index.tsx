"use client";

import type { Locale } from "@kyuar/shared";
import { resolveLocale } from "@kyuar/shared";
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

import { isTelegramStarted, subscribeTelegram, telegramLanguage } from "~/lib/telegram";

import { en, type Messages } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";

const MESSAGES: Record<Locale, Messages> = { en, uz, ru };

const MessagesContext = createContext<Messages>(en);

function telegramLocale(): Locale | undefined {
  if (!isTelegramStarted()) return undefined;
  const code = telegramLanguage();
  return code ? resolveLocale(code) : undefined;
}

/**
 * Serves messages in the locale from `Accept-Language` on the first render,
 * then switches to the Telegram user's language once the SDK has started.
 */
export function MessagesProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const fromTelegram = useSyncExternalStore(subscribeTelegram, telegramLocale, () => undefined);
  const active = fromTelegram ?? locale;

  useEffect(() => {
    document.documentElement.lang = active;
  }, [active]);

  return <MessagesContext value={MESSAGES[active]}>{children}</MessagesContext>;
}

export function useMessages(): Messages {
  return useContext(MessagesContext);
}
