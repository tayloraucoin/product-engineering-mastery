import { fileURLToPath } from "node:url";
import { storybookNextJsPlugin } from "@storybook/nextjs-vite/vite-plugin";
import { defineConfig } from "vitest/config";

/**
 * `yarn test` for @pem/ui: every story's interactions and accessibility
 * (stories.test.ts) and the story-coverage check, in jsdom.
 *
 * `VITEST_STORYBOOK: "false"` is the a11y addon's flag for a standalone
 * Vitest run, outside the Storybook UI: it is what makes a violation throw.
 * "true" would only report it, and every story would pass. Storybook's
 * packages are inlined so the addon reads the flag.
 */
export default defineConfig({
  root: fileURLToPath(new URL("..", import.meta.url)),
  plugins: [storybookNextJsPlugin()],
  test: {
    environment: "jsdom",
    include: [".storybook/**/*.test.ts"],
    setupFiles: [".storybook/vitest.setup.ts"],
    env: { VITEST_STORYBOOK: "false" },
    server: {
      deps: {
        inline: [
          /@storybook\//,
          /[\\/]storybook[\\/]/,
          /vite-plugin-storybook-nextjs/,
          /next-themes/,
        ],
      },
    },
  },
});
