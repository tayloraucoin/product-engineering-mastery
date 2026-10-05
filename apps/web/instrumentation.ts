/**
 * Next calls `register` once per server runtime, before the first request,
 * and `onRequestError` for every error a request throws (STK-18). Each
 * runtime loads its own Sentry config; `onRequestError` is a no-op until the
 * SDK has started, so a tier without a DSN reports nothing.
 */

import * as Sentry from "@sentry/nextjs";

import { nextRuntime } from "./env";

export async function register() {
  if (nextRuntime === "nodejs") await import("./sentry.server.config");
  if (nextRuntime === "edge") await import("./sentry.edge.config");
}

export const onRequestError = Sentry.captureRequestError;
