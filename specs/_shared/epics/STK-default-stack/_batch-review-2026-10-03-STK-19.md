# Tier 1 batch review: STK-19, 2026-10-03

The reply of one `vigil` subagent (claude-opus-5-5). It was given the contract, the cited `technical.md`, `results.json`, the as-built, the evidence folder and the changed files. The reply is saved here as received, with only its layout reformatted; what was done about each finding is under "Disposition" at the end.

---

## STK-19 (helpers-deploy), tier 1 review

**Verdict: FAIL.** The only reason is C2. It is recorded as FAIL, and the chain stopped before the contrast audit ever ran, so the audit has never run inside `yarn verify`. The cause is outside this ticket's code. The code meets the contract, and I found no Blocking defect in it.

I built the checklist from the contract and D-STK-19 before reading any code.

### What checks out against the files

- **Precondition (D-STK-19 ratified):** `technical.md:46` says D-STK-16 to D-STK-19 were ratified on 2026-10-03.
- **`web:dev:local`:** `package.json:16` runs `print-local-urls.ts 3000`, then turbo dev with `--hostname 0.0.0.0`. This reaches the app's `next dev --port 3000` (`apps/web/package.json:7`). `next.config.ts:5,24` sets `allowedDevOrigins: getLocalDevOrigins()`. The helper drops loopback and link-local addresses and returns `[]` rather than crashing when it can't read the interfaces (`local-dev-origins.ts:15-30`).
- **Audit exit code and place in verify:** the audit exits 1 when any pair fails (`contrast-audit.ts:209-215`). A missing token or one it can't parse is an ERROR, which counts as a failure (`:189-196`). It sits in `verify` at `package.json:13`.
- **`vercel.json`:** `apps/web/vercel.json:4-5` installs with corepack and `--immutable`, and builds with `yarn turbo run build --filter=web`.
- **CI runs the same verify as local:** `ci.yml:41-42` runs only `yarn verify`. The file is unchanged, which matches the as-built.
- **Preset fixed by lightness only:** `preset.css:34-35` keeps chroma and hue at `0 0`; only L moved. No brand token was touched.
- **The as-built's numbers:** I recomputed all eight ratios in its table, before and after. Every one matches. The 4 failing light pairs on the STK-6 preset are real.
- **C1:** PASS (`C1.log:206-240`). Test 34 passes the repo preset. Test 36 fails `#777777` on white at 4.48:1 and names the pair. The ring and missing-token cases also behave.
- **C3:** an honest manual "not verified" (`evidence/C3.md:15`).
- **Paths:** every changed file is inside `planned_paths`.
- **D-STK-19 doc rule:** `README.md:24-28` names only modules that exist.

### Blocking

**B1. C2 is recorded FAIL, and the audit has never run inside `verify`.**

- Where: `results.json:18-28`; `C2.log:2,51-55`.
- What happened: `yarn verify` exited 1 at `check-specs`. The 4 problems are evidence drift in other tickets: STK-2's C1 to C3 logs, which are uncommitted changes in the working tree, and STK-9's `test-db.txt`.
- Why it matters: `check-specs` comes before `contrast-audit` in `package.json:13`, so the run never got to the audit. That leaves several things unshown:
  - C2 ("full chain passes with the audit in it")
  - the "runs in verify" half of that non-negotiable
  - `lint:boundaries`, which the as-built claims passes (`as-built.md:20`) with no evidence in the folder
  - `check-types` and `build`, now that `apps/web` type-checks a file in `tooling/`
- Owner: batch close. Restore or re-record the STK-2 and STK-9 evidence, then get one green `yarn verify`.

### Should-fix

**S1. The audit can wrongly pass light, see-through text on a dark surface.**

- Where: `contrast-audit.ts:160-167`.
- Cause: colours are converted to linear light first (`:123`, `:143-150`, `:154`), and see-through colours are then blended in linear light. Browsers blend gamma-encoded sRGB.
- Effect: it overstates contrast for light-on-dark. White at 30% on black gets 7.0:1 from the audit; the browser renders about 2.5:1. Dark-on-light errs the safe way.
- Not live today: no token in the current preset uses alpha. Brand colours (STK-7), or a product adding something like `oklch(1 0 0 / 70%)`, would hit it.
- Fix: encode to sRGB, blend, decode, and add a fixture for a see-through foreground on dark.
- Owner: whoever owns `tooling/`.

**S2. A conventions line is now untrue, and the lint can't see this import.**

- `codebase-conventions.md:69` says `tooling/` has one consumer (the root scripts) and that its shared module stays in `tooling/lib/`.
- `apps/web/next.config.ts:5` now imports `tooling/local-dev-origins.ts`, a shared module at the `tooling/` root.
- `lint:boundaries` lets this through only because `tooling/` belongs to no element and unknown targets are allowed (`boundaries.js:45-52,118`). So any app or package can import `tooling/` unchecked.
- The as-built logs the deviation (`as-built.md:20`), but the doc line is still wrong.
- Owner: the conventions owner. Amend line 69, and either add a `tooling` element to the boundaries config or open a follow-up ticket. The conventions file is not in `planned_paths`.

### Notes

- **N1. The contract's C2 breaks a house rule.** C2 is `yarn verify`, which `.claude/rules/specs.md` says is never a criterion. This is a contract-authoring issue; the as-built correctly treats it as a batch-close step.
- **N2. This ticket made other tickets' proofs stale** (warnings at `C2.log:18-48`):
  - STK-3, through `README.md`
  - STK-4 and STK-9, through `next.config.ts` and `package.json`
  - STK-6 C1 to C6, through `preset.css`; C3 to C6 need `contract:record` with an evidence path

  All of these must be re-recorded before `check-specs --strict` at merge.

- **N3. One bound in the as-built is off by 0.001.** `as-built.md:22` gives 0.541 as the low end of `--neutral-500`'s window. At 0.541, dark `--ring` on `--muted` is 2.999:1, which fails. The true bound is about 0.5411, so 0.542 at three decimals. The other three bounds are correct.
- **N4. The parser has silent gaps** (`contrast-audit.ts:79-89`). It reads only the exact selectors `:root` and `.dark`:
  - A dark theme under `html.dark` or `:root.dark` would not be read, so dark would quietly reuse the light values.
  - A `:root` nested in `@media (prefers-color-scheme: dark)` would overwrite the light values.

  Neither happens with the current preset, which uses the `.dark` class (D-STK-17).

- **N5. The pair list is a judgment call, and it is labelled `[ASSUMPTION]`.** It has no focus-ring-on-`--accent` pair, though a hovered row can hold focus. Consider adding one.
- **N6. C3 never ran the combined script.** The evidence ran `yarn web:dev` and `print-local-urls.ts` separately, never `yarn web:dev:local` itself. It also didn't use a phone.
- **N7. `vercel.json` has never been deployed** (the as-built says so at `as-built.md:30`). Vercel's documented way to use Corepack is the `ENABLE_EXPERIMENTAL_COREPACK=1` project variable. Whether `corepack enable` in `installCommand` is enough has not been checked.

### Conversation

The raw-step fixes leave very small margins: 4.54, 3.02 and 3.05:1, each with an L window about 0.006 wide. That's because `--neutral-400` and `--neutral-500` each play two roles (muted text in one theme, focus ring in the other). Should the ring get its own raw step, so that a product changing a neutral doesn't trip the audit on a role it wasn't touching? This is a design call for the design layer's owner, not a defect.

### Runtime checklist, highest risk first

1. After the batch housekeeping, run `yarn verify` to green. Confirm the `contrast-audit: all 18 pairs pass` line appears, along with lint:boundaries, check-types and build. Then record C2.
2. Taylor runs `yarn web:dev:local`, opens the printed LAN URL on a phone, toggles the theme, and records C3.
3. Run a Vercel preview with Root Directory set to `apps/web` to confirm install and build. Check whether `ENABLE_EXPERIMENTAL_COREPACK=1` is needed.

Verdict: FAIL

---

## Disposition

- **B1:** C2 is re-run once the close-out thread has re-proved STK-2 and STK-9 on the same branch.
- **S1:** fixed. The audit holds colours as encoded sRGB, composites in that space, and linearises only to compute luminance. A test covers white at 30% on black. The opaque ratios did not change.
- **S2:** `docs/engineering/codebase-conventions.md` was added to `planned_paths`, and §3 now names the one import as the exception. A `tooling` boundaries element would be a package-boundary change, so it is left to Taylor.
- **N3:** the as-built now gives 0.542.
- **N1, N2, N4 to N7:** carried as they stand. N2 is the close-out thread's re-proofs. N5 and the conversation point are design calls.
