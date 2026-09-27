"use client";

import { Button } from "@kyuar/ui/components/button";
import { Spinner } from "@kyuar/ui/components/spinner";
import { CameraIcon, ImageIcon } from "lucide-react";
import { useRef } from "react";

import { useMessages } from "~/i18n";
import { cameraAvailable } from "~/lib/scanner";

import type { ScanModel } from "./use-scan";

const PILL = "font-heading h-14 rounded-full px-7 shadow-[0_12px_28px_-12px] shadow-foreground/40";

export function ScanActions({ scan }: { scan: ScanModel }) {
  const t = useMessages();
  const fileInput = useRef<HTMLInputElement>(null);
  const withCamera = cameraAvailable();

  const photoIcon = scan.busy ? (
    <Spinner aria-label={t.scan.scanning} data-icon="inline-start" />
  ) : (
    <ImageIcon data-icon="inline-start" />
  );

  return (
    <div className="mx-auto flex w-fit items-center gap-3">
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        aria-label={t.scan.photo}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void scan.fromFile(file);
        }}
      />
      {withCamera ? (
        <>
          <Button
            variant="float"
            size="fab"
            aria-label={t.scan.photo}
            disabled={scan.busy}
            onClick={() => fileInput.current?.click()}
          >
            {scan.busy ? <Spinner aria-label={t.scan.scanning} /> : <ImageIcon />}
          </Button>
          <Button size="xl" className={PILL} onClick={() => void scan.fromCamera()}>
            <CameraIcon data-icon="inline-start" />
            {t.scan.camera}
          </Button>
        </>
      ) : (
        <Button
          size="xl"
          className={PILL}
          disabled={scan.busy}
          onClick={() => fileInput.current?.click()}
        >
          {photoIcon}
          {scan.busy ? t.scan.scanning : t.scan.photo}
        </Button>
      )}
    </div>
  );
}
