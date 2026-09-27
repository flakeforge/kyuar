"use client";

import type { RenderInput } from "@kyuar/qr";
import { Alert, AlertDescription } from "@kyuar/ui/components/alert";
import { ShieldCheckIcon, TriangleAlertIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { useMessages } from "~/i18n";
import { useQrRender, type QrRenderState } from "~/lib/use-qr-render";
import type { ScanCheck } from "~/lib/use-scan-check";

import type { EditorModel } from "./use-editor";

export function useRendered(editor: EditorModel): QrRenderState {
  const { content, style, logo, halftone } = editor;

  const input = useMemo<RenderInput>(
    () => ({
      data: content.value,
      style,
      logoHref: logo ?? undefined,
      halftone: halftone
        ? { image: halftone.image, centerRatio: halftone.centerRatio, contrast: halftone.contrast }
        : undefined,
      idPrefix: "preview",
    }),
    [content.value, halftone, logo, style],
  );

  return useQrRender(input);
}

interface PreviewProps {
  rendered: QrRenderState;
  isEmpty: boolean;
  hasLogo: boolean;
}

export function Preview({ rendered, isEmpty, hasLogo }: PreviewProps) {
  const t = useMessages();

  return (
    <figure className="aspect-square w-full">
      {rendered.status === "ready" ? (
        <div className="relative size-full">
          <Image
            src={rendered.src}
            alt=""
            width={rendered.size}
            height={rendered.size}
            unoptimized
            priority
            draggable={false}
            className={
              isEmpty
                ? "size-full opacity-25 blur-[2px] select-none"
                : "size-full drop-shadow-[0_18px_22px_color-mix(in_oklab,var(--foreground)_22%,transparent)] select-none"
            }
          />
          {isEmpty && (
            <p className="text-foreground absolute inset-0 flex items-center justify-center px-10 text-center text-base font-medium text-balance">
              {t.preview.empty}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-card text-card-foreground flex size-full items-center justify-center rounded-(--radius-card) px-8 text-center text-sm">
          {rendered.status === "failed"
            ? hasLogo
              ? t.preview.tooLongLogo
              : t.preview.tooLong
            : null}
        </div>
      )}
      <figcaption className="sr-only">{t.preview.label}</figcaption>
    </figure>
  );
}

export function ScanWarning({ rendered, margin }: { rendered: QrRenderState; margin: number }) {
  const t = useMessages();
  const messages = [
    rendered.status === "ready" && rendered.warnings.length > 0 ? t.preview.lowContrast : null,
    margin < 2 ? t.preview.tightMargin : null,
  ].filter((message): message is string => message !== null);

  if (messages.length === 0) return null;

  return (
    <Alert variant="destructive" role="presentation">
      <TriangleAlertIcon />
      <AlertDescription>{messages.join(" ")}</AlertDescription>
    </Alert>
  );
}

export function ScanScore({ check }: { check: ScanCheck | undefined }) {
  const t = useMessages();
  if (!check) return null;

  const template =
    check.passed === check.total
      ? t.preview.checkGood
      : check.passed >= check.total / 2
        ? t.preview.checkFair
        : t.preview.checkPoor;
  const text = template
    .replace("{passed}", String(check.passed))
    .replace("{total}", String(check.total));

  if (check.passed < check.total / 2) {
    return (
      <Alert variant="destructive" role="presentation">
        <TriangleAlertIcon />
        <AlertDescription>{text}</AlertDescription>
      </Alert>
    );
  }

  return (
    <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
      <ShieldCheckIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">{t.preview.checkLabel}: </span>
      {text}
    </p>
  );
}
