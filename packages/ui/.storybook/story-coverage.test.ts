import path from "node:path";
import { describe, expect, it } from "vitest";

import { storyCoverage } from "./story-coverage";

const pkg = path.resolve(import.meta.dirname, "..");
const fixture = path.resolve(import.meta.dirname, "fixtures/uncovered");

describe("story coverage", () => {
  it("passes for every @pem/ui component", () => {
    expect(storyCoverage(pkg, "packages/ui")).toEqual([]);
  });

  it("fails a component with no story, naming it", () => {
    const problems = storyCoverage(fixture, "fixture");
    expect(problems).toContain(
      "fixture/src/primitives/control/orphan: no story; add orphan.stories.tsx beside the component",
    );
  });

  it("fails a story title outside the grammar, and passes one inside it", () => {
    const problems = storyCoverage(fixture, "fixture");
    expect(problems).toContain(
      'fixture/src/composed/control/misnamed/misnamed.stories.tsx: title is "Misnamed"; it must be "Composed/Control/Misnamed"',
    );
    expect(problems.some((line) => line.includes("/covered"))).toBe(false);
    expect(problems).toHaveLength(2);
  });
});
