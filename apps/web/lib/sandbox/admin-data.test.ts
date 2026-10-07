/**
 * Deleting and erasing in /admin (LAB-16): C3 (a developer's delete never
 * reaches the store; the tab shows them no field), C6 (the signed-in
 * reviewer by a stubbed account lookup; the no-match line), C8 (the confirm
 * matches the slug exactly), C9 (the reviewer view reads only; the nav's
 * Data entry is a link). The database's own cases are in packages/db's
 * test:db suite.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  confirmMatches,
  DATA_PAGE_STATE_KEYS,
  DATA_TAB_STATE_KEYS,
  DATA_WORDS,
  dataPageStateView,
  dataTabStateView,
  deleteButtonLabel,
  deletedToast,
  deletePanel,
  erasedToast,
  FIXTURE_COUNTS,
  foundLine,
  holdsLine,
  recordWords,
  type DataTabView,
} from "./admin-data-view.ts";
import {
  accountIdsFor,
  DATA_ACTION_REFUSED,
  deleteExperimentDataWith,
  eraseReviewerWith,
  findReviewerWith,
  loadDataTabWith,
  loadRecordWith,
  loadReviewerWith,
  parseEmail,
  parsePage,
  type DataDeps,
  type DataExperiment,
  type DataStore,
} from "./admin-data.ts";
import { requireTeamActionWith, TEAM_ACTION_REFUSED } from "./admin-gate.ts";
import { ADMIN_NAV, adminNavFor } from "./admin-nav.ts";
import { SANDBOX_STATE_KEYS } from "./state.ts";
import type { TeamMember } from "./team-check.ts";

const DEVELOPER: TeamMember = {
  userId: "00000000-0000-4000-8000-0000000000d1",
  email: "dev@example.test",
  role: "developer",
};
const ADMIN: TeamMember = { ...DEVELOPER, role: "admin" };
const REVIEWER_ID = "00000000-0000-4000-8000-000000000001";
const ACCOUNT_ID = "00000000-0000-4000-8000-0000000000a1";

const PRICING: DataExperiment = {
  slug: "pricing-2026",
  title: "Pricing 2026",
  closedOn: null,
};

/** A store whose every function throws when called, and counts the calls. */
function throwingStore(): { store: DataStore; calls: () => number } {
  let calls = 0;
  const refuse = () => {
    calls++;
    throw new Error("the store was called");
  };
  return {
    store: {
      countExperimentData: refuse,
      deleteExperimentData: refuse,
      findErasure: refuse,
      findReviewerEmails: refuse,
      eraseEmail: refuse,
      listActions: refuse,
    },
    calls: () => calls,
  };
}

function deps(store: Partial<DataStore>, extra: Partial<DataDeps> = {}) {
  const { store: base } = throwingStore();
  const accountCalls: string[] = [];
  const built: DataDeps = {
    findExperiment: (slug) => (slug === PRICING.slug ? PRICING : null),
    findAccountIds: async (email) => {
      accountCalls.push(email);
      return [];
    },
    findAccountEmail: async () => null,
    store: { ...base, ...store },
    ...extra,
  };
  return { deps: built, accountCalls };
}

describe("C3: a developer cannot delete an experiment's data", () => {
  test("the delete refuses a developer with a store that throws when called, never called", async () => {
    const { store, calls } = throwingStore();
    let found = 0;
    const result = await deleteExperimentDataWith(
      {
        findExperiment: () => {
          found++;
          return PRICING;
        },
        findAccountIds: async () => [],
        findAccountEmail: async () => null,
        store,
      },
      DEVELOPER,
      { slug: "pricing-2026", confirm: "pricing-2026" },
    );
    assert.deepEqual(result, DATA_ACTION_REFUSED);
    assert.equal(calls(), 0, "the store was reached");
    assert.equal(found, 0, "the registry was read before the refusal");
    for (const member of [
      { ...DEVELOPER, role: "Admin" },
      { ...DEVELOPER, role: undefined },
      null,
    ] as unknown as TeamMember[])
      assert.deepEqual(
        await deleteExperimentDataWith(deps({}).deps, member, {
          slug: "pricing-2026",
          confirm: "pricing-2026",
        }),
        DATA_ACTION_REFUSED,
      );
  });

  test("the action's guard refuses a developer before the rules run, and the action passes { adminOnly: true }", async () => {
    assert.equal(
      await requireTeamActionWith(async () => DEVELOPER, { adminOnly: true }),
      TEAM_ACTION_REFUSED,
    );
    assert.equal(
      await requireTeamActionWith(async () => ADMIN, { adminOnly: true }),
      ADMIN,
    );
    const source = readFileSync(
      fileURLToPath(
        new URL(
          "../../app/admin/experiments/[slug]/data/actions.ts",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    assert.match(
      source,
      /export async function deleteExperimentData\([\s\S]*?\{\s*const member = await requireTeamAction\(\{ adminOnly: true \}\);\s*if \(isTeamActionRefusal\(member\)\) return member;/,
    );
  });

  test('the Data tab\'s view for a developer has the counts and "Only an admin can delete this data.", and no field or button', async () => {
    const view = await loadDataTabWith(
      deps({ countExperimentData: async () => ({ ...FIXTURE_COUNTS }) }).deps,
      DEVELOPER,
      PRICING,
    );
    assert.deepEqual(view.counts, FIXTURE_COUNTS);
    assert.equal(
      holdsLine(view.title, view.counts!),
      "Pricing 2026 holds: 5 access codes, 41 views, 23 comments, 4 reviews (7 versions), 6 team notes.",
    );
    assert.deepEqual(deletePanel(view), { kind: "developer" });
    assert.equal(
      DATA_WORDS.developerOnly,
      "Only an admin can delete this data.",
    );
    // The admin's view of the same counts is the one with the field and button.
    assert.deepEqual(deletePanel({ ...view, role: "admin" }), {
      kind: "admin",
      reviewers: 5,
      enabled: true,
    });
    const fixture = dataTabStateView("data-tab-developer", {
      slug: "pricing-2026",
      title: "Pricing 2026",
      open: true,
    })!;
    assert.deepEqual(deletePanel(fixture), { kind: "developer" });
    // The tab's leaf renders the field and button only for the admin panel.
    const leaf = readFileSync(
      fileURLToPath(
        new URL(
          "../../app/admin/experiments/[slug]/data/_components/data-tab.tsx",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    assert.match(leaf, /panel\.kind === "admin" \? \(\s*<DeleteForm/);
    assert.equal(leaf.match(/<DeleteForm/g)?.length, 1);
  });
});

describe("C6: erasing a signed-in reviewer, and an email that holds nothing", () => {
  test("the account is found by its email through the stubbed lookup, and its user id goes to the erasure", async () => {
    const erased: unknown[] = [];
    const { deps: d, accountCalls } = deps(
      {
        eraseEmail: async (_member, input) => {
          erased.push(input);
          return {
            accesses: 2,
            comments: 3,
            versions: 1,
            views: 9,
            labelsScrubbed: 1,
            reviewersRevoked: 0,
          } as never;
        },
      },
      {},
    );
    d.findAccountIds = async (email) => {
      accountCalls.push(email);
      return email === "ana@example.com" ? [ACCOUNT_ID] : [];
    };
    const result = await eraseReviewerWith(d, DEVELOPER, {
      email: "  Ana@Example.com ",
      clearLabels: [REVIEWER_ID],
    });
    assert.deepEqual(accountCalls, ["ana@example.com"]);
    assert.deepEqual(erased, [
      {
        email: "ana@example.com",
        userIds: [ACCOUNT_ID],
        clearLabels: [REVIEWER_ID],
      },
    ]);
    assert.deepEqual(result, {
      outcome: "erased",
      counts: { comments: 3, versions: 1, views: 9 },
    });
    assert.equal(
      erasedToast((result as Extract<typeof result, { outcome: "erased" }>).counts),
      "Erased 3 comments, 1 review version and 9 views.",
    );
    // The lookup matches Auth's email trimmed and lower-cased.
    assert.deepEqual(
      accountIdsFor(
        [
          { id: ACCOUNT_ID, email: " ANA@example.com" },
          { id: REVIEWER_ID, email: "ben@example.com" },
          { id: "x", email: null },
        ],
        "ana@example.com",
      ),
      [ACCOUNT_ID],
    );
  });

  test('an unknown email gives "Nothing is held for that email." and erases nothing', async () => {
    let erasures = 0;
    const { deps: d } = deps({
      findErasure: async () => null,
      eraseEmail: async () => {
        erasures++;
        return null;
      },
    });
    assert.deepEqual(
      await findReviewerWith(d, DEVELOPER, { email: "nobody@example.com" }),
      { outcome: "no-match", message: "Nothing is held for that email." },
    );
    assert.equal(erasures, 0, "a find erased");
    assert.deepEqual(
      await eraseReviewerWith(d, ADMIN, {
        email: "nobody@example.com",
        clearLabels: [],
      }),
      { outcome: "no-match", message: "Nothing is held for that email." },
    );
  });

  test("a find returns what is held everywhere, with each name label's experiment title", async () => {
    const { deps: d } = deps({
      findErasure: async () => ({
        experiments: 2,
        comments: 14,
        versions: 3,
        views: 41,
        nameLabels: [
          { reviewerId: REVIEWER_ID, slug: "pricing-2026", label: "Ana Ruiz" },
        ],
      }),
    });
    const result = await findReviewerWith(d, DEVELOPER, {
      email: "ana@example.com",
    });
    assert.equal(result.outcome, "found");
    const found = (result as Extract<typeof result, { outcome: "found" }>)
      .found;
    assert.equal(
      foundLine(found.email, found.totals),
      "ana@example.com: 2 experiments, 14 comments, 3 review versions, 41 views.",
    );
    assert.deepEqual(found.nameLabels, [
      { reviewerId: REVIEWER_ID, label: "Ana Ruiz", title: "Pricing 2026" },
    ]);
    assert.equal(
      DATA_WORDS.clearLabel("Ana Ruiz", "Pricing 2026"),
      "Also clear the label 'Ana Ruiz' on Pricing 2026",
    );
  });

  test("a malformed email or ticked list is refused before any lookup; a failed lookup is the action-failed toast", async () => {
    const { store, calls } = throwingStore();
    let lookups = 0;
    const d: DataDeps = {
      findExperiment: () => PRICING,
      findAccountIds: async () => {
        lookups++;
        throw new Error("Auth is down");
      },
      findAccountEmail: async () => null,
      store,
    };
    for (const email of ["", "no-at", "a b@example.com", 7, null])
      assert.deepEqual(await findReviewerWith(d, DEVELOPER, { email }), {
        outcome: "invalid",
        message: DATA_WORDS.emailInvalid,
      });
    assert.equal(
      (
        await eraseReviewerWith(d, DEVELOPER, {
          email: "ana@example.com",
          clearLabels: ["not-a-uuid"],
        })
      ).outcome,
      "failed",
    );
    assert.equal(lookups, 0);
    assert.deepEqual(
      await eraseReviewerWith(d, DEVELOPER, {
        email: "ana@example.com",
        clearLabels: [],
      }),
      { outcome: "failed", message: "Nothing was deleted. Try again." },
    );
    assert.equal(calls(), 0, "the store was reached after a failed lookup");
    assert.equal(parseEmail(" Ana@Example.COM "), "ana@example.com");
  });
});

describe("C8: the typed confirmation", () => {
  test("the delete button stays disabled until the field equals the slug exactly (case and spaces count)", () => {
    assert.ok(confirmMatches("pricing-2026", "pricing-2026"));
    for (const typed of [
      "",
      "pricing",
      "Pricing-2026",
      "PRICING-2026",
      " pricing-2026",
      "pricing-2026 ",
      "pricing 2026",
      "pricing-2026\n",
    ])
      assert.ok(!confirmMatches(typed, "pricing-2026"), JSON.stringify(typed));
    // The leaf disables the button on exactly this check.
    const leaf = readFileSync(
      fileURLToPath(
        new URL(
          "../../app/admin/experiments/[slug]/data/_components/data-tab.tsx",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    assert.match(leaf, /const matches = confirmMatches\(typed, view\.slug\);/);
    assert.match(leaf, /disabled=\{!enabled \|\| !matches \|\| busy\}/);
    assert.equal(
      DATA_WORDS.confirmLabel("pricing-2026"),
      "Type pricing-2026 to confirm",
    );
    assert.equal(deleteButtonLabel(5), "Delete data from 5 reviewers");
    assert.equal(deleteButtonLabel(0), "Delete this experiment's data");
    assert.equal(deletedToast(5), "Data deleted from 5 reviewers");
  });

  test("the action refuses a mismatched confirm with nothing deleted", async () => {
    const { store, calls } = throwingStore();
    const d: DataDeps = {
      findExperiment: () => PRICING,
      findAccountIds: async () => [],
      findAccountEmail: async () => null,
      store,
    };
    for (const confirm of ["Pricing-2026", " pricing-2026", "", null, 2026])
      assert.equal(
        (
          await deleteExperimentDataWith(d, ADMIN, {
            slug: "pricing-2026",
            confirm,
          })
        ).outcome,
        "mismatch",
      );
    assert.equal(calls(), 0, "a mismatched confirm reached the store");

    let deleted = 0;
    const ok = await deleteExperimentDataWith(
      deps({
        deleteExperimentData: async (_m, input) => {
          deleted++;
          assert.deepEqual(input, { slug: "pricing-2026" });
          return { reviewers: 5 };
        },
      }).deps,
      ADMIN,
      { slug: "pricing-2026", confirm: "pricing-2026" },
    );
    assert.deepEqual(ok, { outcome: "deleted", reviewers: 5 });
    assert.equal(deleted, 1);
    // An unregistered slug never reaches the store, even with a matching confirm.
    assert.equal(
      (
        await deleteExperimentDataWith(deps({}).deps, ADMIN, {
          slug: "unknown",
          confirm: "unknown",
        })
      ).outcome,
      "failed",
    );
  });
});

describe("C9: the erase view from a reviewer, and the nav", () => {
  test("/admin/data?reviewer=<id> lists each email used with that code, with its own counts, and erases nothing on load", async () => {
    let lookups = 0;
    const { deps: d } = deps({
      findReviewerEmails: async (_m, input) => {
        assert.deepEqual(input, { reviewerId: REVIEWER_ID });
        return {
          slug: "pricing-2026",
          emails: [
            { email: "ana@example.com", comments: 9, versions: 2, views: 30 },
            {
              email: "ana.ruiz@example.org",
              comments: 5,
              versions: 1,
              views: 11,
            },
          ],
          accounts: [
            { userId: ACCOUNT_ID, comments: 1, versions: 0, views: 2 },
          ],
        };
      },
    });
    d.findAccountEmail = async (userId) => {
      lookups++;
      return userId === ACCOUNT_ID ? "ana@example.com" : null;
    };
    // Every write in the store still throws: loading must not erase.
    const view = await loadReviewerWith(d, DEVELOPER, REVIEWER_ID);
    assert.equal(lookups, 1);
    assert.deepEqual(view, {
      reviewerId: REVIEWER_ID,
      title: "Pricing 2026",
      emails: [
        { email: "ana@example.com", comments: 10, versions: 2, views: 32 },
        { email: "ana.ruiz@example.org", comments: 5, versions: 1, views: 11 },
      ],
    });
    assert.equal(
      DATA_WORDS.fromReviewer(2),
      "This code was used with 2 emails. Each is erased separately.",
    );
    // The page reads the id from ?reviewer= and nothing else from the URL.
    const page = readFileSync(
      fileURLToPath(new URL("../../app/admin/data/page.tsx", import.meta.url)),
      "utf8",
    );
    assert.match(page, /query\.reviewer/);
    assert.doesNotMatch(page, /query\.email|searchParams\.get\("email"\)/);
  });

  test("a reviewer id the team cannot see gives the no-match line", async () => {
    const { store, calls } = throwingStore();
    const d: DataDeps = {
      findExperiment: () => PRICING,
      findAccountIds: async () => [],
      findAccountEmail: async () => null,
      store: { ...store, findReviewerEmails: async () => null },
    };
    assert.equal(await loadReviewerWith(d, DEVELOPER, REVIEWER_ID), null);
    for (const id of ["ana@example.com", "", undefined, ["x"]])
      assert.equal(await loadReviewerWith(d, DEVELOPER, id), null);
    assert.equal(calls(), 0);
    assert.equal(DATA_WORDS.noMatch, "Nothing is held for that email.");
  });

  test("the nav's Data entry is a link, for developers and admins", () => {
    const data = ADMIN_NAV.find((e) => e.title === "Data")!;
    assert.equal(data.ready, true);
    assert.equal(data.href, "/admin/data");
    for (const role of ["developer", "admin"] as const)
      assert.ok(
        adminNavFor(role).some((e) => e.href === "/admin/data" && e.ready),
      );
  });
});

describe("the record of actions", () => {
  test("reads each action name in words, never naming a reviewer; an unknown name reads as itself", () => {
    const title = (slug: string) =>
      slug === "pricing-2026" ? "Pricing 2026" : slug;
    const row = (
      action: string,
      extra: Partial<{
        slug: string | null;
        targetEmail: string | null;
        counts: Record<string, number> | null;
      }> = {},
    ) => ({
      action,
      slug: "pricing-2026",
      targetEmail: null,
      counts: null,
      ...extra,
    });
    assert.equal(
      recordWords(row("code-made"), title),
      "Made a code on Pricing 2026",
    );
    assert.equal(
      recordWords(row("code-replaced"), title),
      "Replaced a code on Pricing 2026",
    );
    assert.equal(
      recordWords(row("code-revoked"), title),
      "Revoked a code on Pricing 2026",
    );
    assert.equal(
      recordWords(
        row("role-change", { slug: null, targetEmail: "ben@example.com" }),
        title,
      ),
      "Changed the role of ben@example.com",
    );
    assert.equal(
      recordWords(
        row("data-deleted", { counts: { reviewers: 5, teamNotes: 6 } }),
        title,
      ),
      "Deleted data from 5 reviewers on Pricing 2026",
    );
    assert.equal(
      recordWords(row("data-deleted", { counts: { teamNotes: 2 } }), title),
      "Deleted team notes on Pricing 2026",
    );
    assert.equal(
      recordWords(
        row("reviewer-erased", {
          slug: null,
          counts: { comments: 14, reviewVersions: 3, viewEvents: 41 },
        }),
        title,
      ),
      "Erased a reviewer: 14 comments, 3 review versions, 41 views",
    );
    assert.equal(recordWords(row("archive-made"), title), "archive-made");
  });

  test("a page is 50 rows, newest first as the store gives them; a page past the end reads the last", async () => {
    const asked: number[] = [];
    const { deps: d } = deps({
      listActions: async (_m, { page }) => {
        asked.push(page);
        return {
          rows: [
            {
              id: "r1",
              at: new Date("2026-10-06T10:00:00Z"),
              actorEmail: "sam@example.com",
              action: "code-made",
              slug: "pricing-2026",
              targetEmail: null,
              counts: null,
            },
          ],
          page,
          total: 51,
        };
      },
    });
    const record = await loadRecordWith(d, DEVELOPER, 7);
    assert.deepEqual(asked, [7, 2]);
    assert.equal(record.pages, 2);
    assert.equal(record.page, 2);
    assert.deepEqual(record.rows[0], {
      id: "r1",
      at: "2026-10-06T10:00:00.000Z",
      who: "sam@example.com",
      what: "Made a code on Pricing 2026",
    });
    for (const raw of [undefined, "0", "-1", "1.5", "x", ["2"]])
      assert.equal(parsePage(raw), 1);
    assert.equal(parsePage("3"), 3);
  });
});

describe("the ?state= keys", () => {
  test("every data-tab and data-page key is registered for the team, and each renders a view", () => {
    for (const key of [...DATA_TAB_STATE_KEYS, ...DATA_PAGE_STATE_KEYS])
      assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
    const registered = Object.keys(SANDBOX_STATE_KEYS).filter((k) =>
      k.startsWith("data-"),
    );
    assert.deepEqual(
      registered.sort(),
      [...DATA_TAB_STATE_KEYS, ...DATA_PAGE_STATE_KEYS].sort(),
    );
    const experiment = {
      slug: "pricing-2026",
      title: "Pricing 2026",
      open: true,
    };
    for (const key of DATA_TAB_STATE_KEYS) {
      const view = dataTabStateView(key, experiment) as DataTabView;
      assert.ok(view?.fixture, key);
    }
    for (const key of DATA_PAGE_STATE_KEYS)
      assert.ok(dataPageStateView(key)?.fixture, key);
    assert.equal(dataTabStateView("codes-empty", experiment), null);
    assert.equal(dataPageStateView(null), null);
  });

  test("the partial state shows what loaded and pauses the delete; nothing held shows no delete", () => {
    const experiment = {
      slug: "pricing-2026",
      title: "Pricing 2026",
      open: true,
    };
    const partial = dataTabStateView("data-tab-partial", experiment)!;
    assert.deepEqual(deletePanel(partial), { kind: "partial" });
    assert.equal(
      holdsLine(partial.title, partial.counts!),
      "Pricing 2026 holds: 5 access codes, — views, 23 comments, 4 reviews (— versions), 6 team notes.",
    );
    assert.deepEqual(
      deletePanel(dataTabStateView("data-tab-empty", experiment)!),
      { kind: "nothing-held" },
    );
    assert.equal(
      deletePanel(dataTabStateView("data-tab-offline", experiment)!).kind,
      "admin",
    );
    assert.deepEqual(
      deletePanel(dataTabStateView("data-tab-offline", experiment)!),
      { kind: "admin", reviewers: 5, enabled: false },
    );
  });

  test("no fixture or word holds a real reviewer: the fixtures' emails are example.com and example.org", () => {
    const text = JSON.stringify([
      ...DATA_PAGE_STATE_KEYS.map((k) => dataPageStateView(k)),
    ]);
    for (const email of text.match(/[\w.+-]+@[\w.-]+/g) ?? [])
      assert.match(email, /@example\.(com|org)$/);
  });
});
