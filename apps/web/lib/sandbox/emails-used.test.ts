import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  EMAILS_USED_WORDS,
  emailsUsedFlags,
  isEmailLabel,
} from "./emails-used.ts";

describe("C7: Emails used flags (access-codes.md)", () => {
  test('C7: two typed emails flag "2 emails used with this code"', () => {
    assert.deepEqual(
      emailsUsedFlags("Ana Ruiz", ["ana@example.com", "ben@example.com"]),
      { several: true, differsFromLabel: false },
    );
    assert.equal(EMAILS_USED_WORDS.several(2), "2 emails used with this code");
  });

  test("C7: one email, typed twice in different case, is one email", () => {
    assert.deepEqual(
      emailsUsedFlags("Ana Ruiz", ["ana@example.com", "ANA@example.com "]),
      { several: false, differsFromLabel: false },
    );
  });

  test("C7: an email label flags a typed email that differs, ignoring case", () => {
    assert.deepEqual(
      emailsUsedFlags("ana@example.com", ["ana.ruiz@example.com"]),
      { several: false, differsFromLabel: true },
    );
    assert.equal(
      EMAILS_USED_WORDS.differsFromLabel,
      "Email differs from the label",
    );
  });

  test("C7: an email label is not flagged when the typed email matches it in another case", () => {
    assert.deepEqual(emailsUsedFlags(" Ana@Example.com", ["ana@example.com"]), {
      several: false,
      differsFromLabel: false,
    });
  });

  test("C7: a name label is never compared or flagged", () => {
    for (const label of ["Ana Ruiz", "Ana", "ana at example", "@ana", "ana@"])
      assert.equal(
        emailsUsedFlags(label, ["someone@example.com"]).differsFromLabel,
        false,
        label,
      );
    assert.equal(isEmailLabel("Ana Ruiz"), false);
    assert.equal(isEmailLabel("ana@example.com"), true);
  });

  test("C7: no typed email flags nothing", () => {
    assert.deepEqual(emailsUsedFlags("ana@example.com", []), {
      several: false,
      differsFromLabel: false,
    });
  });
});
