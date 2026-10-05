/**
 * withSentryConfig's options (STK-18). Source maps and the release upload
 * only from a deployment that holds the token, the org and the tier's
 * project; every other build skips both and succeeds (NN5). Nothing about the
 * build is sent to Sentry's own telemetry.
 */

import type { SentryBuildOptions } from "@sentry/nextjs/config";

/**
 * Browser events go through this route on the app's own origin, so an ad
 * blocker does not drop them. A fixed path, so proxy.ts's matcher can leave
 * it out (the devs_call: tunnel on).
 */
export const TUNNEL_ROUTE = "/monitoring";

export type ErrorReportingBuild = {
  deployed: boolean;
  authToken: string | undefined;
  org: string | undefined;
  project: string | undefined;
  release: string | undefined;
};

/** Whether this build uploads source maps and creates the release. */
export function shouldUpload(build: ErrorReportingBuild): boolean {
  return Boolean(
    build.deployed && build.authToken && build.org && build.project,
  );
}

export function sentryBuildOptions(
  build: ErrorReportingBuild,
): SentryBuildOptions {
  const upload = shouldUpload(build);
  return {
    ...(upload
      ? { org: build.org, project: build.project, authToken: build.authToken }
      : {}),
    telemetry: false,
    silent: !upload,
    tunnelRoute: TUNNEL_ROUTE,
    sourcemaps: { disable: !upload, deleteSourcemapsAfterUpload: true },
    release: {
      ...(build.release ? { name: build.release } : {}),
      create: upload,
      finalize: upload,
    },
    // Errors only (NN6): no tracing code ships, so no router-transition hook is wanted.
    suppressOnRouterTransitionStartWarning: true,
    webpack: { treeshake: { removeTracing: true, removeDebugLogging: true } },
  };
}
