import assert from "node:assert/strict";
import { test } from "node:test";

import { DEMO_SURFACES } from "../../lib/demo/states.ts";
import type { DemoSurface } from "../../lib/demo/surfaces/types.ts";
import { captureFile, renderProblem, walkKeys } from "./capture.ts";

const fake: Record<string, DemoSurface> = {
  a: { id: "a", route: "/a", samplePath: "/a", keys: ["empty", "error"] },
  b: { id: "b", route: "/b/[id]", samplePath: "/b/1?x=1", keys: ["loading"] },
};

test("captureFile names light and dark files", () => {
  assert.equal(captureFile("a", "empty", 390, "light"), "a/empty-390.png");
  assert.equal(
    captureFile("a", "empty", 1440, "dark"),
    "a/empty-1440-dark.png",
  );
});

test("walkKeys yields every key of every surface", () => {
  assert.deepEqual(
    walkKeys(fake).map((t) => `${t.surface}:${t.key}:${t.path}`),
    [
      "a:empty:/a?state=empty",
      "a:error:/a?state=error",
      "b:loading:/b/1?x=1&state=loading",
    ],
  );
});

test("walkKeys on the real registry covers all its keys", () => {
  const want = Object.values(DEMO_SURFACES).reduce(
    (n, s) => n + s.keys.length,
    0,
  );
  assert.equal(walkKeys(DEMO_SURFACES).length, want);
});

test("walkKeys filters by surface and throws on an unknown one", () => {
  assert.equal(walkKeys(fake, "b").length, 1);
  assert.throws(() => walkKeys(fake, "zzz"), /no registered surface "zzz"/);
  assert.throws(() => walkKeys({}), /no surfaces/);
});

test("renderProblem passes only a 200 whose root carries the key", () => {
  const t = { surface: "a", key: "empty" };
  assert.equal(renderProblem(t, { status: 200, stateAttr: "empty" }), null);
  assert.match(
    renderProblem(t, { status: 404, stateAttr: null })!,
    /a \?state=empty.*404/,
  );
  assert.match(renderProblem(t, { status: 200, stateAttr: null })!, /absent/);
  assert.match(
    renderProblem(t, { status: 200, stateAttr: "populated" })!,
    /"populated"/,
  );
  assert.match(renderProblem(t, { status: null, stateAttr: null })!, /nothing/);
});
