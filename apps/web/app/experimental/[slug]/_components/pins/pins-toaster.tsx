"use client";

/**
 * The pins' toasts (pins.md): Undo after a delete or a discard, and "Saved
 * in this browser only." Built from @pem/ui's toast parts so the viewport
 * sits above the review bar, never under it. An Undo toast stays until
 * dismissed or 8 seconds pass, pauses while hovered or focused (Base UI's
 * viewport), and is reachable by keyboard (F6). While LAB-13's list is open
 * the viewport is portalled into it (`container`), so a modal list neither
 * covers an Undo nor traps focus away from it.
 */
import type { CSSProperties, ReactNode } from "react";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
  type createToastManager,
} from "@pem/ui/toast";

function PinsToastList() {
  const { toasts } = useToastManager();
  return toasts.map((toast) => (
    <Toast key={toast.id} toast={toast}>
      <ToastContent>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction className="h-11 min-w-11" />
        <ToastClose className="size-11" />
      </ToastContent>
    </Toast>
  ));
}

export function PinsToaster({
  toastManager,
  barHeight,
  container,
  children,
}: {
  toastManager: ReturnType<typeof createToastManager>;
  barHeight: number;
  container: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <ToastProvider toastManager={toastManager}>
      {children}
      <ToastPortal container={container ?? undefined}>
        <ToastViewport
          style={{ "--review-bar-height": `${barHeight}px` } as CSSProperties}
          className="bottom-[calc(var(--review-bar-height)+--spacing(4))]"
        >
          <PinsToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
