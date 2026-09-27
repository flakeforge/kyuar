"use client";

import { renderQr } from "@kyuar/qr";
import { buildQrUrl, qrRequestSchema } from "@kyuar/shared";
import { Button } from "@kyuar/ui/components/button";
import { Spinner } from "@kyuar/ui/components/spinner";
import { toast } from "@kyuar/ui/lib/toast";
import { DownloadIcon, ShareIcon, ShuffleIcon } from "lucide-react";
import { useState } from "react";

import { useMessages } from "~/i18n";
import { svgToPngBlob } from "~/lib/images";
import { download, haptic, rawInitData, share } from "~/lib/telegram";

import styles from "./editor.module.css";
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

export function ActionBar({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const { request, fits, surprise, halftone, isEmpty } = editor;
  const ready = fits && !isEmpty;
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
        toast.add({ title: t.actions.downloaded, type: "success" });
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
    <nav
      className={`${styles.bar} from-background via-background/80 pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-linear-to-t to-transparent pt-8 pb-[max(env(safe-area-inset-bottom),1rem)]`}
    >
      <div className="pointer-events-auto mx-auto flex w-fit items-center gap-4">
        <Button
          variant="float"
          size="fab"
          aria-label={t.actions.download}
          disabled={!ready || busy !== null}
          onClick={() => void onDownload()}
        >
          {busy === "download" ? <Spinner /> : <DownloadIcon />}
        </Button>
        <Button
          size="pill"
          aria-label={t.actions.surprise}
          className="shadow-foreground/40 shadow-[0_12px_28px_-12px]"
          onClick={() => {
            const undo = surprise();
            haptic("impact");
            toast.add({
              title: t.actions.surprised,
              timeout: 4000,
              actionProps: { children: t.actions.undo, onClick: undo },
            });
          }}
        >
          <ShuffleIcon />
        </Button>
        <Button
          variant="float"
          size="fab"
          aria-label={busy === "share" ? t.actions.sharing : t.actions.share}
          disabled={!ready || busy !== null}
          onClick={() => void onShare()}
        >
          {busy === "share" ? <Spinner /> : <ShareIcon />}
        </Button>
      </div>
    </nav>
  );
}
