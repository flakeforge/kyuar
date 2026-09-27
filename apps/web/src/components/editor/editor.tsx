"use client";

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

export function Editor({ initialData }: { initialData: string }) {
  const t = useMessages();
  const isTelegram = useTelegram();
  const editor = useEditor(initialData);
  const rendered = useRendered(editor);
  const { themeColor, inkColor } = editor;

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--theme", themeColor);
    root.setProperty("--theme-ink", inkColor);
    setHeaderColor(themeColor);
  }, [themeColor, inkColor]);

  return (
    <>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-3 px-4 pb-36">
        <header className={styles.header}>
          <div className={styles.backdrop} />
          <div className={styles.code}>
            <Preview rendered={rendered} />
          </div>
        </header>

        <ScanWarning rendered={rendered} />

        <Input
          aria-label={t.input.label}
          value={editor.value}
          onChange={(event) => editor.setValue(event.target.value)}
          placeholder={t.input.placeholder}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="bg-card text-card-foreground h-14 rounded-(--radius) border-transparent text-center text-base font-medium"
        />

        <Separator className="my-2" />

        <Controls editor={editor} />
      </main>

      <ActionBar editor={editor} isTelegram={isTelegram} />
    </>
  );
}
