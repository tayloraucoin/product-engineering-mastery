/**
 * WEB-8 and WEB-9: no db:* script or test resolves an unset or hosted tier
 * to a local database, and the local-only scripts refuse a URL that is not
 * this machine before connecting. Each script is run as a child with only
 * `env` set and no .env.local, as `node scripts/<name>.ts` would be. PATH is
 * empty, so a script that tried to call `docker` would fail with a different
 * message than the one asserted. Every hosted URL below is unroutable
 * (TEST-NET-3), so a run that tried to connect would hang past the timeout
 * instead of refusing.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const DOCKER_ADDRESS = "127.0.0.1:54322";
const DOCKER_URL = `postgresql://postgres:postgres@${DOCKER_ADDRESS}/postgres`;
const UNROUTABLE_URL =
  "postgresql://postgres:synthetic@203.0.113.10:5432/postgres";

function runScript(script: string, env: Record<string, string>) {
  const started = Date.now();
  const result = spawnSync(
    process.execPath,
    [path.join(packageRoot, "scripts", script)],
    {
      cwd: packageRoot,
      env: { PATH: "", ...env },
      encoding: "utf8",
      timeout: 10_000,
    },
  );
  const stderr = result.stderr ?? "";
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr,
    firstLine: stderr.trim().split("\n")[0] ?? "",
    lines: stderr.trim() === "" ? 0 : stderr.trim().split("\n").length,
    ms: Date.now() - started,
  };
}

const EVERY_SCRIPT = [
  "migrate.ts",
  "setup.ts",
  "setup-local.ts",
  "local.ts",
  "local-full.ts",
  "reset-local-db.ts",
  "test-db.ts",
  "seed-users.ts",
];

/** The scripts that start or need Docker's database. */
const DOCKER_SCRIPTS = ["local.ts", "local-full.ts"];

/** The scripts that need a local database of either kind. */
const LOCAL_SCRIPTS = ["reset-local-db.ts", "test-db.ts", "setup-local.ts"];

describe("C1: an unset tier never resolves to a local database", () => {
  for (const script of EVERY_SCRIPT) {
    test(`${script} refuses in one line naming DATABASE_ENVIRONMENT and the example default`, () => {
      const result = runScript(script, {});
      assert.equal(result.status, 1, result.stderr);
      assert.equal(result.lines, 1, result.stderr);
      assert.match(result.firstLine, /DATABASE_ENVIRONMENT is unset/);
      assert.match(result.firstLine, /packages\/db\/\.env\.example/);
      assert.doesNotMatch(result.stdout + result.stderr, /54322|5432\//);
      assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
    });
  }

  test("an empty tier is unset too", () => {
    const result = runScript("migrate.ts", { DATABASE_ENVIRONMENT: "  " });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.firstLine, /DATABASE_ENVIRONMENT is unset/);
    assert.doesNotMatch(result.stdout + result.stderr, /54322/);
  });
});

describe("C2: a hosted tier never reaches Docker or a local address", () => {
  for (const script of DOCKER_SCRIPTS) {
    test(`${script} on staging says in its first line that it needs the Docker database, and exits before calling it`, () => {
      const result = runScript(script, { DATABASE_ENVIRONMENT: "staging" });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.firstLine, /Docker/);
      assert.match(result.firstLine, /DATABASE_ENVIRONMENT is staging/);
      assert.match(result.firstLine, /docker-local-database\.md/);
      assert.doesNotMatch(result.stderr, /Docker is not running/);
      assert.doesNotMatch(result.stdout + result.stderr, /54322/);
      assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
    });
  }

  for (const script of LOCAL_SCRIPTS) {
    test(`${script} on staging says in its first line that it needs a local database, and exits before connecting`, () => {
      const result = runScript(script, { DATABASE_ENVIRONMENT: "staging" });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.firstLine, /DATABASE_ENVIRONMENT is staging/);
      assert.match(result.firstLine, /local/i);
      assert.doesNotMatch(result.stdout, /TAP version|# tests/);
      assert.doesNotMatch(result.stdout + result.stderr, /54322|5432\//);
      assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
    });
  }

  test("test-db.ts on staging names both ways to get a local database", () => {
    const result = runScript("test-db.ts", { DATABASE_ENVIRONMENT: "staging" });
    assert.match(result.firstLine, /db:setup:local/);
    assert.match(result.firstLine, /docker-local-database\.md/);
  });

  test("seed-users.ts on staging refuses a hosted auth URL, never calling it", () => {
    const result = runScript("seed-users.ts", {
      DATABASE_ENVIRONMENT: "staging",
      NEXT_PUBLIC_SUPABASE_URL_STAGING: "https://203.0.113.10",
      SUPABASE_SERVICE_ROLE_KEY_STAGING: "synthetic",
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /NEXT_PUBLIC_SUPABASE_URL_STAGING/);
    assert.doesNotMatch(result.stdout + result.stderr, /54322/);
    assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
  });

  for (const script of ["migrate.ts", "setup.ts"]) {
    test(`${script} on staging with only _LOCAL URLs set refuses naming the _STAGING variable`, () => {
      const result = runScript(script, {
        DATABASE_ENVIRONMENT: "staging",
        DATABASE_URL_LOCAL: DOCKER_URL,
        DATABASE_MIGRATION_URL_LOCAL: DOCKER_URL,
      });
      assert.equal(result.status, 1, result.stderr);
      assert.equal(result.lines, 1, result.stderr);
      assert.match(result.firstLine, /Set DATABASE_MIGRATION_URL_STAGING/);
      assert.doesNotMatch(result.stdout + result.stderr, /54322/);
      assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
    });

    test(`${script} on staging reads its own URL, never the _LOCAL one`, () => {
      const result = runScript(script, {
        DATABASE_ENVIRONMENT: "staging",
        DATABASE_MIGRATION_URL_LOCAL: DOCKER_URL,
        // Port 6543 is the wrong pooler for a migration, so the run stops
        // at the pooler check, before connecting, and names the URL it read.
        DATABASE_MIGRATION_URL_STAGING:
          "postgresql://postgres:synthetic@203.0.113.10:6543/postgres",
      });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /203\.0\.113\.10:6543/);
      assert.match(result.stderr, /session pooler/);
      assert.doesNotMatch(result.stdout + result.stderr, /54322/);
      assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
    });
  }
});

describe("WEB-9 C1: db:setup:local refuses before it connects", () => {
  test("a local URL that is not this machine is refused, naming the variable", () => {
    const result = runScript("setup-local.ts", {
      DATABASE_ENVIRONMENT: "local",
      DATABASE_MIGRATION_URL_LOCAL: UNROUTABLE_URL,
    });
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.lines, 1, result.stderr);
    assert.match(
      result.firstLine,
      /refused: the local migration URL points at 203\.0\.113\.10/,
    );
    assert.match(result.firstLine, /DATABASE_MIGRATION_URL_LOCAL/);
    assert.ok(result.ms < 5_000, `took ${result.ms} ms`);
  });

  test("a hosted tier is refused before any URL is resolved", () => {
    const result = runScript("setup-local.ts", {
      DATABASE_ENVIRONMENT: "production",
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(
      result.firstLine,
      /refused: DATABASE_ENVIRONMENT is production/,
    );
    assert.match(result.firstLine, /yarn db:migrate/);
    assert.doesNotMatch(result.stderr, /Set DATABASE_/);
  });
});
