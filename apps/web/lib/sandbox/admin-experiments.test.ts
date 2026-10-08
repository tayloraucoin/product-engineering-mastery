import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  daysSinceClose,
  EXPERIMENT_HEADER_STATE_KEYS,
  experimentHeaderStateView,
  experimentRows,
  EXPERIMENTS_STATE_KEYS,
  experimentsStateView,
  resolveExperimentHeader,
  type ExperimentCounts,
  type ExperimentSummary,
} from "./admin-experiments.ts";
import { readSandboxState, SANDBOX_STATE_KEYS } from "./state.ts";

// 12:00 London (BST) on 6 October 2026.
const NOW = new Date("2026-10-06T11:00:00Z");

const open: ExperimentSummary = {
  slug: "pricing-2026",
  title: "Pricing page, 2026",
  designs: [{}, {}],
  closedOn: null,
};
const closed: ExperimentSummary = {
  slug: "checkout-2026",
  title: "Checkout, 2026",
  designs: [{}, {}, {}],
  closedOn: "2026-09-02", // 34 London days before NOW
};

const counts = (
  slug: string,
  over: Partial<ExperimentCounts> = {},
): ExperimentCounts => ({
  slug,
  codes: 5,
  sent: 2,
  lastActivityAt: new Date("2026-10-03T09:00:00Z"),
  reviewersHoldingData: 5,
  ...over,
});

describe("C1: the list", () => {
  test("C1: one open and one closed experiment list with title, status word, designs and codes · sent, open first", () => {
    const list = experimentRows(
      [closed, open],
      [
        counts(closed.slug, { codes: 3, sent: 1, reviewersHoldingData: 3 }),
        counts(open.slug),
      ],
      "admin",
      NOW,
    );
    assert.deepEqual(
      list.rows.map((r) => [r.title, r.status, r.designs, r.reviewers]),
      [
        ["Pricing page, 2026", "Open", 2, "5 codes · 2 sent"],
        ["Checkout, 2026", "Closed", 3, "3 codes · 1 sent"],
      ],
    );
    assert.equal(list.rows[0]!.href, "/admin/experiments/pricing-2026");
    assert.equal(list.rows[0]!.lastActivity?.relative, "3 days ago");
    assert.match(list.rows[0]!.lastActivity!.exact, /3 October 2026/);
  });

  test("C1: open by latest activity (none last), then closed by latest close", () => {
    const a = { ...open, slug: "a-2026", title: "A" };
    const b = { ...open, slug: "b-2026", title: "B" };
    const c = { ...open, slug: "c-2026", title: "C" };
    const old = {
      ...closed,
      slug: "old-2026",
      title: "Old",
      closedOn: "2026-01-10",
    };
    const recent = {
      ...closed,
      slug: "recent-2026",
      title: "Recent",
      closedOn: "2026-09-30",
    };
    const list = experimentRows(
      [old, a, recent, b, c],
      [
        counts("a-2026", { lastActivityAt: new Date("2026-10-01T09:00:00Z") }),
        counts("b-2026", { lastActivityAt: new Date("2026-10-05T09:00:00Z") }),
        counts("c-2026", { lastActivityAt: null }),
        counts("old-2026"),
        counts("recent-2026"),
      ],
      "admin",
      NOW,
    );
    assert.deepEqual(
      list.rows.map((r) => r.title),
      ["B", "A", "C", "Recent", "Old"],
    );
  });
});

describe("C2–C4: data held", () => {
  test("C2: a closed experiment with 3 reviewers holding data shows the marker, and the header counts it", () => {
    const list = experimentRows(
      [open, closed],
      [counts(open.slug), counts(closed.slug, { reviewersHoldingData: 3 })],
      "admin",
      NOW,
    );
    const row = list.rows.find((r) => r.slug === closed.slug)!;
    assert.equal(
      row.marker?.text,
      "Holds data from 3 reviewers · closed 34 days ago",
    );
    assert.equal(list.rows.find((r) => r.slug === open.slug)!.marker, null);
    assert.equal(
      list.headerLine,
      "1 closed experiment still holds reviewers' data.",
    );
  });

  test("C2: the same line shows under the experiment's own heading", async () => {
    const result = await resolveExperimentHeader(
      {
        findExperiment: (s) => (s === closed.slug ? closed : null),
        loadStats: async () => counts(closed.slug, { reviewersHoldingData: 3 }),
      },
      closed.slug,
      "admin",
      NOW,
    );
    assert.equal(result.kind, "found");
    assert.equal(
      (result as { header: { marker: { text: string } } }).header.marker.text,
      "Holds data from 3 reviewers · closed 34 days ago",
    );
  });

  test("C2: two stale experiments read in the plural", () => {
    const other = { ...closed, slug: "other-2026", title: "Other" };
    const list = experimentRows(
      [closed, other],
      [counts(closed.slug), counts(other.slug)],
      "admin",
      NOW,
    );
    assert.equal(
      list.headerLine,
      "2 closed experiments still hold reviewers' data.",
    );
  });

  test("C3: once its data is deleted the row shows no marker and the header drops it; with none left it is absent", () => {
    const other = { ...closed, slug: "other-2026", title: "Other" };
    const list = experimentRows(
      [closed, other],
      [
        counts(closed.slug, {
          codes: 0,
          sent: 0,
          reviewersHoldingData: 0,
          lastActivityAt: null,
        }),
        counts(other.slug),
      ],
      "admin",
      NOW,
    );
    assert.equal(list.rows.find((r) => r.slug === closed.slug)!.marker, null);
    assert.equal(
      list.headerLine,
      "1 closed experiment still holds reviewers' data.",
    );
    const none = experimentRows(
      [closed],
      [counts(closed.slug, { reviewersHoldingData: 0 })],
      "admin",
      NOW,
    );
    assert.equal(none.headerLine, null);
  });

  test("C4: a developer sees the marker without Delete data; an admin's links to the Data tab", () => {
    for (const [role, href] of [
      ["developer", null],
      ["admin", "/admin/experiments/checkout-2026/data"],
    ] as const) {
      const list = experimentRows([closed], [counts(closed.slug)], role, NOW);
      assert.equal(list.rows[0]!.marker?.deleteHref, href, role);
      assert.match(list.rows[0]!.marker!.text, /^Holds data from 5 reviewers/);
    }
  });

  test("C4: under the heading, too", async () => {
    for (const [role, href] of [
      ["developer", null],
      ["admin", "/admin/experiments/checkout-2026/data"],
    ] as const) {
      const result = await resolveExperimentHeader(
        {
          findExperiment: () => closed,
          loadStats: async () => counts(closed.slug),
        },
        closed.slug,
        role,
        NOW,
      );
      assert.equal(
        (result as { header: { marker: { deleteHref: string | null } } }).header
          .marker.deleteHref,
        href,
      );
    }
  });

  test("the marker and the header line are plain text: no alarm words (A-19)", () => {
    const list = experimentRows([closed], [counts(closed.slug)], "admin", NOW);
    const text = `${list.headerLine} ${list.rows[0]!.marker!.text}`;
    assert.doesNotMatch(text, /!|urgent|warning|overdue|expire/i);
  });

  test("failed counts list every row with — and no header line", () => {
    const list = experimentRows([open, closed], null, "admin", NOW);
    assert.equal(list.partial, true);
    assert.equal(list.headerLine, null);
    for (const row of list.rows) {
      assert.equal(row.reviewers, "—");
      assert.equal(row.marker, null);
      assert.equal(row.lastActivity, null);
    }
  });
});

describe("C6: days since close, by London's calendar", () => {
  test("C6: at 23:30 UTC in summer, a closedOn of the London day before counts 1", () => {
    // 23:30 UTC on 15 July is 00:30 on 16 July in London (BST).
    const now = new Date("2026-07-15T23:30:00Z");
    assert.equal(daysSinceClose("2026-07-15", now), 1);
    assert.equal(daysSinceClose("2026-07-16", now), 0);
  });

  test("C6: the day of close shows the marker, as closed today", () => {
    const today = { ...closed, closedOn: "2026-10-06" };
    const list = experimentRows(
      [today],
      [counts(today.slug, { reviewersHoldingData: 1 })],
      "admin",
      NOW,
    );
    assert.equal(
      list.rows[0]!.marker?.text,
      "Holds data from 1 reviewer · closed today",
    );
    const yesterday = { ...closed, closedOn: "2026-10-05" };
    assert.match(
      experimentRows([yesterday], [counts(yesterday.slug)], "admin", NOW)
        .rows[0]!.marker!.text,
      /closed 1 day ago$/,
    );
  });

  test("C6: across both clock changes, days stay whole calendar days", () => {
    assert.equal(
      daysSinceClose("2026-03-28", new Date("2026-03-30T12:00:00Z")),
      2,
    );
    assert.equal(
      daysSinceClose("2026-10-24", new Date("2026-10-26T12:00:00Z")),
      2,
    );
    assert.equal(
      daysSinceClose("2026-01-15", new Date("2026-01-15T23:59:00Z")),
      0,
    );
  });
});

describe("C7: the experiment layout", () => {
  test("C7: an unknown slug is not-found, and the database is never called", async () => {
    const throwing = async (): Promise<never> => {
      throw new Error("the database was read");
    };
    let read = false;
    const result = await resolveExperimentHeader(
      {
        findExperiment: () => null,
        loadStats: () => {
          read = true;
          return throwing();
        },
      },
      "no-such-experiment",
      "admin",
      NOW,
    );
    assert.deepEqual(result, { kind: "not-found" });
    assert.equal(read, false);
  });

  test("C7: a known slug gives its title, status word and the four tabs in order", async () => {
    const result = await resolveExperimentHeader(
      { findExperiment: () => open, loadStats: async () => counts(open.slug) },
      open.slug,
      "developer",
      NOW,
    );
    assert.equal(result.kind, "found");
    const { header } = result as Extract<typeof result, { kind: "found" }>;
    assert.equal(header.title, "Pricing page, 2026");
    assert.equal(header.status, "Open");
    assert.equal(header.marker, null);
    assert.deepEqual(header.tabs, [
      { label: "Results", href: "/admin/experiments/pricing-2026" },
      { label: "Reviewers", href: "/admin/experiments/pricing-2026/reviewers" },
      { label: "Access codes", href: "/admin/experiments/pricing-2026/codes" },
      { label: "Data", href: "/admin/experiments/pricing-2026/data" },
    ]);
  });

  test("C7: the layout guards with its own path, then resolves the slug, before rendering", () => {
    const source = readFileSync(
      new URL("../../app/admin/experiments/[slug]/layout.tsx", import.meta.url),
      "utf8",
    );
    const guard = source.indexOf(
      "await requireTeamPage(`/admin/experiments/${slug}`)",
    );
    const resolve = source.indexOf("await resolveExperimentHeader(");
    const missing = source.indexOf("notFound()");
    assert.ok(guard > 0 && resolve > guard && missing > resolve);
  });
});

describe("the list's state keys", () => {
  test("every key is team-only and has its view", () => {
    for (const key of EXPERIMENTS_STATE_KEYS) {
      assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
      assert.equal(readSandboxState(key, "guest"), null);
      assert.ok(experimentsStateView(key, "admin", NOW), key);
    }
    assert.equal(experimentsStateView(null, "admin", NOW), null);
    assert.equal(
      experimentsStateView("expts-empty", "admin", NOW)!.list!.rows.length,
      0,
    );
    assert.equal(
      experimentsStateView("expts-error", "admin", NOW)!.error,
      true,
    );
    assert.equal(
      experimentsStateView("expts-partial", "admin", NOW)!.list!.partial,
      true,
    );
    const stale = experimentsStateView("expts-stale", "admin", NOW)!.list!;
    assert.equal(
      stale.headerLine,
      "2 closed experiments still hold reviewers' data.",
    );
    assert.ok(
      stale.rows.some((r) => r.marker?.text.endsWith("closed 34 days ago")),
    );
    const developer = experimentsStateView(
      "expts-developer",
      "admin",
      NOW,
    )!.list!;
    assert.ok(developer.rows.every((r) => !r.marker?.deleteHref));
    assert.equal(
      experimentsStateView("expts-success", "admin", NOW)!.list!.headerLine,
      null,
    );
  });
});

describe("the header when its counts fail", () => {
  test("a closed experiment whose counts failed says so in place of the marker", async () => {
    const result = await resolveExperimentHeader(
      { findExperiment: () => closed, loadStats: async () => null },
      closed.slug,
      "admin",
      NOW,
    );
    const { header } = result as Extract<typeof result, { kind: "found" }>;
    assert.equal(header.marker, null);
    assert.equal(header.partial, true);
    const ok = await resolveExperimentHeader(
      {
        findExperiment: () => closed,
        loadStats: async () => counts(closed.slug),
      },
      closed.slug,
      "admin",
      NOW,
    );
    assert.equal(
      (ok as Extract<typeof ok, { kind: "found" }>).header.partial,
      false,
    );
  });

  test("the header's state keys are team-only and show the stale, developer and partial forms", () => {
    for (const key of EXPERIMENT_HEADER_STATE_KEYS) {
      assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
      assert.equal(readSandboxState(key, "reviewer"), null);
    }
    const stale = experimentHeaderStateView(
      "expts-header-stale",
      "admin",
      NOW,
    )!;
    assert.match(stale.marker!.text, /closed 34 days ago$/);
    assert.equal(
      stale.marker!.deleteHref,
      "/admin/experiments/checkout-2026/data",
    );
    const dev = experimentHeaderStateView(
      "expts-header-developer",
      "admin",
      NOW,
    )!;
    assert.equal(dev.marker!.deleteHref, null);
    const partial = experimentHeaderStateView(
      "expts-header-partial",
      "admin",
      NOW,
    )!;
    assert.deepEqual([partial.marker, partial.partial], [null, true]);
    assert.equal(experimentHeaderStateView(null, "admin", NOW), null);
  });
});
