import assert from "node:assert/strict";
import { test } from "node:test";

import { FIXTURE_INDEX } from "../../../_lib/fixtures/index.ts";
import {
  buildCountWords,
  buildFilterWords,
  buildRecordsSearch,
  effectiveSort,
  filterRecords,
  parseRecordsQuery,
  SORT_COLUMNS,
  SORT_OPTIONS,
  sortRecords,
  type RecordsQuery,
} from "./query.ts";

const NONE: RecordsQuery = { q: "", status: null, owner: null, sort: null };

test("C1: every filter and sort round-trips through the URL", () => {
  const queries: RecordsQuery[] = [NONE];
  for (const column of SORT_COLUMNS)
    for (const direction of ["asc", "desc"] as const)
      queries.push({
        q: "Zephyr air",
        status: "terminated",
        owner: "own_tomas",
        sort: { column, direction },
      });
  queries.push({ ...NONE, q: "a & b=c" }, { ...NONE, status: "draft" });
  for (const query of queries) {
    const search = buildRecordsSearch(query);
    assert.deepEqual(parseRecordsQuery(new URLSearchParams(search)), query);
  }
  assert.equal(buildRecordsSearch(NONE), "");
});

test("C1: Next's searchParams object parses like URLSearchParams", () => {
  assert.deepEqual(
    parseRecordsQuery({ q: " halv ", status: "active", sort: "value-desc" }),
    {
      q: "halv",
      status: "active",
      owner: null,
      sort: { column: "value", direction: "desc" },
    },
  );
});

test("C1: an invalid or repeated value reads as absent", () => {
  assert.deepEqual(
    parseRecordsQuery({
      status: "Active",
      owner: "own_nobody",
      sort: "vendor-up",
    }),
    NONE,
  );
  assert.deepEqual(parseRecordsQuery({ sort: "price-asc" }), NONE);
  assert.deepEqual(parseRecordsQuery({ q: ["a", "b"] }), NONE);
  assert.deepEqual(
    parseRecordsQuery(new URLSearchParams("status=draft&status=active")),
    NONE,
  );
});

test("C1: an absent sort reads the prefs default", () => {
  assert.deepEqual(effectiveSort(NONE, "renews-asc"), {
    column: "renews",
    direction: "asc",
  });
  assert.deepEqual(
    effectiveSort(
      { ...NONE, sort: { column: "owner", direction: "desc" } },
      "renews-asc",
    ),
    { column: "owner", direction: "desc" },
  );
});

test("C1: filters narrow by vendor substring, status and owner together", () => {
  assert.equal(filterRecords(FIXTURE_INDEX, NONE).length, 40);
  const zephyr = filterRecords(FIXTURE_INDEX, { ...NONE, q: "zEPHYR" });
  assert.deepEqual(
    zephyr.map((r) => r.vendor),
    ["Zephyr Air Filtration"],
  );
  assert.equal(
    filterRecords(FIXTURE_INDEX, { ...NONE, q: "Zephyr", status: "terminated" })
      .length,
    0,
  );
  const tomasActive = filterRecords(FIXTURE_INDEX, {
    ...NONE,
    status: "active",
    owner: "own_tomas",
  });
  assert.ok(tomasActive.length > 0);
  assert.ok(
    tomasActive.every(
      (r) => r.status === "active" && r.ownerId === "own_tomas",
    ),
  );
});

test("C1: each sort orders rows, with undated renewals last both ways", () => {
  const vendors = (column: (typeof SORT_COLUMNS)[number], asc: boolean) =>
    sortRecords(FIXTURE_INDEX, {
      column,
      direction: asc ? "asc" : "desc",
    });
  assert.equal(vendors("vendor", true)[0]!.vendor, "Alderley Web Studio");
  assert.equal(vendors("vendor", false)[0]!.vendor, "Zephyr Air Filtration");
  assert.equal(vendors("value", false)[0]!.vendor, "Tidewater Software");
  assert.equal(vendors("value", true)[0]!.vendor, "Redwater Pest Control");
  assert.equal(vendors("renews", true)[0]!.vendor, "Xenon Lighting");
  assert.equal(vendors("renews", false)[0]!.vendor, "Tidewater Software");
  for (const asc of [true, false]) {
    const rows = vendors("renews", asc);
    const firstUndated = rows.findIndex((r) => r.renewsOn === null);
    assert.ok(rows.slice(firstUndated).every((r) => r.renewsOn === null));
  }
  assert.equal(vendors("owner", true)[0]!.ownerId, "own_ana");
  assert.equal(vendors("status", true)[0]!.status, "active");
  assert.equal(vendors("status", false)[0]!.status, "terminated");
});

test("C1: the Sort select names every column both ways", () => {
  for (const column of SORT_COLUMNS)
    for (const direction of ["asc", "desc"])
      assert.ok(
        SORT_OPTIONS.some((o) => o.value === `${column}-${direction}`),
        `${column}-${direction}`,
      );
  assert.deepEqual(
    SORT_OPTIONS.filter((o) =>
      ["vendor-asc", "value-desc", "renews-asc"].includes(o.value),
    ).map((o) => o.label),
    ["Vendor, A to Z", "Annual value, highest first", "Renews, soonest first"],
  );
});

test("C1: the count and the filter words", () => {
  assert.equal(buildCountWords(40, 40, false), "40 records");
  assert.equal(buildCountWords(12, 40, true), "12 of 40 records");
  assert.equal(buildCountWords(0, 40, true), "0 of 40 records");
  assert.equal(buildCountWords(1, 1, false), "1 record");
  assert.equal(
    buildFilterWords({ ...NONE, q: "Zephyr", status: "terminated" }),
    'Vendor contains "Zephyr" and status is Terminated.',
  );
  assert.equal(
    buildFilterWords({ ...NONE, status: "draft" }),
    "Status is Draft.",
  );
  assert.equal(
    buildFilterWords({
      ...NONE,
      q: "Co",
      status: "active",
      owner: "own_ana",
    }),
    'Vendor contains "Co", status is Active and owner is Ana Okafor.',
  );
  assert.equal(buildFilterWords(NONE), "");
});
