/**
 * The gate (ux/experimental/gate.md; D-LAB-5, D-LAB-6, R1), pure: its words,
 * which face a request gets, its `?state=` fixtures, and the enter action's
 * logic. The page, the action and the form bind it (app/experimental/[slug]).
 *
 * One face for every slug (S12b): the gate's props are the path, a prefilled
 * email, the signed-in account's email and the state, never anything read
 * from the registry. An unknown slug, a wrong code, a revoked code and a
 * closed experiment without a live code all look the same, and each wrong
 * try counts against the throttle.
 */

import { brand } from "@pem/brand/brand";

import type { GrantAccessInput, ViewerResult } from "./access-check.ts";
import type { ThrottledResult } from "./throttle.ts";
import { guestGateForm, signedInGateForm } from "./validators.ts";

const WRONG_CODE =
  "That code doesn't open a review here. Check it against the message you were sent, or ask whoever sent it for a new one.";

/** gate.md's Words, verbatim. The notice is four points, in order. */
export const GATE_WORDS = {
  title: "Design review",
  heading: "Design review",
  lead: "Enter your email and the code you were sent to see the designs and leave comments.",
  leadSignedIn:
    "Enter the code you were sent to see the designs and leave comments.",
  noticeHeading: "What we keep",
  notice: [
    "Your email, so the team knows whose feedback it is and can email you a confirmation when you send your review.",
    "Which designs you look at and for how long, your comments with the screen size you left them at, and your answers.",
    `We keep these until the team deletes them after the review. To have yours deleted, email ${brand.contact.email}.`,
    "This browser remembers your access for 30 days.",
  ],
  noticeSignedInFirst:
    "Your account email, so the team knows whose feedback it is and can email you a confirmation when you send your review.",
  signedInAs: "Signed in as",
  signedInSaved: "Your feedback is saved to this account.",
  notYou: "Not you?",
  signOut: "Sign out",
  emailLabel: "Your email",
  codeLabel: "Access code",
  codeHint: "From the message you were sent.",
  button: "Open the review",
  buttonPending: "Checking",
  success: "Opening the review",
  teamLink: "On the team? Sign in instead",
  offline: "You're offline. Connect, then try again.",
  serverError:
    "Something on our side stopped this. Try again in a minute; what you typed is still here.",
  throttled: (time: string) =>
    `Too many tries. You can try again after ${time}.`,
  errors: {
    emailEmpty: "Enter your email.",
    emailMalformed: "Enter an email address, like name@example.com.",
    codeEmpty: "Enter the access code you were sent.",
    wrongCode: WRONG_CODE,
  },
} as const;

/** gate.md's States, each reachable by `?state=` for anyone (LAB-4's reader). */
export const GATE_STATE_KEYS = [
  "gate-empty",
  "gate-loading",
  "gate-error",
  "gate-partial",
  "gate-offline",
  "gate-success",
  "gate-throttled",
  "gate-revoked",
  "gate-signed-in",
  "gate-server-error",
] as const;

export type GateStateKey = (typeof GATE_STATE_KEYS)[number];

export function isGateStateKey(value: unknown): value is GateStateKey {
  return (GATE_STATE_KEYS as readonly unknown[]).includes(value);
}

export type GateField = "email" | "code";

/** What the enter action hands back to the form. It never holds the code or the email. */
export type GateActionState =
  | { kind: "idle" }
  | { kind: "error"; errors: Partial<Record<GateField, string>> }
  | { kind: "throttled"; lockedUntil: string }
  | { kind: "server-error" };

export const GATE_IDLE: GateActionState = { kind: "idle" };

/** The Gate's props: these four and nothing else (C-LAB-gate-1). */
export type GateProps = {
  path: string;
  prefilledEmail: string | null;
  accountEmail: string | null;
  state: GateStateKey | null;
};

export type GateView =
  | { kind: "gate"; status: 200; props: GateProps }
  | { kind: "not-found" }
  | { kind: "ended" }
  | { kind: "experiment" };

/** Synthetic values for the fixtures (never a real reviewer). */
export const GATE_FIXTURE = {
  email: "ana@example.com",
  code: "7KQM 29XH PATR 4WDX",
  lockedUntil: "2026-10-06T13:32:00.000Z",
} as const;

/**
 * Which face a request gets. A gate `?state=` key renders its fixture for
 * anyone, on any slug. Otherwise no access is the gate (status 200, in
 * place), the team on an unknown slug is not found, a live access on a
 * closed experiment is ended, and the team or a reviewer sees the experiment.
 */
export function gateView(result: ViewerResult, input: GateProps): GateView {
  if (input.state !== null)
    return {
      kind: "gate",
      status: 200,
      props: {
        path: input.path,
        prefilledEmail:
          input.state === "gate-partial" ? GATE_FIXTURE.email : null,
        accountEmail:
          input.state === "gate-signed-in" ? GATE_FIXTURE.email : null,
        state: input.state,
      },
    };
  switch (result.kind) {
    case "gate":
      return {
        kind: "gate",
        status: 200,
        props: {
          path: input.path,
          prefilledEmail:
            input.accountEmail === null ? input.prefilledEmail : null,
          accountEmail: input.accountEmail,
          state: null,
        },
      };
    case "not-found":
      return { kind: "not-found" };
    case "ended":
      return { kind: "ended" };
    case "team":
    case "reviewer":
      return { kind: "experiment" };
  }
}

/** What the form shows first: the fields, the result, and any forced state. */
export type GateFormView = {
  email: string;
  code: string;
  result: GateActionState;
  pending: boolean;
  offline: boolean;
  success: boolean;
  /** A `?state=` fixture: it holds still, so a lock never re-opens. */
  fixture: boolean;
};

export function gateFormView(props: GateProps): GateFormView {
  const view: GateFormView = {
    email: props.prefilledEmail ?? "",
    code: "",
    result: GATE_IDLE,
    pending: false,
    offline: false,
    success: false,
    fixture: props.state !== null,
  };
  const filled = { email: GATE_FIXTURE.email, code: GATE_FIXTURE.code };
  switch (props.state) {
    case "gate-loading":
      return { ...view, ...filled, pending: true };
    case "gate-error":
      return {
        ...view,
        ...filled,
        result: { kind: "error", errors: { code: WRONG_CODE } },
      };
    case "gate-offline":
      return { ...view, ...filled, offline: true };
    case "gate-success":
      return { ...view, ...filled, success: true };
    case "gate-throttled":
      return {
        ...view,
        ...filled,
        result: { kind: "throttled", lockedUntil: GATE_FIXTURE.lockedUntil },
      };
    case "gate-server-error":
      return { ...view, ...filled, result: { kind: "server-error" } };
    default:
      return view;
  }
}

export type EnterGateInput = {
  slug: string;
  /** The form's raw fields; email is ignored on the signed-in face. */
  email: unknown;
  code: unknown;
  /** A signed-in user without a team role (S8): they enter with their user id. */
  account: { userId: string } | null;
};

export type EnterGateDeps = {
  /** LAB-6's `withGateThrottle`, bound to this request's keys and the database. */
  runThrottled<T>(
    attempt: () => Promise<T | null>,
  ): Promise<ThrottledResult<T>>;
  /** LAB-5's `grantAccess`, bound to the database. */
  grantAccess(input: GrantAccessInput): Promise<{ accessId: string } | null>;
  /** Sets `sandbox_access` for the slug. */
  setAccessCookie(accessId: string): Promise<void>;
  /** Sets `sandbox_gate` after a failed or refused try, so the browser counter has a key. */
  markFailedTry(): Promise<void>;
};

export type EnterGateResult =
  | { kind: "redirect"; to: string }
  | { kind: "error"; errors: Partial<Record<GateField, string>> }
  | { kind: "throttled"; lockedUntil: Date }
  | { kind: "server-error" };

const GATE_PATH_PREFIX = "/experimental/";

/** The experiment's own address, without `?r=` or anything else. */
export function gatePath(slug: string): string {
  return `${GATE_PATH_PREFIX}${encodeURIComponent(slug)}`;
}

/** The slug a `gatePath` names, so the Gate needs no prop beyond its path. */
export function slugOfGatePath(path: string): string {
  return decodeURIComponent(path.slice(GATE_PATH_PREFIX.length));
}

/**
 * One press of "Open the review". Empty or malformed fields return their own
 * words and reach neither the throttle nor the database. Everything else is
 * one try: a live code sets the cookie and redirects to the same path; any
 * other code (wrong, revoked, unknown slug, closed without a live code) is
 * the one wrong-code error; a lock is throttled; a store that throws is a
 * server error. Nothing here logs or returns the code or the email.
 */
export async function enterGateWith(
  deps: EnterGateDeps,
  input: EnterGateInput,
): Promise<EnterGateResult> {
  const parsed = input.account
    ? signedInGateForm.safeParse({ code: input.code })
    : guestGateForm.safeParse({ email: input.email, code: input.code });
  if (!parsed.success) {
    const errors: Partial<Record<GateField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "email" || field === "code") && !errors[field])
        errors[field] = issue.message;
    }
    return { kind: "error", errors };
  }

  const { code } = parsed.data;
  const identity: GrantAccessInput["identity"] =
    input.account !== null
      ? { userId: input.account.userId }
      : { email: String((parsed.data as { email?: unknown }).email) };

  try {
    const result = await deps.runThrottled(() =>
      deps.grantAccess({ slug: input.slug, code, identity }),
    );
    if (result.ok) {
      await deps.setAccessCookie(result.value.accessId);
      return { kind: "redirect", to: gatePath(input.slug) };
    }
    await deps.markFailedTry();
    return result.lockedUntil
      ? { kind: "throttled", lockedUntil: result.lockedUntil }
      : { kind: "error", errors: { code: WRONG_CODE } };
  } catch {
    return { kind: "server-error" };
  }
}
