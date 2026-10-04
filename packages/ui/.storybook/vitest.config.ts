import { fileURLToPath } from "node:url";
import { storybookNextJsPlugin } from "@storybook/nextjs-vite/vite-plugin";
import { defineConfig } from "vitest/config";

/**
 * `yarn test` for @pem/ui: every story's interactions and accessibility
 * (stories.test.ts) and the story-coverage check, in jsdom. Storybook's
 * packages are inlined so the a11y addon sees `VITEST_STORYBOOK` and fails
 * a story on a violation instead of only reporting it.
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
