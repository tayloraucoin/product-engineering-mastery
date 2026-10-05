---
title: "Remove AI — a removal runbook"
description: "Follow from step 4 of new-project.md when the briefing drops AI; delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-04
supersedes:
load_when:
---

# Remove AI

> **Module:** the AI package (D-STK-12: the AI SDK and Anthropic, three standard cases, recorded fixtures for the local tier), the one owner of `ai` and `@ai-sdk/*` (D-STK-16), and the app's streaming route.
> **Built by:** STK-17. The lists below are the module's `ai` entry in `toolkit.json`'s `stack` block, and what reads it.
> **Run from:** step 4 of [`new-project.md`](new-project.md).

## Files to delete

- `packages/ai/`, the whole folder: the cases, prompts, models, fixtures, evals, the record script and their tests.
- `apps/web/app/api/ai/`, the whole folder: the app's AI client (`ai.ts`) and the chat route.

## Files to edit

- `apps/web/env.ts`: the `ANTHROPIC_API_KEY` reads in `raw` (with `_LOCAL` and `_STAGING`), and its `server` and `runtimeEnv` entries.
- `apps/web/next.config.ts`: `@pem/ai` in `transpilePackages`.
- `apps/web/package.json`: `@pem/ai`.
- Any service that takes an `Ai`: that import, and `@pem/ai` in `packages/services/package.json` if a service added it.
- `packages/config/eslint/boundaries.js` and `tooling/boundaries.test.ts`: see Boundaries entries.
- `docs/engineering/tech-stack.md`: the `ai`, `@ai-sdk/anthropic`, `@ai-sdk/provider` row.
- `docs/engineering/codebase-conventions.md` §4: the `@pem/ai` row, `ai` in the services row's imports and in the layer order, the "AI is reached two ways" paragraph, and `ai` in the SDK owners sentence.
- `packages/config/eslint/workspace-resolver.cjs` keeps resolving the `@/` alias: it guards every app's imports, not only this module's.

## Variables

From `.env.example` and `turbo.json`'s `globalEnv`, each with its `_LOCAL` and `_STAGING` forms, and the comment block above them:

- `ANTHROPIC_API_KEY`

## Dependencies

`@pem/ai`, `ai`, `@ai-sdk/anthropic` and `@ai-sdk/provider`. After deleting the folders, run `yarn install` so `yarn.lock` drops them.

## Boundaries entries

In `packages/config/eslint/boundaries.js`: the `workspacePackage("ai", "ai")` line and the `web-ai-route` element in `ELEMENTS`, its paragraph in the header comment, the `ai` entry in `PACKAGE_IMPORTS` and `"ai"` in the `services` entry, the `ai` and `"@ai-sdk/*"` entries in `SDK_OWNERS`, `"ai"` in `NOT_FOR_APPS`, and the `web-ai-route` rule in `buildDependencyRules`. Remove `ai` from the layer-order comment. In `tooling/boundaries.test.ts`, delete the probes that name `ai`, `@ai-sdk/*`, `@pem/ai` or `apps/web/app/api/ai`.

## Vendor-side steps

1. In the Anthropic Console, revoke each tier's API key.
2. Delete the `ANTHROPIC_API_KEY*` values from the hosting provider's environment settings.
3. Text already sent stays under Anthropic's retention for the account. If the privacy notice promises deletion, request it from Anthropic, and update the notice so it no longer names Anthropic as a processor.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `ai` entry of the `stack` block.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
