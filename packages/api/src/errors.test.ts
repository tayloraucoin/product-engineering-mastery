/**
 * C2: domain errors map to NOT_FOUND, FORBIDDEN, CONFLICT and BAD_REQUEST,
 * through the one mapper, in-process and over HTTP.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Conflict, Forbidden, Invalid, NotFound } from "@pem/services/errors";

import { createApiContext } from "./context.ts";
import { toTRPCError } from "./errors.ts";
import { handleApiRequest } from "./server.ts";
import {
  ACCESS_TOKEN,
  headers,
  NOTE_ID,
  scriptedDb,
  sources,
} from "./test-helpers.ts";
import { createCallerFactory, protectedProcedure, router } from "./trpc.ts";

const domainErrors = [
  [new NotFound("There is no note with that id."), "NOT_FOUND", 404],
  [new Forbidden("You cannot change this note."), "FORBIDDEN", 403],
  [new Conflict("This note already exists."), "CONFLICT", 409],
  [
    new Invalid("Check body: Write the note.", { body: ["Write the note."] }),
    "BAD_REQUEST",
    400,
  ],
] as const;

test("C2: the mapper turns each domain error into its tRPC code and keeps the message", () => {
  for (const [error, code] of domainErrors) {
    const mapped = toTRPCError(error);
    assert.ok(mapped instanceof TRPCError);
    assert.equal(mapped.code, code);
    assert.equal(mapped.message, error.message);
    assert.equal(mapped.cause, error);
  }
  assert.equal(toTRPCError(new Error("a fault")), null);
});

const throwing = router({
  fail: protectedProcedure.input(z.number()).query(({ input }) => {
    throw domainErrors[input]![0];
  }),
});

test("C2: a service's domain error leaves a procedure as its tRPC code", async () => {
  const createCaller = createCallerFactory(throwing);
  for (const [index, [, code]] of domainErrors.entries()) {
    const context = await createApiContext(
      headers({ authorization: `Bearer ${ACCESS_TOKEN}` }),
      sources({ cookie: null }),
    );
    await assert.rejects(
      createCaller(context).fail(index),
      (error: unknown) => {
        assert.ok(error instanceof TRPCError);
        assert.equal(error.code, code);
        return true;
      },
    );
  }
});

/** One request to the mounted API, as a script with a token would send it. */
async function request(
  path: string,
  options: { input: unknown; mutation?: boolean },
  db: Parameters<typeof sources>[0]["db"],
) {
  const url = new URL(`http://localhost/api/trpc/${path}`);
  const body = JSON.stringify({ json: options.input });
  const init: RequestInit = {
    headers: {
      authorization: `Bearer ${ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
  };
  if (options.mutation) {
    init.method = "POST";
    init.body = body;
  } else {
    url.searchParams.set("input", body);
  }
  const response = await handleApiRequest(
    new Request(url, init),
    sources({ cookie: null, db }),
  );
  const payload = (await response.json()) as {
    error: { json: { message: string; data: Record<string, unknown> } };
  };
  return { status: response.status, error: payload.error.json };
}

test("C2: over HTTP, a note row-level security withholds is NOT_FOUND (404)", async () => {
  const { status, error } = await request(
    "notes.get",
    { input: { id: NOTE_ID } },
    scriptedDb(() => []),
  );
  assert.equal(status, 404);
  assert.equal(error.data.code, "NOT_FOUND");
  assert.equal(error.message, "There is no note with that id.");
});

test("C2: over HTTP, a policy's refusal is FORBIDDEN (403) and a unique violation CONFLICT (409)", async () => {
  const refusal = (code: string) => () =>
    Object.assign(new Error("database said no"), { code });
  const forbidden = await request(
    "notes.create",
    { input: { body: "hello" }, mutation: true },
    scriptedDb(refusal("42501")),
  );
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.error.data.code, "FORBIDDEN");

  const conflict = await request(
    "notes.create",
    { input: { body: "hello" }, mutation: true },
    scriptedDb(refusal("23505")),
  );
  assert.equal(conflict.status, 409);
  assert.equal(conflict.error.data.code, "CONFLICT");
});

test("C2: over HTTP, input that fails its validator is BAD_REQUEST (400) with the failed fields", async () => {
  const { status, error } = await request(
    "notes.create",
    { input: { body: "   " }, mutation: true },
    scriptedDb(() => assert.fail("an invalid note reached the database")),
  );
  assert.equal(status, 400);
  assert.equal(error.data.code, "BAD_REQUEST");
  assert.deepEqual(error.data.fields, { body: ["Write the note."] });
});

test("C2: a fault is INTERNAL_SERVER_ERROR (500) and its message stays on the server", async () => {
  const { status, error } = await request(
    "notes.get",
    { input: { id: NOTE_ID } },
    scriptedDb(() => new Error('relation "notes" does not exist')),
  );
  assert.equal(status, 500);
  assert.doesNotMatch(error.message, /relation/);
});
