/**
 * Access codes' rules (LAB-15): C1 (shown once), C4 (label and display
 * name), C5 (closed), against an in-memory store that models
 * @pem/db/sandbox's code functions. The database's own cases (record rows,
 * isolation, the gate after revoke and replace) are in packages/db's
 * test:db suite.
 */

import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  CODE_DISPLAY_NAME_MAX,
  CODE_LABEL_MAX,
  codeRowsView,
  CODES_STATE_KEYS,
  CODES_WORDS,
  codesStateView,
  FIXTURE_CODE,
  replaceConfirmation,
  revokeConfirmation,
  type CodeListRow,
} from "./admin-codes-view.ts";
import {
  CODE_ACTION_REFUSED,
  makeCodeWith,
  replaceCodeWith,
  revokeCodeWith,
  type CodeActionResult,
  type CodesDeps,
  type CodesExperiment,
  type CodesStore,
} from "./admin-codes.ts";
import {
  CODE_ALPHABET,
  generateCode,
  hashCode,
  normaliseCode,
} from "./code.ts";
import { SANDBOX_STATE_KEYS } from "./state.ts";
import type { TeamMember } from "./team-check.ts";

const SITE = "https://pem.example.test";
const DEVELOPER: TeamMember = {
  userId: "00000000-0000-4000-8000-0000000000d1",
  email: "dev@example.test",
  role: "developer",
};
const ADMIN: TeamMember = { ...DEVELOPER, role: "admin" };

const EXPERIMENTS: Record<string, CodesExperiment> = {
  "open-private": { slug: "open-private", mode: "private", closedOn: null },
  "open-collab": { slug: "open-collab", mode: "collaborate", closedOn: null },
  "closed-collab": {
    slug: "closed-collab",
    mode: "collaborate",
    closedOn: "2026-09-30",
  },
};

type Reviewer = {
  id: string;
  slug: string;
  label: string;
  displayName: string | null;
  codeHash: Buffer;
  codeVersion: number;
  revoked: boolean;
};

/** An in-memory model of codes.ts: hashes unique across slugs, id and slug matched together. */
function memoryStore() {
  const reviewers: Reviewer[] = [];
  const calls: unknown[] = [];
  const store: CodesStore = {
    async makeCode(_member, input) {
      calls.push(input);
      const hash = Buffer.from(input.codeHash);
      if (reviewers.some((r) => r.codeHash.equals(hash)))
        return { taken: true };
      const id = randomUUID();
      reviewers.push({
        id,
        slug: input.slug,
        label: input.label,
        displayName: input.displayName,
        codeHash: hash,
        codeVersion: 1,
        revoked: false,
      });
      return { reviewerId: id };
    },
    async replaceCode(_member, input) {
      calls.push(input);
      const hash = Buffer.from(input.codeHash);
      if (reviewers.some((r) => r.codeHash.equals(hash)))
        return { taken: true };
      const r = reviewers.find(
        (x) => x.id === input.reviewerId && x.slug === input.slug,
      );
      if (!r) return null;
      r.codeHash = hash;
      r.codeVersion += 1;
      r.revoked = false;
      return { codeVersion: r.codeVersion };
    },
    async revokeCode(_member, input) {
      calls.push(input);
      const r = reviewers.find(
        (x) => x.id === input.reviewerId && x.slug === input.slug,
      );
      if (!r) return null;
      r.revoked = true;
      return { revoked: true };
    },
  };
  /** What listCodes returns: no hash, no code. */
  const list = (slug: string): CodeListRow[] =>
    reviewers
      .filter((r) => r.slug === slug)
      .map((r) => ({
        reviewerId: r.id,
        label: r.label,
        displayName: r.displayName,
        emailsUsed: [],
        lastUsedAt: null,
        revoked: r.revoked,
      }));
  return { store, reviewers, calls, list };
}

/** A store whose every function throws: proves a path never reaches it. */
const THROWING_STORE: CodesStore = {
  makeCode: () => {
    throw new Error("the store was called");
  },
  replaceCode: () => {
    throw new Error("the store was called");
  },
  revokeCode: () => {
    throw new Error("the store was called");
  },
};

function depsWith(
  store: CodesStore,
  overrides: Partial<CodesDeps> = {},
): CodesDeps {
  return {
    findExperiment: (slug) => EXPERIMENTS[slug] ?? null,
    generateCode,
    hashCode,
    siteUrl: SITE,
    store,
    ...overrides,
  };
}

/** Calls through `deps.store` and fails the test if any is made. */
function neverCalled(): { store: CodesStore; called: () => number } {
  let count = 0;
  const wrap =
    <K extends keyof CodesStore>(name: K) =>
    (...args: Parameters<CodesStore[K]>) => {
      count++;
      return (THROWING_STORE[name] as (...a: typeof args) => never)(...args);
    };
  return {
    store: {
      makeCode: wrap("makeCode"),
      replaceCode: wrap("replaceCode"),
      revokeCode: wrap("revokeCode"),
    },
    called: () => count,
  };
}

const sha256Hex = (normalised: string) =>
  createHash("sha256").update(normalised).digest("hex");

function assertMade(
  result: CodeActionResult,
  slug: string,
): asserts result is Extract<CodeActionResult, { outcome: "made" }> {
  assert.equal(result.outcome, "made");
  const made = result as Extract<CodeActionResult, { outcome: "made" }>;
  assert.deepEqual(Object.keys(made).sort(), ["code", "link", "outcome"]);
  assert.match(
    made.code,
    new RegExp(`^([${CODE_ALPHABET}]{4}-){3}[${CODE_ALPHABET}]{4}$`),
  );
  // The link is env's site URL plus the experiment, and nothing more (no ?r=).
  assert.equal(made.link, `${SITE}/experimental/${slug}`);
}

describe("C1: a code exists in clear only in the make or replace response", () => {
  test("C1: making a code returns it and its link once; the store gets only its hash", async () => {
    const memory = memoryStore();
    const result = await makeCodeWith(depsWith(memory.store), DEVELOPER, {
      slug: "open-private",
      label: "Ana Ruiz",
      displayName: null,
    });
    assertMade(result, "open-private");
    const normalised = normaliseCode(result.code)!;
    const [reviewer] = memory.reviewers;
    assert.equal(reviewer!.codeHash.toString("hex"), sha256Hex(normalised));
    const sent = JSON.stringify(memory.calls);
    assert.ok(!sent.includes(result.code), "the store was sent the code");
    assert.ok(!sent.includes(normalised), "the store was sent the code");
  });

  test("C1: the list read and the page's rows after Done hold neither the code nor its hash, and no read returns a code", async () => {
    const memory = memoryStore();
    const deps = depsWith(memory.store);
    const made = await makeCodeWith(deps, ADMIN, {
      slug: "open-private",
      label: "ben@example.com",
      displayName: "",
    });
    assertMade(made, "open-private");
    const reviewerId = memory.reviewers[0]!.id;
    const replaced = await replaceCodeWith(deps, ADMIN, {
      slug: "open-private",
      reviewerId,
    });
    assertMade(replaced, "open-private");
    assert.notEqual(replaced.code, made.code);
    const hash = memory.reviewers[0]!.codeHash;
    for (let read = 0; read < 2; read++) {
      const rows = memory.list("open-private");
      for (const row of rows)
        assert.deepEqual(Object.keys(row).sort(), [
          "displayName",
          "emailsUsed",
          "label",
          "lastUsedAt",
          "reviewerId",
          "revoked",
        ]);
      const view = codeRowsView(rows);
      const text = JSON.stringify({ rows, view });
      for (const secret of [
        made.code,
        replaced.code,
        normaliseCode(made.code)!,
        normaliseCode(replaced.code)!,
        hash.toString("hex"),
        hash.toString("base64"),
      ])
        assert.ok(!text.includes(secret), "a read holds a code or its hash");
    }
  });

  test("C1: a taken hash draws once more, then fails without a code", async () => {
    const memory = memoryStore();
    let draws = 0;
    const fixed = "7KQM-29XH-PATR-4WDN";
    const deps = depsWith(memory.store, {
      generateCode: () => {
        draws++;
        return fixed;
      },
    });
    const first = await makeCodeWith(deps, DEVELOPER, {
      slug: "open-private",
      label: "Ana",
      displayName: null,
    });
    assertMade(first, "open-private");
    draws = 0;
    const second = await makeCodeWith(deps, DEVELOPER, {
      slug: "open-private",
      label: "Ben",
      displayName: null,
    });
    assert.deepEqual(second, {
      outcome: "failed",
      message: CODES_WORDS.makeFailed,
    });
    assert.equal(draws, 2);
    assert.equal(memory.reviewers.length, 1);
  });

  test("C1: a store failure is failed, and carries no code", async () => {
    const result = await makeCodeWith(depsWith(THROWING_STORE), DEVELOPER, {
      slug: "open-private",
      label: "Ana",
      displayName: null,
    });
    assert.deepEqual(result, {
      outcome: "failed",
      message: CODES_WORDS.makeFailed,
    });
  });

  test("C1: the route's files never put a code in storage, a log, a URL or the page's cache", () => {
    const dir = fileURLToPath(
      new URL("../../app/admin/experiments/[slug]/codes/", import.meta.url),
    );
    const files: string[] = [];
    const walk = (at: string) => {
      for (const name of readdirSync(at)) {
        const full = path.join(at, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(name)) files.push(full);
      }
    };
    walk(dir);
    assert.ok(files.length >= 3, "the codes route's files were not found");
    const banned = [
      /localStorage/,
      /sessionStorage/,
      /indexedDB/,
      /document\.cookie/,
      /console\./,
      /history\.(push|replace)State/,
      /URLSearchParams/,
      /router\.(push|replace)\(/,
      /createLogger/,
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const pattern of banned)
        assert.ok(
          !pattern.test(source),
          `${path.relative(dir, file)} uses ${pattern}`,
        );
    }
    // Make and replace answer with the code, so neither revalidates or
    // redirects: the page re-renders after Done, from the list.
    const actions = readFileSync(path.join(dir, "actions.ts"), "utf8");
    for (const name of ["makeCode", "replaceCode"]) {
      const body = actions.slice(
        actions.indexOf(`export async function ${name}(`),
      );
      const end = body.indexOf("\n}\n");
      const fn = body.slice(0, end);
      assert.ok(fn.length > 0, `${name} not found`);
      assert.ok(!/revalidate|redirect|cookies\(/.test(fn), `${name} caches`);
    }
  });
});

describe("C4: label and display name", () => {
  test("C4: on a collaborate experiment, a make without a display name is refused, the store untouched", async () => {
    const stub = neverCalled();
    for (const displayName of [null, "", "   "]) {
      const result = await makeCodeWith(depsWith(stub.store), DEVELOPER, {
        slug: "open-collab",
        label: "Ana Ruiz",
        displayName,
      });
      assert.deepEqual(result, {
        outcome: "invalid",
        field: "displayName",
        message: CODES_WORDS.displayNameEmpty,
      });
    }
    assert.equal(stub.called(), 0);
  });

  test("C4: on a collaborate experiment the display name is stored, trimmed", async () => {
    const memory = memoryStore();
    assertMade(
      await makeCodeWith(depsWith(memory.store), DEVELOPER, {
        slug: "open-collab",
        label: "Ana Ruiz",
        displayName: " Ana ",
      }),
      "open-collab",
    );
    assert.equal(memory.reviewers[0]!.displayName, "Ana");
  });

  test("C4: on a private experiment the stored display name is null, whatever the form sent", async () => {
    const memory = memoryStore();
    for (const displayName of [null, "", "Ana"])
      assertMade(
        await makeCodeWith(depsWith(memory.store), DEVELOPER, {
          slug: "open-private",
          label: "Ana Ruiz",
          displayName,
        }),
        "open-private",
      );
    assert.deepEqual(
      memory.reviewers.map((r) => r.displayName),
      [null, null, null],
    );
  });

  test('C4: an empty label is refused with "Enter who this code is for."', async () => {
    const stub = neverCalled();
    for (const slug of ["open-private", "open-collab"])
      for (const label of ["", "   ", null, 7])
        assert.deepEqual(
          await makeCodeWith(depsWith(stub.store), DEVELOPER, {
            slug,
            label,
            displayName: "Ana",
          }),
          {
            outcome: "invalid",
            field: "label",
            message: "Enter who this code is for.",
          },
        );
    assert.equal(stub.called(), 0);
  });

  test("C4: a label or display name past its limit is refused with its own line", async () => {
    const stub = neverCalled();
    assert.deepEqual(
      await makeCodeWith(depsWith(stub.store), DEVELOPER, {
        slug: "open-collab",
        label: "x".repeat(CODE_LABEL_MAX + 1),
        displayName: "Ana",
      }),
      {
        outcome: "invalid",
        field: "label",
        message: CODES_WORDS.labelTooLong,
      },
    );
    assert.deepEqual(
      await makeCodeWith(depsWith(stub.store), DEVELOPER, {
        slug: "open-collab",
        label: "Ana",
        displayName: "x".repeat(CODE_DISPLAY_NAME_MAX + 1),
      }),
      {
        outcome: "invalid",
        field: "displayName",
        message: CODES_WORDS.displayNameTooLong,
      },
    );
    assert.equal(stub.called(), 0);
  });
});

describe("C5: a closed experiment", () => {
  test("C5: make and replace return closed with a throwing store never called; revoke still succeeds", async () => {
    const stub = neverCalled();
    const deps = depsWith(stub.store);
    const closed = { outcome: "closed", message: "This experiment is closed." };
    assert.deepEqual(
      await makeCodeWith(deps, DEVELOPER, {
        slug: "closed-collab",
        label: "Ana",
        displayName: "Ana",
      }),
      closed,
    );
    assert.deepEqual(
      await replaceCodeWith(deps, ADMIN, {
        slug: "closed-collab",
        reviewerId: randomUUID(),
      }),
      closed,
    );
    assert.equal(stub.called(), 0);

    const memory = memoryStore();
    memory.reviewers.push({
      id: randomUUID(),
      slug: "closed-collab",
      label: "Ana",
      displayName: "Ana",
      codeHash: Buffer.alloc(32, 1),
      codeVersion: 1,
      revoked: false,
    });
    assert.deepEqual(
      await revokeCodeWith(depsWith(memory.store), DEVELOPER, {
        slug: "closed-collab",
        reviewerId: memory.reviewers[0]!.id,
      }),
      { outcome: "revoked" },
    );
    assert.equal(memory.reviewers[0]!.revoked, true);
  });
});

describe("replace and revoke", () => {
  test("replace brings back a revoked code with a new one; revoke stops it", async () => {
    const memory = memoryStore();
    const deps = depsWith(memory.store);
    await makeCodeWith(deps, DEVELOPER, {
      slug: "open-private",
      label: "Ana",
      displayName: null,
    });
    const id = memory.reviewers[0]!.id;
    assert.deepEqual(
      await revokeCodeWith(deps, DEVELOPER, {
        slug: "open-private",
        reviewerId: id,
      }),
      { outcome: "revoked" },
    );
    assertMade(
      await replaceCodeWith(deps, DEVELOPER, {
        slug: "open-private",
        reviewerId: id,
      }),
      "open-private",
    );
    assert.equal(memory.reviewers[0]!.revoked, false);
    assert.equal(memory.reviewers[0]!.codeVersion, 2);
  });

  test("a reviewer id from another slug, a malformed id or an unknown slug fails without a code", async () => {
    const memory = memoryStore();
    const deps = depsWith(memory.store);
    await makeCodeWith(deps, DEVELOPER, {
      slug: "open-collab",
      label: "Ana",
      displayName: "Ana",
    });
    const id = memory.reviewers[0]!.id;
    const before = memory.reviewers[0]!.codeHash;
    for (const input of [
      { slug: "open-private", reviewerId: id },
      { slug: "open-collab", reviewerId: "not-a-uuid" },
      { slug: "no-such-slug", reviewerId: id },
      { slug: 7, reviewerId: id },
    ]) {
      const replaced = await replaceCodeWith(deps, DEVELOPER, input);
      assert.equal(replaced.outcome, "failed");
      const revoked = await revokeCodeWith(deps, DEVELOPER, input);
      assert.equal(revoked.outcome, "failed");
    }
    assert.ok(memory.reviewers[0]!.codeHash.equals(before));
    assert.equal(memory.reviewers[0]!.revoked, false);
  });

  test("anyone but a developer or an admin is refused before the store", async () => {
    const stub = neverCalled();
    const user = { ...DEVELOPER, role: "user" } as unknown as TeamMember;
    const deps = depsWith(stub.store);
    const input = {
      slug: "open-private",
      label: "Ana",
      displayName: null,
      reviewerId: randomUUID(),
    };
    assert.equal(await makeCodeWith(deps, user, input), CODE_ACTION_REFUSED);
    assert.equal(await replaceCodeWith(deps, user, input), CODE_ACTION_REFUSED);
    assert.equal(await revokeCodeWith(deps, user, input), CODE_ACTION_REFUSED);
    assert.equal(stub.called(), 0);
  });
});

describe("the tab's words and states", () => {
  test("the confirmations name the reviewer and the consequence (access-codes.md)", () => {
    assert.equal(
      replaceConfirmation("Ana Ruiz", false),
      "Replace Ana Ruiz's code? Their current code stops working. Their comments and review stay theirs.",
    );
    assert.equal(
      replaceConfirmation("Ana Ruiz", true),
      "Give Ana Ruiz a new code? Their comments and review stay theirs.",
    );
    assert.equal(
      revokeConfirmation("Ana Ruiz"),
      "Revoke Ana Ruiz's code? They won't be able to open the review again. Anything they've sent stays.",
    );
  });

  test("every codes key is registered for the team and gives a fixture view; others give none", () => {
    for (const key of CODES_STATE_KEYS) {
      assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
      const view = codesStateView(key, "open-private", SITE);
      assert.ok(view?.fixture, key);
      assert.equal(view.slug, "open-private");
    }
    assert.equal(codesStateView(null, "open-private", SITE), null);
    assert.equal(codesStateView("people-empty", "open-private", SITE), null);
  });

  test("only the shown-once fixtures hold a code, and it is the made-up one", () => {
    for (const key of CODES_STATE_KEYS) {
      const view = codesStateView(key, "open-private", SITE)!;
      const shown = view.fixture!.shownOnce;
      if (key === "codes-shown-once" || key === "codes-copied") {
        assert.equal(shown?.code, FIXTURE_CODE);
        assert.equal(shown?.link, `${SITE}/experimental/open-private`);
      } else assert.equal(shown, null, key);
    }
    assert.equal(normaliseCode(FIXTURE_CODE)?.length, 16);
  });

  test("partial shows the rows with Emails used unread; mismatch flags both kinds", () => {
    const partial = codesStateView("codes-partial", "s", SITE)!;
    assert.ok(partial.rows!.length > 0);
    for (const row of partial.rows!) {
      assert.equal(row.emailsUsed, null);
      assert.equal(row.flags, null);
    }
    const mismatch = codesStateView("codes-mismatch", "s", SITE)!;
    assert.ok(mismatch.rows!.some((r) => r.flags?.several));
    assert.ok(mismatch.rows!.some((r) => r.flags?.differsFromLabel));
    assert.equal(codesStateView("codes-closed", "s", SITE)!.closed, true);
    assert.deepEqual(codesStateView("codes-empty", "s", SITE)!.rows, []);
  });
});
