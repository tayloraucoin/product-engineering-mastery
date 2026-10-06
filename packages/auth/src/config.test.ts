/** The public-key guard, and the cookie stem agreeing with the installed SDK. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { authCookieStem, publicKeyProblem } from "./config.ts";
import { createServerAuthClient } from "./server.ts";
import { LOCAL_STACK, memoryStore, STAGING } from "./test-helpers.ts";

const NAME = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

function legacyJwt(role: string): string {
  const part = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "HS256", typ: "JWT" })}.${part({ iss: "supabase", ref: "stagingref0000000000", role })}.synthetic-signature`;
}

test("a secret key in the public slot is refused, naming the variable", () => {
  assert.match(
    publicKeyProblem(NAME, "sb_secret_synthetic") ?? "",
    /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY holds a secret key/,
  );
  assert.match(
    publicKeyProblem(NAME, legacyJwt("service_role")) ?? "",
    /holds the service-role JWT/,
  );
});

test("the publishable key and the legacy anon key pass", () => {
  assert.equal(publicKeyProblem(NAME, "sb_publishable_synthetic"), null);
  assert.equal(publicKeyProblem(NAME, legacyJwt("anon")), null);
  assert.equal(publicKeyProblem(NAME, "not.a-jwt.!!"), null);
});

test("the cookie stem the purge uses is the storage key the installed SDK writes", () => {
  for (const config of [STAGING, LOCAL_STACK]) {
    const client = createServerAuthClient(config, memoryStore([]));
    const storageKey = (client.auth as unknown as { storageKey: string })
      .storageKey;
    assert.equal(storageKey, authCookieStem(config.url));
  }
});
