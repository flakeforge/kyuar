"use client";

import { renderQr } from "@kyuar/qr";
import { buildQrUrl, qrRequestSchema } from "@kyuar/shared";
import { Button } from "@kyuar/ui/components/button";
import { Spinner } from "@kyuar/ui/components/spinner";
import { toast } from "@kyuar/ui/lib/toast";
import { DownloadIcon, SendIcon, ShuffleIcon } from "lucide-react";
import { useState } from "react";

import { useMessages } from "~/i18n";
import { svgToPngBlob } from "~/lib/images";
import { download, haptic, rawInitData, share } from "~/lib/telegram";

import type { EditorModel } from "./use-editor";

const INIT_DATA_HEADER = "x-telegram-init-data";
const FILE_NAME = "kyuar.png";

async function post(path: string, body: unknown, initData: string) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", [INIT_DATA_HEADER]: initData },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return (await response.json()) as { id: string };
}

function saveBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
}

export function ActionBar({ editor, isTelegram }: { editor: EditorModel; isTelegram: boolean }) {
  const t = useMessages();
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const { request, fits, surprise, halftone } = editor;
  const hasImages = Boolean(request.logo || request.halftone);

  async function downloadInTelegram(initData: string) {
    if (hasImages) {
      const { id } = await post("/api/render", request, initData);
      return download(`${window.location.origin}/api/render/${id}?t=png`, FILE_NAME);
    }
    const query = qrRequestSchema.parse({
      data: request.data,
      style: request.style,
      format: "png",
    });
    return download(buildQrUrl(window.location.origin, query), FILE_NAME);
  }

  async function onDownload() {
    setBusy("download");
    try {
      const initData = rawInitData();
      const handled = initData ? await downloadInTelegram(initData) : false;
      if (!handled) {
        const { svg } = renderQr({
          data: request.data,
          style: request.style,
          logoHref: request.logo,
          halftone: halftone
            ? {
                image: halftone.image,
                centerRatio: halftone.centerRatio,
                contrast: halftone.contrast,
              }
            : undefined,
        });
        saveBlob(await svgToPngBlob(svg, 1024));
      }
      haptic("success");
    } catch {
      haptic("error");
      toast.add({ title: t.actions.downloadFailed, type: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function onShare() {
    const initData = rawInitData();
    if (!initData) {
      toast.add({ title: t.actions.shareUnavailable });
      return;
    }
    setBusy("share");
    try {
      const { id } = await post("/api/share", request, initData);
      await share(id);
      haptic("success");
    } catch {
      haptic("error");
      toast.add({ title: t.actions.shareFailed, type: "error" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <nav className="bg-background/90 fixed inset-x-0 bottom-0 z-10 border-t pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 pt-3">
        <Button
          variant="outline"
          size="icon-xl"
          aria-label={t.actions.download}
          disabled={!fits || busy !== null}
          onClick={() => void onDownload()}
        >
          {busy === "download" ? <Spinner /> : <DownloadIcon />}
        </Button>
        <Button
          variant="secondary"
          size="icon-xl"
          aria-label={t.actions.surprise}
          onClick={() => {
            surprise();
            haptic("impact");
          }}
        >
          <ShuffleIcon />
        </Button>
        <Button
          size="xl"
          className="flex-1"
          disabled={!fits || busy !== null || !isTelegram}
          onClick={() => void onShare()}
        >
          {busy === "share" ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          {busy === "share" ? t.actions.sharing : t.actions.share}
        </Button>
      </div>
    </nav>
  );
}
