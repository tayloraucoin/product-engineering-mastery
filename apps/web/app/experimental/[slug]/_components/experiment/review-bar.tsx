"use client";

/**
 * The review bar (experiment.md, D-LAB-9): fixed to the bottom, in the
 * app's tokens, a region named "Review tools" that comes last in DOM order.
 * Left to right: the design switcher, the Comment toggle, the Comments
 * button, the save status and the primary. Below 768px the switcher takes
 * its own row and the save status moves into the list (LAB-13). The
 * offline, closed and revoked lines sit full width above the bar.
 *
 * The Comment toggle, Comments button and save status are slots: LAB-12 and
 * LAB-13 wire them; here the page feeds them its fixtures. The bar reports
 * its measured height, so the page pads by it at every width.
 */
import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { buttonVariants } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import { ToggleGroup, ToggleGroupItem } from "@pem/ui/toggle-group";

import {
  EXPERIMENT_WORDS,
  primaryLabel,
  reviewPath,
  type DesignOption,
  type PrimaryKind,
} from "../../../../../lib/sandbox/client/experiment-view";

export type ReviewBarProps = {
  slug: string;
  /** In switcher order; one design renders no switcher (D-LAB-10). */
  designs: readonly DesignOption[];
  shown: string;
  onSwitch(design: string): void;
  primary: PrimaryKind;
  /** LAB-12's Comment toggle. */
  commentToggle: ReactNode;
  /** LAB-13's Comments button. */
  commentsButton: ReactNode;
  /** The save status: muted text, empty at rest. */
  saveStatus: ReactNode;
  /** The offline, closed or revoked line above the bar, or null. */
  statusLine: ReactNode;
  /** Called with the bar's height whenever it changes. */
  onHeight(height: number): void;
};

export function ReviewBar({
  slug,
  designs,
  shown,
  onSwitch,
  primary,
  commentToggle,
  commentsButton,
  saveStatus,
  statusLine,
  onHeight,
}: ReviewBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const report = () => onHeight(bar.getBoundingClientRect().height);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [onHeight]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={EXPERIMENT_WORDS.barRegion}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background text-foreground"
    >
      {/* Always present, so a line that arrives later is announced once. */}
      <p
        role="status"
        className={
          statusLine ? "border-b bg-muted px-4 py-2 text-sm" : "sr-only"
        }
      >
        {statusLine}
      </p>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:gap-4">
        {designs.length > 1 ? (
          <ToggleGroup
            aria-label={EXPERIMENT_WORDS.switcherGroup}
            variant="outline"
            spacing={0}
            value={[shown]}
            onValueChange={(value: string[]) => {
              if (value[0]) onSwitch(value[0]);
            }}
            className="w-full md:w-fit"
          >
            {designs.map((design) => (
              <ToggleGroupItem
                key={design.id}
                value={design.id}
                aria-label={design.accessibleName}
                // The selection token and a check, never the primary's fill:
                // the bar keeps one primary (C-P02, C-P07).
                className="h-11 flex-1 group-data-[spacing=0]/toggle-group:px-4 aria-pressed:bg-selected aria-pressed:font-semibold aria-pressed:text-selected-foreground aria-pressed:hover:bg-selected aria-pressed:hover:text-selected-foreground md:flex-none"
              >
                {design.id === shown ? (
                  <CheckIcon aria-hidden="true" data-icon="inline-start" />
                ) : null}
                {design.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {commentToggle}
          {commentsButton}
          <span
            aria-live="polite"
            className="hidden min-w-0 truncate text-sm text-muted-foreground md:inline"
          >
            {saveStatus}
          </span>
          <Link
            href={reviewPath(slug)}
            className={cn(buttonVariants(), "ml-auto h-11 px-4")}
          >
            {primaryLabel(primary)}
          </Link>
        </div>
      </div>
    </div>
  );
}
