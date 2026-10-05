import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

import { getLocalDevOrigins } from "../../tooling/local-dev-origins";
import { errorReportingBuild, nextConfigEnv } from "./env";
import { sentryBuildOptions } from "./lib/error-reporting/build";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appRoot, "../..");

const nextConfig: NextConfig = {
  /**
   * Next 16 rewrites an app's `AGENTS.md` and `CLAUDE.md` on every `next dev`.
   * One fact, one home: the instruction spine is the root `AGENTS.md`, which
   * carries Next's version warning by hand.
   */
  agentRules: false,

  /**
   * Next 16 blocks cross-origin `/_next/*` and HMR in dev unless the origin is
   * listed: without the LAN addresses, a phone on `yarn web:dev:local` gets
   * the page but React never hydrates.
   */
  allowedDevOrigins: getLocalDevOrigins(),

  // Workspace packages ship TypeScript source; the app compiles them.
  transpilePackages: [
    "@pem/api",
    "@pem/ai",
    "@pem/auth",
    "@pem/brand",
    "@pem/db",
    "@pem/email",
    "@pem/env",
    "@pem/observability",
    "@pem/services",
    "@pem/ui",
    "@pem/validators",
  ],

  /**
   * Inlined into every bundle, the browser's included: only the collapsed
   * NEXT_PUBLIC_* values from env.ts, which refuses any other name (D-STK-4).
   * Importing env.ts here also validates the environment once, at build.
   */
  env: nextConfigEnv,

  turbopack: {
    root: repoRoot,
  },
  outputFileTracingRoot: repoRoot,
};

/** Sentry wraps the config (STK-18): the tunnel route, and the source-map upload a tokenless build skips. */
export default withSentryConfig(
  nextConfig,
  sentryBuildOptions(errorReportingBuild),
);
