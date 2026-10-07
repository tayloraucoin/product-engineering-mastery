"use client";

/**
 * What the review bar's slots show until LAB-12 and LAB-13 wire them: the
 * Comment toggle, the Comments button, the save status and the line above
 * the bar, each drawn from `BarData` (here, the page's fixtures). Placing
 * is disabled once the review has closed or access has ended.
 */
import { useState } from "react";

import { Button } from "@pem/ui/button";
import { Toggle } from "@pem/ui/toggle";

import {
  commentsButtonView,
  placingDisabled,
  EXPERIMENT_WORDS as W,
  type BarData,
  type SaveStatus,
} from "../../../../../lib/sandbox/client/experiment-view";

export function CommentToggle({ status }: { status: SaveStatus }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Toggle
      variant="outline"
      pressed={pressed}
      onPressedChange={setPressed}
      disabled={placingDisabled(status)}
      // The Comments button's outline, so the two read as one kind of control.
      className="h-11 border-border bg-background px-4 dark:border-input dark:bg-input/30"
    >
      {W.comment}
    </Toggle>
  );
}

export function CommentsButton({ bar }: { bar: BarData }) {
  const view = commentsButtonView(bar);
  return (
    <Button variant="outline" disabled={view.disabled} className="h-11 px-4">
      {view.label}
    </Button>
  );
}

/** The save status in the bar: empty at rest; the error and unsent lines carry Retry. */
export function SaveStatusText({ status }: { status: SaveStatus }) {
  switch (status.kind) {
    case "error":
      return (
        <>
          {W.loadError} <RetryButton />
        </>
      );
    case "partial":
      return (
        <>
          {W.unsent(status.unsent)} · <RetryButton />
        </>
      );
    case "saved":
      return <>{W.saved}</>;
    default:
      return null;
  }
}

function RetryButton() {
  return (
    <Button variant="link" className="h-11 min-w-11 px-2">
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

export type { BarData };
