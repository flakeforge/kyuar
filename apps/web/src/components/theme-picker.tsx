"use client";

import { Popover } from "@base-ui/react/popover";
import { THEMES, type QrTheme } from "@kyuar/qr";

interface ThemePickerProps {
  active: QrTheme;
  onSelect: (theme: QrTheme) => void;
}

export function ThemePicker({ active, onSelect }: ThemePickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger className="surface-row ease-snap flex w-full items-center justify-between px-5 py-4 text-left font-medium transition-transform duration-150 active:scale-[0.985]">
        <span>Color</span>
        <span
          className="size-6 rounded-full ring-2 ring-white/60"
          style={{ background: active.background }}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={10} align="end">
          <Popover.Popup className="rounded-3xl bg-white p-4 shadow-2xl shadow-black/15 outline-none">
            <div className="grid grid-cols-4 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  aria-label={theme.name}
                  aria-pressed={theme.id === active.id}
                  onClick={() => onSelect(theme)}
                  className="ease-snap size-11 rounded-full transition-transform duration-150 active:scale-90 aria-pressed:ring-3 aria-pressed:ring-black/20"
                  style={{ background: theme.background }}
                />
              ))}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
