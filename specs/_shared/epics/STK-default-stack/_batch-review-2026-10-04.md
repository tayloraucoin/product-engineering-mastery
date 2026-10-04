# Tier 1 batch review: STK-22, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5). It was given the contract, the cited `technical.md`, `results.json`, the as-built, the evidence folder, the changed files and the two reference packages. The reply is saved here as received, with only its layout reformatted; what was done about each finding is under "Disposition" at the end.

---

## STK-22 (ui-layout), tier 1 review

Verdict: **Pass with conditions.** No blocking issues. C1 to C5 hold on the evidence, and the public subpaths and app imports are unchanged.

### What checks out against the files

- **Subpaths:** all five `exports` keys are unchanged (`packages/ui/package.json:6-24`). Every `@pem/ui/*` import in `apps/web` and `apps/docs` resolves to an existing target.
- **Exports per subpath:** `/theme` exports `ThemeProvider`, `useTheme`, `THEMES` and `Theme`. `/button` exports `Button`, `buttonVariants` and `ButtonProps`. `/theme-toggle` exports `ThemeToggle`.
- **Button styles:** the class strings in `button.variants.ts` match an older flat-layout copy at `.claude/worktrees/wizardly-newton-83f22b/packages/ui/src/button/button.tsx` byte for byte. I could not compare the toggle's strings without git.
- **Toggle copy:** all three option labels plus the group label are in `copy.ts`.
- **Primitive vs composed:** the button primitive imports only `lib/cn`.
- **Order in `yarn verify`:** `check-ui-layout` runs right before `test:tooling` (`package.json:13`), and CI runs `yarn verify`.
- **C1:** the seven named cases all appear in `evidence/C1.log` (tests 14 to 20).
- **C3 and C4:** these logs are full Turbo cache replays. That is valid, because `check-types` and `lint` depend on the same task in their dependencies (`turbo.json:40-45`) and Turbo keys its cache on file contents.

### Should-fix

1. **The `cva()` check only reads `<name>.tsx`, so a `cva()` elsewhere gets through** (`tooling/check-ui-layout.ts:90-94`). It misses a `cva()` in a second `.tsx` in the same folder, in `index.ts`, or under `providers/`. Second `.tsx` files are normal in the reference layout (Synapse's `checkbox-field.tsx` beside `checkbox.tsx`). The regex `/\bcva\(/` also misses `cva (` and an aliased import. Suggested fix: flag any import of `cva` from `class-variance-authority` in a `.ts` or `.tsx` under `primitives/`, `composed/` or `providers/`, except `*.variants.ts`.
2. **The kinds are listed in three places, but non-negotiable 2 says "named once, in the check":** `tooling/check-ui-layout.ts:32-40`, `packages/ui/AGENTS.md:19` and `docs/decisions/changelog.md:22`. The contract's Build notes (`contract.md:74`) ask for "the kinds" in AGENTS.md. Suggested fix: have AGENTS.md point to `KINDS` instead of copying the list. The changelog copy is a dated record and can stay.
3. **The docs say the check enforces more than it does.** EN-11 says the `copy.ts` rule is "enforced by `yarn check-ui-layout`"; AGENTS.md and the changelog say the check enforces the layout, including the primitive/composed test and the `copy.ts` rule. The check enforces neither. Suggested fix: narrow the wording, or add the cheap primitive-import check.
4. **The proof is not committed.** `evidence/` (C1 to C5 logs) is untracked and `results.json` has uncommitted changes. Commit both before merge; this may be the batch-close step's job.

### Notes

5. **False positive in the `cva()` check:** a comment in `<name>.tsx` mentioning `cva(` fails the check (`check-ui-layout.ts:91`). Should-fix 1 removes this.
6. **The exports walker is fragile on shapes the repo doesn't use yet** (`check-ui-layout.ts:102-109`): nested conditional exports or a `null` target throw a TypeError; a subpath pattern (`"./*"`) is reported as a missing target; a missing `src/` crashes with ENOENT at `:58`.
7. **The test never runs the command, so "exits 1" is untested** (`check-ui-layout.ts:115-127`). One `spawnSync` case would cover non-negotiable 5 end to end.
8. **`yarn verify:fast` (the stop gate) never runs `check-ui-layout`, even when `packages/ui` changes** (`tooling/verify-fast.ts:83-142`). Outside the contract.
9. **`packages/ui/AGENTS.md:14` describes `hooks/` as "shared hooks".** D-STK-1 plans a separate `hooks` package; "DOM-bound hooks only" would stop a platform-pure hook landing in `@pem/ui`.
10. **`tooling/budget.ts:207` still probes `packages/ui/src/button.tsx`,** no longer a legal layout path. Cosmetic.
11. **"Carried from Synapse and Conscious Connections" is slightly overstated:** both use a flat `providers/theme-provider.tsx`; the `providers/<name>/` folder is the contract's own choice.
12. **Still needs a person:** nobody has rendered either app since the move. Load `/` in web and a docs page in light and dark, and click through the toggle.

## Disposition

- **S1, N5:** fixed. The check flags any `cva` import from `class-variance-authority` in any `.ts` or `.tsx` under `src/` except `*.variants.ts`; a comment no longer trips it. Tests cover a second file in the folder and the comment.
- **S2:** fixed. `packages/ui/AGENTS.md` points to `KINDS` and no longer lists them; the check names them only once. The changelog's list stays as a dated record.
- **S3:** fixed both ways. The check now fails a primitive with a `copy.ts` or a relative import into another primitive or into `composed/`. AGENTS.md, EN-11 and the changelog name exactly what the check enforces and say the primitive test otherwise stays judgment.
- **S4:** the evidence and `results.json` are committed with the batch close.
- **N6:** fixed. Conditional exports are walked to their string targets, a wildcard key or target fails with its own message, and a missing `src/` is a problem line.
- **N7:** fixed: a `spawnSync` case asserts exit 1 and the named path.
- **N9:** fixed: `hooks/` is "DOM-bound hooks only", and a line sends platform-pure hooks to the `hooks` package.
- **N10:** fixed; `tooling/budget.ts` was added to `planned_paths`.
- **N11:** fixed in AGENTS.md: `providers/<name>/` is named as this repo's own.
- **N12:** the demo home was rendered in the browser pane after the move. The toggle reads its labels and `aria-label` from `copy.ts`, and selecting Dark sets `dark` on `<html>`, with no console errors. The docs app was built but not rendered.
- **N8:** carried. Adding the check to `verify:fast` is outside this contract.
