"use client";

import { Button } from "@kyuar/ui/components/button";
import { ToggleGroup, ToggleGroupItem } from "@kyuar/ui/components/toggle-group";
import { CheckIcon, ChevronDownIcon, DicesIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

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

interface ChoiceGridProps<Value extends string> extends ChoicesProps<Value> {
  recommended?: readonly Value[];
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
 * Icon grid with a random pick in the first cell. With `recommended`, only
 * those choices show until the user asks for more.
 */
export function ChoiceGrid<Value extends string>({
  label,
  choices,
  value,
  onChange,
  recommended,
}: ChoiceGridProps<Value>) {
  const t = useMessages();
  const [showAll, setShowAll] = useState(false);
  const limited = recommended !== undefined && !showAll;
  const shortlist = new Set<string>(recommended);
  const visible = limited
    ? choices.filter((choice) => shortlist.has(choice.value) || choice.value === value)
    : choices;

  const pickRandom = () => {
    const pool = visible.filter((choice) => choice.value !== value);
    const choice = pool[Math.floor(Math.random() * pool.length)];
    if (choice) onChange(choice.value);
    haptic("impact");
  };

  return (
    <div className="flex flex-col gap-3">
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
          className="bg-muted text-muted-foreground hover:bg-accent focus-visible:ring-ring/50 flex aspect-square items-center justify-center rounded-(--radius) border border-dashed border-current/30 outline-none focus-visible:ring-3 active:scale-95"
        >
          <DicesIcon className="size-6" />
        </button>
        {visible.map((choice) => (
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
      {recommended !== undefined && (
        <Button
          variant="ghost"
          size="xl"
          aria-expanded={showAll}
          onClick={() => setShowAll((open) => !open)}
        >
          {showAll ? t.options.fewerShapes : t.options.more}
          <ChevronDownIcon data-icon="inline-end" className={showAll ? "rotate-180" : undefined} />
        </Button>
      )}
    </div>
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
