/**
 * C1: against a fake ctx, the example service throws NotFound when the scoped
 * db withholds a row and Forbidden when a policy rejects a write. C2: invalid
 * input stops at the validator, naming the field, before any query.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { DomainError, Forbidden, Invalid, NotFound } from "../errors.ts";
import {
  fakeContext,
  NOTE_ID,
  policyRefusal,
  USER_ID,
} from "../test-context.ts";
import { createNote, getNote, listNotes } from "./notes.ts";

const CREATED = new Date("2026-10-04T09:00:00Z");
const row = (body: string) => [NOTE_ID, body, CREATED, CREATED];

test("C1: getNote throws NotFound when the scoped db withholds the row", async () => {
  // Row-level security returns no row for another user's note, exactly as for a missing one.
  const ctx = fakeContext(() => []);
  await assert.rejects(getNote(ctx, { id: NOTE_ID }), NotFound);
  assert.equal(ctx.calls.length, 1);
  assert.match(
    ctx.calls[0]!.sql,
    /^select .* from "notes" where "notes"\."id" = \$1/,
  );
  assert.deepEqual(ctx.calls[0]!.params.slice(0, 1), [NOTE_ID]);
});

test("C1: createNote throws Forbidden when a policy rejects the insert", async () => {
  const ctx = fakeContext(() => policyRefusal());
  const error = await assert.rejects(
    createNote(ctx, { body: "Call Ana about the lease" }),
    Forbidden,
  );
  assert.equal(ctx.calls.length, 1);
  assert.match(ctx.calls[0]!.sql, /^insert into "notes"/);
  return error;
});

test("C1: a policy refusal wrapped by drizzle is still Forbidden", async () => {
  const ctx = fakeContext(() =>
    Object.assign(new Error("Failed query: insert into notes"), {
      cause: policyRefusal(),
    }),
  );
  await assert.rejects(createNote(ctx, { body: "Call Ana" }), Forbidden);
});

test("C1: createNote writes the caller as owner and returns the note", async () => {
  const ctx = fakeContext(() => [row("Call Ana")]);
  const note = await createNote(ctx, { body: "  Call Ana  " });
  assert.deepEqual(note, {
    id: NOTE_ID,
    body: "Call Ana",
    createdAt: CREATED,
    updatedAt: CREATED,
  });
  assert.ok(ctx.calls[0]!.params.includes(USER_ID), "owner is the caller");
  assert.ok(ctx.calls[0]!.params.includes("Call Ana"), "body is trimmed");
});

test("C1: getNote returns the row the scoped db shows; listNotes returns the list", async () => {
  const one = fakeContext(() => [row("Call Ana")]);
  assert.equal((await getNote(one, { id: NOTE_ID })).body, "Call Ana");
  const many = fakeContext(() => [row("Second"), row("First")]);
  assert.deepEqual(
    (await listNotes(many, { limit: 2 })).map((note) => note.body),
    ["Second", "First"],
  );
  assert.match(
    many.calls[0]!.sql,
    /where "notes"\."owner_id" = \$1 order by "notes"\."created_at" desc limit \$2/,
  );
  assert.equal(many.calls[0]!.params[0], USER_ID, "filtered to the caller");
});

test("C2: invalid input throws Invalid naming the field, before any query", async () => {
  const ctx = fakeContext(() => {
    throw new Error("no query should run");
  });
  const cases: [Promise<unknown>, string][] = [
    [createNote(ctx, { body: "   " }), "body"],
    [getNote(ctx, { id: "note-1" }), "id"],
    [listNotes(ctx, { limit: 0 }), "limit"],
  ];
  for (const [call, field] of cases) {
    const error = await call.then(
      () => assert.fail("expected Invalid"),
      (caught: unknown) => caught,
    );
    assert.ok(error instanceof Invalid);
    assert.deepEqual(Object.keys(error.fields), [field]);
    assert.match(error.message, new RegExp(`^Check ${field}:`));
  }
  assert.equal(ctx.calls.length, 0);
});

test("an error that is no domain error is not turned into one", async () => {
  // drizzle 0.45.2 wraps every query error, with the driver's error as its cause.
  const fault = Object.assign(new Error("connection reset"), { code: "08006" });
  const ctx = fakeContext(() => fault);
  await assert.rejects(getNote(ctx, { id: NOTE_ID }), (error: unknown) => {
    assert.ok(!(error instanceof DomainError));
    assert.equal((error as { cause?: unknown }).cause, fault);
    return true;
  });
});
