/** The admin client never persists, refreshes or detects a session. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { createAdminAuthClient } from "./admin.ts";

test("the admin client holds no session: nothing persisted, refreshed or read from a URL", () => {
  const client = createAdminAuthClient({
    url: "https://stagingref0000000000.supabase.co",
    serviceRoleKey: "synthetic-service-role-key",
  });
  // GoTrueClient keeps these as protected fields; read them as the client was built.
  const auth = client.auth as unknown as Record<string, unknown>;
  assert.equal(auth.persistSession, false);
  assert.equal(auth.autoRefreshToken, false);
  assert.equal(auth.detectSessionInUrl, false);
});
