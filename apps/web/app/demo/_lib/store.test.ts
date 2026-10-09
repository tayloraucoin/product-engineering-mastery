import assert from "node:assert/strict";
import { test } from "node:test";

import {
  FIXTURE_BODIES,
  FIXTURE_INDEX,
  GREYFOLD_ID,
  HALVORSEN_ID,
} from "./fixtures/index.ts";
import { demoReducer, initialDemoState } from "./store.ts";

const halvorsenClauses = () => [
  ...FIXTURE_BODIES[HALVORSEN_ID]!.versions[0]!.clauses,
];

test("C2: changed clauses append version 5 with a built summary", () => {
  const clauses = [...halvorsenClauses(), "  Invoices are sent monthly.  ", ""];
  const state = demoReducer(initialDemoState(), {
    type: "update",
    id: HALVORSEN_ID,
    input: { clauses },
  });
  const versions = state.bodies[HALVORSEN_ID]!.versions;
  assert.equal(versions.length, 5);
  assert.equal(versions[0]!.n, 5);
  assert.equal(versions[0]!.summary, "1 added");
  assert.equal(versions[0]!.by, "you");
  assert.equal(versions[0]!.clauses.at(-1), "Invoices are sent monthly.");
  assert.equal(
    state.records.find((r) => r.id === HALVORSEN_ID)!.versionCount,
    5,
  );
  assert.deepEqual(state.lastEvent, {
    kind: "saved",
    vendor: "Halvorsen Freight",
    fields: ["clauses"],
    created: false,
  });
});

test("C2: a value-only save adds no version and reports the field", () => {
  const state = demoReducer(initialDemoState(), {
    type: "update",
    id: HALVORSEN_ID,
    input: { annualValueUsd: 52000, clauses: halvorsenClauses() },
  });
  assert.equal(state.bodies[HALVORSEN_ID]!.versions.length, 4);
  const record = state.records.find((r) => r.id === HALVORSEN_ID)!;
  assert.equal(record.annualValueUsd, 52000);
  assert.deepEqual(record.lastChange, { on: "2026-10-08", by: "you" });
  assert.deepEqual(state.lastEvent, {
    kind: "saved",
    vendor: "Halvorsen Freight",
    fields: ["annualValueUsd"],
    created: false,
  });
});

test("C2: delete then reset returns all 40 records, and nothing mutates", () => {
  const before = initialDemoState();
  const deleted = demoReducer(before, { type: "delete", id: GREYFOLD_ID });
  assert.equal(deleted.records.length, 39);
  assert.equal(deleted.bodies[GREYFOLD_ID], undefined);
  assert.deepEqual(deleted.lastEvent, {
    kind: "deleted",
    vendor: "Greyfold Security",
  });
  assert.equal(before.records.length, 40);
  const reset = demoReducer(deleted, { type: "reset" });
  assert.equal(reset.records.length, 40);
  assert.equal(reset.lastEvent, null);
});

test("C2: the fixtures are 40 deep-frozen records whose counts match their bodies", () => {
  assert.equal(FIXTURE_INDEX.length, 40);
  assert.equal(new Set(FIXTURE_INDEX.map((r) => r.id)).size, 40);
  assert.ok(
    Object.isFrozen(FIXTURE_INDEX) && Object.isFrozen(FIXTURE_INDEX[0]),
  );
  assert.ok(
    Object.isFrozen(FIXTURE_BODIES[HALVORSEN_ID]!.versions[0]!.clauses),
  );
  for (const r of FIXTURE_INDEX) {
    assert.match(r.id, /^rec_[0-9a-f]{4}$/);
    assert.equal(FIXTURE_BODIES[r.id]!.versions.length, r.versionCount);
    assert.equal(r.endedOn !== null, r.status === "terminated");
  }
});

test("C2: create adds a record with version 1 when it has terms", () => {
  const state = demoReducer(initialDemoState(), {
    type: "create",
    id: "rec_ffff",
    input: {
      vendor: "New Vendor",
      ownerId: "own_ana",
      status: "draft",
      annualValueUsd: 1000,
      renewsOn: null,
      endedOn: null,
      clauses: ["One clause."],
    },
  });
  assert.equal(state.records.length, 41);
  assert.equal(state.bodies["rec_ffff"]!.versions[0]!.n, 1);
});
