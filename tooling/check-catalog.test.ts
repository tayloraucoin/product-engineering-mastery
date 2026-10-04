/**
 * check-catalog (CAT-3 C2): states are derived from the tree, and every way
 * the plan and the tree can disagree is reported. Each case builds a small
 * synthetic repo under $TMPDIR; every name in it is synthetic.
 */

import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { checkCatalog } from "./check-catalog.ts";

const scratch = mkdtempSync(path.join(tmpdir(), "check-catalog-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const SOURCES = {
  custom: {
    label: "Custom",
    name: "Custom",
    verdict: "unruled",
    licence: "house",
    homepage: null,
    ruling: "CS-07",
  },
  shadcn: {
    label: "shadcn",
    name: "shadcn/ui",
    verdict: "shelf",
    licence: "MIT",
    homepage: null,
    ruling: "CS-01",
  },
};

const ENTRIES = [
  {
    id: "probe-dial",
    name: "Dial",
    source: "shadcn",
    target: "ui",
    path: "packages/ui/src/primitives/control/probe-dial",
    kind: "control",
    layer: "primitive",
    wave: 0,
    ticket: "ZZ-1",
  },
  {
    id: "probe-meter",
    name: "Meter",
    source: "custom",
    target: "catalog",
    path: "packages/catalog/src/custom/display/probe-meter",
    kind: "display",
    layer: "composed",
    wave: null,
    ticket: "ZZ-1",
  },
  {
    id: "probe-later",
    name: "Later",
    source: "shadcn",
    target: "ui",
    path: "packages/ui/src/primitives/layout/probe-later",
    kind: "layout",
    layer: "primitive",
    wave: 1,
    ticket: "ZZ-2",
  },
  {
    id: "probe-link",
    name: "Linked",
    source: "custom",
    target: "catalog",
    path: "packages/catalog/src/custom/media/probe-link",
    kind: "media",
    layer: "composed",
    wave: null,
    ticket: "ZZ-2",
    linkOnly: {
      url: "https://example.com/synthetic",
      reason: "needs more than a rename",
    },
  },
];

function story(title: string, tags: string[], provenance = true) {
  return [
    "const meta = {",
    `  title: "${title}",`,
    `  tags: [${tags.map((t) => `"${t}"`).join(", ")}],`,
    provenance
      ? '  parameters: { provenance: { upstream: "synthetic@0000000", licence: "house" } },'
      : "",
    "};",
    "export default meta;",
    "export const Default = {};",
    "",
  ].join("\n");
}

/** A synthetic repo: the manifest, then the given files. */
function repo(files: Record<string, string>, entries: object[] = ENTRIES) {
  const root = mkdtempSync(path.join(scratch, "repo-"));
  const all = {
    "packages/catalog/manifest.json": JSON.stringify({
      sources: SOURCES,
      entries,
    }),
    ...files,
  };
  for (const [rel, text] of Object.entries(all)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), text);
  }
  return root;
}

const DIAL = "packages/ui/src/primitives/control/probe-dial";
const METER = "packages/catalog/src/custom/display/probe-meter";
const GOOD = {
  [`${DIAL}/probe-dial.tsx`]: "export const Dial = () => null;\n",
  [`${DIAL}/probe-dial.stories.tsx`]: story("Primitives/Control/Probe dial", [
    "source:shadcn",
    "verdict:kit",
    "layer:primitive",
  ]),
  [`${METER}/probe-meter.tsx`]: "export const Meter = () => null;\n",
  [`${METER}/probe-meter.stories.tsx`]: story(
    "Catalog/Display/Probe meter/Custom",
    ["source:custom", "verdict:unruled", "layer:composed"],
  ),
};

test("C2: states are derived from the tree: storied, planned and link-only, and --write makes STATUS.md current", () => {
  const root = repo(GOOD);
  const written = checkCatalog(root, { write: true });
  assert.deepEqual(written.problems, []);
  assert.equal(written.states.get("probe-dial"), "storied");
  assert.equal(written.states.get("probe-meter"), "storied");
  assert.equal(written.states.get("probe-later"), "planned");
  assert.equal(written.states.get("probe-link"), "link-only");
  assert.match(
    readFileSync(path.join(root, "packages/catalog/STATUS.md"), "utf8"),
    /\| ZZ-1 \| 2 \| 0 \| 0 \| 2 \| 0 \|/,
  );
  assert.deepEqual(checkCatalog(root).problems, []);
  assert.deepEqual(checkCatalog(root, { ticket: "ZZ-1" }).problems, []);
});

test("C2: a component with no story is present, and fails its ticket", () => {
  const files: Record<string, string> = { ...GOOD };
  delete files[`${METER}/probe-meter.stories.tsx`];
  const root = repo(files);
  checkCatalog(root, { write: true });
  const result = checkCatalog(root, { ticket: "ZZ-1" });
  assert.equal(result.states.get("probe-meter"), "present");
  assert.ok(
    result.problems.includes(
      "ZZ-1: probe-meter is present; it must be storied or link-only",
    ),
  );
});

test("C2: a planned entry fails its ticket, and a ticket with no entries is named", () => {
  const root = repo(GOOD);
  checkCatalog(root, { write: true });
  assert.ok(
    checkCatalog(root, { ticket: "ZZ-2" }).problems.includes(
      "ZZ-2: probe-later is planned; it must be storied or link-only",
    ),
  );
  assert.ok(
    checkCatalog(root, { ticket: "ZZ-9" }).problems.some((p) =>
      p.includes("no entry belongs to ZZ-9"),
    ),
  );
});

test("C2: a wrong title, a missing or wrong tag, and missing provenance are each named", () => {
  const root = repo({
    ...GOOD,
    [`${DIAL}/probe-dial.stories.tsx`]: story(
      "Dial",
      ["source:custom", "layer:primitive"],
      false,
    ),
  });
  const { problems } = checkCatalog(root, { write: true });
  const file = `${DIAL}/probe-dial.stories.tsx`;
  assert.ok(
    problems.includes(
      `${file}: title is "Dial"; it must be "Primitives/Control/Probe dial"`,
    ),
  );
  assert.ok(
    problems.includes(
      `${file}: tags lack "source:shadcn" (the manifest's probe-dial)`,
    ),
  );
  assert.ok(
    problems.includes(
      `${file}: tags lack "verdict:kit" (the manifest's probe-dial)`,
    ),
  );
  assert.ok(problems.includes(`${file}: parameters.provenance needs upstream`));
});

test("C2: a component story with no manifest entry is an orphan", () => {
  const orphan =
    "packages/catalog/src/custom/control/probe-stray/probe-stray.stories.tsx";
  const root = repo({
    ...GOOD,
    [orphan]: story("Catalog/Control/Probe stray/Custom", ["source:custom"]),
  });
  const { problems } = checkCatalog(root, { write: true });
  assert.ok(
    problems.includes(
      `${orphan}: no manifest entry; add one to packages/catalog/manifest.json`,
    ),
  );
});

test("C2: a stale STATUS.md fails until it is rewritten", () => {
  const root = repo(GOOD);
  checkCatalog(root, { write: true });
  writeFileSync(
    path.join(root, "packages/catalog/STATUS.md"),
    "# edited by hand\n",
  );
  assert.ok(
    checkCatalog(root).problems.includes(
      "packages/catalog/STATUS.md: stale; run yarn check-catalog --write",
    ),
  );
});

test("C2: a malformed entry is named: unknown source, kind outside KINDS, a block in the kit, a path off the layout", () => {
  const bad = [
    { ...ENTRIES[0], id: "x-source", source: "nowhere" },
    {
      ...ENTRIES[0],
      id: "x-kind",
      kind: "gadget",
      path: "packages/ui/src/primitives/gadget/probe-dial",
    },
    { ...ENTRIES[0], id: "x-block", layer: "block" },
    {
      ...ENTRIES[1],
      id: "x-path",
      path: "packages/catalog/src/shadcn/display/probe-meter",
    },
  ];
  const { problems } = checkCatalog(repo({}, bad));
  assert.ok(
    problems.some((p) =>
      p.includes('x-source: source "nowhere" is not in sources'),
    ),
  );
  assert.ok(
    problems.some((p) => p.includes('x-kind: kind "gadget" is not one of')),
  );
  assert.ok(problems.some((p) => p.includes("x-block: a block is a page")));
  assert.ok(
    problems.some((p) =>
      p.includes(
        "x-path: path is packages/catalog/src/shadcn/display/probe-meter; it must be packages/catalog/src/custom/display/probe-meter",
      ),
    ),
  );
});
