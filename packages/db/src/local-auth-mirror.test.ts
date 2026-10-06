import assert from "node:assert/strict";
import { describe, test } from "node:test";
import postgres from "postgres";

import { applyLocalAuthMirror } from "./local-auth-mirror.ts";

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
