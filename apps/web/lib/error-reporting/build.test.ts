import assert from "node:assert/strict";
import { test } from "node:test";

import { sentryBuildOptions, type ErrorReportingBuild } from "./build.ts";

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
