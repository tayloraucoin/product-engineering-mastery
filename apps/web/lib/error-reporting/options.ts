/**
 * The one set of Sentry options every runtime starts with (STK-18). Errors
 * only: no tracing, replay, logs, feedback or profiling (NN6), so no sample
 * rate is set, no such integration is added, and the browser's default
 * tracing integration is dropped. Every dataCollection category is set here,
 * none left to the SDK's default (NN3): `Required<…>` below fails the type
 * check when an SDK upgrade adds a category. `beforeSend` then scrubs whatever
 * still arrives.
 */

import type { BrowserOptions, ErrorEvent } from "@sentry/nextjs";

import { scrubEvent } from "./scrub.ts";

/** What a runtime knows when it starts the SDK. */
export type ReportingTarget = {
  dsn: string;
  /** The tier, as Sentry's environment; unset, the SDK picks one. */
  environment?: string;
};

type Integration = { name: string };

/** Integrations the SDK adds on its own that this app does not want. */
const UNWANTED_INTEGRATIONS = new Set(["BrowserTracing"]);

export const DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: false, response: false },
  httpBodies: [],
  urlQueryParams: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
  frameContextLines: 5,
} as const satisfies Required<NonNullable<BrowserOptions["dataCollection"]>>;

export function sentryOptions({ dsn, environment }: ReportingTarget) {
  return {
    dsn,
    ...(environment ? { environment } : {}),
    sendDefaultPii: false,
    dataCollection: DATA_COLLECTION,
    enableLogs: false,
    integrations: <I extends Integration>(defaults: I[]) =>
      defaults.filter(
        (integration) => !UNWANTED_INTEGRATIONS.has(integration.name),
      ),
    beforeSend: (event: ErrorEvent) => scrubEvent(event),
  };
}
