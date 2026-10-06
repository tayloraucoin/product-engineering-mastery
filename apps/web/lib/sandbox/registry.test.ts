import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  REGISTRY_ERRORS as E,
  experiments,
  findExperiment,
  registeredConfigs,
  validateRegistry,
} from "../../app/experimental/_experiments/registry.ts";
import { SANDBOX_TIME_ZONE, todayIn } from "./time.ts";

const EXPERIMENTS_DIR = new URL(
  "../../app/experimental/_experiments/",
  import.meta.url,
);

/** Every experiment folder: a directory under _experiments. */
function experimentFolders(): string[] {
  return readdirSync(EXPERIMENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/** A synthetic config that passes; each refusal test breaks one field. */
function validConfig(overrides: Record<string, unknown> = {}) {
  const load = async () => () => null;
  return {
    slug: "synthetic-check",
    title: "Synthetic check",
    designs: [
      { id: "circle", shape: "circle", component: load },
      { id: "square", shape: "square", component: load },
    ],
    goals: ["First synthetic goal", "Second synthetic goal"],
    questions: [{ id: "extra", text: "A synthetic extra question?" }],
    mode: "private",
    coreVersion: "v1",
    closedOn: null,
    ...overrides,
  };
}

const NOW = new Date("2026-10-06T12:00:00Z");

function messagesFor(configs: unknown[], now: Date = NOW): string[] {
  const result = validateRegistry(configs, now);
  return result.ok ? [] : result.errors.map((e) => e.message);
}

function assertRefused(config: unknown, message: string) {
  const messages = messagesFor([config]);
  assert.ok(
    messages.includes(message),
    `expected "${message}", got ${JSON.stringify(messages)}`,
  );
}

function design(id: string, shape: string) {
  return { id, shape, component: async () => () => null };
}

describe("C1: every registered config", () => {
  test("C1: the registry parses at load and finds each experiment by slug", () => {
    assert.ok(experiments.length > 0);
    assert.equal(validateRegistry(registeredConfigs, new Date()).ok, true);
    for (const experiment of experiments)
      assert.equal(findExperiment(experiment.slug), experiment);
    assert.equal(findExperiment("not-registered"), null);
  });

  test("C1: each folder holds a config whose slug is the folder, listed once", async () => {
    const folders = experimentFolders();
    assert.ok(folders.length > 0);
    for (const folder of folders) {
      const exported: Record<string, unknown> = await import(
        new URL(`${folder}/config.ts`, EXPERIMENTS_DIR).href
      );
      const configs = Object.values(exported) as { slug?: unknown }[];
      assert.equal(configs.length, 1, `${folder}/config.ts exports one config`);
      assert.equal(configs[0]?.slug, folder);
      assert.equal(
        registeredConfigs.filter((c) => c === configs[0]).length,
        1,
        `${folder} is registered once`,
      );
    }
    assert.deepEqual(
      experiments.map((e) => e.slug).sort(),
      [...folders].sort(),
    );
  });

  test("C1: pricing-2026 has Circle and Square, 2 or 3 goals, private, open", () => {
    const demo = findExperiment("pricing-2026");
    assert.ok(demo);
    assert.deepEqual(
      demo.designs.map((d) => [d.id, d.shape]),
      [
        ["circle", "circle"],
        ["square", "square"],
      ],
    );
    assert.ok(demo.goals.length >= 2 && demo.goals.length <= 3);
    assert.equal(demo.mode, "private");
    assert.equal(demo.coreVersion, "v1");
    assert.equal(demo.closedOn, null);
  });
});

describe("C2: the validator refuses a bad config, naming the field", () => {
  test("C2: the synthetic base config passes", () => {
    assert.deepEqual(messagesFor([validConfig()]), []);
  });

  test("C2: a duplicate slug", () => {
    assert.deepEqual(validateRegistry([validConfig(), validConfig()], NOW), {
      ok: false,
      errors: [{ index: 1, message: E.slugDuplicate }],
    });
  });

  test("C2: a duplicate slug is reported even when the first config has another error", () => {
    assert.deepEqual(
      validateRegistry([validConfig({ mode: "public" }), validConfig()], NOW),
      {
        ok: false,
        errors: [
          { index: 0, message: E.mode },
          { index: 1, message: E.slugDuplicate },
        ],
      },
    );
  });

  test("C2: a misspelled field is refused, not dropped", () => {
    assertRefused(
      validConfig({ targetedquestion: "A misspelled field" }),
      E.unknownField,
    );
  });

  test("C2: a bad slug", () => {
    for (const slug of [
      "Pricing-2026",
      "-pricing",
      "pricing-",
      "pricing--2026",
      "pricing 2026",
      "",
    ])
      assertRefused(validConfig({ slug }), E.slugPattern);
    const longest = "a".repeat(48);
    assert.deepEqual(messagesFor([validConfig({ slug: longest })]), []);
    assertRefused(validConfig({ slug: `${longest}a` }), E.slugLength);
  });

  test("C2: 0 or 5 designs", () => {
    assertRefused(validConfig({ designs: [] }), E.designsCount);
    assertRefused(
      validConfig({
        designs: [
          design("a", "circle"),
          design("b", "square"),
          design("c", "triangle"),
          design("d", "diamond"),
          design("e", "circle"),
        ],
      }),
      E.designsCount,
    );
    assert.deepEqual(
      messagesFor([
        validConfig({
          designs: [
            design("a", "circle"),
            design("b", "square"),
            design("c", "triangle"),
            design("d", "diamond"),
          ],
        }),
      ]),
      [],
    );
  });

  test("C2: two designs sharing a shape or an id", () => {
    assertRefused(
      validConfig({ designs: [design("a", "circle"), design("b", "circle")] }),
      E.designShapeDuplicate,
    );
    assertRefused(
      validConfig({ designs: [design("a", "circle"), design("a", "square")] }),
      E.designIdDuplicate,
    );
    assertRefused(
      validConfig({ designs: [design("a", "hexagon")] }),
      E.designShape,
    );
    assertRefused(
      validConfig({
        designs: [{ id: "a", shape: "circle", component: "./a.tsx" }],
      }),
      E.designComponent,
    );
  });

  test("C2: 1 or 4 goals", () => {
    assertRefused(validConfig({ goals: ["Only one"] }), E.goalsCount);
    assertRefused(
      validConfig({ goals: ["One", "Two", "Three", "Four"] }),
      E.goalsCount,
    );
    assertRefused(validConfig({ goals: ["One", " "] }), E.goalText);
  });

  test("C2: an unknown mode or core version", () => {
    assertRefused(validConfig({ mode: "public" }), E.mode);
    assertRefused(validConfig({ mode: undefined }), E.mode);
    assertRefused(validConfig({ coreVersion: "v2" }), E.coreVersion);
  });

  test("C2: messages are fixed and never echo the config", () => {
    const secret = "Client-Name-Leak";
    const messages = messagesFor([validConfig({ slug: secret, mode: secret })]);
    assert.ok(messages.length > 0);
    for (const message of messages) assert.ok(!message.includes(secret));
    const fixed = new Set<string>(Object.values(E));
    for (const message of messages) assert.ok(fixed.has(message), message);
  });

  test("C2: a malformed config, design or question still gets a fixed message", () => {
    const cases: [unknown, string][] = [
      [null, E.config],
      ["pricing-2026", E.config],
      [validConfig({ designs: [null] }), E.design],
      [validConfig({ questions: [null] }), E.questions],
      [validConfig({ questions: [{ text: "No id" }] }), E.questions],
    ];
    for (const [config, message] of cases)
      assert.deepEqual(messagesFor([config]), [message]);
  });
});

describe("C3: closedOn is never after today in Europe/London", () => {
  test("C3: the zone is one constant", () => {
    assert.equal(SANDBOX_TIME_ZONE, "Europe/London");
  });

  test("C3: today passes and tomorrow is refused", () => {
    assert.deepEqual(
      messagesFor([validConfig({ closedOn: "2026-10-06" })]),
      [],
    );
    assert.deepEqual(
      messagesFor([validConfig({ closedOn: "2025-01-31" })]),
      [],
    );
    assertRefused(validConfig({ closedOn: "2026-10-07" }), E.closedOnFuture);
  });

  test("C3: at 23:30 UTC in summer, London's date already counts as today", () => {
    const lateSummer = new Date("2026-07-15T23:30:00Z");
    assert.equal(lateSummer.toISOString().slice(0, 10), "2026-07-15");
    assert.equal(todayIn(SANDBOX_TIME_ZONE, lateSummer), "2026-07-16");
    assert.deepEqual(
      messagesFor([validConfig({ closedOn: "2026-07-16" })], lateSummer),
      [],
    );
    assert.deepEqual(
      messagesFor([validConfig({ closedOn: "2026-07-17" })], lateSummer),
      [E.closedOnFuture],
    );
  });

  test("C3: across both clock changes, London's date is the one checked", () => {
    // The night the clocks go back: 23:30 UTC is 00:30 BST, the next day.
    assert.equal(
      todayIn(SANDBOX_TIME_ZONE, new Date("2026-10-24T23:30:00Z")),
      "2026-10-25",
    );
    // The morning the clocks go forward: 00:30 UTC is still 00:30 GMT.
    assert.equal(
      todayIn(SANDBOX_TIME_ZONE, new Date("2026-03-29T00:30:00Z")),
      "2026-03-29",
    );
    assert.deepEqual(
      messagesFor(
        [validConfig({ closedOn: "2026-10-25" })],
        new Date("2026-10-24T23:30:00Z"),
      ),
      [],
    );
  });

  test("C3: in winter London's date is the UTC date", () => {
    const lateWinter = new Date("2026-01-15T23:30:00Z");
    assert.equal(todayIn(SANDBOX_TIME_ZONE, lateWinter), "2026-01-15");
    assert.deepEqual(
      messagesFor([validConfig({ closedOn: "2026-01-15" })], lateWinter),
      [],
    );
    assert.deepEqual(
      messagesFor([validConfig({ closedOn: "2026-01-16" })], lateWinter),
      [E.closedOnFuture],
    );
  });

  test("C3: closedOn is an ISO date or null", () => {
    for (const closedOn of [
      "2026-02-30",
      "06/10/2026",
      "2026-10-06T00:00:00Z",
      "",
      undefined,
    ])
      assertRefused(validConfig({ closedOn }), E.closedOnFormat);
  });
});

// Reads the source as text: it sees literal `<section ...>` tags and literal
// `data-sandbox-region="..."` attributes, which is how the demo marks regions.
describe("C4: every <section> of each demo design is marked", () => {
  const demo = findExperiment("pricing-2026");
  assert.ok(demo);
  for (const { id } of demo.designs) {
    test(`C4: ${id} marks each section with a unique region id and a name`, () => {
      const source = readFileSync(
        new URL(`pricing-2026/${id}.tsx`, EXPERIMENTS_DIR),
        "utf8",
      );
      const sections = [...source.matchAll(/<section\b([^>]*)>/g)];
      assert.ok(sections.length >= 3, "the design has its sections");
      const regionIds: string[] = [];
      for (const [, attributes = ""] of sections) {
        const region = /data-sandbox-region="([a-z0-9-]+)"/.exec(attributes);
        const name = /data-sandbox-name="([^"]*\S[^"]*)"/.exec(attributes);
        assert.ok(region, `a section has no region id: ${attributes.trim()}`);
        assert.ok(name, `section ${region[1]} has no human name`);
        regionIds.push(region[1] ?? "");
      }
      const everyMarker = [
        ...source.matchAll(/data-sandbox-region="([^"]*)"/g),
      ].map((m) => m[1]);
      assert.deepEqual(everyMarker, regionIds, "only sections carry markers");
      assert.equal(new Set(regionIds).size, regionIds.length, "ids are unique");
    });
  }
});
