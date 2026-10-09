"use client";

import { Button } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import { Spinner } from "@pem/ui/spinner";

/**
 * Save first in DOM and focus order (D-DEMO-21): stacked on top at 390,
 * outermost right at 1440. A held Save is `aria-disabled`, so it stays
 * focusable and its description is heard; pressing it does nothing. Both
 * labels share one grid cell, so the pending Save keeps its width.
 */
export function FormActions({
  saveLabel,
  pending,
  held,
  describedBy,
  onCancel,
  cancelDisabled = false,
}: {
  saveLabel: string;
  pending: boolean;
  /** Save does nothing while pending, loading, partial or offline. */
  held: boolean;
  describedBy?: string;
  onCancel: () => void;
  cancelDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-t pt-4 md:flex-row-reverse md:justify-start">
      <Button
        type="submit"
        aria-disabled={held || undefined}
        aria-describedby={describedBy}
        onClick={(event) => {
          if (held) event.preventDefault();
        }}
        className="w-full aria-disabled:cursor-not-allowed aria-disabled:opacity-50 md:w-auto"
      >
        <span className="grid">
          <span
            className={cn("col-start-1 row-start-1", pending && "invisible")}
          >
            {saveLabel}
          </span>
          <span
            className={cn(
              "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5",
              !pending && "invisible",
            )}
          >
            <Spinner
              aria-hidden="true"
              role={undefined}
              aria-label={undefined}
            />
            Saving
          </span>
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={cancelDisabled}
        onClick={onCancel}
        className="w-full md:w-auto"
      >
        Cancel
      </Button>
    </div>
  );
}
