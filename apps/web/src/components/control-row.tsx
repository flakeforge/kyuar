"use client";

import type { ReactNode } from "react";

interface ControlRowProps {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}

export function ControlRow({ label, onClick, children }: ControlRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="surface-row flex w-full items-center justify-between px-5 py-4 text-left font-medium transition-transform duration-150 ease-[var(--ease-snap)] active:scale-[0.985]"
    >
      <span>{label}</span>
      <span className="flex items-center gap-2 opacity-80">{children}</span>
    </button>
  );
}
