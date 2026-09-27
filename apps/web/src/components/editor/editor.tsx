"use client";

import { hexToOklch, oklchToHex } from "@kyuar/qr";
import { Input } from "@kyuar/ui/components/input";
import { Separator } from "@kyuar/ui/components/separator";
import { useEffect } from "react";

import { useMessages } from "~/i18n";
import { setHeaderColor } from "~/lib/telegram";
import { useTelegram } from "~/lib/use-telegram";

import { ActionBar } from "./action-bar";
import { Controls } from "./controls";
import styles from "./editor.module.css";
import { Preview, ScanWarning, useRendered } from "./preview";
import { useEditor } from "./use-editor";

const PAGE_TINT = 0.12;

function pageBackground(theme: string) {
  const { l, c, h } = hexToOklch(theme);
  return oklchToHex({ l: l * PAGE_TINT + (1 - PAGE_TINT), c: c * PAGE_TINT, h });
}

export function Editor({ initialData }: { initialData: string }) {
  const t = useMessages();
  useTelegram();
  const editor = useEditor(initialData);
  const rendered = useRendered(editor);
  const { themeColor, inkColor } = editor;

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--theme", themeColor);
    root.setProperty("--theme-ink", inkColor);
    setHeaderColor(pageBackground(themeColor));
  }, [themeColor, inkColor]);

  return (
    <>
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-3 px-4 pb-36">
        <h1 className="sr-only">kyuar</h1>
        <header className={styles.header}>
          <div className={styles.backdrop} />
          <div className={styles.code}>
            <Preview rendered={rendered} isEmpty={editor.isEmpty} />
          </div>
        </header>

        <ScanWarning rendered={rendered} margin={editor.style.margin} />

        <Input
          aria-label={t.input.label}
          value={editor.value}
          onChange={(event) => editor.setValue(event.target.value)}
          placeholder={t.input.placeholder}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className={`${styles.item} bg-card text-card-foreground h-14 rounded-(--radius) border-transparent text-center text-base font-medium`}
        />

        <Separator className={`${styles.item} my-2`} />

        <Controls editor={editor} itemClassName={styles.item} />
      </main>

      <ActionBar editor={editor} />
    </>
  );
}
