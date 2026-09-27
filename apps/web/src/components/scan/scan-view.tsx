"use client";

import { parseScanned } from "@kyuar/shared";
import { Button } from "@kyuar/ui/components/button";
import { ChevronLeftIcon, ScanLineIcon } from "lucide-react";

import { useMessages } from "~/i18n";

import { ScanResult } from "./scan-result";
import type { ScanModel } from "./use-scan";

interface ScanViewProps {
  scan: ScanModel;
  onRestyle: (text: string) => void;
}

export function ScanView({ scan, onRestyle }: ScanViewProps) {
  const t = useMessages();
  const { result, setResult, history, clear } = scan;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-5 px-4 pt-[calc(var(--tg-viewport-safe-area-inset-top,0px)+var(--tg-viewport-content-safe-area-inset-top,0px)+1rem)] pb-52">
      <header className="flex min-h-11 items-center gap-2">
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
        <h2 className="font-heading text-xl font-semibold">{t.scan.title}</h2>
      </header>

      {result ? (
        <ScanResult content={result} onRestyle={onRestyle} />
      ) : (
        <>
          <div className="bg-card text-card-foreground flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-(--radius-card) px-8 text-center">
            <ScanLineIcon className="text-muted-foreground size-12" aria-hidden="true" />
            <p className="text-base font-medium text-balance">{t.scan.emptyView}</p>
          </div>

          <section className="flex flex-col gap-2" aria-label={t.scan.history}>
            <div className="flex min-h-11 items-center justify-between">
              <h3 className="text-sm font-medium">{t.scan.history}</h3>
              {history && history.length > 0 && (
                <Button variant="ghost" size="lg" className="h-11" onClick={() => void clear()}>
                  {t.scan.clearHistory}
                </Button>
              )}
            </div>
            {!history || history.length === 0 ? (
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
                        <span className="w-full truncate text-sm font-medium">{entry.text}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
