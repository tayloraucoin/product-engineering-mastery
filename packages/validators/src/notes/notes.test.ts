/** C2: invalid input fails at the validator, naming the field. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { fieldErrors } from "../field-errors.ts";
import {
  createNoteInput,
  getNoteInput,
  listNotesInput,
  NOTE_BODY_MAX,
} from "./notes.ts";

function failedFields(result: { success: boolean; error?: unknown }) {
  assert.equal(result.success, false);
  return fieldErrors(result.error as Parameters<typeof fieldErrors>[0]);
}

test("C2: an empty or whitespace body fails on body", () => {
  for (const body of ["", "   ", undefined]) {
    const errors = failedFields(createNoteInput.safeParse({ body }));
    assert.deepEqual(Object.keys(errors), ["body"]);
    assert.deepEqual(errors.body, ["Write the note."]);
  }
});

test("C2: a body over the limit fails on body", () => {
  const errors = failedFields(
    createNoteInput.safeParse({ body: "a".repeat(NOTE_BODY_MAX + 1) }),
  );
  assert.match(errors.body?.[0] ?? "", /under 10,000 characters/);
});

test("C2: a malformed id fails on id; a list limit out of range fails on limit", () => {
  assert.deepEqual(
    Object.keys(failedFields(getNoteInput.safeParse({ id: "note-1" }))),
    ["id"],
  );
  assert.deepEqual(
    Object.keys(failedFields(listNotesInput.safeParse({ limit: 500 }))),
    ["limit"],
  );
});

test("valid input parses, trimmed and defaulted", () => {
  assert.deepEqual(createNoteInput.parse({ body: "  Call Ana  " }), {
    body: "Call Ana",
  });
  assert.deepEqual(listNotesInput.parse({}), { limit: 20 });
});
