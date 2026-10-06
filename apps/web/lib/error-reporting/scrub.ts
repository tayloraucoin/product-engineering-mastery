/**
 * What may leave the app in an error event (STK-18 NN3): no cookies, body,
 * headers or query string, and a user who is an opaque id and nothing else.
 * Sentry's `beforeSend` runs this on every event, after the SDK's own
 * dataCollection settings, so a category left on by mistake still never
 * leaves: a stack frame's local variables are dropped too, in exceptions and
 * threads. Free text (messages, exception values, breadcrumbs, tags, the
 * transaction) is scrubbed with @pem/observability's `scrubText`, the
 * logger's one rule.
 *
 * The request's path and the transaction name are kept: they say where the
 * error happened. `scrubText` catches addresses, JWTs, bearer credentials and
 * `?code=`, not a bare opaque token in a path segment. A product that adds a
 * route such as `/invite/<token>` or `/reset/<token>` scrubs that segment
 * here before it ships.
 *
 * The event type is the structural subset this function touches, so the rule
 * is tested without the SDK; Sentry's `ErrorEvent` is assignable to it.
 */

import { redactValue, scrubText } from "@pem/observability/redact";

export type ScrubbableEvent = {
  message?: string;
  request?: {
    url?: string;
    method?: string;
    cookies?: unknown;
    data?: unknown;
    headers?: unknown;
    query_string?: unknown;
    env?: unknown;
  };
  user?: { id?: string | number; [field: string]: unknown };
  exception?: {
    values?: {
      value?: string;
      stacktrace?: { frames?: { function?: string; vars?: unknown }[] };
    }[];
  };
  threads?: {
    values?: {
      stacktrace?: { frames?: { function?: string; vars?: unknown }[] };
    }[];
  };
  breadcrumbs?: { message?: string; data?: unknown }[];
  extra?: unknown;
  contexts?: unknown;
  tags?: Record<string, unknown>;
  transaction?: string;
  logentry?: { message?: string; params?: unknown[] };
  server_name?: string;
};

type Frames = { frames?: { vars?: unknown }[] };

/** The stack trace with every frame's local variables dropped: locals at a throw site hold payloads, tokens and form input. */
function withoutLocals<S extends Frames>(stacktrace: S): S {
  if (!stacktrace.frames) return stacktrace;
  return {
    ...stacktrace,
    frames: stacktrace.frames.map((frame) => {
      const bare = { ...frame };
      delete bare.vars;
      return bare;
    }),
  };
}

/** `url` without its query string or fragment, its text scrubbed. */
function stripQuery(url: string): string {
  const cut = url.search(/[?#]/);
  return scrubText(cut === -1 ? url : url.slice(0, cut));
}

/** The event with request data dropped, the user reduced to an id, and every free-text field scrubbed. */
export function scrubEvent<E extends ScrubbableEvent>(event: E): E {
  const scrubbed: ScrubbableEvent = { ...event };

  if (event.request) {
    const { url, method } = event.request;
    scrubbed.request = {
      ...(url === undefined ? {} : { url: stripQuery(url) }),
      ...(method === undefined ? {} : { method }),
    };
  }

  if (event.user) {
    const { id } = event.user;
    if (id === undefined) delete scrubbed.user;
    // Scrubbed too: an id is opaque by convention only, so an address passed as one is caught.
    else scrubbed.user = { id: scrubText(String(id)) };
  }

  if (event.message !== undefined) scrubbed.message = scrubText(event.message);

  if (event.exception?.values) {
    scrubbed.exception = {
      ...event.exception,
      values: event.exception.values.map((value) => {
        const kept = { ...value };
        if (kept.value !== undefined) kept.value = scrubText(kept.value);
        if (kept.stacktrace) kept.stacktrace = withoutLocals(kept.stacktrace);
        return kept;
      }),
    };
  }

  if (event.threads?.values) {
    scrubbed.threads = {
      ...event.threads,
      values: event.threads.values.map((thread) =>
        thread.stacktrace
          ? { ...thread, stacktrace: withoutLocals(thread.stacktrace) }
          : thread,
      ),
    };
  }

  // A breadcrumb's data holds URLs and arguments; only its scrubbed message stays.
  if (event.breadcrumbs) {
    scrubbed.breadcrumbs = event.breadcrumbs.map((crumb) => {
      const kept = { ...crumb };
      delete kept.data;
      if (kept.message !== undefined) kept.message = scrubText(kept.message);
      return kept;
    });
  }

  // Contexts (the SDK's os, runtime and browser, and any a caller sets) pass
  // the logger's rule: secret-named keys redacted, every string scrubbed.
  if (event.contexts !== undefined)
    scrubbed.contexts = redactValue(event.contexts);

  // Tags and the transaction name pass the same rule, so a tag built from
  // input or a route name holding a value cannot carry it past the scrub.
  if (event.tags)
    scrubbed.tags = Object.fromEntries(
      Object.entries(event.tags).map(([key, value]) => [
        key,
        typeof value === "string" ? scrubText(value) : value,
      ]),
    );
  if (event.transaction !== undefined)
    scrubbed.transaction = scrubText(event.transaction);
  // A parameterized message (`captureMessage`) keeps its text and arguments here.
  if (event.logentry)
    scrubbed.logentry = {
      ...(event.logentry.message === undefined
        ? {}
        : { message: scrubText(event.logentry.message) }),
      ...(event.logentry.params === undefined
        ? {}
        : { params: event.logentry.params.map((param) => redactValue(param)) }),
    };

  // The node SDK sets it to os.hostname(): off Vercel, often a person's name.
  delete scrubbed.server_name;
  delete scrubbed.extra;
  return scrubbed as E;
}
