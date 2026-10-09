"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { Info, TriangleAlert } from "lucide-react";

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
import { Spinner } from "@pem/ui/spinner";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: ReactNode;
  /** One icon and a text line, never a bordered alert (D-DEMO-17). */
  notice?: string;
  /** `error` draws the notice in the destructive colour and announces it. */
  noticeTone?: "info" | "error";
  noticeId?: string;
  confirmLabel: string;
  /** "Cancel" unless a surface names the way back ("Keep editing"). */
  cancelLabel?: string;
  pendingLabel: string;
  pending?: boolean;
  confirmDisabled?: boolean;
  /** Hold with `aria-disabled` instead of `disabled`, so focus stays on the confirm while pending. */
  holdAria?: boolean;
  /** The confirm is held and described by `noticeId`. */
  confirmHeld?: boolean;
  /** Written on the dialog root as `data-demo-state`. */
  demoState?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Focus goes back here on close. */
  triggerRef?: RefObject<HTMLElement | null>;
}

/** The delete, reset and leave-without-saving confirm layout. No close button; Cancel takes focus first. */
export function ConfirmDialog({
  open,
  title,
  body,
  notice,
  noticeTone = "info",
  noticeId,
  confirmLabel,
  cancelLabel = "Cancel",
  pendingLabel,
  pending = false,
  confirmDisabled = false,
  holdAria = false,
  confirmHeld = false,
  demoState,
  onConfirm,
  onCancel,
  triggerRef,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  // Base UI's alert dialog ignores outside presses; the scrim cancels here, never while pending.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.dataset.slot === "alert-dialog-overlay" && !pending)
        onCancel();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open, pending, onCancel]);
  const isError = noticeTone === "error";
  const Icon = isError ? TriangleAlert : Info;
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Escape and the scrim do nothing while a confirm is pending.
        if (!next && !pending) onCancel();
      }}
    >
      <AlertDialogContent
        data-demo-state={demoState}
        initialFocus={pending && holdAria ? confirmRef : cancelRef}
        finalFocus={triggerRef}
        className="w-[calc(100%-(--spacing(8)))] p-6 data-[size=default]:max-w-(--container-md) data-[size=default]:sm:max-w-(--container-md) data-[size=default]:rounded-xl duration-(--motion-duration-moderate) data-closed:duration-(--motion-duration-base) motion-reduce:duration-(--motion-duration-instant)"
      >
        <AlertDialogHeader className="sm:group-data-[size=default]/alert-dialog-content:place-items-center sm:group-data-[size=default]/alert-dialog-content:text-center">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        {notice ? (
          <p
            id={noticeId}
            role={isError ? "alert" : undefined}
            className={`flex items-start justify-center gap-2 text-sm ${isError ? "text-destructive" : "text-muted-foreground"}`}
          >
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{notice}</span>
          </p>
        ) : null}
        {/* Primary first in DOM and focus order; the row reverses at 1440 so it sits outermost. */}
        <AlertDialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
          <AlertDialogAction
            ref={confirmRef}
            variant="destructive-solid"
            onClick={(event) => {
              if (holdAria && (pending || confirmHeld)) {
                event.preventDefault();
                return;
              }
              onConfirm();
            }}
            disabled={holdAria ? undefined : confirmDisabled || pending}
            aria-disabled={
              holdAria && (pending || confirmHeld) ? true : undefined
            }
            aria-describedby={confirmHeld ? noticeId : undefined}
            aria-busy={pending}
            className="min-w-32 aria-disabled:opacity-50"
          >
            {pending ? (
              <>
                <Spinner
                  aria-hidden="true"
                  role={undefined}
                  aria-label={undefined}
                />
                {pendingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
          <AlertDialogCancel
            ref={cancelRef}
            disabled={holdAria ? undefined : pending}
            aria-disabled={holdAria && pending ? true : undefined}
            onClick={
              holdAria && pending ? (e) => e.preventDefault() : undefined
            }
            className="aria-disabled:opacity-50"
          >
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
