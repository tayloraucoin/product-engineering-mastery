"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@pem/ui/button";

import { COPY_BUTTON_COPY } from "./copy";

/**
 * Copies text and says so, in words, beside the button.
 *
 * The result line is a live region, so the confirmation reaches a screen
 * reader, and it clears itself so a second press reads as a second copy.
 * `copiedMessage` lets a caller say more than "Copied", for instance naming
 * what could not be filled in.
 *
 * Lifted from taylor-aucoin (`app/admin/_components/copy-button.tsx`), onto
 * the house Button and tokens.
 */

/** How long the result line stays before it clears; not a motion value. */
const CLEAR_AFTER_MS = 2400;

type CopyState = "idle" | "copied" | "failed";

export type CopyButtonProps = {
  /** The text put on the clipboard. */
  text: string;
  label?: string;
  /** Names the button for a screen reader when `label` alone is ambiguous. */
  accessibleLabel?: string;
  copiedMessage?: string;
  failedMessage?: string;
};

export function CopyButton({
  text,
  label = COPY_BUTTON_COPY.label,
  accessibleLabel,
  copiedMessage = COPY_BUTTON_COPY.copied,
  failedMessage = COPY_BUTTON_COPY.failed,
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), CLEAR_AFTER_MS);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        aria-label={accessibleLabel}
        onClick={() => void copy()}
      >
        {label}
      </Button>
      <span role="status" className="text-xs text-muted-foreground">
        {state === "copied" ? copiedMessage : state === "failed" ? failedMessage : ""}
      </span>
    </span>
  );
}
