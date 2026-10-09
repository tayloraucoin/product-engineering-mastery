"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ConfirmDialog } from "../../../_components/confirm-dialog";
import {
  useDemoRecord,
  useDemoStore,
} from "../../../../_components/demo-store";
import type { RecordId } from "../../../../_lib/record";

export type DeleteDialogState =
  "deleting" | "error" | "partial" | "offline" | null;

type Phase = "idle" | "deleting" | "error";

const NOTICE_ID = "delete-dialog-notice";

const WORDS = {
  cancel: "Cancel",
  confirm: "Delete record",
  pending: "Deleting",
  retry: "Retry delete",
  offline: "You are offline. Delete is off until you reconnect.",
  partialBody:
    "The record and its terms are removed. Demo data comes back when you reload.",
  partialLine: "The terms did not load. The name is enough to confirm.",
} as const;

function bodyWords(versions: number) {
  const lost = versions <= 1 ? "its only version" : `all ${versions} versions`;
  return `The record, its terms and ${lost} are removed. Demo data comes back when you reload.`;
}

function initialPhase(state: DeleteDialogState): Phase {
  return state === "deleting" || state === "error" ? state : "idle";
}

/**
 * `?dialog=delete` on detail (D-DEMO-4). Always mounted so close can fade and
 * focus can return to Delete; `open` is read from the URL. A forced key sets
 * the first render only; Retry delete runs the real delete.
 */
export function DeleteDialog({
  id,
  state,
}: {
  id: string;
  state: DeleteDialogState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { dispatch } = useDemoStore();
  const { summary } = useDemoRecord(id as RecordId);
  const [phase, setPhase] = useState<Phase>(() => initialPhase(state));
  const trigger = useRef<HTMLElement | null>(null);
  // Two presses in one tick both see `idle`; the ref lets only the first run.
  const started = useRef(false);
  const open = params.get("dialog") === "delete";
  const offline = state === "offline";
  const partial = state === "partial";

  useEffect(() => {
    trigger.current = document.getElementById("record-delete");
  }, [open]);

  if (!summary) return null;

  const close = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("dialog");
    next.delete("state");
    const query = next.toString();
    setPhase("idle");
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const run = () => {
    if (phase === "deleting" || offline || started.current) return;
    started.current = true;
    if (phase === "error") {
      // The forced key was the first render only; drop it from the URL.
      const next = new URLSearchParams(params.toString());
      next.delete("state");
      router.replace(`${pathname}?${next.toString()}`);
    }
    // No invented wait (A-20): the delete is in memory, so it runs now and
    // `deleting` holds only until the table route takes over.
    setPhase("deleting");
    dispatch({ type: "delete", id: summary.id });
    router.push("/demo/records?state=deleted");
  };

  const notice = offline
    ? WORDS.offline
    : partial
      ? WORDS.partialLine
      : phase === "error"
        ? `Delete did not finish. ${summary.vendor} is unchanged. Retry, or cancel.`
        : undefined;

  return (
    <ConfirmDialog
      open={open}
      title={`Delete ${summary.vendor}?`}
      body={partial ? WORDS.partialBody : bodyWords(summary.versionCount)}
      notice={notice}
      noticeTone={phase === "error" ? "error" : "info"}
      noticeId={NOTICE_ID}
      confirmLabel={phase === "error" ? WORDS.retry : WORDS.confirm}
      cancelLabel={WORDS.cancel}
      pendingLabel={WORDS.pending}
      pending={phase === "deleting"}
      holdAria
      confirmHeld={offline}
      demoState={state ?? "confirm"}
      onConfirm={run}
      onCancel={close}
      triggerRef={trigger}
    />
  );
}
