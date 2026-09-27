"use client";

import { parseScanned, type ScannedContent } from "@kyuar/shared";
import { toast } from "@kyuar/ui/lib/toast";
import { useCallback, useState } from "react";

import { useMessages } from "~/i18n";
import {
  clearHistory,
  loadHistory,
  saveToHistory,
  scanFile,
  scanWithCamera,
  type HistoryEntry,
} from "~/lib/scanner";
import { haptic } from "~/lib/telegram";

export function useScan() {
  const t = useMessages();
  const [result, setResult] = useState<ScannedContent | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshHistory = useCallback(async () => {
    setHistory(await loadHistory());
  }, []);

  const show = useCallback(
    async (text: string | undefined, quiet = false) => {
      if (!text) {
        if (!quiet) {
          haptic("error");
          toast.add({ title: t.scan.notFound, type: "error" });
        }
        return;
      }
      haptic("success");
      setResult(parseScanned(text));
      setHistory(await saveToHistory(text));
    },
    [t.scan.notFound],
  );

  const fromCamera = useCallback(async () => {
    await show(await scanWithCamera(t.scan.cameraPrompt).catch(() => undefined), true);
  }, [show, t.scan.cameraPrompt]);

  const fromFile = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        await show(await scanFile(file));
      } catch {
        await show(undefined);
      } finally {
        setBusy(false);
      }
    },
    [show],
  );

  const clear = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  return { result, setResult, history, refreshHistory, busy, fromCamera, fromFile, clear };
}

export type ScanModel = ReturnType<typeof useScan>;
