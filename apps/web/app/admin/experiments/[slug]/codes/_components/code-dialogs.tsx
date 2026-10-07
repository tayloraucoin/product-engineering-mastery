"use client";

/**
 * Access codes' dialogs (access-codes.md): make a code, show it once,
 * replace one, revoke one. The code lives only in the shown-once dialog's
 * props, which the table holds in component state and drops on Done or
 * Escape; it is never written to storage, a URL, a toast or a log.
 */
import { useEffect, useRef, useState, useTransition } from "react";

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
  CODES_WORDS,
  codeFieldLabel,
  replaceConfirmation,
  revokeConfirmation,
  shownOnceTitle,
  type CodeRowView,
} from "../../../../../../lib/sandbox/admin-codes-view";

const W = CODES_WORDS;
const COPIED_MS = 2000;

/** A code to show once, and whom it is for. */
export type ShownCode = { label: string; code: string; link: string };

type Run = (form: FormData) => Promise<CodeActionResult>;
type ReturnTo = React.RefObject<HTMLElement | null>;

export function MakeCodeDialog({
  open,
  collaborate,
  initialFailure,
  returnTo,
  onClose,
  onMade,
  run,
}: {
  open: boolean;
  collaborate: boolean;
  /** `codes-make-error`: opens with the failure line. */
  initialFailure: boolean;
  returnTo: ReturnTo;
  onClose: () => void;
  onMade: (shown: ShownCode) => void;
  run: Run;
}) {
  const [errors, setErrors] = useState<Partial<Record<CodeField, string>>>(
    {},
  );
  const [failure, setFailure] = useState<string | null>(
    initialFailure ? W.makeFailed : null,
  );
  const [busy, startMake] = useTransition();
  const labelRef = useRef<HTMLInputElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "").trim();
    startMake(async () => {
      const result = await run(form);
      if (result.outcome === "made") {
        setErrors({});
        setFailure(null);
        onMade({ label, code: result.code, link: result.link });
        return;
      }
      if (result.outcome === "invalid") {
        setFailure(null);
        setErrors({ [result.field]: result.message });
        (result.field === "label" ? labelRef : displayNameRef).current?.focus();
        return;
      }
      setErrors({});
      setFailure(result.outcome === "closed" ? result.message : W.makeFailed);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) {
          setErrors({});
          setFailure(null);
          onClose();
        }
      }}
    >
      <DialogContent initialFocus={labelRef} finalFocus={returnTo}>
        <form onSubmit={submit} noValidate className="grid gap-6">
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
                <FieldLabel htmlFor="code-display-name">
                  {W.displayName}
                </FieldLabel>
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
              onClick={onClose}
            >
              {W.cancel}
            </Button>
            <Button type="submit" disabled={busy}>
              {W.makeButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
      return;
    }
    setCopied(true);
    onCopied(announce);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }
  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="outline"
      className="w-28"
      onClick={copy}
    >
      {copied ? W.copied : idle}
    </Button>
  );
}

export function ShownOnceDialog({
  shown,
  initiallyCopied,
  returnTo,
  onDone,
}: {
  shown: ShownCode | null;
  /** `codes-copied`: the Copy code button already reads "Copied". */
  initiallyCopied: boolean;
  returnTo: ReturnTo;
  onDone: () => void;
}) {
  const copyCodeRef = useRef<HTMLButtonElement>(null);
  const [announcement, setAnnouncement] = useState("");
  return (
    <Dialog
      open={shown !== null}
      onOpenChange={(next) => {
        if (!next) {
          setAnnouncement("");
          onDone();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        initialFocus={copyCodeRef}
        finalFocus={returnTo}
      >
        {shown ? (
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
                <div className="flex gap-2">
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
                <div className="flex gap-2">
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
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function ReplaceCodeDialog({
  row,
  returnTo,
  onClose,
  onMade,
  onFailed,
  run,
}: {
  row: CodeRowView | null;
  returnTo: ReturnTo;
  onClose: () => void;
  onMade: (shown: ShownCode) => void;
  onFailed: (message: string) => void;
  run: Run;
}) {
  const [busy, startReplace] = useTransition();
  function confirm() {
    if (!row) return;
    const form = new FormData();
    form.set("reviewerId", row.reviewerId);
    const label = row.label;
    startReplace(async () => {
      const result = await run(form);
      if (result.outcome === "made")
        onMade({ label, code: result.code, link: result.link });
      else
        onFailed(
          result.outcome === "closed" ? result.message : W.replaceFailed,
        );
    });
  }
  return (
    <Dialog
      open={row !== null}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <DialogContent finalFocus={returnTo}>
        <DialogHeader>
          <DialogTitle>{W.replace}</DialogTitle>
          <DialogDescription>
            {row ? replaceConfirmation(row.label, row.revoked) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onClose}
          >
            {W.cancel}
          </Button>
          <Button type="button" disabled={busy} onClick={confirm}>
            {W.replace}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [busy, startRevoke] = useTransition();
  function confirm() {
    if (!row) return;
    const form = new FormData();
    form.set("reviewerId", row.reviewerId);
    startRevoke(async () => onDone(await run(form)));
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
