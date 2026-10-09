import assert from "node:assert/strict";
import { test } from "node:test";

import { HALVORSEN_ID } from "../../../_lib/fixtures/index.ts";
import { demoReducer, initialDemoState } from "../../../_lib/store.ts";
import {
  changedFields,
  dirtyWords,
  formatAnnualValue,
  NEW_VALUES,
  nextRecordId,
  parseAnnualValue,
  summaryWords,
  toRecordInput,
  validateRecordInput,
  valuesFromRecord,
  type FormValues,
} from "./record-input.ts";

const valid: FormValues = {
  ...NEW_VALUES,
  vendor: "Northwind Couriers",
  ownerId: "own_ana",
  annualValue: "12,500",
};

test("C1: each missing required field is refused with its words", () => {
  assert.deepEqual(validateRecordInput(NEW_VALUES), {
    vendor: "Enter the vendor's name.",
    ownerId: "Choose an owner.",
    annualValue: "Enter a value of 0 or more.",
  });
  assert.deepEqual(validateRecordInput({ ...valid, vendor: "   " }), {
    vendor: "Enter the vendor's name.",
  });
  assert.deepEqual(validateRecordInput(valid), {});
});

test("C1: the annual value accepts 0 and refuses -1 and 1.5", () => {
  assert.equal(parseAnnualValue("0"), 0);
  assert.equal(parseAnnualValue("48,000"), 48_000);
  assert.equal(parseAnnualValue("-1"), null);
  assert.equal(parseAnnualValue("1.5"), null);
  assert.equal(parseAnnualValue(""), null);
  assert.deepEqual(validateRecordInput({ ...valid, annualValue: "0" }), {});
  for (const bad of ["-1", "1.5", "-1,200", "ten"])
    assert.deepEqual(validateRecordInput({ ...valid, annualValue: bad }), {
      annualValue: "Enter a value of 0 or more.",
    });
  assert.equal(formatAnnualValue("48000"), "48,000");
  assert.equal(formatAnnualValue("-1200"), "-1200");
});

test("C1: the summary and the dirty dialog build their words", () => {
  assert.deepEqual(summaryWords(["vendor", "annualValue"]), {
    title: "2 fields need a change before saving",
    names: "Vendor name and Annual value.",
  });
  assert.deepEqual(summaryWords(["vendor", "ownerId", "annualValue"]), {
    title: "3 fields need a change before saving",
    names: "Vendor name, Owner and Annual value.",
  });
  assert.equal(
    summaryWords(["ownerId"]).title,
    "1 field needs a change before saving",
  );
  assert.equal(
    dirtyWords(["annualValue"]),
    "You changed Annual value. Leaving discards that change.",
  );
  assert.equal(
    dirtyWords(["vendor", "terms"]),
    "You changed 2 fields. Leaving discards those changes.",
  );
});

test("C1: only real changes count as dirty", () => {
  const state = initialDemoState();
  const record = state.records.find((r) => r.id === HALVORSEN_ID)!;
  const start = valuesFromRecord(record, state.bodies[HALVORSEN_ID]);
  assert.deepEqual(changedFields(start, start), []);
  assert.deepEqual(
    changedFields(start, {
      ...start,
      annualValue: start.annualValue.replace(/,/g, ""),
      terms: `${start.terms}\n\n  `,
    }),
    [],
  );
  assert.deepEqual(
    changedFields(start, { ...start, vendor: "Halvorsen", annualValue: "1" }),
    ["vendor", "annualValue"],
  );
});

test("C1: changed terms add a version and unchanged terms do not", () => {
  const state = initialDemoState();
  const record = state.records.find((r) => r.id === HALVORSEN_ID)!;
  const start = valuesFromRecord(record, state.bodies[HALVORSEN_ID]);
  const versions = state.bodies[HALVORSEN_ID]!.versions.length;

  const same = demoReducer(state, {
    type: "update",
    id: HALVORSEN_ID,
    input: toRecordInput({ ...start, annualValue: "52,000" }),
  });
  assert.equal(same.bodies[HALVORSEN_ID]!.versions.length, versions);

  const changed = demoReducer(state, {
    type: "update",
    id: HALVORSEN_ID,
    input: toRecordInput({ ...start, terms: `${start.terms}\n New clause. ` }),
  });
  assert.equal(changed.bodies[HALVORSEN_ID]!.versions.length, versions + 1);
  assert.equal(
    changed.bodies[HALVORSEN_ID]!.versions[0]!.clauses.at(-1),
    "New clause.",
  );
});

test("C1: a new record's id comes from the store, never from chance", () => {
  const state = initialDemoState();
  const id = nextRecordId(state.records);
  assert.match(id, /^rec_[0-9a-f]{4}$/);
  assert.equal(nextRecordId(state.records), id);
  const next = demoReducer(state, {
    type: "create",
    id,
    input: { ...toRecordInput(valid), endedOn: null },
  });
  assert.notEqual(nextRecordId(next.records), id);
});
