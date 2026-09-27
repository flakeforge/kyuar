"use client";

import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";
import { PaletteIcon, ScanLineIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useMessages } from "~/i18n";
import { haptic } from "~/lib/telegram";

import styles from "./editor.module.css";

export type Mode = "create" | "scan";

interface DockProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  children: ReactNode;
}

/**
 * Bottom dock: the actions for the current mode on top, the mode switch below,
 * both inside the thumb zone.
 */
export function Dock({ mode, onModeChange, children }: DockProps) {
  const t = useMessages();

  return (
    <nav
      className={`${styles.bar} from-background via-background/90 pointer-events-none fixed inset-x-0 bottom-0 z-10 flex flex-col gap-3 bg-linear-to-t to-transparent px-4 pt-8 pb-[max(env(safe-area-inset-bottom),0.75rem)]`}
    >
      <div className="pointer-events-auto">{children}</div>
      <ToggleGroup
        aria-label={t.modes.label}
        value={[mode]}
        onValueChange={(next) => {
          const [value] = next as Mode[];
          if (!value) return;
          haptic("select");
          onModeChange(value);
        }}
        variant="segment"
        size="touch"
        spacing={1}
        className="bg-muted pointer-events-auto mx-auto grid w-full max-w-xs grid-cols-2 gap-1 rounded-full p-1 shadow-[inset_0_0_0_1px_var(--border)]"
      >
        <ToggleGroupItem value="create" className="h-11 gap-2">
          <PaletteIcon data-icon="inline-start" />
          {t.modes.create}
        </ToggleGroupItem>
        <ToggleGroupItem value="scan" className="h-11 gap-2">
          <ScanLineIcon data-icon="inline-start" />
          {t.modes.scan}
        </ToggleGroupItem>
      </ToggleGroup>
    </nav>
  );
}
