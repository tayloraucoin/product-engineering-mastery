import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { LOCAL_USERS, seedLocalUsers } from "./local-users.ts";

/** A fetch stub that records every request and answers with `respond`. */
function recordingFetch(respond: () => Response) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const send = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return respond();
  }) as typeof fetch;
  return { send, calls };
}

const key = "sb_secret_synthetic";

describe("seedLocalUsers", () => {
  test("refuses a non-loopback auth URL before sending anything", async () => {
    for (const authUrl of [
      "https://abcdefgh.supabase.co",
      "http://10.0.0.5:54321",
      "http://localhost.example.com:54321",
      undefined,
    ]) {
      const { send, calls } = recordingFetch(() => new Response("{}"));
      await assert.rejects(
        seedLocalUsers({
          authUrl,
          serviceRoleKey: key,
          authUrlName: "NEXT_PUBLIC_SUPABASE_URL_LOCAL",
          fetch: send,
        }),
        /seeds only a local auth server/,
      );
      assert.equal(calls.length, 0, String(authUrl));
    }
  });

  test("refuses a missing service-role key before sending anything", async () => {
    const { send, calls } = recordingFetch(() => new Response("{}"));
    await assert.rejects(
      seedLocalUsers({
        authUrl: "http://127.0.0.1:54321",
        serviceRoleKey: undefined,
        authUrlName: "NEXT_PUBLIC_SUPABASE_URL_LOCAL",
        fetch: send,
      }),
      /SUPABASE_SERVICE_ROLE_KEY_LOCAL/,
    );
    assert.equal(calls.length, 0);
  });

  test("creates each synthetic user through the local admin API", async () => {
    const { send, calls } = recordingFetch(
      () => new Response("{}", { status: 200 }),
    );
    const outcomes = await seedLocalUsers({
      authUrl: "http://127.0.0.1:54321",
      serviceRoleKey: key,
      authUrlName: "NEXT_PUBLIC_SUPABASE_URL_LOCAL",
      fetch: send,
    });
    assert.deepEqual(
      outcomes,
      LOCAL_USERS.map(({ email }) => ({ email, result: "created" })),
    );
    assert.ok(calls.every((call) => call.init?.redirect === "error"));
    assert.deepEqual(
      calls.map((call) => call.url),
      LOCAL_USERS.map(() => "http://127.0.0.1:54321/auth/v1/admin/users"),
    );
  });

  test("treats an existing email as done", async () => {
    const { send } = recordingFetch(
      () =>
        new Response(JSON.stringify({ error_code: "email_exists" }), {
          status: 422,
        }),
    );
    const outcomes = await seedLocalUsers({
      authUrl: "http://localhost:54321",
      serviceRoleKey: key,
      authUrlName: "NEXT_PUBLIC_SUPABASE_URL_LOCAL",
      fetch: send,
    });
    assert.ok(outcomes.every(({ result }) => result === "exists"));
  });
});
