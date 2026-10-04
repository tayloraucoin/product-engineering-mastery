# Tier 1 batch review: STK-7, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5). It was given the contract, the cited `technical.md`, `results.json`, the as-built, the evidence folder and the changed files. The reply is saved here as received, with only its layout reformatted; what was done about each finding is under "Disposition" at the end.

---

**Verdict: PASS for STK-7.** No Blocking findings. Three Should-fix belong to the ticket; a fourth is a repo-wide gap that limits what C2 proves. Nothing was fixed (read-only).

Plan written from the contract and D-STK-1, D-STK-9 and D-STK-16 before reading code: five non-negotiables, four criteria, foundation-layer placement, a `toolkit.json` entry, and the font and transpile wiring in both apps. Tools were Read, Grep and Glob only, so each PASS below is code inspection plus the recorded evidence; nothing was run.

## Verified in code and evidence

- **NN1 (package and assets):** `packages/brand/package.json:6-23` exports `./brand`, `./font`, `./icon`, `./color` and `./assets/*`. The logo, the mark and the font with its OFL licence are in `packages/brand/assets/`.
- **NN2 (no hard-coded brand values):** `apps/web/app/manifest.ts`, `apps/web/app/opengraph-image.tsx`, `apps/web/app/layout.tsx` and `apps/docs/app/layout.tsx` hold no literal brand string, hex value or asset path; everything comes from `@pem/brand`. No emails or stories exist yet.
- **NN3 / C1 (colour test):** `brand.test.ts:54-75` reads the preset and follows each `var()` through the raw scale for `:root` and `.dark`. A missing token fails rather than passing silently. `TOKENS` (line 18) is typed over the keys of `brand.theme`, so a new colour without a mapping fails type-checking. The tests at lines 81 and 94 show a change on either side fails. `packages/brand/turbo.json` adds `preset.css` to the test task's inputs. `C1.log` lines 16-38: PASS.
- **NN4 (font loads once):** one `localFont` call (`packages/brand/src/font.ts:14`). Both layouts put `brandSans.variable` on `<html>`, `preset.css:85` reads it, and nothing else in `apps/` or `packages/` loads a font.
- **D-STK-16 / C2 (boundaries):** `boundaries.js:50,59` puts `brand` in the foundation layer, importing `config` only. `toolkit.json:192-203` has the brand entry; `codebase-conventions.md:86` and `tech-stack.md:33,41` were updated. `C2.log` exits 0 (but see finding 4).
- **C3 (build):** `C3.log:768-772` shows the web build emitting `/manifest.webmanifest` and `/opengraph-image`.
- **C4 (manifest and OG image):** `og.png` shows the brand name and description in `#fafafa` on `#171717`. `manifest.webmanifest` has the name, short name, both colours and the mark as its icon.

## Blocking

None.

## Should-fix

1. **Step 3's own check cannot pass (`docs/runbooks/new-project.md:84`).** The check `git grep -n -e "Product Engineering Mastery" -e "PEM" -- apps/web/app …` must print nothing, but on a fresh copy it prints `apps/web/app/page.tsx:7`. The same line says the demo page keeps the name until step 5, and line 21 says a failing check is fixed before the next step starts: a contradiction the reader cannot get past. Line 77, "No other file names the brand", is false for the same reason. Fix: `page.tsx` renders `{brand.name}`, or the pathspec excludes it. Owner: builder.
2. **A new font silently leaves the Open Graph image in Geist (`apps/web/app/opengraph-image.tsx:13-14`, `new-project.md:81`).** The image uses next/og's built-in Geist, and step 3.3 never says to pass the product's font to it. next/og cannot read woff2 (it takes TTF, OTF and WOFF). Link previews stay in Geist unnoticed: the "hard-coded brand value a product forgets to change" this ticket exists to remove. Fix: a sentence in step 3.3, or have the image load a brand file. Owner: builder.
3. **NN5 is unmet as written, and the as-built's reason is wrong (`as-built.md:15`).** NN5 says the step edits only `brand.ts` and assets; it also edits `preset.css` (`new-project.md:77,82`). The as-built says "an accepted decision outranks the contract", but D-STK-9 lives in `technical.md`, on the same rung as the contract (rung 5), not in `docs/decisions/`: the ledger has no D-STK-9 and record 0010 does not cover the brand. The resolution is right, since NN3 plus D-STK-9 make the preset edit unavoidable; Taylor accepts it in one line on the record, and the as-built's reasoning is corrected. Owner: Taylor.
4. **Repo-wide, not introduced by STK-7: the boundaries lint may not see any `@pem/*` import.** `boundaries.js:164-170` resolves through eslint-import-resolver-node 0.3.9 on `resolve` 1.22.12, which ignores `exports`, and no `@pem` package has a `main` field or root entry. So `@pem/brand/brand` likely resolves to nothing and passes on `isUnknown` (`:120`), the failure the comment at `:164-166` warns about. `C2.log` is empty with exit 0, so it does not show a bad edge is caught. Not probed. Owner: mason or Taylor. Does not count against STK-7.

## Nit

5. Two lines became untrue (D-STK-19: the ticket that makes a line untrue updates it): `preset.css:19-20` ("replaces the raw values here and nowhere else"; `brand.ts` now mirrors them) and `new-project.md:82` ("A raw value is written nowhere else", right after telling the reader to write them into `brand.ts`).
6. `opengraph-image.tsx:16-29` moves literal layout values out of `style={…}`, so the token lint does not see them. The need is real, but the exception is invisible to the lint and to a search for suppressions; make it countable (an `eslint-disable` with a reason, or an allowlist for `opengraph-image` files). Logged at `as-built.md:18`.
7. `manifest.ts:16` sets `background_color` from `primaryForeground`, the text-on-primary colour, not the page background (`#ffffff`). The splash shows `#fafafa`, then the page `#ffffff`; with a real brand the flash may show. Accept with a comment or map it deliberately.
8. C3 uses `yarn verify` as a criterion, which `.claude/rules/specs.md` forbids, and it caused the C3 failure at `as-built.md:23`. The criteria are frozen; a note for contract writers (`contract:init` could refuse it).

## Conversations

- **Is the starter meant to be installable?** The manifest says `display: standalone` with one SVG icon. iOS Add to Home Screen needs a PNG `apple-icon`; some install checks want raster 192 and 512 icons. Should the guide say what a product gives up, or should Next's `apple-icon` be generated from the mark?

## Runtime checklist (highest risk first)

1. Add `import "@pem/db/client"` in `packages/brand/src` and run `yarn lint:boundaries`: it must fail. Likewise `packages/env` importing `@pem/brand/brand`. Confirms or clears finding 4.
2. Change `--neutral-900` in `preset.css`, run `yarn test` without `--force`: the brand test must miss the cache and fail naming `brand.theme.primary.light`. Revert.
3. Run the command at `new-project.md:84` on this tree; expect `apps/web/app/page.tsx:7` (finding 1).
4. `yarn docs:dev`, light and dark: body font is the brand font; the icon returns 200 `image/svg+xml`.
5. Chrome DevTools, Application, Manifest: installability warnings; iOS Add to Home Screen.
6. Preview the OG image on a real platform.

**PASS for STK-7.**

---

## Disposition

- **S1, fixed:** the step 3 check excludes `apps/web/app/page.tsx`, and the sentence says the demo page is the one exception until step 5 (`new-project.md`).
- **S2, fixed:** `@pem/brand/image-font` reads `assets/fonts/brand-sans-image.ttf` (Geist Regular, the same typeface), and the Open Graph image draws with it; step 3.3 replaces both font files.
- **S3, open for Taylor:** the as-built's reasoning is corrected and the item is marked `[NEEDS DECISION]`.
- **Finding 4, confirmed by probe, not fixed:** on 2026-10-04, `import "@pem/db/client"` in `packages/ui/src` and `import "@pem/brand/brand"` in `packages/env/src` both lint clean; the same `env` to `db` edge by relative path fails. Repo-wide; flagged as its own task.
- **Nit 5, fixed:** `preset.css`'s header and step 3.4 name the two colours `brand.ts` mirrors.
- **Nit 6, fixed:** the image's styles are inline under one file-level `eslint-disable no-restricted-syntax` with its reason.
- **Nit 7, kept and commented** in `manifest.ts`: two brand colours only (D-STK-9).
- **Nit 8, not actionable here:** the criteria are frozen.
- **Runtime checklist 2, done:** a changed `--neutral-900` missed the cache and failed the brand test, naming `brand.theme.primary.light`; reverted.
- **Conversation, carried to the report:** PNG and `apple-icon` installability.
