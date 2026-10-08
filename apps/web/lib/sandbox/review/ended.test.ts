import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";

import type { ExperimentConfig } from "../../../app/experimental/_experiments/registry.ts";
import { queueKey, type StorageLike } from "../client/queue.ts";
import { draftKey } from "../client/review-form.ts";
import { recordViewWith } from "../experiment/experiment.ts";
import { gatePath, gateView } from "../gate/gate.ts";
import {
  resolveViewerWith,
  type ResolveViewerDeps,
  type ViewerResult,
} from "../shared/access-check.ts";
import { signAccessCookie } from "../shared/cookie.ts";
import { readSandboxState, SANDBOX_STATE_KEYS } from "../shared/state.ts";
import {
  arriveEnded,
  clearUnsent,
  ENDED_FIXTURES,
  ENDED_STATE_KEYS,
  ENDED_WORDS,
  endedDate,
  endedLines,
  endedPageWith,
  readUnsent,
  takeDraft,
  type EndedDeps,
} from "./ended.ts";

const SECRET = "synthetic-sandbox-secret-for-tests-only-0123456789";
const NOW = new Date("2026-10-06T09:00:00Z");
const ACCESS_ID = "00000000-0000-4000-8000-0000000000a1";
const REVIEWER_ID = "00000000-0000-4000-8000-0000000000b1";
const OTHER_REVIEWER = "00000000-0000-4000-8000-0000000000b2";
const USER_ID = "00000000-0000-4000-8000-0000000000c1";
const SLUG = "closed-2026";
const SENT_AT = new Date("2026-10-03T12:00:00.000Z");

const EXPERIMENTS: Record<string, ExperimentConfig> = {
  "pricing-2026": {
    slug: "pricing-2026",
    closedOn: null,
    designs: [{ id: "circle" }],
  } as never,
  [SLUG]: {
    slug: SLUG,
    closedOn: "2026-09-30",
    designs: [{ id: "circle" }],
  } as never,
};

function resolveAs(
  slug: string,
  overrides: Partial<ResolveViewerDeps> = {},
): Promise<ViewerResult> {
  return resolveViewerWith(
    {
      getTeamMember: async () => null,
      findExperiment: (s) => EXPERIMENTS[s] ?? null,
      readAccessCookies: () => [],
      secret: SECRET,
      now: NOW,
      getUserId: async () => null,
      checkAccess: () => {
        throw new Error("the database was reached");
      },
      ...overrides,
    },
    slug,
  );
}

const liveOn = (slug: string) =>
  resolveAs(slug, {
    readAccessCookies: () => [
      signAccessCookie(SECRET, { accessId: ACCESS_ID, slug, issuedAt: NOW }),
    ],
    checkAccess: async () => ({ reviewerId: REVIEWER_ID, accessId: ACCESS_ID }),
  });

const teamOn = (slug: string, role: "developer" | "admin") =>
  resolveAs(slug, {
    getTeamMember: async () => ({
      userId: USER_ID,
      email: "team@example.com",
      role,
    }),
  });

const blank = (slug: string) => ({
  path: gatePath(slug),
  prefilledEmail: null,
  accountEmail: null,
  state: null,
});

/** Deps that record each read; anything else the page could call is absent. */
function recordingDeps(sentAt: Date | null = SENT_AT) {
  const calls: unknown[] = [];
  const deps: EndedDeps = {
    latestSentAt: async (viewer) => {
      calls.push(viewer);
      return sentAt;
    },
  };
  return { deps, calls };
}

/** An in-memory Storage that can be told to throw. */
function fakeStorage(
  entries: Record<string, string> = {},
  throws: "never" | "always" | "on-remove" = "never",
) {
  const map = new Map(Object.entries(entries));
  const storage: StorageLike = {
    getItem(key) {
      if (throws === "always") throw new Error("SecurityError");
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key, value) {
      if (throws !== "never") throw new Error("QuotaExceededError");
      map.set(key, value);
    },
    removeItem(key) {
      if (throws !== "never") throw new Error("SecurityError");
      map.delete(key);
    },
  };
  return { storage, map };
}

const entry = (id: string, body: unknown) => ({
  id,
  number: 1,
  design: "circle",
  kind: null,
  body,
  anchor: { marked: "hero", x: 0.5, y: 0.5 },
  viewportW: 1280,
  viewportH: 800,
  clientCreatedAt: "2026-10-02T10:00:00.000Z",
});

const FIRST = "The price under Pro wraps onto two lines at this width.";
const SECOND = "Is the yearly toggle meant to keep my place in the table?";
const ELSEWHERE = "A comment on another experiment.";

describe("C1: a live access on a closed experiment gets the Ended view", () => {
  test("C1: LAB-5's ended gives the Ended view with the latest send, never the gate or its error", async () => {
    const result = await liveOn(SLUG);
    assert.equal(result.kind, "ended");
    assert.deepEqual(gateView(result, blank(SLUG)), { kind: "ended" });
    const { deps, calls } = recordingDeps();
    const props = await endedPageWith(deps, result, null);
    assert.deepEqual(props, {
      sentAt: SENT_AT.toISOString(),
      browser: { kind: "live", slug: SLUG, reviewerId: REVIEWER_ID },
    });
    // One read, as the reviewer themself.
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], {
      kind: "reviewer",
      slug: SLUG,
      reviewerId: REVIEWER_ID,
      accessId: ACCESS_ID,
    });
    // No send gives the not-sent line.
    const none = await endedPageWith(recordingDeps(null).deps, result, null);
    assert.equal(none?.sentAt, null);
  });

  test("C1: the view action writes no view event for an ended reviewer", async () => {
    let written = 0;
    const outcome = await recordViewWith(
      {
        resolveViewer: () => liveOn(SLUG),
        recordViewEvent: async () => {
          written++;
        },
      },
      SLUG,
      { kind: "load", design: "circle" },
    );
    assert.deepEqual(outcome, { kind: "not-counted" });
    assert.equal(written, 0);
  });

  test("C1: the Ended view and its leaves import no action, call no fetch or beacon, and touch storage only through ended.ts (source scan: node cannot load TSX)", () => {
    const dir = new URL(
      "../../../app/experimental/[slug]/_components/ended/",
      import.meta.url,
    );
    const files = readdirSync(dir).filter((f) => f.endsWith(".tsx"));
    assert.deepEqual(files.sort(), [
      "ended-browser.tsx",
      "ended-sent-line.tsx",
      "ended.tsx",
    ]);
    for (const file of files) {
      const source = readFileSync(new URL(file, dir), "utf8");
      for (const banned of [
        /actions/,
        /\bfetch\(/,
        /sendBeacon/,
        /recordView/,
        /\.(getItem|setItem|removeItem|clear)\(/,
        /beforeunload/,
      ])
        assert.doesNotMatch(source, banned, `${file}: ${banned}`);
    }
  });
});

describe("C2: the team and anyone without a live code never reach the Ended view", () => {
  test("C2: a developer or admin on a closed experiment gets the experiment branch", async () => {
    for (const role of ["developer", "admin"] as const) {
      const result = await teamOn(SLUG, role);
      assert.deepEqual(gateView(result, blank(SLUG)), { kind: "experiment" });
      const { deps, calls } = recordingDeps();
      assert.equal(await endedPageWith(deps, result, null), null);
      assert.equal(calls.length, 0);
    }
  });

  test("C2: a request without a live code gets the gate, on a closed and an open experiment", async () => {
    for (const slug of [SLUG, "pricing-2026", "no-such-review"]) {
      const result = await resolveAs(slug);
      assert.equal(gateView(result, blank(slug)).kind, "gate");
      const { deps, calls } = recordingDeps();
      assert.equal(await endedPageWith(deps, result, null), null);
      assert.equal(calls.length, 0);
    }
  });

  test("C2: a live reviewer on an open experiment gets the experiment, not the Ended view", async () => {
    const result = await liveOn("pricing-2026");
    assert.deepEqual(gateView(result, blank("pricing-2026")), {
      kind: "experiment",
    });
    assert.equal(await endedPageWith(recordingDeps().deps, result, null), null);
  });

  test("C2: the ended keys are team-only on synthetic fixtures; a reviewer or guest with one renders as if absent", async () => {
    for (const key of ENDED_STATE_KEYS) {
      assert.equal(SANDBOX_STATE_KEYS[key], "team");
      assert.equal(readSandboxState(key, "reviewer"), null);
      assert.equal(readSandboxState(key, "guest"), null);
      assert.equal(readSandboxState(key, "team"), key);
      const team = await teamOn(SLUG, "developer");
      const { deps, calls } = recordingDeps();
      assert.deepEqual(
        await endedPageWith(deps, team, key),
        ENDED_FIXTURES[key],
      );
      assert.equal(calls.length, 0, "a fixture reads nothing");
      assert.equal(ENDED_FIXTURES[key].browser.kind, "fixture");
    }
    // A reviewer's request never carries the key past readSandboxState.
    const ended = await liveOn(SLUG);
    const props = await endedPageWith(recordingDeps().deps, ended, null);
    assert.equal(props?.browser.kind, "live");
  });
});

describe("C3: this browser's unsent comments", () => {
  const stored = () =>
    fakeStorage({
      [queueKey(SLUG, REVIEWER_ID)]: JSON.stringify([
        entry("p1", FIRST),
        entry("p2", SECOND),
      ]),
      [queueKey("pricing-2026", REVIEWER_ID)]: JSON.stringify([
        entry("p3", ELSEWHERE),
      ]),
      [queueKey(SLUG, OTHER_REVIEWER)]: JSON.stringify([
        entry("p4", ELSEWHERE),
      ]),
    });

  test("C3: 2 queued here and 1 elsewhere show the count and both texts; after pagehide only this queue is gone", () => {
    const { storage, map } = stored();
    const page = new EventTarget();
    const { state, stop } = arriveEnded(storage, page, SLUG, REVIEWER_ID);
    assert.deepEqual(state.unsent, [FIRST, SECOND]);
    assert.equal(
      endedLines(null, state).unsent,
      "2 comments in this browser weren't sent before it closed.",
    );
    // Shown, not yet cleared.
    assert.ok(map.has(queueKey(SLUG, REVIEWER_ID)));
    page.dispatchEvent(new Event("pagehide"));
    assert.equal(map.has(queueKey(SLUG, REVIEWER_ID)), false);
    assert.ok(map.has(queueKey("pricing-2026", REVIEWER_ID)));
    assert.ok(map.has(queueKey(SLUG, OTHER_REVIEWER)));
    stop();
  });

  test("C3: beforeunload clears nothing, and after stop pagehide clears nothing", () => {
    const { storage, map } = stored();
    const page = new EventTarget();
    const { stop } = arriveEnded(storage, page, SLUG, REVIEWER_ID);
    page.dispatchEvent(new Event("beforeunload"));
    assert.ok(map.has(queueKey(SLUG, REVIEWER_ID)));
    stop();
    page.dispatchEvent(new Event("pagehide"));
    assert.ok(map.has(queueKey(SLUG, REVIEWER_ID)));
  });

  test("C3: only body strings are read; entries without one are skipped", () => {
    const { storage } = fakeStorage({
      [queueKey(SLUG, REVIEWER_ID)]: JSON.stringify([
        entry("p1", FIRST),
        entry("p2", 42),
        { id: "p3" },
        null,
        entry("p4", "   "),
        entry("p5", SECOND),
      ]),
    });
    assert.deepEqual(readUnsent(storage, SLUG, REVIEWER_ID), [FIRST, SECOND]);
  });

  test("C3: one queued comment reads in the singular", () => {
    assert.equal(
      endedLines(null, { unsent: [FIRST], draftCleared: false }).unsent,
      "1 comment in this browser wasn't sent before it closed.",
    );
  });

  test("C3: a malformed queue or a throwing storage shows no count and no error", () => {
    for (const raw of ["{not json", '{"id":"p1"}', "null", "42", '"text"'])
      assert.deepEqual(
        readUnsent(
          fakeStorage({ [queueKey(SLUG, REVIEWER_ID)]: raw }).storage,
          SLUG,
          REVIEWER_ID,
        ),
        [],
        raw,
      );
    const throwing = fakeStorage(
      { [queueKey(SLUG, REVIEWER_ID)]: JSON.stringify([entry("p1", FIRST)]) },
      "always",
    );
    const page = new EventTarget();
    const { state } = arriveEnded(throwing.storage, page, SLUG, REVIEWER_ID);
    assert.deepEqual(state, { unsent: [], draftCleared: false });
    assert.equal(endedLines(null, state).unsent, null);
    assert.doesNotThrow(() => page.dispatchEvent(new Event("pagehide")));
    assert.doesNotThrow(() => clearUnsent(throwing.storage, SLUG, REVIEWER_ID));
    assert.deepEqual(arriveEnded(null, page, SLUG, REVIEWER_ID).state, {
      unsent: [],
      draftCleared: false,
    });
  });
});

describe("C4: this browser's unsent review draft", () => {
  const draft = JSON.stringify({
    answers: { overall: "very" },
    triage: { comments: {} },
  });

  test("C4: a draft for this experiment is removed on arrival and the draft line shows", () => {
    const { storage, map } = fakeStorage({
      [draftKey(SLUG, REVIEWER_ID)]: draft,
      [draftKey("pricing-2026", REVIEWER_ID)]: draft,
      [draftKey(SLUG, OTHER_REVIEWER)]: draft,
    });
    const { state, stop } = arriveEnded(
      storage,
      new EventTarget(),
      SLUG,
      REVIEWER_ID,
    );
    assert.equal(state.draftCleared, true);
    assert.equal(map.has(draftKey(SLUG, REVIEWER_ID)), false);
    assert.ok(map.has(draftKey("pricing-2026", REVIEWER_ID)));
    assert.ok(map.has(draftKey(SLUG, OTHER_REVIEWER)));
    assert.equal(endedLines(null, state).draft, ENDED_WORDS.draft);
    stop();
  });

  test("C4: with no draft the line is absent", () => {
    const { storage } = fakeStorage({
      [draftKey("pricing-2026", REVIEWER_ID)]: draft,
    });
    const { state } = arriveEnded(
      storage,
      new EventTarget(),
      SLUG,
      REVIEWER_ID,
    );
    assert.equal(state.draftCleared, false);
    assert.equal(endedLines(null, state).draft, null);
  });

  test("C4: a draft that cannot be removed claims no clear", () => {
    const { storage } = fakeStorage(
      { [draftKey(SLUG, REVIEWER_ID)]: draft },
      "on-remove",
    );
    assert.equal(takeDraft(storage, SLUG, REVIEWER_ID), false);
    assert.equal(
      takeDraft(fakeStorage({}, "always").storage, SLUG, REVIEWER_ID),
      false,
    );
    assert.equal(takeDraft(null, SLUG, REVIEWER_ID), false);
  });
});

describe("Words: ended.md verbatim", () => {
  test("the heading, the lines, the toggle and the footer read as ended.md says", () => {
    assert.equal(ENDED_WORDS.heading, "This review has ended");
    assert.equal(
      endedLines(
        SENT_AT.toISOString(),
        { unsent: [], draftCleared: false },
        false,
      ).base,
      "The team has your review, sent on 3 October. Nothing more can be added now.",
    );
    assert.equal(
      endedLines(null, { unsent: [], draftCleared: false }).base,
      "The team is no longer taking feedback on this one. Any comments you left before it closed have been kept.",
    );
    assert.equal(
      endedLines(null, { unsent: [FIRST, SECOND], draftCleared: true }).unsent,
      "2 comments in this browser weren't sent before it closed.",
    );
    assert.equal(
      ENDED_WORDS.draft,
      "Answers you hadn't sent couldn't be added, and have been cleared from this browser.",
    );
    assert.equal(ENDED_WORDS.show, "Show them");
    assert.equal(ENDED_WORDS.hide, "Hide them");
    assert.equal(
      `${ENDED_WORDS.footerLead} ${ENDED_WORDS.email}`,
      "Questions? Email hello@example.com",
    );
  });

  test("the date is the instant in the reader's locale and zone; before hydration it reads in UTC", () => {
    const late = "2026-10-03T23:30:00.000Z";
    assert.equal(endedDate(late, false), "3 October");
    const local = endedDate(late, true);
    assert.equal(
      local,
      new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
      }).format(new Date(late)),
    );
  });

  test("the fixtures are synthetic: 3 October and two invented comments", () => {
    assert.equal(
      ENDED_FIXTURES["ended-success"].sentAt,
      "2026-10-03T12:00:00.000Z",
    );
    assert.equal(ENDED_FIXTURES["ended-empty"].sentAt, null);
    const partial = ENDED_FIXTURES["ended-draft-partial"].browser;
    assert.ok(partial.kind === "fixture" && partial.state.unsent.length === 2);
    assert.ok(partial.kind === "fixture" && partial.state.draftCleared);
  });
});
