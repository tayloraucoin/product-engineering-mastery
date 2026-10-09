"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { Info } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pem/ui/alert-dialog";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: ReactNode;
  /** One icon and a text line, never a bordered alert (D-DEMO-17). */
  notice?: string;
  confirmLabel: string;
  pendingLabel: string;
  pending?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Focus goes back here on close. */
  triggerRef?: RefObject<HTMLElement | null>;
}

/** The delete and reset confirm layout. No close button; Cancel takes focus first. */
export function ConfirmDialog({
  open,
  title,
  body,
  notice,
  confirmLabel,
  pendingLabel,
  pending = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  triggerRef,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Escape and the scrim do nothing while a confirm is pending.
        if (!next && !pending) onCancel();
      }}
    >
      <AlertDialogContent
        initialFocus={cancelRef}
        finalFocus={triggerRef}
        className="w-[calc(100%-(--spacing(8)))] p-6 data-[size=default]:max-w-(--container-md) data-[size=default]:sm:max-w-(--container-md) data-[size=default]:rounded-xl duration-(--motion-duration-moderate) data-closed:duration-(--motion-duration-base) motion-reduce:duration-(--motion-duration-instant)"
      >
        <AlertDialogHeader className="sm:group-data-[size=default]/alert-dialog-content:place-items-center sm:group-data-[size=default]/alert-dialog-content:text-center">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        {notice ? (
          <p className="flex items-start justify-center gap-2 text-sm text-muted-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{notice}</span>
          </p>
        ) : null}
        {/* Primary first in DOM and focus order; the row reverses at 1440 so it sits outermost. */}
        <AlertDialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
          <AlertDialogAction
            variant="destructive-solid"
            onClick={onConfirm}
            disabled={confirmDisabled || pending}
            aria-busy={pending}
            className="min-w-32"
          >
            {pending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
          <AlertDialogCancel ref={cancelRef} disabled={pending}>
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
