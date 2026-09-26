"use client";

import { renderQr } from "@kyuar/qr";
import { Alert, AlertDescription } from "@kyuar/ui/components/alert";
import { TriangleAlertIcon } from "lucide-react";
import { useMemo } from "react";

import { useMessages } from "~/i18n";

import type { EditorModel } from "./use-editor";

export function Preview({ editor }: { editor: EditorModel }) {
  const t = useMessages();
  const { content, style, logo, halftone, fits } = editor;

  const rendered = useMemo(() => {
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

  return (
    <div className="flex flex-col gap-3">
      <figure className="shadow-foreground/40 aspect-square w-full overflow-hidden rounded-(--radius-card) shadow-[0_18px_40px_-24px]">
        {rendered ? (
          <div
            className="size-full [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: rendered.svg }}
          />
        ) : (
          <div className="bg-card text-card-foreground flex size-full items-center justify-center px-8 text-center text-sm">
            {t.preview.tooLong}
          </div>
        )}
        <figcaption className="sr-only">{t.preview.label}</figcaption>
      </figure>

      {rendered && rendered.warnings.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>{t.preview.lowContrast}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
