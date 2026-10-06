/**
 * The one set of Sentry options every runtime starts with (STK-18). Errors
 * only: no tracing, replay, logs, feedback or profiling (NN6), so no sample
 * rate is set, no such integration is added, and the browser's default
 * tracing integration is dropped. Every dataCollection category is set here,
 * none left to the SDK's default (NN3): `EveryCategory` below fails the type
 * check when an SDK upgrade adds a category or a nested key. `beforeSend` then scrubs whatever
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

type DataCollection = NonNullable<BrowserOptions["dataCollection"]>;
type CollectBehavior = Extract<DataCollection["cookies"], unknown>;

/**
 * Every category and every nested key set: an SDK upgrade that adds either
 * fails the type check here instead of defaulting permissive. The shape of
 * the SDK's own ResolvedDataCollection.
 */
type EveryCategory = Required<
  Omit<DataCollection, "httpHeaders" | "graphQL" | "genAI">
> & {
  httpHeaders: Required<
    Exclude<NonNullable<DataCollection["httpHeaders"]>, CollectBehavior>
  >;
  graphQL: Required<NonNullable<DataCollection["graphQL"]>>;
  genAI: Required<NonNullable<DataCollection["genAI"]>>;
};

/**
 * Integrations this app never runs (NN6). Only BrowserTracing is a default
 * today; the rest are opt-in, named here so an SDK upgrade that turns one on
 * by default is still dropped.
 */
export const UNWANTED_INTEGRATIONS: ReadonlySet<string> = new Set([
  "BrowserTracing",
  "Replay",
  "ReplayCanvas",
  "Feedback",
  "BrowserProfiling",
]);

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
} as const satisfies EveryCategory;

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
