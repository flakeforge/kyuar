"use client";

import { renderQr } from "@kyuar/qr";
import { buildQrUrl, qrRequestSchema } from "@kyuar/shared";
import { Button } from "@kyuar/ui/components/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@kyuar/ui/components/drawer";
import { Spinner } from "@kyuar/ui/components/spinner";
import { toast } from "@kyuar/ui/lib/toast";
import { DownloadIcon, SendIcon, ShuffleIcon } from "lucide-react";
import { useState } from "react";

import { useMessages } from "~/i18n";
import { svgToPngBlob } from "~/lib/images";
import { download, haptic, rawInitData, share } from "~/lib/telegram";

import styles from "./editor.module.css";
import type { EditorModel } from "./use-editor";

const INIT_DATA_HEADER = "x-telegram-init-data";

type DownloadFormat = "png" | "png2048" | "svg";

const FILE_NAMES: Record<DownloadFormat, string> = {
  png: "kyuar.png",
  png2048: "kyuar-2048.png",
  svg: "kyuar.svg",
};

async function post(path: string, body: unknown, initData: string) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", [INIT_DATA_HEADER]: initData },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return (await response.json()) as { id: string };
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

interface ActionBarProps {
  editor: EditorModel;
  fits: boolean;
  isTelegram: boolean;
}

export function ActionBar({ editor, fits, isTelegram }: ActionBarProps) {
  const t = useMessages();
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [formatsOpen, setFormatsOpen] = useState(false);
  const { request, surprise, halftone, isEmpty } = editor;
  const ready = fits && !isEmpty;
  const hasImages = Boolean(request.logo || request.halftone);

  async function downloadInTelegram(initData: string, format: DownloadFormat) {
    if (hasImages) {
      const { id } = await post("/api/render", request, initData);
      return download(`${window.location.origin}/api/render/${id}?t=${format}`, FILE_NAMES[format]);
    }
    const query = qrRequestSchema.parse({
      data: request.data,
      style: request.style,
      format: format === "svg" ? "svg" : "png",
      px: format === "png2048" ? 2048 : 1024,
    });
    return download(buildQrUrl(window.location.origin, query), FILE_NAMES[format]);
  }

  async function downloadInBrowser(format: DownloadFormat) {
    const { svg } = renderQr({
      data: request.data,
      style: request.style,
      logoHref: request.logo,
      halftone: halftone
        ? { image: halftone.image, centerRatio: halftone.centerRatio, contrast: halftone.contrast }
        : undefined,
    });
    const blob =
      format === "svg"
        ? new Blob([svg], { type: "image/svg+xml" })
        : await svgToPngBlob(svg, format === "png2048" ? 2048 : 1024);
    saveBlob(blob, FILE_NAMES[format]);
    toast.add({ title: t.actions.downloaded, type: "success" });
  }

  async function onDownload(format: DownloadFormat) {
    setFormatsOpen(false);
    setBusy("download");
    try {
      const initData = rawInitData();
      const handled = initData ? await downloadInTelegram(initData, format) : false;
      if (!handled) await downloadInBrowser(format);
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

  function onSurprise() {
    const undo = surprise();
    haptic("impact");
    const id = toast.add({
      title: t.actions.surprised,
      timeout: 4000,
      actionProps: {
        children: t.actions.undo,
        onClick: () => {
          undo();
          toast.close(id);
        },
      },
    });
  }

  const pillClassName = "h-14 rounded-full px-7 shadow-[0_12px_28px_-12px] shadow-foreground/40";

  const downloadButton = (primary: boolean) => (
    <Button
      variant={primary ? "default" : "float"}
      size={primary ? "xl" : "fab"}
      aria-label={primary ? undefined : t.actions.download}
      disabled={!ready || busy !== null}
      onClick={() => setFormatsOpen(true)}
      className={primary ? pillClassName : undefined}
    >
      {busy === "download" ? (
        <Spinner data-icon={primary ? "inline-start" : undefined} />
      ) : (
        <DownloadIcon data-icon={primary ? "inline-start" : undefined} />
      )}
      {primary && t.actions.download}
    </Button>
  );

  const shareButton = (primary: boolean) => (
    <Button
      variant={primary ? "default" : "float"}
      size={primary ? "xl" : "fab"}
      aria-label={primary ? undefined : t.actions.share}
      disabled={!ready || busy !== null}
      onClick={() => void onShare()}
      className={primary ? pillClassName : undefined}
    >
      {busy === "share" ? (
        <Spinner data-icon={primary ? "inline-start" : undefined} />
      ) : (
        <SendIcon data-icon={primary ? "inline-start" : undefined} />
      )}
      {primary && (busy === "share" ? t.actions.sharing : t.actions.share)}
    </Button>
  );

  return (
    <>
      <nav
        className={`${styles.bar} from-background via-background/80 pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-linear-to-t to-transparent pt-8 pb-[max(env(safe-area-inset-bottom),1rem)]`}
      >
        <div className="pointer-events-auto mx-auto flex w-fit items-center gap-3">
          <Button variant="float" size="fab" aria-label={t.actions.surprise} onClick={onSurprise}>
            <ShuffleIcon />
          </Button>
          {isTelegram ? shareButton(true) : downloadButton(true)}
          {isTelegram ? downloadButton(false) : shareButton(false)}
        </div>
      </nav>

      <Drawer open={formatsOpen} onOpenChange={setFormatsOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader className="pb-2">
              <DrawerTitle>{t.actions.downloadTitle}</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-2 px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
              {(
                [
                  ["png", t.actions.pngStandard],
                  ["png2048", t.actions.pngLarge],
                  ["svg", t.actions.svg],
                ] as const
              ).map(([format, label]) => (
                <Button
                  key={format}
                  variant="secondary"
                  size="xl"
                  className="h-14 justify-start"
                  onClick={() => void onDownload(format)}
                >
                  <DownloadIcon data-icon="inline-start" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
