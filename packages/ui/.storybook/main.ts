import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";

/** @pem/brand's assets folder, found through the package, never by a relative path. */
const brandAssets = dirname(
  fileURLToPath(import.meta.resolve("@pem/brand/assets/logo.svg")),
);

/**
 * The component workshop (D-STK-10): `yarn ui:storybook` on port 6006.
 * Stories sit beside their components; `story-coverage.ts` fails a
 * component without one. Brand assets are served from @pem/brand at
 * `/brand/`, never from an app's public folder.
 */
const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "storybook-addon-pseudo-states",
  ],
  staticDirs: [{ from: brandAssets, to: "/brand" }],
  core: { disableTelemetry: true },
  viteFinal: (vite) => ({
    ...vite,
    plugins: [...(vite.plugins ?? []), tailwindcss()],
  }),
};

export default config;
