"use client";

import { parseScanned, type ScannedContent } from "@kyuar/shared";
import { Button } from "@kyuar/ui/components/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@kyuar/ui/components/drawer";
import { Spinner } from "@kyuar/ui/components/spinner";
import { toast } from "@kyuar/ui/lib/toast";
import { CameraIcon, ChevronLeftIcon, ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

import { useMessages } from "~/i18n";
import {
  cameraAvailable,
  clearHistory,
  loadHistory,
  saveToHistory,
  scanFile,
  scanWithCamera,
  type HistoryEntry,
} from "~/lib/scanner";
import { haptic } from "~/lib/telegram";

import { ScanResult } from "./scan-result";

interface ScanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestyle: (text: string) => void;
}

export function ScanSheet({ open, onOpenChange, onRestyle }: ScanSheetProps) {
  const t = useMessages();
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ScannedContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const show = async (text: string | undefined) => {
    if (!text) {
      haptic("error");
      toast.add({ title: t.scan.notFound, type: "error" });
      return;
    }
    haptic("success");
    setResult(parseScanned(text));
    setHistory(await saveToHistory(text));
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) void loadHistory().then(setHistory);
        else setResult(null);
      }}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="flex-row items-center gap-2 pb-2">
            {result && (
              <Button
                variant="ghost"
                size="icon-xl"
                aria-label={t.scan.actions.again}
                onClick={() => setResult(null)}
              >
                <ChevronLeftIcon />
              </Button>
            )}
            <DrawerTitle>{t.scan.title}</DrawerTitle>
          </DrawerHeader>

          <div className="max-h-[75svh] overflow-y-auto overscroll-contain px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
            {result ? (
              <ScanResult
                content={result}
                onRestyle={(text) => {
                  onRestyle(text);
                  onOpenChange(false);
                  setResult(null);
                }}
              />
            ) : (
              <div className="flex flex-col gap-5">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  aria-label={t.scan.photo}
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    setBusy(true);
                    try {
                      await show(await scanFile(file));
                    } catch {
                      await show(undefined);
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  {cameraAvailable() && (
                    <Button
                      size="xl"
                      className="h-24 flex-col gap-2"
                      onClick={async () => void show(await scanWithCamera(t.scan.cameraPrompt))}
                    >
                      <CameraIcon className="size-6" />
                      {t.scan.camera}
                    </Button>
                  )}
                  <Button
                    size="xl"
                    variant={cameraAvailable() ? "secondary" : "default"}
                    className={
                      cameraAvailable() ? "h-24 flex-col gap-2" : "col-span-2 h-24 flex-col gap-2"
                    }
                    disabled={busy}
                    onClick={() => fileInput.current?.click()}
                  >
                    {busy ? <Spinner className="size-6" /> : <ImageIcon className="size-6" />}
                    {busy ? t.scan.scanning : t.scan.photo}
                  </Button>
                </div>

                <section className="flex flex-col gap-2" aria-label={t.scan.history}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{t.scan.history}</h3>
                    {history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="lg"
                        className="h-11"
                        onClick={async () => {
                          await clearHistory();
                          setHistory([]);
                        }}
                      >
                        {t.scan.clearHistory}
                      </Button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t.scan.emptyHistory}</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {history.map((entry) => {
                        const content = parseScanned(entry.text);
                        return (
                          <li key={`${entry.at}-${entry.text}`}>
                            <button
                              type="button"
                              onClick={() => setResult(content)}
                              className="bg-card text-card-foreground focus-visible:ring-ring/50 flex min-h-14 w-full flex-col items-start justify-center rounded-(--radius) px-4 py-2 text-left outline-none focus-visible:ring-3"
                            >
                              <span className="text-muted-foreground text-xs">
                                {t.scan.kinds[content.kind]}
                              </span>
                              <span className="w-full truncate text-sm font-medium">
                                {entry.text}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
