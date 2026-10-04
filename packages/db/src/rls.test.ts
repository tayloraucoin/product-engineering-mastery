import assert from "node:assert/strict";
import { test } from "node:test";

import { assertRlsContext } from "./rls.ts";

const userId = "00000000-0000-4000-8000-000000000001";

test("the bridge accepts a UUID user and a known role", () => {
  assert.deepEqual(assertRlsContext({ userId, role: "user" }), {
    userId,
    role: "user",
  });
});

test("the bridge refuses a partial or forged identity before any SQL", () => {
  assert.throws(() => assertRlsContext({ userId: "", role: "user" }), /UUID/);
  assert.throws(
    () => assertRlsContext({ userId: "1; drop table notes", role: "user" }),
    /UUID/,
  );
  assert.throws(
    () =>
      assertRlsContext({
        userId,
        role: "service_role" as unknown as "user",
      }),
    /role must be one of/,
  );
});
