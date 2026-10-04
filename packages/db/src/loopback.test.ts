import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { isLoopbackHost, isLoopbackUrl } from "./loopback.ts";

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
