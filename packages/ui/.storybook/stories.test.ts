import { composeStories } from "@storybook/nextjs-vite";
import { describe, expect, it } from "vitest";

import * as violation from "./fixtures/a11y-violation.stories";

/**
 * Every story in @pem/ui and in the catalog the workshop shows (CS-07), run
 * as the workshop runs it: render, its `play` interactions, then the
 * accessibility addon's axe pass, which fails on any violation
 * (`a11y.test: "error"` in preview.tsx).
 */
const modules = import.meta.glob<Parameters<typeof composeStories>[0]>(
  ["../src/**/*.stories.tsx", "../../catalog/src/**/*.stories.tsx"],
  { eager: true },
);

for (const [file, module] of Object.entries(modules)) {
  describe(module.default.title ?? file, () => {
    for (const [name, Story] of Object.entries(composeStories(module))) {
      it(name, async () => {
        // No story opts out of the axe pass that this test rests on.
        expect(Story.parameters.a11y?.test).toBe("error");
        await Story.run();
      });
    }
  });
}

describe("the accessibility check", () => {
  it("fails a story with a violation", async () => {
    const { UnnamedButton } = composeStories(violation);
    await expect(UnnamedButton.run()).rejects.toThrow(/button-name/);
  });
});
