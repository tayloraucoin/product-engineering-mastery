/** Only NEXT_PUBLIC_* names enter next.config.ts's env block (D-STK-4). Every value is synthetic. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { nextPublicEnv } from "./next-public.ts";

test("public names pass, and unset values are left out", () => {
  assert.deepEqual(
    nextPublicEnv({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_UNSET: undefined,
    }),
    { NEXT_PUBLIC_SITE_URL: "http://localhost:3000" },
  );
});

test("a server-only name is refused, by name", () => {
  assert.throws(
    () =>
      nextPublicEnv({
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        EXAMPLE_API_KEY: "secret",
      }),
    /^Error: EXAMPLE_API_KEY cannot go in next.config.ts's env block/,
  );
});
