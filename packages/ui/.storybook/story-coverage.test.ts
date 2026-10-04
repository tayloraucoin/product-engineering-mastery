import path from "node:path";
import { describe, expect, it } from "vitest";

import { findStoryCoverageProblems } from "./story-coverage";

const pkg = path.resolve(import.meta.dirname, "..");
const fixture = path.resolve(import.meta.dirname, "fixtures/uncovered");

describe("story coverage", () => {
  it("passes for every @pem/ui component", () => {
    expect(findStoryCoverageProblems(pkg, "packages/ui")).toEqual([]);
  });

  it("fails a component with no story, naming it", () => {
    const problems = findStoryCoverageProblems(fixture, "fixture");
    expect(problems).toContain(
      "fixture/src/primitives/control/orphan: no story; add orphan.stories.tsx beside the component",
    );
  });

  it("fails a story title outside the grammar, and passes one inside it", () => {
    const problems = findStoryCoverageProblems(fixture, "fixture");
    expect(problems).toContain(
      'fixture/src/composed/control/misnamed/misnamed.stories.tsx: title is "Misnamed"; it must be "Composed/Control/Misnamed"',
    );
    expect(problems.some((line) => line.includes("/covered"))).toBe(false);
  });

  it("fails a provider with no story, naming it", () => {
    expect(findStoryCoverageProblems(fixture, "fixture")).toContain(
      "fixture/src/providers/bare: no story; add bare-provider.stories.tsx beside the component",
    );
  });

  it("reports nothing else in the fixture", () => {
    expect(findStoryCoverageProblems(fixture, "fixture")).toHaveLength(3);
  });
});
