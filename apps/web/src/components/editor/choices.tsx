"use client";

import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";
import { CheckIcon, ShuffleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useMessages } from "~/i18n";
import { haptic } from "~/lib/telegram";

export interface Choice<Value extends string> {
  value: Value;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface ChoicesProps<Value extends string> {
  label: string;
  choices: Choice<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

function select<Value extends string>(onChange: (value: Value) => void) {
  return (next: string[]) => {
    const [value] = next as Value[];
    if (!value) return;
    onChange(value);
    haptic("select");
  };
}

/**
 * Icon grid with a random pick in the first cell, as in the shape sheets.
 */
export function ChoiceGrid<Value extends string>({
  label,
  choices,
  value,
  onChange,
}: ChoicesProps<Value>) {
  const t = useMessages();

  const pickRandom = () => {
    const pool = choices.filter((choice) => choice.value !== value);
    const choice = pool[Math.floor(Math.random() * pool.length)];
    if (choice) onChange(choice.value);
    haptic("impact");
  };

  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={select(onChange)}
      variant="tile"
      size="tile"
      spacing={2}
      className="grid w-full grid-cols-5 gap-2"
    >
      <button
        type="button"
        onClick={pickRandom}
        aria-label={t.options.random}
        title={t.options.random}
        className="bg-primary text-primary-foreground focus-visible:ring-ring/50 flex aspect-square items-center justify-center rounded-(--radius) outline-none focus-visible:ring-3 active:scale-95"
      >
        <ShuffleIcon className="size-6" />
      </button>
      {choices.map((choice) => (
        <ToggleGroupItem
          key={choice.value}
          value={choice.value}
          aria-label={choice.label}
          title={choice.label}
        >
          {choice.icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/**
 * Text options as full-width rows, each with an optional preview on the right.
 */
export function ChoiceList<Value extends string>({
  label,
  choices,
  value,
  onChange,
}: ChoicesProps<Value>) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={select(onChange)}
      orientation="vertical"
      variant="tile"
      size="row"
      spacing={2}
      className="w-full"
    >
      {choices.map((choice) => (
        <ToggleGroupItem key={choice.value} value={choice.value} disabled={choice.disabled}>
          <span className="flex items-center gap-2">
            <CheckIcon
              className="invisible size-4 group-aria-pressed/toggle:visible"
              aria-hidden="true"
            />
            {choice.label}
          </span>
          {choice.icon && (
            <span className="flex size-8 items-center justify-center" aria-hidden="true">
              {choice.icon}
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
