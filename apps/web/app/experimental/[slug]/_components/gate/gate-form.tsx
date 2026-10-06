"use client";

/**
 * The gate's form (gate.md): email (guest face only), code, one button. The
 * fields are controlled, so they stay filled after the action returns; the
 * action's state never holds the code or the email. After a press, focus
 * moves to the first field in error, and each error is tied to its field.
 *
 * A lock shows a fixed time in the reader's own locale and zone, formatted
 * after mount, and one timer re-enables the button at that time: never a
 * countdown (A-19).
 */
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@pem/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@pem/ui/field";
import { Input } from "@pem/ui/input";

import {
  GATE_WORDS,
  type GateActionState,
  type GateFormView,
} from "../../../../../lib/sandbox/gate";

type GateFormProps = {
  action: (
    previous: GateActionState,
    formData: FormData,
  ) => Promise<GateActionState>;
  signOut: () => Promise<never>;
  accountEmail: string | null;
  initial: GateFormView;
  focusCode: boolean;
};

const IDS = {
  email: "gate-email",
  emailError: "gate-email-error",
  code: "gate-code",
  codeHint: "gate-code-hint",
  codeError: "gate-code-error",
  message: "gate-message",
} as const;

const noSubscription = () => () => {};

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** The lock's time in the reader's own locale and zone; before hydration, in UTC and named so. */
function formatLockTime(iso: string, local: boolean): string {
  return new Intl.DateTimeFormat(local ? undefined : "en-GB", {
    hour: "numeric",
    minute: "2-digit",
    ...(local ? {} : { timeZone: "UTC", timeZoneName: "short" }),
  }).format(new Date(iso));
}

export function GateForm({
  action,
  signOut,
  accountEmail,
  initial,
  focusCode,
}: GateFormProps) {
  const [state, formAction, isPending] = useActionState(action, initial.result);
  const [email, setEmail] = useState(initial.email);
  const [code, setCode] = useState(initial.code);
  const [reopenedFor, setReopenedFor] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const signedIn = accountEmail !== null;
  const offline = initial.offline || !online;
  const pending = initial.pending || isPending;
  const lockedUntil = state.kind === "throttled" ? state.lockedUntil : null;
  const locked =
    lockedUntil !== null && (initial.fixture || reopenedFor !== lockedUntil);
  const errors = state.kind === "error" ? state.errors : {};
  const codeError =
    lockedUntil !== null
      ? GATE_WORDS.throttled(formatLockTime(lockedUntil, mounted))
      : errors.code;

  // One timer re-enables the button when the lock ends; a fixture stays locked.
  useEffect(() => {
    if (lockedUntil === null || initial.fixture) return;
    const timer = setTimeout(
      () => setReopenedFor(lockedUntil),
      Math.max(0, Date.parse(lockedUntil) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [lockedUntil, initial.fixture]);

  // After a press, focus the first field in error; nothing is focused on load.
  const firstState = useRef(initial.result);
  useEffect(() => {
    if (state === firstState.current) return;
    if (state.kind === "error" && state.errors.email) emailRef.current?.focus();
    else if (state.kind === "error" || state.kind === "throttled")
      codeRef.current?.focus();
  }, [state]);

  const busy = pending || initial.success;
  const buttonLabel = initial.success
    ? GATE_WORDS.success
    : pending
      ? GATE_WORDS.buttonPending
      : GATE_WORDS.button;

  return (
    <div className="flex flex-col gap-6">
      {signedIn ? (
        <form
          action={signOut}
          onSubmit={(event) => {
            // A ?state= fixture never ends a real session.
            if (initial.fixture) event.preventDefault();
          }}
          className="text-sm"
        >
          <p>
            {GATE_WORDS.signedInAs} {accountEmail}. {GATE_WORDS.signedInSaved}{" "}
            {GATE_WORDS.notYou}{" "}
            <button
              type="submit"
              className="-my-3 inline-block py-3 underline underline-offset-4"
            >
              {GATE_WORDS.signOut}
            </button>
          </p>
        </form>
      ) : null}

      <form
        action={formAction}
        noValidate
        onSubmit={(event) => {
          // A ?state= fixture never spends a real try.
          if (initial.fixture || !navigator.onLine || locked)
            event.preventDefault();
        }}
        className="flex flex-col gap-6"
      >
        {signedIn ? null : (
          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor={IDS.email}>{GATE_WORDS.emailLabel}</FieldLabel>
            <Input
              ref={emailRef}
              id={IDS.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              readOnly={busy}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? IDS.emailError : undefined}
              className="h-11"
            />
            {errors.email ? (
              <FieldError id={IDS.emailError}>{errors.email}</FieldError>
            ) : null}
          </Field>
        )}

        <Field data-invalid={codeError ? true : undefined}>
          <FieldLabel htmlFor={IDS.code}>{GATE_WORDS.codeLabel}</FieldLabel>
          <Input
            ref={codeRef}
            id={IDS.code}
            name="code"
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            // gate.md: with the email prefilled from the link, focus goes to the code.
            autoFocus={focusCode}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            readOnly={busy}
            aria-invalid={codeError ? true : undefined}
            aria-describedby={
              codeError ? `${IDS.codeHint} ${IDS.codeError}` : IDS.codeHint
            }
            className="h-11"
          />
          <FieldDescription id={IDS.codeHint}>
            {GATE_WORDS.codeHint}
          </FieldDescription>
          {codeError ? (
            <FieldError id={IDS.codeError}>
              {lockedUntil !== null ? (
                <time dateTime={lockedUntil}>{codeError}</time>
              ) : (
                codeError
              )}
            </FieldError>
          ) : null}
        </Field>

        <div className="flex flex-col gap-3">
          {offline ? (
            <p id={IDS.message} role="status" className="text-sm font-medium">
              {GATE_WORDS.offline}
            </p>
          ) : state.kind === "server-error" ? (
            <p id={IDS.message} role="alert" className="text-sm font-medium">
              {GATE_WORDS.serverError}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={busy || locked}
            className="h-11 w-full sm:w-fit sm:px-6"
          >
            {buttonLabel}
          </Button>
          <p role="status" className="sr-only">
            {pending ? GATE_WORDS.buttonPending : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
