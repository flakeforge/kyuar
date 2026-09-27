"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@kyuar/ui/components/drawer";
import { cn } from "@kyuar/ui/lib/utils";
import type { ReactNode } from "react";

interface SheetRowProps {
  label: string;
  value?: string;
  className?: string;
  preview: ReactNode;
  children: ReactNode;
}

/**
 * One control row. Tapping it opens a bottom sheet with the options, so only
 * one group of controls is on screen at a time.
 */
export function SheetRow({ label, value, preview, className, children }: SheetRowProps) {
  return (
    <Drawer>
      <DrawerTrigger
        aria-label={value ? `${label}: ${value}` : label}
        className={cn(
          className,
          "bg-card text-card-foreground ease-snap focus-visible:ring-ring/50 flex h-14 w-full items-center justify-between rounded-(--radius) px-4 text-left text-base font-medium transition-transform duration-150 outline-none focus-visible:ring-3 active:scale-[0.985]",
        )}
      >
        <span>{label}</span>
        <span className="flex size-8 items-center justify-center" aria-hidden="true">
          {preview}
        </span>
      </DrawerTrigger>
      <DrawerContent backdrop="clear" className="shadow-foreground/30 shadow-[0_-16px_40px_-20px]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[max(16rem,calc(100svh-26rem))] overflow-y-auto overscroll-contain px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
