"use client";

import { hexToOklch, oklchToHex } from "@kyuar/qr";
import { Button } from "@kyuar/ui/components/button";
import { Input } from "@kyuar/ui/components/input";
import { Separator } from "@kyuar/ui/components/separator";
import { ClipboardPasteIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ScanActions } from "~/components/scan/scan-actions";
import { ScanView } from "~/components/scan/scan-view";
import { useScan } from "~/components/scan/use-scan";
import { useMessages } from "~/i18n";
import { setHeaderColor } from "~/lib/telegram";
import { useScanCheck } from "~/lib/use-scan-check";
import { useTelegram } from "~/lib/use-telegram";

import { Controls } from "./controls";
import { CreateActions } from "./create-actions";
import { Dock, type Mode } from "./dock";
import styles from "./editor.module.css";
import { Preview, ScanScore, ScanWarning, useRendered } from "./preview";
import { useEditor } from "./use-editor";

const PAGE_TINT = 0.12;

function pageBackground(theme: string) {
  const { l, c, h } = hexToOklch(theme);
  return oklchToHex({ l: l * PAGE_TINT + (1 - PAGE_TINT), c: c * PAGE_TINT, h });
}

export function Editor({ initialData, initialMode }: { initialData: string; initialMode: Mode }) {
  const t = useMessages();
  const isTelegram = useTelegram();
  const [mode, setMode] = useState<Mode>(initialMode);
  const scan = useScan();
  const editor = useEditor(initialData);
  const rendered = useRendered(editor);
  const scanCheck = useScanCheck(
    rendered.status === "ready" && !editor.isEmpty ? rendered.src : undefined,
    editor.content.value,
  );
  const { themeColor, inkColor } = editor;

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--theme", themeColor);
    root.setProperty("--theme-ink", inkColor);
    setHeaderColor(pageBackground(themeColor));
  }, [themeColor, inkColor]);

  return (
    <>
      <main
        hidden={mode !== "create"}
        className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-3 px-4 pb-52"
      >
        <h1 className="sr-only">kyuar</h1>
        <header className={styles.header}>
          <div className={styles.backdrop} />
          <div className={styles.code}>
            <Preview rendered={rendered} isEmpty={editor.isEmpty} hasLogo={Boolean(editor.logo)} />
          </div>
        </header>

        <ScanWarning rendered={rendered} margin={editor.style.margin} />
        <div className={styles.item}>
          <ScanScore check={scanCheck} />
        </div>

        <div className={`${styles.item} relative`}>
          <Input
            aria-label={t.input.label}
            value={editor.value}
            onChange={(event) => editor.setValue(event.target.value)}
            placeholder={t.input.placeholder}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="bg-card text-card-foreground border-input h-14 rounded-(--radius) px-14 text-center text-base font-medium"
          />
          {editor.value ? (
            <Button
              variant="ghost"
              size="icon-xl"
              aria-label={t.input.clear}
              className="text-muted-foreground absolute top-1 right-1"
              onClick={() => editor.setValue("")}
            >
              <XIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-xl"
              aria-label={t.input.paste}
              className="text-muted-foreground absolute top-1 right-1"
              onClick={async () => {
                const text = await navigator.clipboard?.readText().catch(() => "");
                if (text) editor.setValue(text.trim());
              }}
            >
              <ClipboardPasteIcon />
            </Button>
          )}
        </div>

        <Separator className={`${styles.item} my-2`} />

        <Controls editor={editor} itemClassName={styles.item} />
      </main>

      {mode === "scan" && (
        <ScanView
          scan={scan}
          onRestyle={(text) => {
            editor.setValue(text);
            setMode("create");
          }}
        />
      )}

      <Dock mode={mode} onModeChange={setMode}>
        {mode === "create" ? (
          <CreateActions
            editor={editor}
            fits={rendered.status !== "failed"}
            isTelegram={isTelegram}
          />
        ) : (
          <ScanActions scan={scan} />
        )}
      </Dock>
    </>
  );
}
