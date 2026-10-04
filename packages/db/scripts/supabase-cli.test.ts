import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { nonLoopbackBindings } from "./supabase-cli.ts";

describe("nonLoopbackBindings", () => {
  test("names every interface and a specific LAN address", () => {
    assert.deepEqual(nonLoopbackBindings("0.0.0.0:54322\n[::]:54322\n"), [
      "0.0.0.0",
      "[::]",
    ]);
    assert.deepEqual(nonLoopbackBindings("192.168.1.5:54322\n"), [
      "192.168.1.5",
    ]);
  });

  test("passes loopback-only bindings", () => {
    assert.deepEqual(nonLoopbackBindings("127.0.0.1:54322\n[::1]:54322\n"), []);
    assert.deepEqual(nonLoopbackBindings(""), []);
  });
});
