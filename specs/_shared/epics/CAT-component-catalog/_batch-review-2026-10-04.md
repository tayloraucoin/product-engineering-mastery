# Tier 1 batch review: CAT-2, CAT-3, CAT-4, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5). It was given the three contracts, the cited `technical.md`, `component-sources.md`, ledger section 11 and record 0011, each ticket's `results.json`, evidence folder and as-built, and the list of changed files; never the builder's summary. The reply is saved here as received, with only its layout reformatted; what was done about each finding is under "Disposition" at the end.

---

## Batch review — CAT-2, CAT-3, CAT-4 (tier 1)

**Verdict: Blocked** — four Blocking findings (two in CAT-2, one each in CAT-3 and CAT-4); the rest of the work is careful and mostly holds.

Verification plan was written from the three contracts before reading code. Lint "everything it rejected before" was checked against the pre-CAT-2 rule, still present at `.claude/worktrees/serene-taussig-1dec47/packages/config/eslint/tokens.js` (old rule rejected every `-[…]` arbitrary value). This is a read-only review: severities come from reading and hand-computation; runtime checks a person must make are listed at the end.

### Blocking

**B1 (CAT-2) — `_`-joined px literals pass the lint.** `packages/config/eslint/tokens.js:54` (`LITERAL_UNIT_RE`) and `:74`. Tailwind writes spaces inside arbitrary values as `_`, a word character, so the lookbehind `(?<![\w.-])` rejects a match after `_`, and the trailing `\b` fails before `px_`. Passes today: `shadow-[0_8px_24px_var(--x)]`, `p-[13px_20px]`, `grid-cols-[240px_1fr]`, `[box-shadow:0_8px_24px_black]` — the first three were rejected by the old rule. Breaks non-negotiable 4 and CS-13 ("rejected when it holds a px … literal"), and admits a raw shadow (canon C-P06). Smallest fix: in `rawArbitrary`, `const inner = utility.slice(…).replaceAll("_", " ")`; add `shadow-[0_8px_24px_var(--x)]` and `p-[13px_20px]` to `FAILING` in `tooling/token-lint.test.ts`. (Every current `PASSING` case still passes with this change.)

**B2 (CAT-2) — chart roles are not set under `.dark`.** `packages/config/tailwind/preset.css:76-80`: `--chart-1`…`--chart-5` exist only in `:root`; the `.dark` block (`:101-129`) has none. Non-negotiable 1: "every new role is set under :root and again under .dark." `tooling/preset-tokens.test.ts:84-85` deliberately loops only `VEGA_ROLES` for dark, excluding `CHARTS`, so the test steps around the rule; the as-built does not log it. In dark, `chart-5` (neutral-800) sits on neutral-950. Smallest fix: five `.dark` lines (e.g. the light steps reversed) and loop `[...VEGA_ROLES, ...CHARTS]` in the dark assertion.

**B3 (CAT-3) — check-catalog reports "storied" when tags or provenance disagree with the manifest.** `tooling/check-catalog.ts:187-198`. It checks only that the three expected tags are present, never that no conflicting one exists: `["source:shadcn","source:custom","verdict:kit","verdict:shelf",…]` passes, and only the first `tags:` array in the file is read (a story-level `tags: ["!verdict:kit"]` is invisible). The Provenance panel then shows whichever comes first (`provenance-panel.ts:40-42`). Provenance is only tested for the presence of `upstream:`/`licence:` keys — the values are never compared, so `licence: "GPL-3.0"` on a shadcn story (manifest: MIT) is "storied". Non-negotiable 3 and C2 both say "a tag or provenance that disagrees with the manifest" fails; on a shelf of third-party code the licence is the field that matters. Tests (`check-catalog.test.ts:187-214`) cover only missing tag and missing provenance. Smallest fix: reject any `source:`/`verdict:`/`layer:` tag in the file other than the expected three (including `!`-prefixed ones), require `provenance.licence` to equal `sources[entry.source].licence`, add two test cases.

**B4 (CAT-4) — destructive Button label fails AA in light.** `packages/ui/src/primitives/control/button/button.variants.ts:24-25` (`bg-destructive/10 text-destructive`). Computed with contrast-audit's own maths: `--red-600` is 4.76:1 on white, but on its 10 % tint ≈ **3.98:1** at rest and ≈ **3.31:1** on hover (`/20`); dark hover (`/30`) ≈ 4.46:1. contrast-audit cannot see it (an alpha background is unresolved, `tooling/contrast-audit.ts:260`, so the pair is never audited), and the story axe pass runs in jsdom, which renders no colour — C2's "passes axe" says nothing about contrast. This is the canon's banned A-11 tell in a kit primitive every product inherits. It is a computation, not a measurement — runtime check 1 below confirms it. Smallest fix: darken the light `--destructive` raw step (≈ Tailwind red-700, `oklch(0.505 0.213 27.518)`, clears ≈ 5:1 on the tint) and teach contrast-audit to composite an `/N` background over `--background`, adding the pair `--destructive` on `--destructive/10`.

### Should-fix

- **S1 (CAT-2) — other raw values now pass that the old rule rejected.** `tokens.js:54,71-79`. Absolute units outside px/rem/em/ms/s and upper-case units: `text-[12pt]`, `w-[3in]`, `p-[13PX]`. Named colours and font families in arbitrary values: `bg-[red]`, `text-[black]`, `font-['Inter']` — canon C-P06 bans raw colour and any font-family outside tokens by name. Fix: add `pt|pc|in|cm|mm|q` with the `i` flag; reject an arbitrary value made only of a CSS colour name or a family name.
- **S2 (CAT-2) — canon C-P06 now disagrees with what shipped.** `docs/design/canon.md:95` still says the lint bans "arbitrary values"; `:89` names the elevation scale "resting, raised, overlay, modal" while CS-11 shipped control/raised/overlay/floating. The canon outranks the ledger on the precedence ladder, so either the canon is amended (plan mode) or the code is in breach. Fix: amend the two lines citing CS-11/CS-13.
- **S3 (CAT-3) — catalog stories can replay a stale pass from turbo's cache.** `@pem/ui#test` globs `../../catalog/src/**` (`packages/ui/.storybook/stories.test.ts:12-15`), but its turbo inputs are `$TURBO_DEFAULT$` of `@pem/ui` only (`turbo.json:55-58`) and catalog is not a dependency, so an edit to only a catalog story is a cache hit. All three tickets' `yarn test` logs show "7 cached, 7 total". Fix: add `"$TURBO_ROOT$/packages/catalog/src/**"` to test inputs (a `packages/ui/turbo.json`), or give `@pem/catalog` its own `test` task.
- **S4 (CAT-4) — C1 says "storied per … size"; two sizes have no story.** `icon-xs` and `icon-lg` (`button.stories.tsx`, after `:92-94`). Fix: two one-line stories.
- **S5 (CAT-3) — the C6 capture never showed source narrowing.** `evidence/C6-workshop.md:9` admits selecting `source:custom` "keeps all 20" (every story was custom); narrowing was shown with `verdict:unruled` instead. Now that the Button is `source:shadcn`, re-capture under CAT-4 or the next ticket (the closed proof stays frozen).
- **S6 (CAT-3) — copy button's custom-message story fails WCAG 2.5.3 Label in Name.** `packages/catalog/src/custom/control/copy-button/copy-button.stories.tsx:78-79`: visible "Copy invite", accessible name "Copy the invite code" — speech input fails; axe's rule is off by default. Fix: `accessibleLabel: "Copy invite code"`.

### Consider

- `drop-shadow-*`, `inset-shadow-*`, `text-shadow-*` scales are not banned (`tokens.js:51`); the old rule missed them too, but C-P06 says "any shadow".
- Arbitrary breakpoint variants (`min-[640px]:`, `@min-[400px]:`) are no longer judged; CS-13 rules variants are selectors, but the old rule caught these.
- Conditional/logical class strings (`className={a ? "shadow-lg" : ""}`), class strings in variables, and `tv()` are not linted (`tokens.js:102-108`) — pre-existing.
- `rounded-[2px]` passes as a hairline (`tokens.js:55`) while the copy-in table maps it to `rounded-xs`.
- `button.variants.ts:21` secondary hover is a 5 % `color-mix` — an A-04 risk; no SecondaryHover story to judge it, and not listed in provenance "adapted".
- `ring-ring/50` (`:13`) puts the ring at ≈ 1.5:1, while the audited ring pair is opaque; the solid `border-ring` carries the indicator (3.3:1). Check at runtime.
- Elevation values have no `.dark` setting (`preset.css:90-97`): black at 10 % vanishes on neutral-950.
- `shadcn.css:9-33` animates accordion height — a C-P11 matter for the accordion ticket, not A-14.
- Doc drift: `technical.md:21` verdict list still `adopt|…` and says tags are "declared in main.ts" (main.ts does not); `records/0011…md:33` still says "provenance strip" (needs an amendment block); `component-sources.md:16` says "CS-01 to CS-10" and its changelog `:160` stops at v0.1; `tech-stack.md:41` says the CLI "stages into src/_shadcn/" against the deviation that the CLI writes nothing; `button.stories.tsx:39` cites CS-11 for roles.
- `docs/runbooks/remove-catalog.md:18,34` does not note that the manifest is also the kit's plan: removing the catalog removes the kit's check-off and step 7 of `component-sources.md`.
- Boundary probes cover only a static `@pem/catalog/manifest` import from apps/web and packages/ui; the code also blocks dynamic import, require, export-from (eslint-plugin-boundaries 6.0.2 defaults) and relative paths (`no-restricted-imports`), unprobed, and apps/docs is unprobed.
- `yarn shadcn` runs the CLI unguarded (`packages/ui/package.json:30`); an `add` without `--dry-run` would write into `src/_shadcn/` and the CSS named by `components.json:8` — procedure only.
- All three tickets' `results.json` record `tests: 114` for `yarn test` (CAT-2 `:52`, CAT-3 `:53`, CAT-4 `:27`) while the logs' vitest counts are 25, 29, 38 — the contract tooling's count parser is wrong (not batch code, but proof honesty).
- No `npmMinimalAgeGate` in `.yarnrc.yml` though `deps.md` says one exists; the as-built raised it to Taylor. The week-old ages could not be verified without network.

### Conversations

- The copy failure message "Couldn't copy. Select the text and copy it instead." clears after 2.4 s (`copy-button.tsx:61`); a person reading it as they go to select the text loses the instruction mid-task. Should failure stay until the next press, and only success clear?

### Your questions, answered

- **Token-lint holes:** important modifier (`!` prefix/suffix) handled; negative values handled; template literals in className/cn/cva handled; `[prop:value]` single-value handled. **Open:** multi-value arbitrary values and arbitrary properties (B1), other units and colour/family names (S1), conditional class expressions (pre-existing).
- **Importing @pem/catalog:** no JS/TS route found — ESM, dynamic import, require, export-from, type imports and relative paths are all rejected, and the bare package exports only `./manifest`. (CSS `@import`/`@source` is outside the lint — Consider.)
- **check-catalog "storied" when wrong:** yes — B3.
- **A-14 in ejected shadcn.css:** none; no shimmer in it or in tw-animate-css; scroll-fade is a scroll-linked mask.
- **apps/web, apps/docs Button variants:** both apps use only `outline`, `ghost`, `sm` and default `Button`, all present. Base UI merges caller props after its own `type:"button"` (`node_modules/@base-ui/react/internals/use-button/useButton.js:183-187`), so sign-in's `type="submit"` survives. Verified in code, not rendered.

### Runtime checks (highest risk first)

1. Workshop, light theme, Button → Destructive and Destructive with hover: measure the label contrast; expect ≥ 4.5:1 (B4).
2. apps/web: submit the sign-in form with the Button; it submits, then shows disabled "Sending link".
3. Edit only a catalog story and run `yarn test`: `@pem/ui#test` must not be a cache hit (S3).
4. Workshop: select `source:shadcn` then `source:custom`; each must narrow the sidebar (S5).
5. apps/docs nav (ghost, sm), apps/docs not-found and apps/web home (outline), light and dark.
6. Tab to a default-variant Button: judge the ring's visibility on the dark fill.

### Per ticket

- CAT-2: Blocked — B1 (lint misses `_`-joined px literals), B2 (chart roles missing under `.dark`).
- CAT-3: Blocked — B3 (check-catalog does not catch conflicting tags or a wrong licence).
- CAT-4: Blocked — B4 (destructive label ≈ 3.98:1 in light, A-11).

---

## Disposition

Filled in after the fixes.
