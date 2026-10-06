import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { sentryBuildOptions, type ErrorReportingBuild } from "./build.ts";
import { resolveSentryProject } from "./dsn.ts";

const deployedWithToken: ErrorReportingBuild = {
  deployed: true,
  authToken: "sntrys_synthetic",
  org: "example-org",
  project: "example-web-staging",
  release: "0123abc",
};

test("a build without SENTRY_AUTH_TOKEN skips the upload and names no credential", () => {
  const options = sentryBuildOptions({
    ...deployedWithToken,
    authToken: undefined,
  });
  assert.equal(options.sourcemaps?.disable, true);
  assert.equal(options.release?.create, false);
  assert.equal(options.release?.finalize, false);
  assert.equal(options.authToken, undefined);
  assert.equal(options.telemetry, false);
});

test("a local build with a token still skips the upload", () => {
  const options = sentryBuildOptions({ ...deployedWithToken, deployed: false });
  assert.equal(options.sourcemaps?.disable, true);
  assert.equal(options.authToken, undefined);
});

test("a deployment with the token, org and project uploads under the commit release", () => {
  const options = sentryBuildOptions(deployedWithToken);
  assert.equal(options.sourcemaps?.disable, false);
  assert.equal(options.release?.name, "0123abc");
  assert.equal(options.release?.create, true);
  assert.equal(options.project, "example-web-staging");
  assert.equal(options.authToken, "sntrys_synthetic");
});

test("there is no tunnel route, so the app relays no one's events", () => {
  assert.equal(sentryBuildOptions(deployedWithToken).tunnelRoute, false);
});

test("the build script turns off the Sentry CLI's own telemetry", () => {
  // The bundler plugin starts the CLI whenever SENTRY_AUTH_TOKEN is in the
  // environment, upload or not, and the CLI reports to Sentry's own project
  // unless this is set; `telemetry: false` covers only the plugin.
  const manifest = JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
  ) as { scripts: { build: string } };
  assert.match(
    manifest.scripts.build,
    /^SENTRY_CLI_NO_TELEMETRY=1 next build$/,
  );
});

test("a staging build missing SENTRY_PROJECT_STAGING uploads nothing, never into production's project", () => {
  const source = {
    SENTRY_PROJECT: "example-web-production",
    SENTRY_ORG: "example-org",
    SENTRY_AUTH_TOKEN: "sntrys_synthetic",
  };
  const project = resolveSentryProject(source, "staging");
  assert.equal(project, undefined);
  const options = sentryBuildOptions({ ...deployedWithToken, project });
  assert.equal(options.sourcemaps?.disable, true);
  assert.equal(options.release?.create, false);
  assert.equal(options.project, undefined);
  assert.equal(
    resolveSentryProject(
      { ...source, SENTRY_PROJECT_STAGING: "example-web-staging" },
      "staging",
    ),
    "example-web-staging",
  );
  assert.equal(
    resolveSentryProject(source, "production"),
    "example-web-production",
  );
});
