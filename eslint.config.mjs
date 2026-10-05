/**
 * Root ESLint config — import-boundary enforcement only.
 *
 * Per-package eslint.config.mjs files handle code quality (TypeScript, React,
 * Next). This config runs once from the repo root so eslint-plugin-boundaries
 * can assign zones from repo-root-relative paths (packages/ui/src/… → ui).
 */

import { boundariesConfig } from "@pem/config/eslint/boundaries";
import { tokensPlugin } from "@pem/config/eslint/tokens";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
    ],
  },
  {
    // Disable comments in source target per-package rules (react-hooks,
    // turbo, …) that this boundaries-only config never loads; reporting them
    // as unused here would make the two lint passes fight each other.
    linterOptions: { reportUnusedDisableDirectives: "off" },
    // Loaded, never run: a waiver naming pem-tokens/no-raw-values (the OG
    // image's) must resolve here too, or this pass reports the rule missing.
    plugins: { "pem-tokens": tokensPlugin },
  },
  ...boundariesConfig,
];
