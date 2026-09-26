"use client";

import { renderQr, type QrStyle } from "@kyuar/qr";
import { useMemo } from "react";

interface QrCanvasProps {
  data: string;
  style: QrStyle;
}

export function QrCanvas({ data, style }: QrCanvasProps) {
  const svg = useMemo(() => {
    try {
      return renderQr({ data, style, idPrefix: "preview" }).svg;
    } catch {
      return null;
    }
  }, [data, style]);

  return (
    <div className="aspect-square w-full overflow-hidden rounded-(--radius-card) transition-colors duration-300">
      {svg ? (
        <div
          className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex h-full items-center justify-center px-8 text-center text-sm opacity-70">
          That is too much data for one QR code.
        </div>
      )}
    </div>
  );
}
