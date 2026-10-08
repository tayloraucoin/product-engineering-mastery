"use client";

/**
 * Access codes' dialogs (access-codes.md). `CodeDialog` is one dialog with
 * steps: the make form or the replace question, then the code shown once.
 * One dialog, so focus moves from the form to "Copy code" without a second
 * dialog racing the first one's close. Revoke is its own `AlertDialog`.
 *
 * The code lives only in `shown`, which the table holds in component state
 * and drops on Done or Escape; it is never written to storage, a URL, a
 * toast or a log.
 */
import { useEffect, useRef, useState } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pem/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@pem/ui/field";
import { Input } from "@pem/ui/input";

import type {
  CodeActionResult,
  CodeField,
} from "../../../../../../lib/sandbox/admin-codes";
import {
  CODE_DISPLAY_NAME_MAX,
  CODE_LABEL_MAX,
  codeFieldLabel,
  CODES_WORDS,
  replaceConfirmation,
  revokeConfirmation,
  shownOnceTitle,
  type CodeRowView,
} from "../../../../../../lib/sandbox/admin-codes-view";

const W = CODES_WORDS;
const COPIED_MS = 2000;

/** A code to show once, and whom it is for. */
export type ShownCode = { label: string; code: string; link: string };

/** What the dialog was opened for. */
export type CodeRequest =
  { kind: "make" } | { kind: "replace"; row: CodeRowView };

type Run = (form: FormData) => Promise<CodeActionResult>;
type ReturnTo = React.RefObject<HTMLElement | null>;

export function CodeDialog({
  request,
  shown,
  collaborate,
  initialFailure,
  initiallyCopied,
  returnTo,
  onCancel,
  onShown,
  onReplaceFailed,
  onDone,
  runMake,
  runReplace,
}: {
  request: CodeRequest | null;
  shown: ShownCode | null;
  collaborate: boolean;
  /** `codes-make-error`: the make form opens with its failure line. */
  initialFailure: boolean;
  /** `codes-copied`: "Copy code" already reads "Copied". */
  initiallyCopied: boolean;
  returnTo: ReturnTo;
  onCancel: () => void;
  onShown: (shown: ShownCode) => void;
  onReplaceFailed: (message: string) => void;
  /** Done or Escape on the shown step: the code leaves the page. */
  onDone: () => void;
  runMake: Run;
  runReplace: Run;
}) {
  const [busy, setBusy] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);
  const copyCodeRef = useRef<HTMLButtonElement>(null);
  const open = request !== null || shown !== null;

  // From the form to the code: focus moves to "Copy code" (access-codes.md).
  const wasShown = useRef(shown !== null);
  useEffect(() => {
    if (shown && !wasShown.current) copyCodeRef.current?.focus();
    wasShown.current = shown !== null;
  }, [shown]);

  async function act(run: Run, form: FormData): Promise<CodeActionResult> {
    setBusy(true);
    try {
      return await run(form);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        if (shown) onDone();
        else if (!busy) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={!shown}
        initialFocus={() =>
          shown
            ? copyCodeRef.current
            : request?.kind === "make"
              ? labelRef.current
              : true
        }
        finalFocus={returnTo}
      >
        {shown ? (
          <ShownOnceStep
            shown={shown}
            copyCodeRef={copyCodeRef}
            initiallyCopied={initiallyCopied}
            onDone={onDone}
          />
        ) : request?.kind === "make" ? (
          <MakeStep
            collaborate={collaborate}
            initialFailure={initialFailure}
            labelRef={labelRef}
            busy={busy}
            onCancel={onCancel}
            run={async (form, label) => {
              const result = await act(runMake, form);
              if (result.outcome === "made")
                onShown({ label, code: result.code, link: result.link });
              return result;
            }}
          />
        ) : request?.kind === "replace" ? (
          <ReplaceStep
            row={request.row}
            busy={busy}
            onCancel={onCancel}
            onConfirm={async () => {
              const form = new FormData();
              form.set("reviewerId", request.row.reviewerId);
              const label = request.row.label;
              const result = await act(runReplace, form);
              if (result.outcome === "made")
                onShown({ label, code: result.code, link: result.link });
              else
                onReplaceFailed(
                  result.outcome === "closed"
                    ? result.message
                    : W.replaceFailed,
                );
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MakeStep({
  collaborate,
  initialFailure,
  labelRef,
  busy,
  onCancel,
  run,
}: {
  collaborate: boolean;
  initialFailure: boolean;
  labelRef: React.RefObject<HTMLInputElement | null>;
  busy: boolean;
  onCancel: () => void;
  run: (form: FormData, label: string) => Promise<CodeActionResult>;
}) {
  const [errors, setErrors] = useState<Partial<Record<CodeField, string>>>({});
  const [failure, setFailure] = useState<string | null>(
    initialFailure ? W.makeFailed : null,
  );
  const displayNameRef = useRef<HTMLInputElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await run(form, String(form.get("label") ?? "").trim());
    if (result.outcome === "made") return;
    if (result.outcome === "invalid") {
      setFailure(null);
      setErrors({ [result.field]: result.message });
      (result.field === "label" ? labelRef : displayNameRef).current?.focus();
      return;
    }
    setErrors({});
    setFailure(result.outcome === "closed" ? result.message : W.makeFailed);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <DialogHeader>
        <DialogTitle>{W.make}</DialogTitle>
      </DialogHeader>
      <FieldGroup>
        <Field data-invalid={errors.label ? true : undefined}>
          <FieldLabel htmlFor="code-label">{W.label}</FieldLabel>
          <Input
            ref={labelRef}
            id="code-label"
            name="label"
            autoComplete="off"
            maxLength={CODE_LABEL_MAX}
            aria-invalid={errors.label ? true : undefined}
            aria-describedby="code-label-hint code-label-error"
          />
          <FieldDescription id="code-label-hint">
            {W.labelHint}
          </FieldDescription>
          <FieldError id="code-label-error">{errors.label}</FieldError>
        </Field>
        {collaborate ? (
          <Field data-invalid={errors.displayName ? true : undefined}>
            <FieldLabel htmlFor="code-display-name">{W.displayName}</FieldLabel>
            <Input
              ref={displayNameRef}
              id="code-display-name"
              name="displayName"
              autoComplete="off"
              maxLength={CODE_DISPLAY_NAME_MAX}
              aria-invalid={errors.displayName ? true : undefined}
              aria-describedby="code-display-name-hint code-display-name-error"
            />
            <FieldDescription id="code-display-name-hint">
              {W.displayNameHint}
            </FieldDescription>
            <FieldError id="code-display-name-error">
              {errors.displayName}
            </FieldError>
          </Field>
        ) : null}
      </FieldGroup>
      {failure ? (
        <p role="alert" className="text-sm text-destructive">
          {failure}
        </p>
      ) : null}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
        >
          {W.cancel}
        </Button>
        <Button type="submit" disabled={busy}>
          {W.makeButton}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ReplaceStep({
  row,
  busy,
  onCancel,
  onConfirm,
}: {
  row: CodeRowView;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{W.replace}</DialogTitle>
        <DialogDescription>
          {replaceConfirmation(row.label, row.revoked)}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
        >
          {W.cancel}
        </Button>
        <Button type="button" disabled={busy} onClick={onConfirm}>
          {W.replace}
        </Button>
      </DialogFooter>
    </>
  );
}

/** A button that copies `text` and reads "Copied" for two seconds. */
function CopyButton({
  text,
  idle,
  announce,
  initiallyCopied,
  onCopied,
  buttonRef,
}: {
  text: string;
  idle: string;
  announce: string;
  initiallyCopied: boolean;
  onCopied: (announcement: string) => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  const [copied, setCopied] = useState(initiallyCopied);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // No clipboard (an insecure origin, or refused): the field stays
      // selectable, and nothing claims a copy that did not happen.
      return;
    }
    setCopied(true);
    // Cleared first, so a second copy is announced again.
    onCopied("");
    setTimeout(() => onCopied(announce), 0);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }
  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="outline"
      className="sm:w-28"
      onClick={copy}
    >
      {copied ? W.copied : idle}
    </Button>
  );
}

function ShownOnceStep({
  shown,
  copyCodeRef,
  initiallyCopied,
  onDone,
}: {
  shown: ShownCode;
  copyCodeRef: React.RefObject<HTMLButtonElement | null>;
  initiallyCopied: boolean;
  onDone: () => void;
}) {
  const [announcement, setAnnouncement] = useState("");
  return (
    <>
      <DialogHeader>
        <DialogTitle>{shownOnceTitle(shown.label)}</DialogTitle>
        <DialogDescription>{W.shownOnce}</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="shown-code">
            {codeFieldLabel(shown.label)}
          </FieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="shown-code"
              readOnly
              value={shown.code}
              autoComplete="off"
              spellCheck={false}
              className="font-mono tracking-wide"
              onFocus={(event) => event.currentTarget.select()}
            />
            <CopyButton
              buttonRef={copyCodeRef}
              text={shown.code}
              idle={W.copyCode}
              announce={W.codeCopied}
              initiallyCopied={initiallyCopied}
              onCopied={setAnnouncement}
            />
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="shown-link">{W.link}</FieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="shown-link"
              readOnly
              value={shown.link}
              autoComplete="off"
              spellCheck={false}
              onFocus={(event) => event.currentTarget.select()}
            />
            <CopyButton
              text={shown.link}
              idle={W.copyLink}
              announce={W.linkCopied}
              initiallyCopied={false}
              onCopied={setAnnouncement}
            />
          </div>
        </Field>
      </FieldGroup>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <DialogFooter>
        <Button type="button" onClick={onDone}>
          {W.done}
        </Button>
      </DialogFooter>
    </>
  );
}

export function RevokeCodeDialog({
  row,
  returnTo,
  onClose,
  onDone,
  run,
}: {
  row: CodeRowView | null;
  returnTo: ReturnTo;
  onClose: () => void;
  onDone: (result: CodeActionResult) => void;
  run: Run;
}) {
  const [busy, setBusy] = useState(false);
  async function confirm() {
    if (!row) return;
    const form = new FormData();
    form.set("reviewerId", row.reviewerId);
    setBusy(true);
    try {
      onDone(await run(form));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AlertDialog
      open={row !== null}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <AlertDialogContent finalFocus={returnTo}>
        <AlertDialogHeader>
          <AlertDialogTitle>{W.revoke}</AlertDialogTitle>
          <AlertDialogDescription>
            {row ? revokeConfirmation(row.label) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{W.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={busy}
            onClick={confirm}
          >
            {W.revoke}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
