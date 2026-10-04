import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * Runs the script with only `env` set, as `yarn db:local:reset` would. Every
 * hosted host below is unroutable (TEST-NET-3), so a run that tried to connect
 * would hang past the timeout instead of refusing.
 */
function runReset(env: Record<string, string>) {
  const started = Date.now();
  const result = spawnSync(
    process.execPath,
    [path.join(packageRoot, "scripts/reset-local-db.ts")],
    { cwd: packageRoot, env, encoding: "utf8", timeout: 10_000 },
  );
  return { ...result, ms: Date.now() - started };
}

describe("db:local:reset", () => {
  for (const tier of ["staging", "production"]) {
    test(`refuses ${tier} before resolving a URL`, () => {
      // No URL is set: resolving one would fail with env.ts's "Set …" error instead.
      const result = runReset({ DATABASE_ENVIRONMENT: tier });
      assert.equal(result.status, 1, result.stderr);
      assert.match(
        result.stderr,
        new RegExp(`refused: DATABASE_ENVIRONMENT is ${tier}`),
      );
      assert.doesNotMatch(result.stderr, /Set DATABASE_/);
    });

    test(`refuses ${tier} before connecting, with its URLs set`, () => {
      const suffix = tier === "staging" ? "_STAGING" : "";
      const result = runReset({
        DATABASE_ENVIRONMENT: tier,
        [`DATABASE_MIGRATION_URL${suffix}`]:
          "postgresql://postgres:synthetic@203.0.113.10:5432/postgres",
        [`DATABASE_URL${suffix}`]:
          "postgresql://postgres:synthetic@203.0.113.10:6543/postgres",
      });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /refused: DATABASE_ENVIRONMENT/);
      assert.doesNotMatch(result.stdout, /203\.0\.113\.10/);
      assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
    });
  }

  test("refuses a local URL that is not this machine, before connecting", () => {
    const result = runReset({
      DATABASE_ENVIRONMENT: "local",
      DATABASE_MIGRATION_URL_LOCAL:
        "postgresql://postgres:synthetic@203.0.113.10:5432/postgres",
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(
      result.stderr,
      /refused: the local migration URL points at 203\.0\.113\.10/,
    );
    assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
  });

  test("refuses a malformed tier", () => {
    const result = runReset({ DATABASE_ENVIRONMENT: "prod" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /DATABASE_ENVIRONMENT is "prod"/);
  });
});
