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

export function Preview({ rendered }: { rendered: RenderedQr | null }) {
  const t = useMessages();

  return (
    <figure className="shadow-foreground/45 aspect-square w-full overflow-hidden rounded-(--radius-card) shadow-[0_24px_48px_-28px]">
      {rendered ? (
        <Image
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`}
          alt=""
          width={rendered.size}
          height={rendered.size}
          unoptimized
          priority
          draggable={false}
          className="size-full select-none"
        />
      ) : (
        <div className="bg-card text-card-foreground flex size-full items-center justify-center px-8 text-center text-sm">
          {t.preview.tooLong}
        </div>
      )}
      <figcaption className="sr-only">{t.preview.label}</figcaption>
    </figure>
  );
}

export function ScanWarning({ rendered }: { rendered: RenderedQr | null }) {
  const t = useMessages();
  if (!rendered || rendered.warnings.length === 0) return null;

  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertDescription>{t.preview.lowContrast}</AlertDescription>
    </Alert>
  );
}
