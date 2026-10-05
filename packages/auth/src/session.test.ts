/**
 * C2: updateSession purges cookies for a different project ref.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { foreignSessionCookies, sessionCookieRef } from "./cookies.ts";
import { clearSessionCookies, updateSession } from "./session.ts";
import {
  LOCAL_STACK,
  memoryStore,
  recordingFetch,
  STAGING,
} from "./test-helpers.ts";

const STAGING_COOKIES = [
  { name: "sb-stagingref0000000000-auth-token.0", value: "base64-chunk0" },
  { name: "sb-stagingref0000000000-auth-token.1", value: "chunk1" },
  { name: "sb-stagingref0000000000-auth-token-code-verifier", value: "v" },
];
const UNRELATED = [
  { name: "theme", value: "dark" },
  { name: "sb-session-notes", value: "kept" },
];

test("C2: on the local stack, updateSession deletes every staging session cookie and nothing else", async () => {
  const store = memoryStore([...STAGING_COOKIES, ...UNRELATED]);
  const fetch = recordingFetch(500, {});
  const result = await updateSession(LOCAL_STACK, store, { fetch });

  assert.deepEqual(
    result.purged.sort(),
    STAGING_COOKIES.map((cookie) => cookie.name).sort(),
  );
  const last = store.batches.at(-1)!;
  for (const cookie of STAGING_COOKIES) {
    const write = last.find((entry) => entry.name === cookie.name);
    assert.ok(write, `${cookie.name} was not deleted`);
    assert.equal(write.value, "");
    assert.equal(write.options.maxAge, 0);
    assert.equal(write.options.path, "/");
  }
  assert.ok(
    !last.some((entry) => UNRELATED.some((u) => u.name === entry.name)),
  );
  assert.equal(result.userId, null);
  assert.deepEqual(fetch.urls, [], "no session of its own, so no Auth call");
});

test("C2: the project's own cookies are never purged", async () => {
  const own = [
    { name: "sb-127-auth-token", value: "base64-x" },
    { name: "sb-127-auth-token-code-verifier", value: "v" },
  ];
  const store = memoryStore([...own, ...STAGING_COOKIES]);
  const result = await updateSession(LOCAL_STACK, store, {
    fetch: recordingFetch(401, {}),
  });
  for (const cookie of own) assert.ok(!result.purged.includes(cookie.name));
  assert.equal(result.purged.length, STAGING_COOKIES.length);
});

test("C2: switching back to staging purges the local stack's cookies", async () => {
  const local = [
    { name: "sb-127-auth-token.0", value: "a" },
    { name: "sb-127-auth-token.1", value: "b" },
  ];
  const store = memoryStore([...local, ...UNRELATED]);
  const result = await updateSession(STAGING, store, {
    fetch: recordingFetch(401, {}),
  });
  assert.deepEqual(result.purged.sort(), local.map((c) => c.name).sort());
});

test("C2: with no foreign cookie, nothing is written", async () => {
  const store = memoryStore(UNRELATED);
  const result = await updateSession(STAGING, store, {
    fetch: recordingFetch(401, {}),
  });
  assert.deepEqual(result.purged, []);
  assert.deepEqual(store.batches, []);
});

test("C2: the purge reads every cookie form Supabase writes", () => {
  assert.equal(sessionCookieRef("sb-abc-auth-token"), "abc");
  assert.equal(sessionCookieRef("sb-abc-auth-token.3"), "abc");
  assert.equal(sessionCookieRef("sb-abc-auth-token-code-verifier"), "abc");
  assert.equal(
    sessionCookieRef("sb-abc-auth-token-flows-code-verifier"),
    "abc",
  );
  assert.equal(
    sessionCookieRef("sb-abc-auth-token-flow-abcdefgh12-code-verifier"),
    "abc",
  );
  assert.equal(sessionCookieRef("sb-my-host-auth-token.0"), "my-host");
  assert.equal(sessionCookieRef("sb-abc-auth-tokens"), undefined);
  assert.equal(sessionCookieRef("theme"), undefined);
  assert.deepEqual(
    foreignSessionCookies(
      [{ name: "sb-localhost-auth-token", value: "x" }],
      "http://localhost:54321",
    ),
    [],
  );
});

test("C2: switching to a tier with no project clears every Supabase session cookie", () => {
  const store = memoryStore([
    ...STAGING_COOKIES,
    { name: "sb-127-auth-token", value: "x" },
    ...UNRELATED,
  ]);
  const cleared = clearSessionCookies(store);
  assert.equal(cleared.length, STAGING_COOKIES.length + 1);
  assert.ok(!cleared.some((name) => UNRELATED.some((u) => u.name === name)));
  assert.ok(store.batches[0]!.every((write) => write.options.maxAge === 0));
});
