/**
 * What may leave the app in an error event (STK-18 NN3): no cookies, body,
 * headers or query string, and a user who is an opaque id and nothing else.
 * Sentry's `beforeSend` runs this on every event, after the SDK's own
 * dataCollection settings, so a category left on by mistake still never
 * leaves. Free text (messages, exception values, breadcrumbs) is scrubbed
 * with @pem/observability's `scrubText`, the logger's one rule.
 *
 * The event type is the structural subset this function touches, so the rule
 * is tested without the SDK; Sentry's `ErrorEvent` is assignable to it.
 */

import { scrubText } from "@pem/observability/redact";

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
  exception?: { values?: { value?: string }[] };
  breadcrumbs?: { message?: string; data?: unknown }[];
  extra?: unknown;
};

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
    else scrubbed.user = { id: String(id) };
  }

  if (event.message !== undefined) scrubbed.message = scrubText(event.message);

  if (event.exception?.values) {
    scrubbed.exception = {
      ...event.exception,
      values: event.exception.values.map((value) =>
        value.value === undefined
          ? value
          : { ...value, value: scrubText(value.value) },
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

  delete scrubbed.extra;
  return scrubbed as E;
}
