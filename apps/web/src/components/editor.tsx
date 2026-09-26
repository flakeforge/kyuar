"use client";

import { DEFAULT_STYLE, DEFAULT_THEME, THEMES, withColors, type QrTheme } from "@kyuar/qr";
import { buildQrUrl, classifyContent, qrRequestSchema } from "@kyuar/shared";
import { useCallback, useMemo, useState } from "react";

import { ControlRow } from "~/components/control-row";
import { QrCanvas } from "~/components/qr-canvas";
import { ThemePicker } from "~/components/theme-picker";
import {
  download as telegramDownload,
  haptic,
  rawInitData,
  setHeaderColor,
  share as telegramShare,
} from "~/lib/telegram";
import { useTelegram } from "~/lib/use-telegram";

const FINDER_CYCLE = ["dot", "extra-rounded", "classy", "square"] as const;
const MODULE_CYCLE = ["fluid", "dot", "classy-rounded", "square"] as const;

interface EditorProps {
  initialData: string;
}

export function Editor({ initialData }: EditorProps) {
  const isTelegram = useTelegram();

  const [value, setValue] = useState(initialData);
  const [theme, setTheme] = useState<QrTheme>(DEFAULT_THEME);
  const [styleIndex, setStyleIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const content = classifyContent(value || "kyuar.app");
  const finderStyle = FINDER_CYCLE[styleIndex % FINDER_CYCLE.length] ?? "dot";
  const moduleStyle = MODULE_CYCLE[styleIndex % MODULE_CYCLE.length] ?? "fluid";

  const style = useMemo(() => {
    const colored = withColors(DEFAULT_STYLE, theme.foreground, theme.background);
    return {
      ...colored,
      data: { ...colored.data, shape: moduleStyle },
      finderOuter: { ...colored.finderOuter, shape: finderStyle },
    };
  }, [moduleStyle, finderStyle, theme.foreground, theme.background]);

  const options = useMemo(() => ({ data: content.value, style }), [content.value, style]);

  const applyTheme = useCallback((next: QrTheme) => {
    setTheme(next);
    setHeaderColor(next.background);
    document.documentElement.style.setProperty("--theme", next.background);
    document.documentElement.style.setProperty("--theme-ink", next.foreground);
  }, []);

  const selectTheme = useCallback(
    (next: QrTheme) => {
      applyTheme(next);
      haptic("select");
    },
    [applyTheme],
  );

  const shuffle = useCallback(() => {
    setStyleIndex((index) => index + 1);
    const pool = THEMES.filter((item) => item.id !== theme.id);
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (next) applyTheme(next);
    haptic("impact");
  }, [applyTheme, theme.id]);

  const download = useCallback(async () => {
    const request = qrRequestSchema.parse({ ...options, format: "png" });
    const url = buildQrUrl(window.location.origin, request);
    const handled = await telegramDownload(url, "kyuar.png");
    if (!handled) window.open(url, "_blank", "noopener,noreferrer");
    haptic("success");
  }, [options]);

  const share = useCallback(async () => {
    const initData = rawInitData();
    if (!initData) {
      window.open(
        buildQrUrl(window.location.origin, qrRequestSchema.parse({ ...options, format: "png" })),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) throw new Error("share failed");

      const { id } = (await response.json()) as { id: string };
      await telegramShare(id);
      haptic("success");
    } catch {
      haptic("impact");
    } finally {
      setIsSharing(false);
    }
  }, [options]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-4 pb-32">
      <QrCanvas data={options.data} style={style} />

      <div className="surface-row flex items-center gap-3 px-5 py-4">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="kyuar.app"
          aria-label="Content to encode"
          className="min-w-0 flex-1 bg-transparent text-center font-medium outline-none placeholder:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <ThemePicker active={theme} onSelect={selectTheme} />

        <ControlRow label="Style" onClick={() => setStyleIndex((index) => index + 1)}>
          <span className="text-sm capitalize">{moduleStyle}</span>
        </ControlRow>

        <ControlRow label="Logo">
          <span className="text-sm opacity-60">Soon</span>
        </ControlRow>
      </div>

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-md items-center justify-center gap-3 px-4 pb-6">
        <button
          type="button"
          onClick={() => void download()}
          aria-label="Download"
          className="ease-snap grid size-14 place-items-center rounded-full bg-white/90 shadow-lg shadow-black/10 backdrop-blur transition-transform duration-150 active:scale-90"
        >
          <DownloadIcon />
        </button>

        <button
          type="button"
          onClick={shuffle}
          aria-label="Shuffle style"
          className="ease-snap grid h-14 w-24 place-items-center rounded-full text-(--theme-ink) shadow-lg shadow-black/20 transition-transform duration-150 active:scale-90"
          style={{ background: theme.background }}
        >
          <ShuffleIcon />
        </button>

        <button
          type="button"
          onClick={() => void share()}
          disabled={isSharing || !isTelegram}
          aria-label="Share to Telegram"
          className="ease-snap grid size-14 place-items-center rounded-full bg-white/90 shadow-lg shadow-black/10 backdrop-blur transition-transform duration-150 active:scale-90 disabled:opacity-50"
        >
          <ShareIcon />
        </button>
      </nav>
    </main>
  );
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0 4 4m-4-4L8 8M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
