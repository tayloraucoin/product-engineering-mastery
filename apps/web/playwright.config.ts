/* eslint-disable turbo/no-undeclared-env-vars -- test-run switches read here, never by a turbo task */
import { defineConfig } from "@playwright/test";

// Journeys and the capture harness run against a production build, never
// `next dev`. CAPTURE_BASE_URL points at a server already running.
const external = process.env.CAPTURE_BASE_URL;
const port = 3100;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  use: { baseURL: external ?? `http://localhost:${port}` },
  projects: [
    {
      name: "e2e",
      testMatch: /.*\.spec\.ts/,
      use: { browserName: "chromium" },
    },
    {
      name: "capture",
      testMatch: /.*\.capture\.ts/,
      use: { browserName: "chromium" },
    },
  ],
  webServer: external
    ? undefined
    : {
        command: `yarn build && yarn next start --port ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: false,
        timeout: 300_000,
      },
});
