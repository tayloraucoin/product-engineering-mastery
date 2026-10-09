"use client";

/**
 * An experiment's Data tab (data.md): what it holds, and an admin's delete.
 * The delete is a typed confirmation, not a dialog: the field's label states
 * the rule, and the button stays off until the field equals the slug. A
 * developer sees the counts and the admin-only line, with no field and no
 * button (D-LAB-26). The action decides; this leaf asks and reports.
 * A `?state=` fixture never reaches the action: its delete answers locally.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

import { Button } from "@pem/ui/button";
import { Field, FieldDescription, FieldLabel } from "@pem/ui/field";
import { Input } from "@pem/ui/input";
import { Skeleton } from "@pem/ui/skeleton";
import { createToastManager, Toaster } from "@pem/ui/toast";

import type { DeleteDataResult } from "../../../../../../lib/sandbox/admin/admin-data";
import {
  confirmMatches,
  DATA_WORDS,
  deleteButtonLabel,
  deletedToast,
  deletePanel,
  holdsLine,
  type DataTabView,
} from "../../../../../../lib/sandbox/admin/admin-data-view";
import { deleteExperimentData } from "../actions";

const W = DATA_WORDS;

/** This tab's toasts: one manager, handed to its Toaster. */
const toasts = createToastManager();

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** False while the browser says it is offline; true on the server. */
function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

export function DataTab({ view }: { view: DataTabView }) {
  return (
    <Toaster toastManager={toasts}>
      <DataTabBody view={view} />
    </Toaster>
  );
}

function DataTabBody({ view }: { view: DataTabView }) {
  const online = useOnline();
  const offline = view.offline || !online;
  const countsRef = useRef<HTMLParagraphElement>(null);

  // A fixture's toast shows on arrival, as the action's would: one task
  // later, since this effect runs before the Toaster's own has subscribed.
  useEffect(() => {
    const toast = view.toast;
    if (!toast) return;
    const timer = setTimeout(() => {
      if (toast.kind === "deleted")
        toasts.add({ type: "success", title: deletedToast(toast.reviewers) });
      else toasts.add({ type: "error", title: W.actionFailed });
    }, 0);
    return () => clearTimeout(timer);
  }, [view.toast]);

  if (view.loading) return <DataTabSkeleton />;
  if (view.error || !view.counts)
    return <p className="text-muted-foreground">{W.error}</p>;

  const panel = deletePanel(view, online);
  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <h2 className="sr-only">{W.heading}</h2>
      {offline ? <p role="status">{W.offline}</p> : null}
      {/* One element in both forms, so focus can land here after a delete. */}
      <p ref={countsRef} tabIndex={-1}>
        {panel.kind === "nothing-held"
          ? W.nothingHeld(view.title)
          : holdsLine(view.title, view.counts)}
      </p>
      {panel.kind === "developer" ? (
        <p className="text-muted-foreground">{W.developerOnly}</p>
      ) : null}
      {panel.kind === "partial" ? (
        <p className="text-muted-foreground">{W.partial}</p>
      ) : null}
      {panel.kind === "admin" ? (
        <DeleteForm
          view={view}
          reviewers={panel.reviewers}
          enabled={panel.enabled && !offline}
          onDeleted={() => countsRef.current?.focus()}
        />
      ) : null}
    </section>
  );
}

function DeleteForm({
  view,
  reviewers,
  enabled,
  onDeleted,
}: {
  view: DataTabView;
  reviewers: number;
  enabled: boolean;
  /** The form leaves with the data: focus moves to the counts line. */
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const fieldId = useId();
  const hintId = useId();
  const matches = confirmMatches(typed, view.slug);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matches || !enabled || busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    let result: DeleteDataResult;
    try {
      result = view.fixture
        ? { outcome: "deleted", reviewers }
        : await deleteExperimentData(view.slug, null, form);
    } catch {
      result = { outcome: "failed", message: W.actionFailed };
    } finally {
      setBusy(false);
    }
    if (result.outcome === "deleted") {
      setTyped("");
      toasts.add({ type: "success", title: deletedToast(result.reviewers) });
      if (!view.fixture) router.refresh();
      onDeleted();
    } else {
      toasts.add({
        type: "error",
        title: result.outcome === "mismatch" ? result.message : W.actionFailed,
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>{W.consequence(view.title)}</p>
        {view.open ? <p className="font-medium">{W.open}</p> : null}
      </div>
      <Field>
        <FieldLabel htmlFor={fieldId}>{W.confirmLabel(view.slug)}</FieldLabel>
        <Input
          id={fieldId}
          name="confirm"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={!enabled}
          aria-describedby={hintId}
          className="max-w-sm"
        />
        <FieldDescription id={hintId}>{W.confirmHint}</FieldDescription>
      </Field>
      <div>
        <Button
          type="submit"
          variant="destructive"
          disabled={!enabled || !matches || busy}
          aria-describedby={hintId}
        >
          {deleteButtonLabel(reviewers)}
        </Button>
      </div>
    </form>
  );
}

export function DataTabSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-4" aria-hidden="true">
      <Skeleton className="animate-none h-4 w-full" />
      <Skeleton className="animate-none h-4 w-3/4" />
      <Skeleton className="animate-none h-9 w-80" />
      <Skeleton className="animate-none h-9 w-56" />
    </div>
  );
}
