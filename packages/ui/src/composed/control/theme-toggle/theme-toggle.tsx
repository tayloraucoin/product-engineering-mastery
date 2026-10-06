"use client";

import { useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import { useTheme } from "next-themes";

import { cn } from "../../../lib/cn";
import { THEMES } from "../../../providers/theme/themes";
import { THEME_TOGGLE_COPY } from "./copy";

/** Arrow keys move the selection; Home and End jump to the ends. */
const STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

const subscribeNever = () => () => {};

/**
 * False on the server and during hydration, true after. The stored theme is
 * unknown until then, so no option shows as selected before it.
 */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/**
 * Light, dark or system, as one radio group: one tab stop, arrow keys to
 * move, a visible focus ring. The selected option takes the accent
 * surface, a border and a dot. Needs `ThemeProvider` from `@pem/ui/theme`
 * above it.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = isClient ? THEMES.find((option) => option === theme) : null;

  function select(index: number) {
    const option = THEMES[index];
    if (!option) return;
    setTheme(option);
    options.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = THEMES.length - 1;
    const step = STEPS[event.key];
    let next: number;
    if (step !== undefined)
      next = (index + step + THEMES.length) % THEMES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    select(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={THEME_TOGGLE_COPY.label}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-background p-1",
        className,
      )}
    >
      {THEMES.map((option, index) => {
        const checked = option === selected;
        const tabbable = selected ? checked : index === 0;
        return (
          <button
            key={option}
            ref={(element) => {
              options.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-sm border border-transparent px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              checked && "border-border bg-accent text-accent-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                checked ? "bg-foreground" : "bg-transparent",
              )}
            />
            {THEME_TOGGLE_COPY.options[option]}
          </button>
        );
      })}
    </div>
  );
}
