"use client";

/**
 * The review bar's slots, wired to the pins (LAB-12): the Comment toggle,
 * the Comments button (LAB-13 opens its list), the save status with Retry,
 * and the line above the bar, each drawn from the pins provider's
 * `BarData`. Placing is disabled once the review has closed or access has
 * ended.
 */
import { CheckIcon } from "lucide-react";

import { Button } from "@pem/ui/button";
import { Toggle } from "@pem/ui/toggle";

import {
  commentsButtonView,
  placingDisabled,
  EXPERIMENT_WORDS as W,
  type BarData,
  type SaveStatus,
} from "../../../../../lib/sandbox/client/experiment-view";
import { usePins } from "../pins/pins-provider";

export function CommentToggle() {
  const { bar, mode, toggleMode } = usePins();
  return (
    <Toggle
      variant="outline"
      pressed={mode !== "off"}
      onPressedChange={toggleMode}
      disabled={placingDisabled(bar.status)}
      // The Comments button's outline, so the two read as one kind of
      // control; pressed, the selection token and a check, never the
      // primary's fill: the bar keeps one primary (C-P02, C-P07).
      className="h-11 border-border bg-background px-4 aria-pressed:bg-selected aria-pressed:font-semibold aria-pressed:text-selected-foreground aria-pressed:hover:bg-selected aria-pressed:hover:text-selected-foreground dark:border-input dark:bg-input/30"
    >
      {mode !== "off" ? (
        <CheckIcon aria-hidden="true" data-icon="inline-start" />
      ) : null}
      {W.comment}
    </Toggle>
  );
}

export function CommentsButton() {
  const { bar } = usePins();
  const view = commentsButtonView(bar);
  return (
    <Button variant="outline" disabled={view.disabled} className="h-11 px-4">
      {view.label}
    </Button>
  );
}

/** The save status in the bar: empty at rest; the error and unsent lines carry Retry. */
export function SaveStatusText() {
  const { bar, retry } = usePins();
  const status = bar.status;
  switch (status.kind) {
    case "error":
      return (
        <>
          {W.loadError} <RetryButton onRetry={retry} />
        </>
      );
    case "partial":
      return (
        <>
          {W.unsent(status.unsent)} · <RetryButton onRetry={retry} />
        </>
      );
    case "saved":
      return <>{W.saved}</>;
    default:
      return null;
  }
}

function RetryButton({ onRetry }: { onRetry(): void }) {
  return (
    <Button variant="link" className="h-11 min-w-11 px-2" onClick={onRetry}>
      {W.retry}
    </Button>
  );
}

/** The full-width line above the bar: offline, closed or revoked. */
export function statusLineFor(status: SaveStatus): string | null {
  switch (status.kind) {
    case "offline":
      return W.offline;
    case "closed":
      return W.closed;
    case "revoked":
      return W.revoked;
    default:
      return null;
  }
}

/** The status line, read from the pins. */
export function useStatusLine(): string | null {
  return statusLineFor(usePins().bar.status);
}

export type { BarData };
