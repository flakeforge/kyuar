"use client";

import { renderQr, type QrOptions } from "@kyuar/qr";
import { useMemo } from "react";

interface QrCanvasProps {
  options: Omit<QrOptions, "moduleSize" | "cornerRadius"> & Partial<QrOptions>;
}

export function QrCanvas({ options }: QrCanvasProps) {
  const svg = useMemo(() => {
    try {
      return renderQr({ ...options, moduleSize: 16 }).svg;
    } catch {
      return null;
    }
  }, [options]);

  return (
    <div
      className="aspect-square w-full overflow-hidden rounded-(--radius-card) transition-colors duration-300"
      style={{ background: options.background }}
    >
      {svg ? (
        <div
          className="h-full w-full p-[6%] [&>svg]:h-full [&>svg]:w-full"
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
