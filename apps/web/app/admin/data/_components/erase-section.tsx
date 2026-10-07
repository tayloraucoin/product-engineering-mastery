"use client";

/**
 * Erase a reviewer (data.md, S28): find what an email holds, then erase it
 * everywhere after an `AlertDialog`. Opened from a reviewer (`?reviewer=`),
 * it first lists each email used with that code, each erased separately.
 *
 * The email travels only in POST bodies (D-LAB-28): the find and the erase
 * are server actions, and the found result lives in component state, never
 * in the URL. After an erase the field is emptied and takes focus again.
 * A `?state=` fixture never reaches an action: find and erase answer locally.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

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
import { Button } from "@pem/ui/button";
import { Checkbox } from "@pem/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@pem/ui/field";
import { Input } from "@pem/ui/input";
import { createToastManager, Toaster } from "@pem/ui/toast";

import type {
  EraseReviewerResult,
  FindReviewerResult,
} from "../../../../lib/sandbox/admin-data";
import {
  DATA_WORDS,
  eraseConfirmation,
  erasedToast,
  FIXTURE_ERASED,
  FIXTURE_FOUND,
  foundLine,
  onThisCode,
  type DataPageView,
  type ErasureFoundView,
  type ReviewerView,
} from "../../../../lib/sandbox/admin-data-view";
import { eraseReviewer, findReviewer } from "../actions";

const W = DATA_WORDS;

/** This page's toasts: one manager, handed to its Toaster. */
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

/** What the section shows under the field. */
type Shown =
  | { kind: "none" }
  | { kind: "found"; found: ErasureFoundView }
  | { kind: "no-match" };

export function EraseSection({ view }: { view: DataPageView }) {
  return (
    <Toaster toastManager={toasts}>
      <EraseBody view={view} />
    </Toaster>
  );
}

function EraseBody({ view }: { view: DataPageView }) {
  const router = useRouter();
  const online = useOnline();
  const offline = view.offline || !online;
  const fixture = view.fixture;
  const headingId = useId();
  const fieldId = useId();
  const errorId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const foundRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState(
    view.found?.email ?? (view.noMatch ? "someone@example.com" : ""),
  );
  const [shown, setShown] = useState<Shown>(
    view.found
      ? { kind: "found", found: view.found }
      : view.noMatch
        ? { kind: "no-match" }
        : { kind: "none" },
  );
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [unticked, setUnticked] = useState<Set<string>>(new Set());

  // A fixture's toast shows on arrival, as the action's would.
  useEffect(() => {
    if (view.toast?.kind === "erased")
      toasts.add({ type: "success", title: erasedToast(view.toast.counts) });
    else if (view.toast?.kind === "failed")
      toasts.add({ type: "error", title: W.actionFailed });
  }, [view.toast]);

  // A new result moves focus to it, so a screen reader hears what was found.
  const lastFound = useRef<ErasureFoundView | null>(view.found);
  useEffect(() => {
    if (shown.kind === "found" && shown.found !== lastFound.current)
      foundRef.current?.focus();
    lastFound.current = shown.kind === "found" ? shown.found : null;
  }, [shown]);

  async function find(value: string) {
    const form = new FormData();
    form.set("email", value);
    setBusy(true);
    let result: FindReviewerResult;
    try {
      result = fixture
        ? value.trim().toLowerCase() === FIXTURE_FOUND.email
          ? { outcome: "found", found: FIXTURE_FOUND }
          : { outcome: "no-match", message: W.noMatch }
        : await findReviewer(null, form);
    } catch {
      result = { outcome: "failed", message: W.actionFailed };
    } finally {
      setBusy(false);
    }
    setUnticked(new Set());
    if (result.outcome === "found") {
      setFieldError(null);
      setEmail(result.found.email);
      setShown({ kind: "found", found: result.found });
    } else if (result.outcome === "no-match") {
      setFieldError(null);
      setShown({ kind: "no-match" });
    } else if (result.outcome === "invalid") {
      setShown({ kind: "none" });
      setFieldError(result.message);
      emailRef.current?.focus();
    } else {
      toasts.add({ type: "error", title: W.actionFailed });
    }
  }

  async function erase(found: ErasureFoundView) {
    const form = new FormData();
    form.set("email", found.email);
    for (const label of found.nameLabels)
      if (!unticked.has(label.reviewerId))
        form.append("clearLabel", label.reviewerId);
    setBusy(true);
    let result: EraseReviewerResult;
    try {
      result = fixture
        ? { outcome: "erased", counts: FIXTURE_ERASED }
        : await eraseReviewer(null, form);
    } catch {
      result = { outcome: "failed", message: W.actionFailed };
    } finally {
      setBusy(false);
    }
    setConfirming(false);
    if (result.outcome === "erased") {
      toasts.add({ type: "success", title: erasedToast(result.counts) });
      setShown({ kind: "none" });
      setEmail("");
      // After the dialog hands focus back, the emptied field takes it (data.md).
      setTimeout(() => emailRef.current?.focus(), 0);
      if (!fixture) router.refresh();
    } else if (result.outcome === "no-match") {
      setShown({ kind: "no-match" });
    } else {
      toasts.add({ type: "error", title: W.actionFailed });
    }
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="text-lg font-semibold">
        {W.eraseHeading}
      </h2>
      {offline ? <p role="status">{W.offline}</p> : null}
      {view.reviewer !== undefined ? (
        <FromReviewer
          reviewer={view.reviewer}
          disabled={offline || busy}
          onErase={find}
        />
      ) : null}
      <form
        noValidate
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!offline && !busy) void find(email);
        }}
      >
        <Field data-invalid={fieldError ? true : undefined}>
          <FieldLabel htmlFor={fieldId}>{W.emailLabel}</FieldLabel>
          <div className="flex max-w-md flex-wrap gap-2">
            <Input
              ref={emailRef}
              id={fieldId}
              name="email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={errorId}
              className="min-w-0 flex-1"
            />
            <Button type="submit" variant="outline" disabled={offline || busy}>
              {W.find}
            </Button>
          </div>
          <FieldError id={errorId}>{fieldError}</FieldError>
        </Field>
      </form>
      <div role="status">
        {shown.kind === "no-match" ? <p>{W.noMatch}</p> : null}
      </div>
      {shown.kind === "found" ? (
        <FoundPanel
          found={shown.found}
          headingRef={foundRef}
          unticked={unticked}
          onTick={(id, checked) =>
            setUnticked((prev) => {
              const next = new Set(prev);
              if (checked) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          disabled={offline || busy}
          onErase={() => setConfirming(true)}
        />
      ) : null}
      <AlertDialog
        open={confirming && shown.kind === "found"}
        onOpenChange={(next) => {
          if (!next && !busy) setConfirming(false);
        }}
      >
        <AlertDialogContent>
          {shown.kind === "found" ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {W.erase(shown.found.email)}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {eraseConfirmation(shown.found.totals)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy}>
                  {W.cancel}
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={busy || offline}
                  onClick={() => void erase(shown.found)}
                >
                  {W.erase(shown.found.email)}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function FromReviewer({
  reviewer,
  disabled,
  onErase,
}: {
  reviewer: ReviewerView | null;
  disabled: boolean;
  onErase: (email: string) => void;
}) {
  if (!reviewer) return <p>{W.noMatch}</p>;
  if (reviewer.emails.length === 0) return <p>{W.fromReviewerNone}</p>;
  return (
    <div className="flex flex-col gap-3">
      <p>{W.fromReviewer(reviewer.emails.length)}</p>
      <ul className="flex flex-col divide-y rounded-lg border">
        {reviewer.emails.map((entry) => (
          <li
            key={entry.email}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium break-all">{entry.email}</p>
              <p className="text-sm text-muted-foreground">
                {onThisCode(entry)}
              </p>
            </div>
            <Button
              variant="outline"
              disabled={disabled}
              onClick={() => onErase(entry.email)}
              className="shrink-0"
            >
              {`${W.erase(entry.email)}…`}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FoundPanel({
  found,
  headingRef,
  unticked,
  onTick,
  disabled,
  onErase,
}: {
  found: ErasureFoundView;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  unticked: Set<string>;
  onTick: (reviewerId: string, checked: boolean) => void;
  disabled: boolean;
  onErase: () => void;
}) {
  const id = useId();
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h3 ref={headingRef} tabIndex={-1} className="font-medium break-all">
        {foundLine(found.email, found.totals)}
      </h3>
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">{W.whatElse}</h4>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          <li>{W.whatElseEmails}</li>
          <li>{W.whatElseOnly}</li>
          <li>{W.whatElseLabels}</li>
        </ul>
      </div>
      {found.nameLabels.length > 0 ? (
        <FieldSet>
          <FieldLegend variant="label" className="sr-only">
            {W.whatElse}
          </FieldLegend>
          <FieldGroup className="gap-3">
            {found.nameLabels.map((label) => (
              <Field key={label.reviewerId} orientation="horizontal">
                <Checkbox
                  id={`${id}-${label.reviewerId}`}
                  checked={!unticked.has(label.reviewerId)}
                  onCheckedChange={(checked) =>
                    onTick(label.reviewerId, checked === true)
                  }
                  disabled={disabled}
                />
                <FieldLabel
                  htmlFor={`${id}-${label.reviewerId}`}
                  className="font-normal"
                >
                  {W.clearLabel(label.label, label.title)}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      ) : null}
      <div>
        <Button variant="destructive" disabled={disabled} onClick={onErase}>
          {W.erase(found.email)}
        </Button>
      </div>
    </div>
  );
}
