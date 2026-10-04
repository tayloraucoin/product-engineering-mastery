import assert from "node:assert/strict";
import { describe, test } from "node:test";
import postgres from "postgres";

import {
  applyLocalAuthMirror,
  isLoopbackHost,
  isLoopbackUrl,
} from "./local-auth-mirror.ts";

/** A client whose socket factory counts connection attempts and never connects. */
function countingClient(url: string): {
  sql: postgres.Sql;
  attempts: () => number;
} {
  let attempts = 0;
  // postgres.js honours a socket factory at runtime; its types leave it out.
  const options = {
    max: 1,
    socket: () => {
      attempts += 1;
      throw new Error("a connection was attempted");
    },
  } as postgres.Options<Record<string, never>>;
  const sql = postgres(url, options);
  return { sql, attempts: () => attempts };
}

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "alice@example.test",
};

describe("isLoopbackHost", () => {
  test("accepts localhost, 127.0.0.0/8 and ::1", () => {
    for (const host of [
      "localhost",
      "LOCALHOST",
      "127.0.0.1",
      "127.1.2.3",
      "::1",
      "[::1]",
    ]) {
      assert.equal(isLoopbackHost(host), true, host);
    }
  });

  test("refuses every other host, including look-alikes", () => {
    for (const host of [
      "db.example.supabase.co",
      "aws-0-us-east-1.pooler.supabase.com",
      "10.0.0.5",
      "0.0.0.0",
      "localhost.example.com",
      "127.0.0.1.example.com",
      "",
    ]) {
      assert.equal(isLoopbackHost(host), false, host);
    }
  });

  test("isLoopbackUrl reads the URL's host and refuses an unparseable URL", () => {
    assert.equal(isLoopbackUrl("http://127.0.0.1:54321"), true);
    assert.equal(isLoopbackUrl("https://abcdefgh.supabase.co"), false);
    assert.equal(isLoopbackUrl("not a url"), false);
  });
});

describe("applyLocalAuthMirror", () => {
  test("refuses a non-loopback host before connecting", async () => {
    for (const url of [
      "postgresql://postgres:synthetic@db.abcdefgh.supabase.co:5432/postgres",
      "postgresql://postgres.abcdefgh:synthetic@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    ]) {
      const { sql, attempts } = countingClient(url);
      await assert.rejects(applyLocalAuthMirror(sql, user), /loopback/);
      assert.equal(attempts(), 0, url);
      await sql.end({ timeout: 0 });
    }
  });

  test("passes the host check on loopback and only then connects", async () => {
    const { sql, attempts } = countingClient(
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    );
    await assert.rejects(
      applyLocalAuthMirror(sql, user),
      /connection was attempted/,
    );
    assert.ok(attempts() > 0);
    await sql.end({ timeout: 0 });
  });
});
