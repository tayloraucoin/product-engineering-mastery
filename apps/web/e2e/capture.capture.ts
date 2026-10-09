/**
 * The capture harness: every registered `?state=` key of DEMO_SURFACES at
 * 390, 834 and 1440, light and dark, reduced motion. A key that does not
 * render fails the run, naming surface and key; nothing is skipped.
 * Run it with `yarn web:capture [--surface <id>]`.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

import { DEMO_SURFACES } from "../lib/demo/states.ts";
import type { DemoSurface } from "../lib/demo/surfaces/types.ts";
import {
  captureFile,
  renderProblem,
  THEME_STORAGE_KEY,
  THEMES,
  walkKeys,
  WIDTHS,
} from "./lib/capture.ts";

const OUT = path.resolve(import.meta.dirname, "../.captures");

// Test hook: a JSON surface registered for this run only (never committed).
const extra = process.env.CAPTURE_EXTRA_SURFACE
  ? (JSON.parse(process.env.CAPTURE_EXTRA_SURFACE) as DemoSurface)
  : null;
const surfaces = extra
  ? { ...DEMO_SURFACES, [extra.id]: extra }
  : DEMO_SURFACES;

for (const target of walkKeys(
  surfaces,
  process.env.CAPTURE_SURFACE || undefined,
)) {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      test(`${target.surface} ?state=${target.key} ${width} ${theme}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        await page.addInitScript(
          ([k, v]) => localStorage.setItem(k!, v!),
          [THEME_STORAGE_KEY, theme],
        );
        const response = await page.goto(target.path);
        const root = page.locator("[data-demo-state]").first();
        const stateAttr =
          (await root.count()) > 0
            ? await root.getAttribute("data-demo-state")
            : null;
        const problem = renderProblem(target, {
          status: response?.status() ?? null,
          stateAttr,
        });
        expect(problem, problem ?? "").toBeNull();
        expect(
          await page.evaluate(() =>
            document.documentElement.classList.contains("dark"),
          ),
          `${target.surface} ?state=${target.key}: <html> ${theme} class at ${width}`,
        ).toBe(theme === "dark");
        await page.evaluate(() => document.fonts.ready);
        const file = path.join(
          OUT,
          captureFile(target.surface, target.key, width, theme),
        );
        mkdirSync(path.dirname(file), { recursive: true });
        await page.screenshot({
          path: file,
          fullPage: true,
          animations: "disabled",
        });
      });
    }
  }
}
