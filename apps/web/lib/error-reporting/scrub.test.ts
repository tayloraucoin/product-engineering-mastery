import assert from "node:assert/strict";
import { test } from "node:test";

import { scrubEvent, type ScrubbableEvent } from "./scrub.ts";

/** A synthetic event carrying every category that must not leave the app. */
const synthetic = (): ScrubbableEvent => ({
  message: "lookup failed for ada@example.test",
  request: {
    url: "https://app.example.test/billing?session=abc123&plan=pro#top",
    method: "POST",
    cookies: { "sb-access-token": "eyJhbGciOiJIUzI1NiJ9.e30.sig" },
    data: { card: "4242424242424242" },
    headers: { authorization: "Bearer synthetic-token-123456" },
    query_string: "session=abc123&plan=pro",
    env: { REMOTE_ADDR: "203.0.113.7" },
  },
  user: {
    id: "user_123",
    email: "ada@example.test",
    ip_address: "203.0.113.7",
    username: "ada",
  },
  exception: {
    values: [
      {
        value: "token=synthetic-secret-value rejected",
        stacktrace: {
          frames: [
            { function: "charge", vars: { cardNumber: "4111111111111111" } },
          ],
        },
      },
    ],
  },
  breadcrumbs: [
    { message: "fetch to ada@example.test", data: { url: "/x?token=1" } },
  ],
  extra: { body: '{"password":"hunter2"}' },
});

test("beforeSend drops cookies, body, headers and query, keeping url path and method", () => {
  const { request } = scrubEvent(synthetic());
  assert.deepEqual(request, {
    url: "https://app.example.test/billing",
    method: "POST",
  });
});

test("the user is reduced to an opaque id", () => {
  assert.deepEqual(scrubEvent(synthetic()).user, { id: "user_123" });
});

test("an address passed as the id does not survive", () => {
  const event = { ...synthetic(), user: { id: "ada@example.test" } };
  assert.notEqual(scrubEvent(event).user?.id, "ada@example.test");
});

test("contexts keep their facts but lose secrets and addresses", () => {
  const event = {
    ...synthetic(),
    contexts: {
      os: { name: "macOS" },
      checkout: {
        sessionToken: "synthetic-session",
        owner: "ada@example.test",
      },
    },
  };
  const { contexts } = scrubEvent(event) as {
    contexts: Record<string, Record<string, string>>;
  };
  assert.equal(contexts.os?.name, "macOS");
  assert.equal(contexts.checkout?.sessionToken, "[redacted]");
  assert.notEqual(contexts.checkout?.owner, "ada@example.test");
});

test("a user without an id is dropped whole", () => {
  const event = { ...synthetic(), user: { email: "ada@example.test" } };
  assert.equal(scrubEvent(event).user, undefined);
});

test("free text is scrubbed and extra and breadcrumb data are dropped", () => {
  const event = scrubEvent(synthetic());
  const serialised = JSON.stringify(event);
  for (const leak of [
    "ada@example.test",
    "synthetic-secret-value",
    "hunter2",
    "abc123",
    "203.0.113.7",
    "4242424242424242",
    "4111111111111111",
  ])
    assert.ok(!serialised.includes(leak), `leaked ${leak}`);
  assert.equal(event.extra, undefined);
  assert.equal(event.breadcrumbs?.[0]?.data, undefined);
});

test("the input event is not mutated", () => {
  const event = synthetic();
  scrubEvent(event);
  assert.equal(event.user?.email, "ada@example.test");
});

test("stack frames keep their place but lose their local variables", () => {
  const frames =
    scrubEvent(synthetic()).exception?.values?.[0]?.stacktrace?.frames;
  assert.deepEqual(frames, [{ function: "charge" }]);
});

test("tags and the transaction name are scrubbed like every other free-text field", () => {
  const event: ScrubbableEvent = {
    tags: { namespace: "billing", invitee: "ada@example.test", attempt: 2 },
    transaction: "/invite/ada@example.test",
  };
  const scrubbed = scrubEvent(event);
  assert.equal(scrubbed.tags?.namespace, "billing");
  assert.equal(scrubbed.tags?.attempt, 2);
  assert.doesNotMatch(String(scrubbed.tags?.invitee), /ada@example\.test/);
  assert.doesNotMatch(scrubbed.transaction ?? "", /ada@example\.test/);
});

test("a parameterized message's text and arguments are scrubbed", () => {
  const scrubbed = scrubEvent({
    logentry: {
      message: "invite for ada@example.test failed",
      params: ["ada@example.test", 3],
    },
  });
  assert.doesNotMatch(JSON.stringify(scrubbed.logentry), /ada@example\.test/);
});

test("a thread's stack frames lose their local variables too", () => {
  const scrubbed = scrubEvent({
    threads: {
      values: [
        {
          stacktrace: {
            frames: [{ function: "charge", vars: { card: "4242 4242" } }],
          },
        },
      ],
    },
  });
  const frame = scrubbed.threads?.values?.[0]?.stacktrace?.frames?.[0];
  assert.equal(frame?.function, "charge");
  assert.equal(frame && "vars" in frame, false);
});
