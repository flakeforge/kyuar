"use client";

import { renderQr, type RenderedQr } from "@kyuar/qr";
import { Alert, AlertDescription } from "@kyuar/ui/components/alert";
import { TriangleAlertIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { useMessages } from "~/i18n";

import type { EditorModel } from "./use-editor";

export function useRendered(editor: EditorModel): RenderedQr | null {
  const { content, style, logo, halftone, fits } = editor;

  return useMemo(() => {
    if (!fits) return null;
    try {
      return renderQr({
        data: content.value,
        style,
        logoHref: logo ?? undefined,
        halftone: halftone
          ? {
              image: halftone.image,
              centerRatio: halftone.centerRatio,
              contrast: halftone.contrast,
            }
          : undefined,
        idPrefix: "preview",
      });
    } catch {
      return null;
    }
  }, [content.value, fits, halftone, logo, style]);
}

export function Preview({ rendered, isEmpty }: { rendered: RenderedQr | null; isEmpty: boolean }) {
  const t = useMessages();

  return (
    <figure className="aspect-square w-full">
      {rendered && isEmpty ? (
        <div className="relative size-full overflow-hidden rounded-(--radius-card)">
          <Image
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`}
            alt=""
            width={rendered.size}
            height={rendered.size}
            unoptimized
            draggable={false}
            className="size-full opacity-25 blur-[2px] select-none"
          />
          <p className="text-foreground absolute inset-0 flex items-center justify-center px-10 text-center text-base font-medium text-balance">
            {t.preview.empty}
          </p>
        </div>
      ) : rendered ? (
        <Image
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`}
          alt=""
          width={rendered.size}
          height={rendered.size}
          unoptimized
          priority
          draggable={false}
          className="size-full drop-shadow-[0_18px_22px_color-mix(in_oklab,var(--foreground)_22%,transparent)] select-none"
        />
      ) : (
        <div className="bg-card text-card-foreground flex size-full items-center justify-center rounded-(--radius-card) px-8 text-center text-sm">
          {t.preview.tooLong}
        </div>
      )}
      <figcaption className="sr-only">{t.preview.label}</figcaption>
    </figure>
  );
}

export function ScanWarning({ rendered, margin }: { rendered: RenderedQr | null; margin: number }) {
  const t = useMessages();
  const messages = [
    rendered && rendered.warnings.length > 0 ? t.preview.lowContrast : null,
    margin < 2 ? t.preview.tightMargin : null,
  ].filter((message): message is string => message !== null);

  if (messages.length === 0) return null;

  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertDescription>{messages.join(" ")}</AlertDescription>
    </Alert>
  );
}
